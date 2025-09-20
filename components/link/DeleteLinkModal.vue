<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
        <p class="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer ce <strong>{{ link?.shortLink }}</strong> ?
        </p>

        <p class="text-gray-600 mb-6">
          Cette action est irréversible.
        </p>

        <div class="flex space-x-3">
          <button @click="$emit('confirm')" :disabled="loading"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50">
            <span v-if="loading">Suppression...</span>
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
import { IconAlertTriangle } from '@tabler/icons-vue';
import type { ShortLink } from '~/types'

defineProps<{
  visible: boolean;
  link: Readonly<ShortLink> | null; 
  loading?: boolean;
}>();

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
