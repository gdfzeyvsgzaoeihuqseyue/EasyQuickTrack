<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <NuxtLink to="/db/qrcode" class="text-primary-600 hover:text-primary-700 flex items-center">
            <IconChevronLeft class="w-5 h-5 mr-2" />
            Retour aux QR codes
          </NuxtLink>
        </div>

        <div v-if="qrStore.currentQRCode">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Détails du QR Code</h1>
          <p class="text-gray-600">Informations et options pour "{{ qrStore.currentQRCode.title || 'QR Code sans titre' }}"</p>
        </div>
      </div>

      <div v-if="qrStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="qrStore.error" class="card p-8 text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
        <p class="text-gray-600 mb-4">{{ qrStore.error }}</p>
        <NuxtLink to="/db/qrcode" class="btn-primary">Retour à la liste</NuxtLink>
      </div>

      <div v-else-if="qrStore.currentQRCode" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Aperçu</h2>
            <div class="flex flex-col items-center">
              <div class="w-64 h-64 bg-white rounded-lg border-2 border-gray-200 p-4 mb-6">
                <img :src="qrStore.currentQRCode.qrCodeBase64" :alt="qrStore.currentQRCode.title" 
                     class="w-full h-full object-contain" />
              </div>
              
              <div class="flex flex-wrap gap-3 justify-center">
                <button @click="downloadQRCode" class="btn-primary flex items-center">
                  <IconDownload class="w-4 h-4 mr-2" />
                  Télécharger
                </button>
                <button @click="copyQRCodeToClipboard" class="btn-secondary flex items-center">
                  <IconCopy class="w-4 h-4 mr-2" />
                  {{ copied ? 'Copié!' : 'Copier l\'image' }}
                </button>
                <button @click="editQRCode" class="btn-secondary flex items-center">
                  <IconEdit class="w-4 h-4 mr-2" />
                  Modifier
                </button>
                <NuxtLink to="/db/deleteInfo" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center">
                  <IconInfoCircle class="w-4 h-4 mr-2" />
                  Info suppr.
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="card p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Informations</h2>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <span class="text-gray-900">{{ qrStore.currentQRCode.title || 'Aucun titre' }}</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium"
                    :class="qrStore.currentQRCode.qrCodeType === 'shortlink' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                    {{ qrStore.currentQRCode.qrCodeType === 'shortlink' ? 'Lien court' : 'URL directe' }}
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ qrStore.currentQRCode.qrCodeType === 'shortlink' ? 'Lien court associé' : 'URL encodée' }}
                </label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <a v-if="qrStore.currentQRCode.shortLink" 
                     :href="qrStore.currentQRCode.shortLink.shortLink" 
                     target="_blank"
                     class="text-primary-600 hover:text-primary-700 break-all">
                    {{ qrStore.currentQRCode.shortLink.shortLink }}
                  </a>
                  <span v-else-if="qrStore.currentQRCode.options?.url" class="text-gray-900 break-all">
                    {{ qrStore.currentQRCode.options.url }}
                  </span>
                  <span v-else class="text-gray-500">URL non disponible</span>
                </div>
              </div>

              <div v-if="qrStore.currentQRCode.shortLink?.longUrl">
                <label class="block text-sm font-medium text-gray-700 mb-2">URL originale</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <a :href="qrStore.currentQRCode.shortLink.longUrl" 
                     target="_blank"
                     class="text-primary-600 hover:text-primary-700 break-all">
                    {{ qrStore.currentQRCode.shortLink.longUrl }}
                  </a>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-sm font-medium text-gray-700">Créé le :</span>
                  <div class="text-gray-900 mt-1">{{ formatDate(qrStore.currentQRCode.createdAt) }}</div>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-700">Modifié le :</span>
                  <div class="text-gray-900 mt-1">{{ formatDate(qrStore.currentQRCode.updatedAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Options techniques</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Format</h3>
              <p class="text-gray-600">{{ qrStore.currentQRCode.options?.format?.toUpperCase() || 'PNG' }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Taille</h3>
              <p class="text-gray-600">{{ qrStore.currentQRCode.options?.size || 300 }}px</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Correction d'erreur</h3>
              <p class="text-gray-600">Niveau {{ qrStore.currentQRCode.options?.errorCorrectionLevel || 'M' }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Couleur principale</h3>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded border" 
                     :style="{ backgroundColor: qrStore.currentQRCode.options?.foregroundColor || '#000000' }"></div>
                <p class="text-gray-600">{{ qrStore.currentQRCode.options?.foregroundColor || '#000000' }}</p>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Couleur de fond</h3>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded border" 
                     :style="{ backgroundColor: qrStore.currentQRCode.options?.backgroundColor || '#FFFFFF' }"></div>
                <p class="text-gray-600">{{ qrStore.currentQRCode.options?.backgroundColor || '#FFFFFF' }}</p>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Marge</h3>
              <p class="text-gray-600">{{ qrStore.currentQRCode.options?.margin || 4 }} modules</p>
            </div>

            <div v-if="qrStore.currentQRCode.options?.quality" class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Qualité</h3>
              <p class="text-gray-600">{{ qrStore.currentQRCode.options.quality }}%</p>
            </div>

            <div v-if="qrStore.currentQRCode.options?.logoSize" class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Taille du logo</h3>
              <p class="text-gray-600">{{ qrStore.currentQRCode.options.logoSize }}%</p>
            </div>

            <div v-if="qrStore.currentQRCode.options?.addSignature" class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Signature</h3>
              <p class="text-gray-600">Activée</p>
            </div>
          </div>
        </div>

        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button @click="duplicateQRCode"
              class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <div class="text-center">
                <IconCopy class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p class="text-sm font-medium text-gray-700">Dupliquer</p>
              </div>
            </button>

            <NuxtLink to="/db/qrcode/create"
              class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <div class="text-center">
                <IconPlus class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p class="text-sm font-medium text-gray-700">Nouveau QR Code</p>
              </div>
            </NuxtLink>

            <button @click="shareQRCode"
              class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <div class="text-center">
                <IconShare class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p class="text-sm font-medium text-gray-700">Partager</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <EditQRCodeModal :visible="showEditModal" :qrCode="qrStore.currentQRCode" :loading="qrStore.loading" :error="qrStore.error"
      @submit="handleUpdateQRCode" @cancel="cancelEdit" />

    <DeleteQRCodeModal :visible="showDeleteModal" :qrCode="qrStore.currentQRCode" :loading="qrStore.loading"
      @confirm="deleteQRCode" @cancel="cancelDelete" />

    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQRCodeStore } from '~/stores/qrcode';
import { IconAlertTriangle, IconChevronLeft, IconCopy, IconDownload, IconEdit, IconLoader, IconPlus, IconShare, IconTrash, IconInfoCircle } from '@tabler/icons-vue';
import { DeleteQRCodeModal, EditQRCodeModal } from '@/components/qrcode'

definePageMeta({
  layout: 'dashboard'
});

const route = useRoute();
const router = useRouter();
const qrStore = useQRCodeStore();

const qrCodeId = route.params.id as string;
const copied = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

// État pour les notifications
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
const showNotification = ref(false);
let notificationTimeout: NodeJS.Timeout | null = null;

// Fonctions de notification
const showFloatingNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  notificationTimeout = setTimeout(() => {
    closeNotification();
  }, 3000);
};

const closeNotification = () => {
  showNotification.value = false;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
};

// Charger les données au montage
onMounted(async () => {
  if (qrCodeId) {
    await qrStore.fetchQRCodeById(qrCodeId);
  }
});

// Nettoyer les données au démontage
onUnmounted(() => {
  qrStore.clearCurrentQRCode();
  qrStore.clearError();
});

// Actions sur le QR Code
const downloadQRCode = async () => {
  if (!qrStore.currentQRCode) return;
  
  await qrStore.fetchQRCodeById(qrStore.currentQRCode.id, true);
  showFloatingNotification('QR Code téléchargé !', 'success');
};

const copyQRCodeToClipboard = async () => {
  if (!qrStore.currentQRCode) return;

  try {
    // Convertir base64 en blob
    const base64Data = qrStore.currentQRCode.qrCodeBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);

    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
    showFloatingNotification('Image copiée dans le presse-papiers !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier l\'image.', 'error');
  }
};

const editQRCode = () => {
  showEditModal.value = true;
};

const handleUpdateQRCode = async (options: any) => {
  if (!qrStore.currentQRCode) return;

  const success = await qrStore.updateQRCode(qrStore.currentQRCode.id, options);

  if (success) {
    showEditModal.value = false;
    showFloatingNotification('QR Code mis à jour avec succès !', 'success');
  } else {
    showFloatingNotification(qrStore.error || 'Erreur lors de la mise à jour.', 'error');
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
  qrStore.clearError();
};

const duplicateQRCode = () => {
  if (!qrStore.currentQRCode) return;
  
  const options = qrStore.currentQRCode.options;
  const queryParams = new URLSearchParams();
  
  if (qrStore.currentQRCode.qrCodeType === 'shortlink' && qrStore.currentQRCode.shortLink) {
    queryParams.set('linkId', qrStore.currentQRCode.shortLink.id);
  } else if (options?.url) {
    queryParams.set('url', options.url);
  }
  
  // Ajouter les options
  Object.entries(options || {}).forEach(([key, value]) => {
    if (value != null && key !== 'url') {
      queryParams.set(key, value.toString());
    }
  });

  router.push(`/db/qrcode/create?${queryParams.toString()}`);
};

const deleteQRCode = async () => {
  if (!qrStore.currentQRCode) return;

  const success = await qrStore.deleteQRCode(qrStore.currentQRCode.id);
  if (success) {
    showFloatingNotification('QR Code supprimé avec succès !', 'success');
    router.push('/db/qrcode');
  } else {
    showFloatingNotification(qrStore.error || 'Erreur lors de la suppression.', 'error');
    cancelDelete();
  }
};
const cancelDelete = () => {
  showDeleteModal.value = false;
  qrStore.clearError();
};

const shareQRCode = async () => {
  if (!qrStore.currentQRCode) return;

  if (navigator.share) {
    try {
      await navigator.share({
        title: qrStore.currentQRCode.title || 'QR Code',
        text: 'Découvrez ce QR Code',
        url: window.location.href
      });
    } catch (err) {
      console.error('Erreur lors du partage:', err);
    }
  } else {
    // Fallback: copier l'URL
    try {
      await navigator.clipboard.writeText(window.location.href);
      showFloatingNotification('Lien copié dans le presse-papiers !', 'success');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      showFloatingNotification('Impossible de copier le lien.', 'error');
    }
  }
};

// Fonctions d'aide
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// SEO
const qrCodeTitle = ref('Détails du QR Code');
watch(() => qrStore.currentQRCode, (newQRCode) => {
  if (newQRCode) {
    qrCodeTitle.value = `Détails de "${newQRCode.title || 'QR Code sans titre'}"`;
  }
}, { immediate: true });

useSeoMeta({
  title: qrCodeTitle,
  description: 'Détails et options d\'un QR code généré.',
  robots: 'noindex, nofollow',
});
</script>