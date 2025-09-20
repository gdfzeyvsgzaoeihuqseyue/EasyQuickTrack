<template>
  <div class="card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Sitemaps récents</h2>
      <div class="flex gap-2">
        <button @click="$emit('open-generate-sitemap-modal')" class="flex items-center btn-primary text-sm px-3 py-2">
          <IconPlus class="w-4 h-4 mr-1" />
          Nouveau
        </button>
        <button @click="refreshSitemaps" class="btn-secondary text-sm px-3 py-2">
          <IconRefresh class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="sitemapStore.loading" class="text-center py-8">
      <IconLoader class="animate-spin w-6 h-6 text-primary-600 mx-auto" />
    </div>
    <div v-else-if="recentSitemaps.length === 0" class="text-center py-8">
      <IconSitemap class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">Aucun Sitemap créé</p>
      <button @click="$emit('open-generate-sitemap-modal')" class="btn-primary text-sm">
        Générer un Sitemap
      </button>
    </div>
    <div v-else class="space-y-3">
      <div v-for="sitemap in recentSitemaps" :key="sitemap.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex-1 min-w-0">
          <NuxtLink :to="`/db/sitemap/${sitemap.id}`"
            class="text-sm font-medium text-gray-900 hover:underline truncate block" :title="sitemap.title || sitemap.url">
            {{ truncateWord(sitemap.title || sitemap.url, 40) }}
          </NuxtLink>
          <div class="flex items-center space-x-4 mt-1">
            <span class="text-xs text-gray-500">{{ sitemap.urlsCount }} URLs</span>
            <span class="text-xs text-gray-500">{{ formatDate(sitemap.lastGenerated) }}</span>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button @click="copySitemapXmlToClipboard(sitemap)" class="text-gray-400 hover:text-primary-600 p-1">
            <IconCopy class="w-4 h-4" />
          </button>
          <button @click="downloadSitemapXml(sitemap)" class="text-gray-400 hover:text-primary-600 p-1">
            <IconDownload class="w-4 h-4" />
          </button>
          <NuxtLink :to="`/db/sitemap/${sitemap.id}`" class="text-gray-400 hover:text-primary-600 p-1">
            <IconExternalLink class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSitemapStore } from '~/stores/sitemap';
import { IconCopy, IconDownload, IconExternalLink, IconLoader, IconPlus, IconRefresh, IconSitemap } from '@tabler/icons-vue';
import type { ShortLinkSitemap } from '~/types';

const sitemapStore = useSitemapStore();
const emit = defineEmits(['open-generate-sitemap-modal', 'show-floating-notification']);

const recentSitemaps = computed(() => {
  return [...sitemapStore.sitemaps as any[]]
    .sort((a, b) => new Date(b.lastGenerated).getTime() - new Date(a.lastGenerated).getTime())
    .slice(0, 10);
});

const refreshSitemaps = async () => {
  await sitemapStore.fetchSitemaps();
  if (!sitemapStore.error) {
    emit('show-floating-notification', 'Liste des sitemaps actualisée !', 'success');
  }
};

const formatDate = (dateString: string | number) => {
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const truncateWord = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const copySitemapXmlToClipboard = async (sitemap: ShortLinkSitemap) => {
  if (!sitemap.sitemapXml) return;
  try {
    await navigator.clipboard.writeText(sitemap.sitemapXml);
    emit('show-floating-notification', 'Contenu XML du sitemap copié !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie du sitemap XML:', err);
    emit('show-floating-notification', 'Impossible de copier le contenu XML du sitemap.', 'error');
  }
};

const downloadSitemapXml = (sitemap: ShortLinkSitemap) => {
  if (!sitemap.sitemapXml) {
    emit('show-floating-notification', 'Aucun contenu XML à télécharger pour ce sitemap.', 'error');
    return;
  }

  const filename = `sitemap-${sitemap.title?.replace(/\s/g, '-') || sitemap.id}.xml`;
  const blob = new Blob([sitemap.sitemapXml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  emit('show-floating-notification', 'Sitemap téléchargé !', 'success');
};
</script>
