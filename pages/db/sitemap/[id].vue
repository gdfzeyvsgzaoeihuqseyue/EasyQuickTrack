<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <NuxtLink to="/db/sitemap" class="text-primary-600 hover:text-primary-700 flex items-center">
            <IconChevronLeft class="w-5 h-5 mr-2" />
            Retour aux Sitemaps
          </NuxtLink>
        </div>

        <div v-if="sitemapStore.currentSitemap">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Détails du Sitemap</h1>
          <p class="text-gray-600">Informations et contenu XML pour "{{ sitemapStore.currentSitemap.title ||
            sitemapStore.currentSitemap.url }}"</p>
        </div>
      </div>

      <div v-if="sitemapStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="sitemapStore.error" class="card p-8 text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
        <p class="text-gray-600 mb-4">{{ sitemapStore.error }}</p>
        <NuxtLink to="/db/sitemap" class="btn-primary">Retour à la liste</NuxtLink>
      </div>

      <div v-else-if="sitemap" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Informations générales -->
          <div class="card p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Informations générales</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input v-model="editableTitle" type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :disabled="sitemapStore.loading" />
                <button @click="updateSitemapTitle" :disabled="sitemapStore.loading || editableTitle === sitemap.title"
                  class="mt-2 btn-primary text-sm py-2 px-4 disabled:opacity-50">
                  Mettre à jour le titre
                </button>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">URL du site</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <a :href="sitemap.url" target="_blank" class="text-primary-600 hover:underline break-all">
                    {{ sitemap.url }}
                  </a>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre d'URLs</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <span class="text-gray-900">{{ sitemap.urlsCount }}</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Dernière génération</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <span class="text-gray-900">{{ formatDateTime(sitemap.lastGenerated) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Options de génération -->
          <div class="card p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Options de génération</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div class="flex items-center">
                <IconCheck class="w-5 h-5 text-green-500 mr-2" v-if="sitemap.options.includePriority" />
                <IconX class="w-5 h-5 text-red-500 mr-2" v-else />
                <span>Priorité: {{ sitemap.options.includePriority ? 'Oui' : 'Non' }}</span>
              </div>
              <div class="flex items-center">
                <IconCheck class="w-5 h-5 text-green-500 mr-2" v-if="sitemap.options.includeLastmod" />
                <IconX class="w-5 h-5 text-red-500 mr-2" v-else />
                <span>Dernière modif.: {{ sitemap.options.includeLastmod ? 'Oui' : 'Non' }}</span>
              </div>
              <div class="flex items-center">
                <IconCheck class="w-5 h-5 text-green-500 mr-2" v-if="sitemap.options.includeChangefreq" />
                <IconX class="w-5 h-5 text-red-500 mr-2" v-else />
                <span>Fréquence: {{ sitemap.options.changefreq || 'N/A' }}</span>
              </div>
              <div class="flex items-center">
                <IconSitemap class="w-5 h-5 text-primary mr-2" />
                <span>Max pages: {{ sitemap.options.maxPages === 0 ? 'Illimité' : sitemap.options.maxPages }}</span>
              </div>
              <div class="flex items-center">
                <IconCheck class="w-5 h-5 text-green-500 mr-2" v-if="sitemap.options.followRobotsTxt" />
                <IconX class="w-5 h-5 text-red-500 mr-2" v-else />
                <span>Robots.txt: {{ sitemap.options.followRobotsTxt ? 'Oui' : 'Non' }}</span>
              </div>
              <div class="flex items-center">
                <IconCheck class="w-5 h-5 text-green-500 mr-2" v-if="sitemap.options.ignoreNoindex" />
                <IconX class="w-5 h-5 text-red-500 mr-2" v-else />
                <span>Ignorer "noindex": {{ sitemap.options.ignoreNoindex ? 'Oui' : 'Non' }}</span>
              </div>
              <div class="flex items-center">
                <IconCheck class="w-5 h-5 text-green-500 mr-2" v-if="sitemap.options.ignoreNofollow" />
                <IconX class="w-5 h-5 text-red-500 mr-2" v-else />
                <span>Ignorer "nofollow": {{ sitemap.options.ignoreNofollow ? 'Oui' : 'Non' }}</span>
              </div>
              <div class="flex items-center">
                <IconCheck class="w-5 h-5 text-green-500 mr-2" v-if="sitemap.options.ignoreNonCanonical" />
                <IconX class="w-5 h-5 text-red-500 mr-2" v-else />
                <span>Ignorer non-canonique: {{ sitemap.options.ignoreNonCanonical ? 'Oui' : 'Non' }}</span>
              </div>
              <div class="flex items-center">
                <IconCheck class="w-5 h-5 text-green-500 mr-2" v-if="sitemap.options.includeImages" />
                <IconX class="w-5 h-5 text-red-500 mr-2" v-else />
                <span>Inclure les images: {{ sitemap.options.includeImages ? 'Oui' : 'Non' }}</span>
              </div>
            </div>
          </div>
        </div>

         <!-- Sites scannés -->
        <div v-if="sitemap.scannedUrls && sitemap.scannedUrls.length > 0" class="card p-8">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h2 class="text-2xl font-bold text-gray-900">URLs scannées ({{ sitemap.scannedUrls.length }})</h2>
            <button @click="copyScannedUrlsToClipboard" class="btn-secondary flex items-center justify-center text-sm py-2 px-4">
              <IconCopy class="w-4 h-4" />
              <span class="hidden sm:inline ml-2">{{ copiedUrls ? 'Copié!' : 'Copier toutes les URLs' }}</span>
            </button>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
            <ul class="list-disc list-inside space-y-1">
              <li v-for="(url, index) in sitemap.scannedUrls" :key="index" class="break-all">
                <a :href="url" target="_blank" class="text-primary-600 hover:underline">{{ url }}</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Contenu XML -->
        <div class="card p-8">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h2 class="text-2xl font-bold text-gray-900">Contenu XML du Sitemap</h2>
            <div class="flex gap-2 mx-auto">
              <button @click="copyXmlToClipboard"
                class="btn-secondary flex items-center justify-center text-sm py-2 px-4">
                <IconCopy class="w-4 h-4" />
                <span class="hidden sm:inline ml-2">{{ copiedXml ? 'Copié!' : 'Copier XML' }}</span>
              </button>
              <button @click="downloadSitemapXml"
                class="btn-primary flex items-center justify-center text-sm py-2 px-4">
                <IconDownload class="w-4 h-4" />
                <span class="hidden sm:inline ml-2">Télécharger</span>
              </button>
            </div>
          </div>
          <pre
            class="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96 whitespace-pre-wrap">{{ sitemap.sitemapXml }}</pre>
        </div>

        <!-- Actions -->
        <div class="card p-8 flex justify-end">
          <button @click="confirmDelete" class="btn-danger flex items-center">
            <IconTrash class="w-5 h-5 mr-2" />
            Supprimer ce Sitemap
          </button>
        </div>
      </div>
    </div>

    <DeleteSitemapModal :visible="showDeleteModal" :sitemap="sitemap" :loading="sitemapStore.loading"
      @confirm="deleteSitemap" @cancel="closeDeleteModal" />

    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSitemapStore } from '~/stores/sitemap';
