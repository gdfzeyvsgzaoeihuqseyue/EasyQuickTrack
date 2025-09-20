<template>
  <div class="card p-6 flex flex-col justify-between h-full">
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2 truncate" :title="config.title">
        {{ config.title }}
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        <span class="font-medium">User-agents:</span>
        {{ Object.keys(config.userAgents).join(', ') }}
      </p>
      <div class="flex items-center text-sm text-gray-500 mb-4">
        <IconSitemap class="w-4 h-4 mr-2" />
        <span>Sitemap: {{ config.sitemapUrl ? 'Oui' : 'Non' }}</span>
        <span class="mx-2">•</span>
        <IconCalendar class="w-4 h-4 mr-2" />
        <span>{{ formatDate(config.lastGenerated) }}</span>
      </div>
    </div>
    <div class="flex space-x-2 mt-4">
      <NuxtLink :to="`/db/robotstxt/${config.id}`" class="btn-secondary flex-1 text-center text-sm py-2">
        Voir détails
      </NuxtLink>
      <button @click="$emit('delete', config.id)" class="btn-danger flex-1 text-center text-sm py-2">
        Supprimer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSitemap, IconCalendar } from '@tabler/icons-vue';
import type { RobotsTxtConfig } from '@/types';

const props = defineProps<{
  config: Readonly<RobotsTxtConfig>; 
}>();

const emit = defineEmits(['delete']);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>

<style scoped>
.btn-danger {
  @apply bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors;
}
</style>
