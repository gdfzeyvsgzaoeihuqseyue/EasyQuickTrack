<template>
  <div class="card p-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Métadonnées du site</h2>
      <button v-if="!loading && linkMetadata" @click="$emit('refresh')" class="btn-secondary flex items-center text-sm">
        <IconRefresh class="w-4 h-4 mr-2" />
        Actualiser
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <IconLoader class="animate-spin w-6 h-6 text-primary-600 mx-auto mb-2" />
      <p class="text-gray-500">Extraction des métadonnées en cours...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <IconAlertTriangle class="w-12 h-12 text-orange-500 mx-auto mb-4" />
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button @click="$emit('refresh')" class="btn-secondary">Réessayer</button>
    </div>

    <div v-else-if="!linkMetadata" class="text-center py-8">
      <IconWorld class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">Aucune métadonnée disponible</p>
      <button @click="$emit('refresh')" class="btn-primary">Extraire les métadonnées</button>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div v-if="linkMetadata.image" class="lg:col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-2">Image de prévisualisation</label>
        <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
          <img :src="linkMetadata.image" :alt="linkMetadata.title || 'Image de prévisualisation'"
            class="w-full h-full object-cover" @error="handleImageError" />
        </div>
      </div>

      <div :class="linkMetadata.image ? 'lg:col-span-2' : 'lg:col-span-3'">
        <div class="space-y-6">
          <div v-if="linkMetadata.favicon || linkMetadata.title">
            <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
            <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <img v-if="linkMetadata.favicon" :src="linkMetadata.favicon" class="w-6 h-6 mr-2 inline-block"
                alt="Favicon" />
              <p v-if="linkMetadata.title" class="text-gray-900 font-medium">
                {{ linkMetadata.title }}
              </p>
            </div>
          </div>

          <div v-if="linkMetadata.description">
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <div class="p-3 bg-gray-50 rounded-lg border">
              <p class="text-gray-700 leading-relaxed">{{ linkMetadata.description }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="linkMetadata.author">
              <label class="block text-sm font-medium text-gray-700 mb-2">Auteur</label>
              <div class="p-3 bg-gray-50 rounded-lg border">
                <p class="text-gray-900">{{ linkMetadata.author }}</p>
              </div>
            </div>

            <div v-if="linkMetadata.language">
              <label class="block text-sm font-medium text-gray-700 mb-2">Langue</label>
              <div class="p-3 bg-gray-50 rounded-lg border">
                <p class="text-gray-900">{{ linkMetadata.language }}</p>
              </div>
            </div>

            <div v-if="linkMetadata.source">
              <label class="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <div class="p-3 bg-gray-50 rounded-lg border">
                <p class="text-gray-900">{{ linkMetadata.source }}</p>
              </div>
            </div>

            <div v-if="linkMetadata.siteName">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom du site</label>
              <div class="p-3 bg-gray-50 rounded-lg border">
                <p class="text-gray-900">{{ linkMetadata.siteName }}</p>
              </div>
            </div>

            <div v-if="linkMetadata.favicon">
              <label class="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
              <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <img :src="linkMetadata.favicon" class="w-6 h-6 mr-2 inline-block" alt="Favicon" />
                <p class="text-gray-900 inline-block align-middle">{{ linkMetadata.favicon }}</p>
              </div>
            </div>
          </div>
          <div v-if="linkMetadata.keywords?.length">
            <label class="block text-sm font-medium text-gray-700 mb-2">Mots-clés</label>
            <div class="p-3 bg-gray-50 rounded-lg border flex flex-wrap gap-2">
              <span v-for="keyword in linkMetadata.keywords.split(',')" :key="keyword.trim()"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {{ keyword.trim() }}
              </span>
            </div>
          </div>

          <div v-if="linkMetadata.lastUpdated">
            <label class="block text-sm font-medium text-gray-700 mb-2">Dernière exploration par PGSBOT</label>
            <div class="p-3 bg-gray-50 rounded-lg border">
              <p class="text-gray-900">{{ formatDateTime(linkMetadata.lastUpdated) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconLoader, IconRefresh, IconWorld } from '@tabler/icons-vue';

// Définir les props
defineProps({
  linkMetadata: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
});

// Définir les événements émis
defineEmits(['refresh']);

// Fonctions d'aide
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
</script>
