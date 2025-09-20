<!-- <template>
  <div class="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestion des liens</h1>
        <p class="text-gray-600">Gérez tous vos liens raccourcis en un seul endroit</p>
      </div>
      <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <button @click="refreshLinks" :disabled="linksStore.loading"
          class="flex items-center justify-center btn-secondary disabled:opacity-50">
          <IconRefresh class="w-4 h-4 mr-2" />
          Actualiser
        </button>
        <button @click="openCreateLinkModal" class="flex items-center justify-center btn-primary">
          <IconPlus class="w-4 h-4 mr-2" />
          Nouveau lien
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <IconLink class="w-5 h-5 text-primary-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Total liens</p>
            <p class="text-xl font-bold text-gray-900">{{ linksStore.pagination.totalLinks }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
            <IconClick class="w-5 h-5 text-success-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Total clics</p>
            <p class="text-xl font-bold text-gray-900">{{ linksStore.totalClicks }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
            <IconTrendingUp class="w-5 h-5 text-warning-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Moy. clics/lien</p>
            <p class="text-xl font-bold text-gray-900">{{ linksStore.averageClicksPerLink }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <IconCircleCheck class="w-5 h-5 text-purple-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Liens actifs</p>
            <p class="text-xl font-bold text-gray-900">{{ activeLinksCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative">
            <IconSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchQuery" type="text" placeholder="Rechercher un lien..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64" />
          </div>

          <select v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="all">Tous les liens</option>
            <option value="active">Liens actifs</option>
            <option value="inactive">Liens inactifs</option>
            <option value="recent">Moins de 7 jours</option>
          </select>

          <select v-model="sortBy"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="createdAt">Plus récents</option>
            <option value="clicks">Plus de clics</option>
            <option value="updatedAt">Dernière modification</option>
            <option value="alphabetical">Alphabétique</option>
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

          <div v-if="selectedLinks.length > 0" class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ selectedLinks.length }} sélectionné(s)</span>
            <button @click="showBulkDeleteModal = true" class="text-red-600 hover:text-red-700 text-sm font-medium">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="linksStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="filteredLinks.length === 0" class="text-center py-12">
        <IconLink class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'Aucun résultat trouvé' : 'Aucun lien trouvé' }}
        </h3>
        <p class="text-gray-500 mb-4">
          {{ searchQuery ? 'Essayez de modifier vos critères de recherche'
            : 'Commencez par créer votre premier lien raccourci' }}
        </p>
        <button @click="openCreateLinkModal" class="btn-primary">
          Créer un lien
        </button>
      </div>

      <div v-else-if="viewMode === 'grid'" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="link in filteredLinks" :key="link.id"
            class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-2">
                  <input type="checkbox" :value="link.id" v-model="selectedLinks"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="!link.disabled ? 'bg-success-100 text-success-800' : 'bg-red-100 text-red-800'">
                    {{ !link.disabled ? 'Actif' : 'Désactivé' }}
                  </span>
                </div>
                <NuxtLink :to="`/db/links/${link.id}`">
                  <h3 class="font-medium text-gray-900 hover:underline truncate" :title="link.longUrl">
                    {{ truncateUrl(link.longUrl, 40) }}
                  </h3>
                </NuxtLink>
                <a :href="link.shortLink" target="_blank"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  {{ link.shortLink }}
                </a>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <IconHandClick class="w-4 h-4 mr-1" />
                  {{ link.clicks || 0 }}
                </div>
                <div class="flex items-center">
                  <IconCalendar class="w-4 h-4 mr-1" />
                  {{ formatDate(link.createdAt) }}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex space-x-2">
                <NuxtLink :to="`/db/links/${link.id}`" class="text-gray-600 hover:text-gray-700 p-1">
                  <IconInfoCircle class="w-4 h-4" />
                </NuxtLink>
                <button @click="copyToClipboard(link.shortLink)" class="text-gray-600 hover:text-gray-700 p-1">
                  <IconCopy class="w-4 h-4" />
                </button>
                <button @click="generateQRCode(link)" class="text-purple-600 hover:text-purple-700">
                  <IconQrcode class="w-4 h-4" />
                </button>
                <button @click="viewAnalytics(link)" class="text-secondary-600 hover:text-secondary-700">
                  <IconChartBar class="w-4 h-4" />
                </button>
                <button @click="editLink(link)" class="text-warning-600 hover:text-warning-700 p-1">
                  <IconEdit class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(link)" class="text-red-600 hover:text-red-700 p-1">
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
                  :checked="selectedLinks.length === filteredLinks.length && filteredLinks.length > 0"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lien original
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lien court
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clics
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
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
            <tr v-for="link in filteredLinks" :key="link.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input type="checkbox" :value="link.id" v-model="selectedLinks"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </td>
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <NuxtLink :to="`/db/links/${link.id}`"
                    class="text-sm font-medium text-gray-900 hover:underline truncate" :title="link.longUrl">
                    {{ truncateUrl(link.longUrl, 50) }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-6 py-4">
                <a :href="link.shortLink" target="_blank"
                  class="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  {{ link.shortLink }}
                </a>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <IconHandClick class="w-4 h-4 mr-1 text-gray-400" />
                  <span class="text-sm font-semibold text-gray-900">{{ link.clicks || 0 }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="!link.disabled ? 'bg-success-100 text-success-800' : 'bg-red-100 text-red-800'">
                  {{ !link.disabled ? 'Actif' : 'Désactivé' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(link.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <NuxtLink :to="`/db/links/${link.id}`" class="text-gray-600 hover:text-gray-700">
                    <IconInfoCircle class="w-4 h-4" />
                  </NuxtLink>
                  <button @click="copyToClipboard(link.shortLink)" class="text-gray-600 hover:text-gray-700">
                    <IconCopy class="w-4 h-4" />
                  </button>
                  <button @click="generateQRCode(link)" class="text-purple-600 hover:text-purple-700">
                    <IconQrcode class="w-4 h-4" />
                  </button>
                  <button @click="viewAnalytics(link)" class="text-secondary-600 hover:text-secondary-700">
                    <IconChartBar class="w-4 h-4" />
                  </button>
                  <button @click="editLink(link)" class="text-warning-600 hover:text-warning-700">
                    <IconEdit class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(link)" class="text-red-600 hover:text-red-700">
                    <IconTrash class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="linksStore.pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Affichage de {{ linksStore.pagination.linksOnPage }} sur {{ linksStore.pagination.totalLinks }} liens
          </div>
          <div class="flex items-center space-x-2">
            <button @click="changePage(linksStore.pagination.currentPage - 1)"
              :disabled="linksStore.pagination.currentPage <= 1 || linksStore.loading"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Précédent
            </button>
            <span class="px-3 py-2 text-sm text-gray-700">
              Page {{ linksStore.pagination.currentPage }} sur {{ linksStore.pagination.totalPages }}
            </span>
            <button @click="changePage(linksStore.pagination.currentPage + 1)"
              :disabled="linksStore.pagination.currentPage >= linksStore.pagination.totalPages || linksStore.loading"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />

    <EditLinkModal :visible="showEditModal" :link="linkToEdit" :loading="linksStore.loading" :error="linksStore.error"
      @submit="handleUpdateLink" @cancel="cancelEdit" />

    <DeleteLinkModal :visible="showDeleteModal" :link="linkToDelete" :loading="linksStore.loading" @confirm="deleteLink"
      @cancel="cancelDelete" />

    <BulkDeleteLinkModal :visible="showBulkDeleteModal" :count="selectedLinks.length" :loading="linksStore.loading"
      @confirm="confirmBulkDelete" @cancel="showBulkDeleteModal = false" />

    <CreateLinkModal :visible="showCreateLinkModal" @close="closeCreateLinkModal"
      @link-created="handleLinkCreatedAndRefresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useLinksStore } from '~/stores/links';
import type { ShortLink } from '~/types';
import { IconInfoCircle, IconCalendar, IconCircleCheck, IconClick, IconCopy, IconEdit, IconHandClick, IconChartBar, IconQrcode, IconLayoutGrid, IconLayoutList, IconLink, IconLoader, IconPlus, IconRefresh, IconSearch, IconTrash, IconTrendingUp } from '@tabler/icons-vue'
import { BulkDeleteLinkModal, CreateLinkModal, DeleteLinkModal, EditLinkModal } from '@/components/link'

definePageMeta({
  layout: 'dashboard'
});

const linksStore = useLinksStore();

// État local
const searchQuery = ref('');
const statusFilter = ref('all');
const sortBy = ref('createdAt');
const viewMode = ref('grid');
const selectedLinks = ref<string[]>([]);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showBulkDeleteModal = ref(false);
const linkToEdit = ref<ShortLink | null>(null);
const linkToDelete = ref<any | null>(null);

// État pour la notification flottante
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
const showNotification = ref(false);
let notificationTimeout: NodeJS.Timeout | null = null;

// Modal de création de lien
const showCreateLinkModal = ref(false);

// Notification flottante
const showFloatingNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  notificationTimeout = setTimeout(() => {
    closeNotification();
  }, 3000); // 3 secondes
};

const closeNotification = () => {
  showNotification.value = false;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
};

// Erreurs du store
watch(() => linksStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

// Récupérer les données 
onMounted(async () => {
  await linksStore.fetchLinks();
});

// Computed properties
const filteredLinks = computed(() => {
  let links = [...linksStore.links];

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    links = links.filter(link =>
      link.longUrl.toLowerCase().includes(query) ||
      link.shortLink.toLowerCase().includes(query) ||
      link.shortCode.toLowerCase().includes(query)
    );
  }

  // Filtrage par statut
  switch (statusFilter.value) {
    case 'active':
      links = links.filter(link => !link.disabled);
      break;
    case 'inactive':
      links = links.filter(link => link.disabled);
      break;
    case 'recent':
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      links = links.filter(link => {
        const createdAt = typeof link.createdAt === 'number' ? link.createdAt : new Date(link.createdAt).getTime();
        return createdAt > weekAgo;
      });
      break;
  }

  // Tri
  switch (sortBy.value) {
    case 'clicks':
      links.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
      break;
    case 'updatedAt':
      links.sort((a, b) => {
        const aTime = typeof a.updatedAt === 'number' ? a.updatedAt : new Date(a.updatedAt).getTime();
        const bTime = typeof b.updatedAt === 'number' ? b.updatedAt : new Date(b.updatedAt).getTime();
        return bTime - aTime;
      });
      break;
    case 'alphabetical':
      links.sort((a, b) => a.longUrl.localeCompare(b.longUrl));
      break;
    default:
      links.sort((a, b) => {
        const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
        const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
  }

  return links;
});

const activeLinksCount = computed(() => {
  return linksStore.links.filter(link => !link.disabled).length;
});

// Modal de création de lien
const openCreateLinkModal = () => {
  showCreateLinkModal.value = true;
};

const closeCreateLinkModal = () => {
  showCreateLinkModal.value = false;
  linksStore.clearError();
};

const handleLinkCreatedAndRefresh = async () => {
  await linksStore.fetchLinks();
};


// Actions
const refreshLinks = async () => {
  await linksStore.fetchLinks();
  if (!linksStore.error) {
    showFloatingNotification('Liste de liens actualisée !', 'success');
  }
};

const changePage = async (page: number) => {
  await linksStore.fetchLinks(page);
};

const formatDate = (dateString: string | number) => {
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const truncateUrl = (url: string, maxLength: number) => {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showFloatingNotification('Lien copié dans le presse-papiers !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier le lien.', 'error');
  }
};

const generateQRCode = (link: ShortLink) => {
  navigateTo(`/db/qrcode/create?linkId=${link.id}`);
};

// Gestion de la sélection
const toggleSelectAll = () => {
  if (selectedLinks.value.length === filteredLinks.value.length) {
    selectedLinks.value = [];
  } else {
    selectedLinks.value = filteredLinks.value.map(link => link.id);
  }
};

// Actions sur les liens
const editLink = (link: ShortLink) => {
  linkToEdit.value = link;
  showEditModal.value = true;
};

const viewAnalytics = (link: ShortLink) => {
  navigateTo(`/db/analytics?linkId=${link.id}`);
};

const handleUpdateLink = async (newUrl: string) => {
  if (!linkToEdit.value) {
    showFloatingNotification('Aucun lien à mettre à jour.', 'error');
    return;
  }

  const success = await linksStore.updateLink(linkToEdit.value.id, newUrl);

  if (success) {
    showEditModal.value = false;
    linkToEdit.value = null;
    showFloatingNotification('Lien mis à jour avec succès !', 'success');
  } else {
    showFloatingNotification(linksStore.error || 'Erreur lors de la mise à jour.', 'error');
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
  linkToEdit.value = null;
  linksStore.clearError();
};

const confirmDelete = (link: any) => {
  linkToDelete.value = link;
  showDeleteModal.value = true;
};

const deleteLink = async () => {
  if (!linkToDelete.value) {
    showFloatingNotification('Aucun lien à supprimer.', 'error');
    return;
  }

  const success = await linksStore.deleteLink(linkToDelete.value.id);

  if (success) {
    showDeleteModal.value = false;
    linkToDelete.value = null;
    showFloatingNotification('Lien supprimé avec succès !', 'success');
  } else {
    showFloatingNotification(linksStore.error || 'Erreur lors de la suppression.', 'error');
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  linkToDelete.value = null;
  linksStore.clearError();
};

// Suppression en masse
const confirmBulkDelete = async () => {
  const linkCount = selectedLinks.value.length;
  let successCount = 0;
  let failCount = 0;

  for (const linkId of selectedLinks.value) {
    const success = await linksStore.deleteLink(linkId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  showBulkDeleteModal.value = false;
  selectedLinks.value = [];
  await linksStore.fetchLinks();

  if (successCount > 0) {
    showFloatingNotification(`${successCount} lien(s) supprimé(s) avec succès !`, 'success');
  }
  if (failCount > 0) {
    showFloatingNotification(`${failCount} lien(s) n'ont pas pu être supprimés.`, 'error');
  }
};

// SEO
useSeoMeta({
  title: 'Gestion des liens',
  description: 'Gérez tous vos liens raccourcis en un seul endroit',
  robots: 'noindex, nofollow'
});
</script> -->





























<template>
  <div class="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestion des liens</h1>
        <p class="text-gray-600">Gérez tous vos liens raccourcis en un seul endroit</p>
      </div>
      <div class="flex items-center gap-4 mx-auto">
        <button @click="refreshLinks" :disabled="linksStore.loading"
          class="flex items-center justify-center btn-secondary disabled:opacity-50">
          <IconRefresh class="w-4 h-4" />
          <span class="hidden sm:inline ml-2">Actualiser</span>
        </button>
        <button @click="openCreateLinkModal" class="flex items-center justify-center btn-primary">
          <IconPlus class="w-4 h-4" />
          <span class="hidden sm:inline ml-2">Nouveau lien</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <IconLink class="w-5 h-5 text-primary-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Total liens</p>
            <p class="text-xl font-bold text-gray-900">{{ linksStore.pagination.totalLinks }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
            <IconClick class="w-5 h-5 text-success-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Total clics</p>
            <p class="text-xl font-bold text-gray-900">{{ linksStore.totalClicks }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
            <IconTrendingUp class="w-5 h-5 text-warning-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Moy. clics/lien</p>
            <p class="text-xl font-bold text-gray-900">{{ linksStore.averageClicksPerLink }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <IconCircleCheck class="w-5 h-5 text-purple-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Liens actifs</p>
            <p class="text-xl font-bold text-gray-900">{{ activeLinksCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative">
            <IconSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchQuery" type="text" placeholder="Rechercher un lien..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64" />
          </div>

          <select v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="all">Tous les liens</option>
            <option value="active">Liens actifs</option>
            <option value="inactive">Liens inactifs</option>
            <option value="recent">Moins de 7 jours</option>
          </select>

          <select v-model="sortBy"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="createdAt">Plus récents</option>
            <option value="clicks">Plus de clics</option>
            <option value="updatedAt">Dernière modification</option>
            <option value="alphabetical">Alphabétique</option>
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

          <div v-if="selectedLinks.length > 0" class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ selectedLinks.length }} sélectionné(s)</span>
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
      <div v-if="linksStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="filteredLinks.length === 0" class="text-center py-12">
        <IconLink class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'Aucun résultat trouvé' : 'Aucun lien trouvé' }}
        </h3>
        <p class="text-gray-500 mb-4">
          {{ searchQuery ? 'Essayez de modifier vos critères de recherche'
            : 'Commencez par créer votre premier lien raccourci' }}
        </p>
        <button @click="openCreateLinkModal" class="btn-primary">
          Créer un lien
        </button>
      </div>

      <div v-else-if="viewMode === 'grid'" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="link in filteredLinks" :key="link.id"
            class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-2">
                  <input type="checkbox" :value="link.id" v-model="selectedLinks"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="!link.disabled ? 'bg-success-100 text-success-800' : 'bg-red-100 text-red-800'">
                    {{ !link.disabled ? 'Actif' : 'Désactivé' }}
                  </span>
                </div>
                <NuxtLink :to="`/db/links/${link.id}`">
                  <h3 class="font-medium text-gray-900 hover:underline truncate" :title="link.longUrl">
                    {{ truncateUrl(link.longUrl, 40) }}
                  </h3>
                </NuxtLink>
                <a :href="link.shortLink" target="_blank"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  {{ link.shortLink }}
                </a>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <IconHandClick class="w-4 h-4 mr-1" />
                  {{ link.clicks || 0 }}
                </div>
                <div class="flex items-center">
                  <IconCalendar class="w-4 h-4 mr-1" />
                  {{ formatDate(link.createdAt) }}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex space-x-2">
                <NuxtLink :to="`/db/links/${link.id}`" class="text-gray-600 hover:text-gray-700 p-1">
                  <IconInfoCircle class="w-4 h-4" />
                </NuxtLink>
                <button @click="copyToClipboard(link.shortLink)" class="text-gray-600 hover:text-gray-700 p-1">
                  <IconCopy class="w-4 h-4" />
                </button>
                <button @click="generateQRCode(link)" class="text-purple-600 hover:text-purple-700">
                  <IconQrcode class="w-4 h-4" />
                </button>
                <button @click="viewAnalytics(link)" class="text-secondary-600 hover:text-secondary-700">
                  <IconChartBar class="w-4 h-4" />
                </button>
                <button @click="editLink(link)" class="text-warning-600 hover:text-warning-700 p-1">
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
                  :checked="selectedLinks.length === filteredLinks.length && filteredLinks.length > 0"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lien original
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lien court
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clics
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
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
            <tr v-for="link in filteredLinks" :key="link.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input type="checkbox" :value="link.id" v-model="selectedLinks"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </td>
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <NuxtLink :to="`/db/links/${link.id}`"
                    class="text-sm font-medium text-gray-900 hover:underline truncate" :title="link.longUrl">
                    {{ truncateUrl(link.longUrl, 50) }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-6 py-4">
                <a :href="link.shortLink" target="_blank"
                  class="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  {{ link.shortLink }}
                </a>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <IconHandClick class="w-4 h-4 mr-1 text-gray-400" />
                  <span class="text-sm font-semibold text-gray-900">{{ link.clicks || 0 }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="!link.disabled ? 'bg-success-100 text-success-800' : 'bg-red-100 text-red-800'">
                  {{ !link.disabled ? 'Actif' : 'Désactivé' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(link.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <NuxtLink :to="`/db/links/${link.id}`" class="text-gray-600 hover:text-gray-700">
                    <IconInfoCircle class="w-4 h-4" />
                  </NuxtLink>
                  <button @click="copyToClipboard(link.shortLink)" class="text-gray-600 hover:text-gray-700">
                    <IconCopy class="w-4 h-4" />
                  </button>
                  <button @click="generateQRCode(link)" class="text-purple-600 hover:text-purple-700">
                    <IconQrcode class="w-4 h-4" />
                  </button>
                  <button @click="viewAnalytics(link)" class="text-secondary-600 hover:text-secondary-700">
                    <IconChartBar class="w-4 h-4" />
                  </button>
                  <button @click="editLink(link)" class="text-warning-600 hover:text-warning-700">
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

      <div v-if="linksStore.pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Affichage de {{ linksStore.pagination.linksOnPage }} sur {{ linksStore.pagination.totalLinks }} liens
          </div>
          <div class="flex items-center space-x-2">
            <button @click="changePage(linksStore.pagination.currentPage - 1)"
              :disabled="linksStore.pagination.currentPage <= 1 || linksStore.loading"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Précédent
            </button>
            <span class="px-3 py-2 text-sm text-gray-700">
              Page {{ linksStore.pagination.currentPage }} sur {{ linksStore.pagination.totalPages }}
            </span>
            <button @click="changePage(linksStore.pagination.currentPage + 1)"
              :disabled="linksStore.pagination.currentPage >= linksStore.pagination.totalPages || linksStore.loading"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />

    <EditLinkModal :visible="showEditModal" :link="linkToEdit" :loading="linksStore.loading" :error="linksStore.error"
      @submit="handleUpdateLink" @cancel="cancelEdit" />

    <DeleteLinkModal :visible="showDeleteModal" :link="linkToDelete" :loading="linksStore.loading" @confirm="deleteLink"
      @cancel="cancelDelete" />

    <BulkDeleteLinkModal :visible="showBulkDeleteModal" :count="selectedLinks.length" :loading="linksStore.loading"
      @confirm="confirmBulkDelete" @cancel="showBulkDeleteModal = false" />

    <CreateLinkModal :visible="showCreateLinkModal" @close="closeCreateLinkModal"
      @link-created="handleLinkCreatedAndRefresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useLinksStore } from '~/stores/links';
import type { ShortLink } from '~/types';
import { IconInfoCircle, IconCalendar, IconCircleCheck, IconClick, IconCopy, IconEdit, IconHandClick, IconChartBar, IconQrcode, IconLayoutGrid, IconLayoutList, IconLink, IconLoader, IconPlus, IconRefresh, IconSearch, IconTrash, IconTrendingUp } from '@tabler/icons-vue'
import { BulkDeleteLinkModal, CreateLinkModal, DeleteLinkModal, EditLinkModal } from '@/components/link'

definePageMeta({
  layout: 'dashboard'
});

const linksStore = useLinksStore();

// État local
const searchQuery = ref('');
const statusFilter = ref('all');
const sortBy = ref('createdAt');
const viewMode = ref('grid');
const selectedLinks = ref<string[]>([]);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showBulkDeleteModal = ref(false);
const linkToEdit = ref<ShortLink | null>(null);
const linkToDelete = ref<any | null>(null);

// État pour la notification flottante
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
const showNotification = ref(false);
let notificationTimeout: NodeJS.Timeout | null = null;

// Modal de création de lien
const showCreateLinkModal = ref(false);

// Notification flottante
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

// Erreurs du store
watch(() => linksStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

// Récupérer les données
onMounted(async () => {
  await linksStore.fetchLinks();
});

// Computed properties
const filteredLinks = computed(() => {
  let links = [...linksStore.links];

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    links = links.filter(link =>
      link.longUrl.toLowerCase().includes(query) ||
      link.shortLink.toLowerCase().includes(query) ||
      link.shortCode.toLowerCase().includes(query)
    );
  }

  // Filtrage par statut
  switch (statusFilter.value) {
    case 'active':
      links = links.filter(link => !link.disabled);
      break;
    case 'inactive':
      links = links.filter(link => link.disabled);
      break;
    case 'recent':
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      links = links.filter(link => {
        const createdAt = typeof link.createdAt === 'number' ? link.createdAt : new Date(link.createdAt).getTime();
        return createdAt > weekAgo;
      });
      break;
  }

  // Tri
  switch (sortBy.value) {
    case 'clicks':
      links.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
      break;
    case 'updatedAt':
      links.sort((a, b) => {
        const aTime = typeof a.updatedAt === 'number' ? a.updatedAt : new Date(a.updatedAt).getTime();
        const bTime = typeof b.updatedAt === 'number' ? b.updatedAt : new Date(b.updatedAt).getTime();
        return bTime - aTime;
      });
      break;
    case 'alphabetical':
      links.sort((a, b) => a.longUrl.localeCompare(b.longUrl));
      break;
    default:
      links.sort((a, b) => {
        const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
        const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
  }

  return links;
});

const activeLinksCount = computed(() => {
  return linksStore.links.filter(link => !link.disabled).length;
});

// Modal de création de lien
const openCreateLinkModal = () => {
  showCreateLinkModal.value = true;
};

const closeCreateLinkModal = () => {
  showCreateLinkModal.value = false;
  linksStore.clearError();
};

const handleLinkCreatedAndRefresh = async () => {
  await linksStore.fetchLinks();
};

// Actions
const refreshLinks = async () => {
  await linksStore.fetchLinks();
  if (!linksStore.error) {
    showFloatingNotification('Liste de liens actualisée !', 'success');
  }
};

const changePage = async (page: number) => {
  await linksStore.fetchLinks(page);
};

const formatDate = (dateString: string | number) => {
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const truncateUrl = (url: string, maxLength: number) => {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showFloatingNotification('Lien copié dans le presse-papiers !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier le lien.', 'error');
  }
};

const generateQRCode = (link: ShortLink) => {
  navigateTo(`/db/qrcode/create?linkId=${link.id}`);
};

// Gestion de la sélection
const toggleSelectAll = () => {
  if (selectedLinks.value.length === filteredLinks.value.length) {
    selectedLinks.value = [];
  } else {
    selectedLinks.value = filteredLinks.value.map(link => link.id);
  }
};

// Actions sur les liens
const editLink = (link: ShortLink) => {
  linkToEdit.value = link;
  showEditModal.value = true;
};

const viewAnalytics = (link: ShortLink) => {
  navigateTo(`/db/analytics?linkId=${link.id}`);
};

const handleUpdateLink = async (newUrl: string) => {
  if (!linkToEdit.value) {
    showFloatingNotification('Aucun lien à mettre à jour.', 'error');
    return;
  }

  const success = await linksStore.updateLink(linkToEdit.value.id, newUrl);

  if (success) {
    showEditModal.value = false;
    linkToEdit.value = null;
    showFloatingNotification('Lien mis à jour avec succès !', 'success');
  } else {
    showFloatingNotification(linksStore.error || 'Erreur lors de la mise à jour.', 'error');
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
  linkToEdit.value = null;
  linksStore.clearError();
};

// Logique de suppression désactivée
const confirmDelete = (link: any) => {
  linkToDelete.value = link;
  showDeleteModal.value = true;
};

const deleteLink = async () => {
  if (!linkToDelete.value) {
    showFloatingNotification('Aucun lien à supprimer.', 'error');
    return;
  }

  const success = await linksStore.deleteLink(linkToDelete.value.id);

  if (success) {
    showDeleteModal.value = false;
    linkToDelete.value = null;
    showFloatingNotification('Lien supprimé avec succès !', 'success');
  } else {
    showFloatingNotification(linksStore.error || 'Erreur lors de la suppression.', 'error');
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  linkToDelete.value = null;
  linksStore.clearError();
};

// Suppression en masse désactivée
const confirmBulkDelete = async () => {
  const linkCount = selectedLinks.value.length;
  let successCount = 0;
  let failCount = 0;

  for (const linkId of selectedLinks.value) {
    const success = await linksStore.deleteLink(linkId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  showBulkDeleteModal.value = false;
  selectedLinks.value = [];
  await linksStore.fetchLinks();

  if (successCount > 0) {
    showFloatingNotification(`${successCount} lien(s) supprimé(s) avec succès !`, 'success');
  }
  if (failCount > 0) {
    showFloatingNotification(`${failCount} lien(s) n'ont pas pu être supprimés.`, 'error');
  }
};

// SEO
useSeoMeta({
  title: 'Gestion des liens',
  description: 'Gérez tous vos liens raccourcis en un seul endroit',
  robots: 'noindex, nofollow'
});
</script>