<template>
  <div v-if="associatedSitemap" class="card p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Sitemap associé</h2>
    <div class="flex flex-col md:flex-row items-center gap-6">
      <div class="w-32 h-32 bg-gray-100 rounded-lg border p-2 flex-shrink-0 flex items-center justify-center">
        <IconSitemap class="w-20 h-20 text-primary-600" />
      </div>
      <div class="flex-1 text-center md:text-left">
        <p class="text-lg font-semibold text-gray-900 mb-2">{{ associatedSitemap.title || 'Sitemap sans titre' }}</p>
        <p class="text-gray-600 mb-4">Ce sitemap contient {{ associatedSitemap.urlsCount }} URLs et est lié à votre site.</p>
        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
          <NuxtLink :to="`/db/sitemap/${associatedSitemap.id}`" class="btn-secondary text-sm">
            Voir les détails
          </NuxtLink>
          <button @click="$emit('open-generate-sitemap-modal', associatedSitemap)" class="btn-secondary text-sm">
            Modifier
          </button>
          <button @click="$emit('open-generate-sitemap-modal', null)" class="btn-primary text-sm">
            Générer un sitemap récent
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="card p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Sitemap associé</h2>
    <IconSitemap class="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p class="text-gray-600 mb-4">Aucun Sitemap n'est actuellement associé à ce lien.</p>
    <button @click="$emit('open-generate-sitemap-modal', null)" class="btn-primary text-sm">
      Générer un Sitemap pour ce lien
    </button>
  </div>
</template>

<script setup lang="ts">
import { IconSitemap } from '@tabler/icons-vue';
import type { ShortLinkSitemap } from '@/types';

defineProps<{
  associatedSitemap: ShortLinkSitemap | null;
}>();

defineEmits(['open-generate-sitemap-modal']);
</script>
