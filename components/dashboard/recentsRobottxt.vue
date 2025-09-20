<template>
  <div class="card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Robots.txt récents</h2>
      <div class="flex gap-2">
        <button @click="$emit('open-generate-robots-txt-modal')" class="flex items-center btn-primary text-sm px-3 py-2">
          <IconPlus class="w-4 h-4 mr-1" />
          Nouveau
        </button>
        <button @click="refreshRobotsTxtConfigs" class="btn-secondary text-sm px-3 py-2">
          <IconRefresh class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="robotsTxtStore.loading" class="text-center py-8">
      <IconLoader class="animate-spin w-6 h-6 text-primary-600 mx-auto" />
    </div>
    <div v-else-if="recentRobotsTxtConfigs.length === 0" class="text-center py-8">
      <IconFileText class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">Aucune configuration robots.txt créée</p>
      <button @click="$emit('open-generate-robots-txt-modal')" class="btn-primary text-sm">
        Générer un robots.txt
      </button>
    </div>
    <div v-else class="space-y-3">
      <div v-for="config in recentRobotsTxtConfigs" :key="config.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex-1 min-w-0">
          <NuxtLink :to="`/db/robotstxt/${config.id}`"
            class="text-sm font-medium text-gray-900 hover:underline truncate block" :title="config.title">
            {{ truncateWord(config.title, 40) }}
          </NuxtLink>
          <div class="flex items-center space-x-4 mt-1">
            <span class="text-xs text-gray-500">User-agents: {{ Object.keys(config.userAgents).join(', ') }}</span>
            <span class="text-xs text-gray-500">{{ formatDate(config.lastGenerated) }}</span>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button @click="copyRobotsTxtContentToClipboard(config)" class="text-gray-400 hover:text-primary-600 p-1">
            <IconCopy class="w-4 h-4" />
          </button>
          <button @click="downloadRobotsTxt(config)" class="text-gray-400 hover:text-primary-600 p-1">
            <IconDownload class="w-4 h-4" />
          </button>
          <NuxtLink :to="`/db/robotstxt/${config.id}`" class="text-gray-400 hover:text-primary-600 p-1">
            <IconExternalLink class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRobotsTxtStore } from '~/stores/robotstxt';
import { IconCopy, IconDownload, IconExternalLink, IconFileText, IconLoader, IconPlus, IconRefresh } from '@tabler/icons-vue';
import type { RobotsTxtConfig } from '~/types';

const robotsTxtStore = useRobotsTxtStore();
const emit = defineEmits(['open-generate-robots-txt-modal', 'show-floating-notification']);

const recentRobotsTxtConfigs = computed(() => {
  return [...robotsTxtStore.robotsTxtConfigs as any[]]
    .sort((a, b) => new Date(b.lastGenerated).getTime() - new Date(a.lastGenerated).getTime())
    .slice(0, 10);
});

const refreshRobotsTxtConfigs = async () => {
  await robotsTxtStore.fetchRobotsTxtConfigs();
  if (!robotsTxtStore.error) {
    emit('show-floating-notification', 'Liste des configurations robots.txt actualisée !', 'success');
  }
};

const formatDate = (dateString: string | number) => {
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const truncateWord = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const buildRobotsTxtContent = (cfg: RobotsTxtConfig): string => {
  let content = '';
  for (const userAgent in cfg.userAgents) {
    content += `User-agent: ${userAgent}\n`;
    const rules = cfg.userAgents[userAgent];
    if (rules.disallow && Array.isArray(rules.disallow)) {
      rules.disallow.forEach(rule => {
        content += `Disallow: ${rule}\n`;
      });
    }
    if (rules.allow && Array.isArray(rules.allow)) {
      rules.allow.forEach(rule => {
        content += `Allow: ${rule}\n`;
      });
    }
    content += '\n';
  }
  if (cfg.sitemapUrl) {
    content += `Sitemap: ${cfg.sitemapUrl}\n\n`;
  }
  if (cfg.customRules) {
    content += cfg.customRules + '\n';
  }
  return content;
};

const copyRobotsTxtContentToClipboard = async (config: RobotsTxtConfig) => {
  const content = buildRobotsTxtContent(config);
  if (!content) return;
  try {
    await navigator.clipboard.writeText(content);
    emit('show-floating-notification', 'Contenu robots.txt copié !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie du contenu robots.txt:', err);
    emit('show-floating-notification', 'Impossible de copier le contenu robots.txt.', 'error');
  }
};

const downloadRobotsTxt = (config: RobotsTxtConfig) => {
  const content = buildRobotsTxtContent(config);
  if (!content) {
    emit('show-floating-notification', 'Aucun contenu robots.txt à télécharger pour cette configuration.', 'error');
    return;
  }

  const filename = `robots-${config.title.replace(/\s/g, '-') || config.id}.txt`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  emit('show-floating-notification', 'Fichier robots.txt téléchargé !', 'success');
};
</script>
