<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression de la configuration robots.txt</h3>

        <div v-if="config" class="mb-6">
          <p class="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer la configuration : <strong>{{ config.title }}</strong> ?
          </p>
          <div class="bg-gray-50 p-4 rounded-lg text-left">
            <p class="text-sm text-gray-700 mb-2">
              <span class="font-medium">Titre:</span> {{ config.title }}
            </p>
            <p class="text-sm text-gray-700">
              <span class="font-medium">Dernière génération:</span> {{ formatDate(config.lastGenerated) }}
            </p>
          </div>
        </div>

        <p class="text-gray-600 mb-6">
          Cette action est irréversible.
        </p>

        <div class="flex space-x-3">
          <button @click="$emit('confirm')" :disabled="loading"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50 transition-colors">
            <span v-if="loading" class="flex items-center justify-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Suppression...
            </span>
            <span v-else>Supprimer</span>
          </button>
          <button @click="$emit('cancel')" class="flex-1 btn-secondary" :disabled="loading">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-vue';
import type { RobotsTxtConfig } from '@/types';

const props = defineProps<{
  visible: boolean;
  config: Readonly<RobotsTxtConfig> | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>