import { DeleteSitemapModal } from '@/components/sitemap';
import {
  IconChevronLeft, IconLoader, IconAlertTriangle, IconCopy, IconTrash,
  IconCheck, IconX, IconSitemap, IconCalendar, IconDownload
} from '@tabler/icons-vue';
import type { ShortLinkSitemap } from '@/types';

definePageMeta({
  layout: 'dashboard'
});

const route = useRoute();
const router = useRouter();
const sitemapStore = useSitemapStore();

const sitemapId = route.params.id as string;
const sitemap = computed<any>(() => sitemapStore.currentSitemap);
const editableTitle = ref('');
const copiedXml = ref(false); 
const copiedUrls = ref(false);
const showDeleteModal = ref(false);

// Notification
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
const showNotification = ref(false);
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

// Watch for store errors
watch(() => sitemapStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

onMounted(async () => {
  if (sitemapId) {
    await sitemapStore.fetchSitemapById(sitemapId);
    if (sitemap.value) {
      editableTitle.value = sitemap.value.title || '';
    }
  }
});

watch(sitemap, (newSitemap) => {
  if (newSitemap) {
    editableTitle.value = newSitemap.title || '';
  }
});

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR');
};

const updateSitemapTitle = async () => {
  if (!sitemap.value || editableTitle.value === sitemap.value.title) return;
  const success = await sitemapStore.updateSitemap(sitemap.value.id, editableTitle.value);
  if (success) {
    showFloatingNotification('Titre du sitemap mis à jour !', 'success');
  }
};

const copyXmlToClipboard = async () => {
  if (!sitemap.value?.sitemapXml) return;
  try {
    await navigator.clipboard.writeText(sitemap.value.sitemapXml);
    copiedXml.value = true;
    showFloatingNotification('Contenu XML copié !', 'success');
    setTimeout(() => (copiedXml.value = false), 2000);
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier le contenu XML.', 'error');
  }
};

const copyScannedUrlsToClipboard = async () => {
  if (!sitemap.value?.scannedUrls || sitemap.value.scannedUrls.length === 0) return;
  try {
    await navigator.clipboard.writeText(sitemap.value.scannedUrls.join('\n'));
    copiedUrls.value = true;
    showFloatingNotification('URLs scannées copiées !', 'success');
    setTimeout(() => (copiedUrls.value = false), 2000);
  } catch (err) {
    console.error('Erreur lors de la copie des URLs:', err);
    showFloatingNotification('Impossible de copier les URLs scannées.', 'error');
  }
};

const downloadSitemapXml = () => {
  if (!sitemap.value?.sitemapXml) {
    showFloatingNotification('Aucun contenu XML à télécharger.', 'error');
    return;
  }

  const filename = `sitemap-${sitemap.value.title?.replace(/\s/g, '-') || sitemap.value.id}.xml`;
  const blob = new Blob([sitemap.value.sitemapXml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showFloatingNotification('Sitemap téléchargé !', 'success');
};

const confirmDelete = () => {
  showDeleteModal.value = true;
  sitemapStore.clearError();
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  sitemapStore.clearError();
};

const deleteSitemap = async () => {
  if (!sitemap.value) return;
  const success = await sitemapStore.deleteSitemap(sitemap.value.id);
  if (success) {
    showFloatingNotification('Sitemap supprimé avec succès !', 'success');
    router.push('/db/sitemap');
  }
};

useSeoMeta({
  title: computed(() => sitemap.value ? `Sitemap: ${sitemap.value.title || sitemap.value.url}` : 'Détails du Sitemap'),
  description: 'Affichez les détails et le contenu XML d\'un sitemap.',
  robots: 'noindex, nofollow'
});
</script>

<style scoped>
.btn-danger {
  @apply bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors;
}
</style>
