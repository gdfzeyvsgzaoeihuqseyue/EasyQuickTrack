<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
        
        <div v-if="qrCode" class="mb-6">
          <p class="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer ce QR Code ?
          </p>
          
          <!-- Aperçu du QR Code -->
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 bg-white rounded-lg border-2 border-gray-200 p-2">
              <img :src="qrCode.qrCodeBase64" :alt="qrCode.title" class="w-full h-full object-contain" />
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg text-left">
            <p class="text-sm text-gray-700 mb-2">
              <span class="font-medium">Titre:</span> {{ qrCode.title || 'QR Code sans titre' }}
            </p>
            <p class="text-sm text-gray-700 mb-2">
              <span class="font-medium">Type:</span> 
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-1"
                :class="qrCode.qrCodeType === 'shortlink' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                {{ qrCode.qrCodeType === 'shortlink' ? 'Lien court' : 'URL directe' }}
              </span>
            </p>
            <p class="text-sm text-gray-700">
              <span class="font-medium">Créé le:</span> {{ formatDate(qrCode.createdAt) }}
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
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-vue'
import type { QRCodeRecord } from '~/stores/qrcode'

const props = defineProps<{
  visible: boolean
  qrCode: QRCodeRecord | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>