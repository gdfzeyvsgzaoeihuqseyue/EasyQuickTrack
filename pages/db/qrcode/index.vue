<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestion des QR Codes</h1>
        <p class="text-gray-600">Gérez tous vos QR codes générés en un seul endroit</p>
      </div>
      <div class="flex items-center gap-4 mx-auto">
        <button @click="refreshQRCodes" :disabled="qrStore.loading"
          class="flex items-center justify-center btn-secondary disabled:opacity-50">
          <IconRefresh class="w-4 h-4" />
          <span class="hidden sm:inline ml-2">Actualiser</span>
        </button>
        <NuxtLink to="/db/qrcode/create" class="flex items-center justify-center btn-primary">
          <IconPlus class="w-4 h-4 mr-2" />
          <span class="hidden sm:inline ml-2">Nouveau QR Code</span>
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <IconQrcode class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total QR Codes</p>
            <p class="text-2xl font-bold text-gray-900">{{ qrStore.totalQRCodes }}</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <IconLink class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">QR Codes de liens</p>
            <p class="text-2xl font-bold text-gray-900">{{ shortlinkQRCodes.length }}</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <IconWorld class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">QR Codes d'URLs</p>
            <p class="text-2xl font-bold text-gray-900">{{ urlQRCodes.length }}</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <IconCalendar class="w-6 h-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Ce mois</p>
            <p class="text-2xl font-bold text-gray-900">{{ thisMonthQRCodes.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative">
            <IconSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchQuery" type="text" placeholder="Rechercher un QR code..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64" />
          </div>

          <select v-model="typeFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="all">Tous les types</option>
            <option value="shortlink">QR Codes de liens</option>
            <option value="url">QR Codes d'URLs</option>
          </select>

          <select v-model="sortBy"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="createdAt">Plus récents</option>
            <option value="title">Alphabétique</option>
            <option value="type">Par type</option>
          </select>
        </div>

        <div class="flex items-center space-x-3">
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button @click="viewMode = 'grid'" :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]">
              <IconLayoutGrid class="w-4 h-4" />
            </button>
            <button @click="viewMode = 'table'" :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]">
              <IconLayoutList class="w-4 h-4" />
            </button>
          </div>

          <div v-if="selectedQRCodes.length > 0" class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ selectedQRCodes.length }} sélectionné(s)</span>
            <button @click="navigateTo('/db/deleteInfo')"
              class="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center">
              <IconInfoCircle class="w-4 h-4 mr-1" />
              Info suppr.
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="qrStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="qrStore.error" class="text-center py-12">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p class="text-gray-600 mb-4">{{ qrStore.error }}</p>
        <button @click="refreshQRCodes" class="btn-primary">Réessayer</button>
      </div>

      <div v-else-if="filteredQRCodes.length === 0" class="text-center py-12">
        <IconQrcode class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'Aucun résultat trouvé' : 'Aucun QR code trouvé' }}
        </h3>
        <p class="text-gray-500 mb-4">
          {{ searchQuery ? 'Essayez de modifier vos critères de recherche'
            : 'Commencez par créer votre premier QR code' }}
        </p>
        <NuxtLink to="/db/qrcode/create" class="btn-primary">
          Créer un QR Code
        </NuxtLink>
      </div>

      <div v-else-if="viewMode === 'grid'" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="qrCode in filteredQRCodes" :key="qrCode.id"
            class="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-2">
                  <input type="checkbox" :value="qrCode.id" v-model="selectedQRCodes"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="qrCode.qrCodeType === 'shortlink' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                    {{ qrCode.qrCodeType === 'shortlink' ? 'Lien court' : 'URL directe' }}
                  </span>
                </div>
                <NuxtLink :to="`/db/qrcode/${qrCode.id}`">
                  <h3 class="font-medium text-gray-900 hover:underline truncate mb-1" :title="qrCode.title">
                    {{ qrCode.title || 'QR Code sans titre' }}
                  </h3>
                </NuxtLink>
                <p class="text-sm text-gray-500 truncate">
                  {{ qrCode.shortLink?.shortLink || qrCode.options?.url || 'URL non disponible' }}
                </p>
              </div>
            </div>

            <div class="flex justify-center mb-4">
              <div class="w-24 h-24 bg-white rounded-lg border p-2">
                <img :src="qrCode.qrCodeBase64" :alt="qrCode.title" class="w-full h-full object-contain" />
              </div>
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <IconCalendar class="w-4 h-4 mr-1" />
                  {{ formatDate(qrCode.createdAt) }}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex space-x-2">
                <NuxtLink :to="`/db/qrcode/${qrCode.id}`" class="text-gray-600 hover:text-gray-700 p-1">
                  <IconEye class="w-4 h-4" />
                </NuxtLink>
                <button @click="downloadQRCode(qrCode)" class="text-blue-600 hover:text-blue-700 p-1">
                  <IconDownload class="w-4 h-4" />
                </button>
                <button @click="editQRCode(qrCode)" class="text-orange-600 hover:text-orange-700 p-1">
                  <IconEdit class="w-4 h-4" />
                </button>
                <button disabled class="text-red-300 cursor-not-allowed p-1"
                  title="Impossible de supprimer cet élément pour l'insatnt">
                  <IconTrash class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input type="checkbox" @change="toggleSelectAll"
                  :checked="selectedQRCodes.length === filteredQRCodes.length && filteredQRCodes.length > 0"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aperçu
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL/Lien
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="qrCode in filteredQRCodes" :key="qrCode.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input type="checkbox" :value="qrCode.id" v-model="selectedQRCodes"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </td>
              <td class="px-6 py-4">
                <div class="w-12 h-12 bg-white rounded border p-1">
                  <img :src="qrCode.qrCodeBase64" :alt="qrCode.title" class="w-full h-full object-contain" />
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <NuxtLink :to="`/db/qrcode/${qrCode.id}`"
                    class="text-sm font-medium text-gray-900 hover:underline truncate" :title="qrCode.title">
                    {{ qrCode.title || 'QR Code sans titre' }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="qrCode.qrCodeType === 'shortlink' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                  {{ qrCode.qrCodeType === 'shortlink' ? 'Lien court' : 'URL directe' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <span class="text-sm text-gray-900 truncate block">
                    {{ qrCode.shortLink?.shortLink || qrCode.options?.url || 'URL non disponible' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(qrCode.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <NuxtLink :to="`/db/qrcode/${qrCode.id}`" class="text-gray-600 hover:text-gray-700">
                    <IconEye class="w-4 h-4" />
                  </NuxtLink>
                  <button @click="downloadQRCode(qrCode)" class="text-blue-600 hover:text-blue-700">
                    <IconDownload class="w-4 h-4" />
                  </button>
                  <button @click="editQRCode(qrCode)" class="text-orange-600 hover:text-orange-700">
                    <IconEdit class="w-4 h-4" />
                  </button>
                  <button disabled class="text-red-300 cursor-not-allowed"
                    title="Impossible de supprimer cet élément pour l'insatnt">
                    <IconTrash class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="qrStore.pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Affichage de {{ qrStore.pagination.qrCodesOnPage }} sur {{ qrStore.pagination.totalQRCodes }} QR codes
          </div>
          <div class="flex items-center space-x-2">
            <button @click="changePage(qrStore.pagination.currentPage - 1)"
              :disabled="qrStore.pagination.currentPage <= 1 || qrStore.loading"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Précédent
            </button>
            <span class="px-3 py-2 text-sm text-gray-700">
              Page {{ qrStore.pagination.currentPage }} sur {{ qrStore.pagination.totalPages }}
            </span>
            <button @click="changePage(qrStore.pagination.currentPage + 1)"
              :disabled="qrStore.pagination.currentPage >= qrStore.pagination.totalPages || qrStore.loading"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <EditQRCodeModal :visible="showEditModal" :qrCode="qrCodeToEdit" :loading="qrStore.loading" :error="qrStore.error"
      @submit="handleUpdateQRCode" @cancel="cancelEdit" />

    <DeleteQRCodeModal :visible="showDeleteModal" :qrCode="qrCodeToDelete" :loading="qrStore.loading"
      @confirm="deleteQRCode" @cancel="cancelDelete" />

    <BulkDeleteQRCodeModal :visible="showBulkDeleteModal" :count="selectedQRCodes.length" :loading="qrStore.loading"
      @confirm="confirmBulkDelete" @cancel="showBulkDeleteModal = false" />

    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQRCodeStore, type QRCodeRecord } from '~/stores/qrcode';
import { IconAlertTriangle, IconCalendar, IconDownload, IconEdit, IconEye, IconLayoutGrid, IconLayoutList, IconLink, IconLoader, IconPlus, IconQrcode, IconRefresh, IconSearch, IconTrash, IconWorld, IconInfoCircle } from '@tabler/icons-vue'
import { BulkDeleteQRCodeModal, DeleteQRCodeModal, EditQRCodeModal } from '@/components/qrcode'

definePageMeta({
  layout: 'dashboard'
});

const qrStore = useQRCodeStore();

// État local
const searchQuery = ref('');
const typeFilter = ref('all');
const sortBy = ref('createdAt');
const viewMode = ref('grid');
const selectedQRCodes = ref<string[]>([]);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showBulkDeleteModal = ref(false);
const qrCodeToEdit = ref<QRCodeRecord | null>(null);
const qrCodeToDelete = ref<QRCodeRecord | null>(null);

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

// Surveillance des erreurs
watch(() => qrStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

// Récupérer les données au montage
onMounted(async () => {
  await qrStore.fetchQRCodes();
});

// Computed properties
const filteredQRCodes = computed(() => {
  let qrCodes = [...qrStore.qrCodes];

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    qrCodes = qrCodes.filter(qr =>
      qr.title?.toLowerCase().includes(query) ||
      qr.shortLink?.shortLink?.toLowerCase().includes(query) ||
      qr.options?.url?.toLowerCase().includes(query)
    );
  }

  // Filtrage par type
  if (typeFilter.value !== 'all') {
    qrCodes = qrCodes.filter(qr => qr.qrCodeType === typeFilter.value);
  }

  // Tri
  switch (sortBy.value) {
    case 'title':
      qrCodes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'type':
      qrCodes.sort((a, b) => a.qrCodeType.localeCompare(b.qrCodeType));
      break;
    default:
      qrCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return qrCodes;
});

const shortlinkQRCodes = computed(() => {
  return qrStore.qrCodes.filter(qr => qr.qrCodeType === 'shortlink');
});

const urlQRCodes = computed(() => {
  return qrStore.qrCodes.filter(qr => qr.qrCodeType === 'url');
});

const thisMonthQRCodes = computed(() => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return qrStore.qrCodes.filter(qr => new Date(qr.createdAt) >= startOfMonth);
});

// Actions
const refreshQRCodes = async () => {
  await qrStore.fetchQRCodes();
  if (!qrStore.error) {
    showFloatingNotification('Liste des QR codes actualisée !', 'success');
  }
};

const changePage = async (page: number) => {
  await qrStore.fetchQRCodes(page);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const downloadQRCode = async (qrCode: QRCodeRecord) => {
  await qrStore.fetchQRCodeById(qrCode.id, true);
  showFloatingNotification('QR Code téléchargé !', 'success');
};

// Gestion de la sélection
const toggleSelectAll = () => {
  if (selectedQRCodes.value.length === filteredQRCodes.value.length) {
    selectedQRCodes.value = [];
  } else {
    selectedQRCodes.value = filteredQRCodes.value.map(qr => qr.id);
  }
};

// Actions sur les QR codes
const editQRCode = (qrCode: QRCodeRecord) => {
  qrCodeToEdit.value = qrCode;
  showEditModal.value = true;
};

const handleUpdateQRCode = async (options: any) => {
  if (!qrCodeToEdit.value) return;

  const success = await qrStore.updateQRCode(qrCodeToEdit.value.id, options);

  if (success) {
    showEditModal.value = false;
    qrCodeToEdit.value = null;
    showFloatingNotification('QR Code mis à jour avec succès !', 'success');
  } else {
    showFloatingNotification(qrStore.error || 'Erreur lors de la mise à jour.', 'error');
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
  qrCodeToEdit.value = null;
  qrStore.clearError();
};

const confirmDelete = (qrCode: QRCodeRecord) => {
  qrCodeToDelete.value = qrCode;
  showDeleteModal.value = true;
};

const deleteQRCode = async () => {
  if (!qrCodeToDelete.value) return;

  const success = await qrStore.deleteQRCode(qrCodeToDelete.value.id);

  if (success) {
    showDeleteModal.value = false;
    qrCodeToDelete.value = null;
    showFloatingNotification('QR Code supprimé avec succès !', 'success');
  } else {
    showFloatingNotification(qrStore.error || 'Erreur lors de la suppression.', 'error');
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  qrCodeToDelete.value = null;
  qrStore.clearError();
};

// Suppression en masse
const confirmBulkDelete = async () => {
  let successCount = 0;
  let failCount = 0;

  for (const qrCodeId of selectedQRCodes.value) {
    const success = await qrStore.deleteQRCode(qrCodeId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  showBulkDeleteModal.value = false;
  selectedQRCodes.value = [];
  await qrStore.fetchQRCodes();

  if (successCount > 0) {
    showFloatingNotification(`${successCount} QR code(s) supprimé(s) avec succès !`, 'success');
  }
  if (failCount > 0) {
    showFloatingNotification(`${failCount} QR code(s) n'ont pas pu être supprimés.`, 'error');
  }
};

// SEO
useSeoMeta({
  title: 'Gestion des QR Codes',
  description: 'Gérez tous vos QR codes générés en un seul endroit',
  robots: 'noindex, nofollow'
});
</script>