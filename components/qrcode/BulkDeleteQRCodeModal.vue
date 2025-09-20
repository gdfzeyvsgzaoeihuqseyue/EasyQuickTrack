<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">Suppression en masse</h3>
        
        <div class="mb-6">
          <p class="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer <strong>{{ count }}</strong> QR Code{{ count > 1 ? 's' : '' }} ?
          </p>
          
          <!-- Icônes représentatives -->
          <div class="flex justify-center space-x-2 mb-4">
            <div v-for="i in Math.min(count, 5)" :key="i" 
              class="w-8 h-8 bg-gray-200 rounded border flex items-center justify-center">
              <IconQrcode class="w-4 h-4 text-gray-500" />
            </div>
            <div v-if="count > 5" class="flex items-center">
              <span class="text-gray-500 text-sm ml-2">+{{ count - 5 }} autres</span>
            </div>
          </div>
          
          <div class="bg-red-50 p-4 rounded-lg border border-red-200">
            <div class="flex items-start">
              <IconAlertTriangle class="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div class="text-left">
                <p class="text-sm text-red-800 font-medium mb-1">Attention !</p>
                <p class="text-sm text-red-700">
                  Cette action supprimera définitivement {{ count > 1 ? 'ces QR codes' : 'ce QR code' }} 
                  de la base de données. Cette opération ne peut pas être annulée.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex space-x-3">
          <button @click="$emit('confirm')" :disabled="loading"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50 transition-colors">
            <span v-if="loading" class="flex items-center justify-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Suppression en cours...
            </span>
            <span v-else>Supprimer {{ count > 1 ? 'tout' : '' }}</span>
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
import { IconAlertTriangle, IconLoader2, IconQrcode } from '@tabler/icons-vue'

const props = defineProps<{
  visible: boolean
  count: number
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>