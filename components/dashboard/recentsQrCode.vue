<template>
  <div class="card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">QR Codes récents</h2>
      <div class="flex gap-2">
        <NuxtLink to="/db/qrcode/create" class="flex items-center btn-primary text-sm px-3 py-2">
          <IconPlus class="w-4 h-4 mr-1" />
          Nouveau
        </NuxtLink>
        <button @click="fetchQRCodes" class="btn-secondary text-sm px-3 py-2">
          <IconRefresh class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="qrCodesLoading" class="text-center py-8">
      <IconLoader class="animate-spin w-6 h-6 text-primary-600 mx-auto" />
    </div>
    <div v-else-if="recentQRCodes.length === 0" class="text-center py-8">
      <IconQrcode class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">Aucun QR Code créé</p>
      <NuxtLink to="/db/qrcode/create" class="btn-primary text-sm">
        Créer un QR Code
      </NuxtLink>
    </div>
    <div v-else class="space-y-3">
      <div v-for="qrCode in recentQRCodes" :key="qrCode.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex items-center space-x-3 min-w-0">
          <div class="w-10 h-10 bg-white rounded-lg p-1 border flex-shrink-0">
            <img :src="qrCode.qrCodeBase64" alt="QR Code" class="w-full h-full object-contain" />
          </div>
          <div class="flex-1 min-w-0 overflow-hidden">
            <NuxtLink :to="`/db/qrcode/${qrCode.id}`" class="text-sm font-medium text-gray-900 hover:underline truncate" :title="qrCode.title">
              {{ truncateWord(qrCode.title, 40) }}
            </NuxtLink>
            <div class="flex items-center space-x-4 mt-1">
              <span class="text-xs text-gray-500">{{ qrCode.qrCodeType }}</span>
              <span class="text-xs text-gray-500">{{ formatDate(qrCode.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button @click="downloadQRCode(qrCode)" class="text-gray-400 hover:text-primary-600 p-1">
            <IconDownload class="w-4 h-4" />
          </button>
          <NuxtLink :to="`/db/qrcode/${qrCode.id}`" class="text-gray-400 hover:text-primary-600 p-1">
            <IconExternalLink class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQRCodeStore } from '~/stores/qrcode';
import { IconDownload, IconExternalLink, IconLoader, IconPlus, IconQrcode, IconRefresh } from '@tabler/icons-vue';

interface QRCode {
  id: string;
  title: string;
  qrCodeBase64: string;
  qrCodeType: string;
  createdAt: string;
}

const qrStore = useQRCodeStore();
const emit = defineEmits(['show-floating-notification']);

const recentQRCodes = ref<QRCode[]>([]);
const qrCodesLoading = ref(false);
const qrCodesError = ref('');

const fetchQRCodes = async () => {
  qrCodesLoading.value = true;
  qrCodesError.value = '';

  try {
    const config = useRuntimeConfig();
    const response = await $fetch<{ data: QRCode[] }>(`${config.public.pgsBaseAPI}/eqt/qrcodes?limit=10`);
    recentQRCodes.value = response.data || [];
    if (!qrCodesError.value) {
      emit('show-floating-notification', 'Liste des QR codes actualisée !', 'success');
    }
  } catch (err: any) {
    console.error('Erreur lors de la récupération des QR codes:', err);
    qrCodesError.value = 'Erreur lors du chargement des QR codes';
    emit('show-floating-notification', 'Erreur lors du chargement des QR codes.', 'error');
  } finally {
    qrCodesLoading.value = false;
  }
};

onMounted(() => {
  fetchQRCodes();
});

const formatDate = (dateString: string | number) => {
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const truncateWord = (url: string, maxLength: number) => {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
};

const downloadQRCode = (qrCode: QRCode) => {
  const link = document.createElement('a');
  link.href = qrCode.qrCodeBase64;
  link.download = `${qrCode.title || 'qrcode'}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  emit('show-floating-notification', 'QR Code téléchargé !', 'success');
};
</script>
