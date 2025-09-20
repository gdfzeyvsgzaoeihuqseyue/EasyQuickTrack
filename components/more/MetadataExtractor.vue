<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900">Extraction de métadonnées</h2>
    <p class="text-gray-600 mb-4">
      Extrayez les métadonnées (titre, description, image, etc.) de n'importe quelle URL.
    </p>
  </div>

  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="metadata-url" class="block text-sm font-medium text-gray-700 mb-2">URL à analyser</label>
      <input id="metadata-url" v-model="url" type="url" required
        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        :disabled="loading" placeholder="https://www.example.com" />
    </div>

    <button type="submit" :disabled="loading || !url"
      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
      <span v-if="loading" class="flex items-center justify-center">
        <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
        Extraction en cours...
      </span>
      <span v-else>Extraire les métadonnées</span>
    </button>
  </form>

  <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
    <p class="text-red-700">{{ error }}</p>
  </div>

  <div v-if="metadata" class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
    <h4 class="text-lg font-semibold text-blue-800 mb-4">Métadonnées pour {{ metadata.url }}</h4>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div v-if="metadata.image" class="lg:col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-2">Image de prévisualisation</label>
        <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
          <img :src="metadata.image" :alt="metadata.title || 'Image de prévisualisation'"
            class="w-full h-full object-cover" @error="handleImageError" />
        </div>
      </div>

      <div :class="metadata.image ? 'lg:col-span-2' : 'lg:col-span-3'">
        <div class="space-y-4">
          <div v-if="metadata.favicon || metadata.title">
            <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
            <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <img v-if="metadata.favicon" :src="metadata.favicon" class="w-6 h-6 mr-2 inline-block" alt="Favicon" />
              <p v-if="metadata.title" class="text-gray-900 font-medium">
                {{ metadata.title }}
              </p>
            </div>
          </div>

          <div v-if="metadata.description">
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <div class="p-3 bg-gray-50 rounded-lg border">
              <p class="text-gray-700 leading-relaxed">{{ metadata.description }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="metadata.author">
              <label class="block text-sm font-medium text-gray-700 mb-2">Auteur</label>
              <div class="p-3 bg-gray-50 rounded-lg border">
                <p class="text-gray-900">{{ metadata.author }}</p>
              </div>
            </div>

            <div v-if="metadata.language">
              <label class="block text-sm font-medium text-gray-700 mb-2">Langue</label>
              <div class="p-3 bg-gray-50 rounded-lg border">
                <p class="text-gray-900">{{ metadata.language }}</p>
              </div>
            </div>

            <div v-if="metadata.source">
              <label class="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <div class="p-3 bg-gray-50 rounded-lg border">
                <p class="text-gray-900">{{ metadata.source }}</p>
              </div>
            </div>

            <div v-if="metadata.siteName">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom du site</label>
              <div class="p-3 bg-gray-50 rounded-lg border">
                <p class="text-gray-900">{{ metadata.siteName }}</p>
              </div>
            </div>
          </div>
          <div v-if="metadata.keywords?.length">
            <label class="block text-sm font-medium text-gray-700 mb-2">Mots-clés</label>
            <div class="p-3 bg-gray-50 rounded-lg border flex flex-wrap gap-2">
              <span v-for="keyword in metadata.keywords.split(',')" :key="keyword.trim()"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {{ keyword.trim() }}
              </span>
            </div>
          </div>

          <div v-if="metadata.lastUpdated">
            <label class="block text-sm font-medium text-gray-700 mb-2">Dernière exploration par PGSBOT</label>
            <div class="p-3 bg-gray-50 rounded-lg border">
              <p class="text-gray-900">{{ formatDateTime(metadata.lastUpdated) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap gap-3 mt-4">
      <button @click="copyResultsToClipboard" class="btn-secondary flex items-center">
        <IconCopy class="w-4 h-4 mr-2" />
        Copier les résultats
      </button>
      <button @click="downloadResultsAsTxt" class="btn-primary flex items-center">
        <IconDownload class="w-4 h-4 mr-2" />
        Télécharger TXT
      </button>
      <button @click="clearResults" class="btn-secondary">
        Effacer les résultats
      </button>
    </div>
  </div>
  <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
    @close="closeNotification" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useApiFetch } from '~/utils/api';
import { IconLoader2, IconCopy, IconDownload } from '@tabler/icons-vue';
import type { LinkMetadata, ExtractMetadataResponse } from '~/types';
import AppNotification from '~/components/AppNotification.vue';

const url = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const metadata = ref<LinkMetadata | null>(null);

// États pour la notification
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
let notificationTimeout: NodeJS.Timeout | null = null;

const showFloatingNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  notificationTimeout = setTimeout(() => {
    closeNotification();
  }, 3000);
};

const closeNotification = () => {
  showNotification.value = false;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  metadata.value = null;
  try {
    const response = await useApiFetch<ExtractMetadataResponse>('/eqt/get-metadata', {
      params: { url: url.value }
    });
    metadata.value = response.data;
    showFloatingNotification('Métadonnées extraites avec succès !', 'success');
  } catch (err: any) {
    console.error('Erreur lors de l\'extraction des métadonnées:', err);
    error.value = (err.data?.message as string) || 'Une erreur est survenue lors de l\'extraction des métadonnées.';
    showFloatingNotification(error.value, 'error');
  } finally {
    loading.value = false;
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatResultsForCopy = (data: LinkMetadata) => {
  let text = `Metadata for: ${data.url}\n\n`;
  if (data.title) text += `Title: ${data.title}\n`;
  if (data.description) text += `Description: ${data.description}\n`;
  if (data.image) text += `Image: ${data.image}\n`;
  if (data.favicon) text += `Favicon: ${data.favicon}\n`;
  if (data.keywords) text += `Keywords: ${data.keywords}\n`;
  if (data.language) text += `Language: ${data.language}\n`;
  if (data.author) text += `Author: ${data.author}\n`;
  if (data.source) text += `Source: ${data.source}\n`;
  if (data.siteName) text += `Site Name: ${data.siteName}\n`;
  if (data.lastUpdated) text += `Last Updated: ${formatDateTime(data.lastUpdated)}\n`;
  return text;
};

const copyResultsToClipboard = async () => {
  if (!metadata.value) return;
  try {
    await navigator.clipboard.writeText(formatResultsForCopy(metadata.value));
    showFloatingNotification('Résultats copiés dans le presse-papiers !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier les résultats.', 'error');
  }
};

const downloadResultsAsTxt = () => {
  if (!metadata.value) return;
  const textContent = formatResultsForCopy(metadata.value);
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'metadata_results.txt';
  link.click();
  URL.revokeObjectURL(link.href);
  showFloatingNotification('Fichier TXT téléchargé !', 'success');
};

const clearResults = () => {
  metadata.value = null;
  error.value = null;
  url.value = '';
  showFloatingNotification('Résultats effacés.', 'info');
};
</script>
