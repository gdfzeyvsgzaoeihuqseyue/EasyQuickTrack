<template>
  <div v-if="associatedQRCode" class="card p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">QR Code associé</h2>
    <div class="flex flex-col md:flex-row items-center gap-6">
      <div class="w-32 h-32 bg-white rounded-lg border p-2 flex-shrink-0">
        <img :src="associatedQRCode.qrCodeBase64" :alt="associatedQRCode.title"
          class="w-full h-full object-contain" />
      </div>
      <div class="flex-1 text-center md:text-left">
        <p class="text-lg font-semibold text-gray-900 mb-2">{{ associatedQRCode.title || 'QR Code sans titre' }}</p>
        <p class="text-gray-600 mb-4">Ce QR Code est lié à votre lien court. Scannez-le pour accéder à l'URL.</p>
        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
          <NuxtLink :to="`/db/qrcode/${associatedQRCode.id}`" class="btn-secondary text-sm">
            Voir les détails
          </NuxtLink>
          <button @click="$emit('edit-qr-code', associatedQRCode)" class="btn-secondary text-sm">
            Modifier
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="card p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">QR Code associé</h2>
    <IconQrcode class="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p class="text-gray-600 mb-4">Aucun QR Code n'est actuellement associé à ce lien.</p>
    <button @click="$emit('generate-qr-code')" class="btn-primary text-sm">
      Générer un QR Code pour ce lien
    </button>
  </div>
</template>

<script setup lang="ts">
import { IconQrcode } from '@tabler/icons-vue';
import type { QRCodeRecord } from '~/stores/qrcode';

defineProps<{
  associatedQRCode: QRCodeRecord | null;
}>();

defineEmits(['generate-qr-code', 'edit-qr-code']); 
</script>
