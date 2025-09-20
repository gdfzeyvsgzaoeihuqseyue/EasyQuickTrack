<template>
  <div class="card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Liens récents</h2>
      <div class="flex gap-2">
        <button @click="$emit('open-create-link-modal')" class="flex items-center btn-primary text-sm px-3 py-2">
          <IconPlus class="w-4 h-4 mr-1" />
          Nouveau
        </button>
        <button @click="fetchShortLinks" class="btn-secondary text-sm px-3 py-2">
          <IconRefresh class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="linksStore.loading" class="text-center py-8">
      <IconLoader class="animate-spin w-6 h-6 text-primary-600 mx-auto" />
    </div>
    <div v-else-if="recentLinks.length === 0" class="text-center py-8">
      <IconLink class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">Aucun lien créé</p>
      <button @click="$emit('open-create-link-modal')" class="btn-primary text-sm">
        Créer mon premier lien
      </button>
    </div>
    <div v-else class="space-y-3">
      <div v-for="link in recentLinks" :key="link.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex-1 min-w-0">
          <NuxtLink :to="`/db/links/${link.id}`"
            class="text-sm font-medium text-gray-900 hover:underline truncate block" :title="link.longUrl">
            {{ truncateWord(link.longUrl, 40) }}
          </NuxtLink>
          <div class="flex items-center space-x-4 mt-1">
            <span class="text-xs text-primary-600">{{ link.shortCode }}</span>
            <span class="text-xs text-gray-500">{{ link.clicks || 0 }} clics</span>
            <span class="text-xs text-gray-500">{{ formatDate(link.createdAt) }}</span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="copyLink(link.shortLink)" class="text-gray-400 hover:text-primary-600 p-1">
            <IconCopy class="w-4 h-4" />
          </button>
          <NuxtLink :to="`/db/links/${link.id}`" class="text-gray-400 hover:text-primary-600 p-1">
            <IconExternalLink class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLinksStore } from '~/stores/links';
import { IconCopy, IconExternalLink, IconLink, IconLoader, IconPlus, IconRefresh } from '@tabler/icons-vue';
import type { ShortLink } from '~/types';

const linksStore = useLinksStore();

const emit = defineEmits(['open-create-link-modal', 'show-floating-notification']);

const recentLinks = computed(() => {
  return [...linksStore.links]
    .sort((a, b) => {
      const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
      const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
      return bTime - aTime;
    })
    .slice(0, 10);
});

const fetchShortLinks = async () => {
  await linksStore.fetchLinks();
  if (!linksStore.error) {
    emit('show-floating-notification', 'Liste des liens actualisée !', 'success');
  }
};

const formatDate = (dateString: string | number) => {
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const truncateWord = (url: string, maxLength: number) => {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
};

const copyLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    emit('show-floating-notification', 'Lien copié !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    emit('show-floating-notification', 'Impossible de copier le lien.', 'error');
  }
};
</script>
