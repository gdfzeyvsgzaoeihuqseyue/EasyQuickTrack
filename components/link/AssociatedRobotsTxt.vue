<template>
  <div v-if="associatedRobotsTxt" class="card p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Robots.txt associé</h2>
    <div class="flex flex-col md:flex-row items-center gap-6">
      <div class="w-32 h-32 bg-gray-100 rounded-lg border p-2 flex-shrink-0 flex items-center justify-center">
        <IconFileText class="w-20 h-20 text-success-600" />
      </div>
      <div class="flex-1 text-center md:text-left">
        <p class="text-lg font-semibold text-gray-900 mb-2">{{ associatedRobotsTxt.title || 'Robots.txt sans titre' }}</p>
        <p class="text-gray-600 mb-4">Cette configuration robots.txt gère l'accès des robots à votre site.</p>
        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
          <NuxtLink :to="`/db/robotstxt/${associatedRobotsTxt.id}`" class="btn-secondary text-sm">
            Voir les détails
          </NuxtLink>
          <button @click="$emit('open-generate-robots-txt-modal', associatedRobotsTxt)" class="btn-secondary text-sm">
            Modifier
          </button>
          <button @click="$emit('open-generate-robots-txt-modal', null)" class="btn-primary text-sm">
            Générer un robots.txt récent
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="card p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Robots.txt associé</h2>
    <IconFileText class="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p class="text-gray-600 mb-4">Aucune configuration robots.txt n'est actuellement associée à ce lien.</p>
    <button @click="$emit('open-generate-robots-txt-modal', null)" class="btn-primary text-sm">
      Générer un Robots.txt pour ce lien
    </button>
  </div>
</template>

<script setup lang="ts">
import { IconFileText } from '@tabler/icons-vue';
import type { RobotsTxtConfig } from '@/types';

defineProps<{
  associatedRobotsTxt: RobotsTxtConfig | null;
}>();

defineEmits(['open-generate-robots-txt-modal']);
</script>
