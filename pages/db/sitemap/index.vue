<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestion des Sitemaps</h1>
        <p class="text-gray-600">Générez et gérez les sitemaps de vos sites web</p>
      </div>
      <div class="flex items-center gap-4 mx-auto">
        <button @click="refreshSitemaps" :disabled="sitemapStore.loading"
          class="flex items-center justify-center btn-secondary disabled:opacity-50">
          <IconRefresh class="w-4 h-4" />
          <span class="hidden sm:inline ml-2">Actualiser</span>
        </button>
        <button @click="openGenerateModal" class="flex items-center justify-center btn-primary">
          <IconPlus class="w-4 h-4" />
          <span class="hidden sm:inline ml-2">Générer un Sitemap</span>
        </button>
      </div>
    </div>

    <div class="card p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative">
            <IconSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchQuery" type="text" placeholder="Rechercher un sitemap..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64" />
          </div>

          <!-- Nouveau filtre par date -->
          <select v-model="dateFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="all">Toutes les dates</option>
            <option value="last7days">Derniers 7 jours</option>
            <option value="last30days">Derniers 30 jours</option>
            <option value="last90days">Derniers 90 jours</option>
            <option value="thisYear">Cette année</option>
          </select>

          <select v-model="urlCountFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="all">Toutes les URLs</option>
            <option value="less10">Moins de 10 URLs</option>
            <option value="10-50">10 - 50 URLs</option>
            <option value="51-100">51 - 100 URLs</option>
            <option value="more100">Plus de 100 URLs</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="sitemapStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="sitemapStore.error" class="text-center py-12">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p class="text-gray-600 mb-4">{{ sitemapStore.error }}</p>
        <button @click="refreshSitemaps" class="btn-primary">Réessayer</button>
      </div>

      <div v-else-if="filteredSitemaps.length === 0" class="text-center py-12">
        <IconSitemap class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery || dateFilter !== 'all' || urlCountFilter !== 'all' ? 'Aucun résultat trouvé' : 'Aucun sitemap trouvé' }}
        </h3>
        <p class="text-gray-500 mb-4">
          {{ searchQuery || dateFilter !== 'all' || urlCountFilter !== 'all' ? 'Essayez de modifier vos critères de recherche'
            : 'Commencez par générer votre premier sitemap' }}
        </p>
        <button @click="openGenerateModal" class="btn-primary">
          Générer un Sitemap
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <SitemapItemCard v-for="sitemap in filteredSitemaps" :key="sitemap.id" :sitemap="sitemap"
          @delete="confirmDelete" />
      </div>

      <div v-if="sitemapStore.pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Affichage de {{ sitemapStore.pagination.sitemapsOnPage }} sur {{ sitemapStore.pagination.totalSitemaps }} sitemaps
          </div>
          <div class="flex items-center space-x-2">
            <button @click="changePage(sitemapStore.pagination.currentPage - 1)"
              :disabled="sitemapStore.pagination.currentPage <= 1 || sitemapStore.loading"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Précédent
            </button>
            <span class="px-3 py-2 text-sm text-gray-700">
              Page {{ sitemapStore.pagination.currentPage }} sur {{ sitemapStore.pagination.totalPages }}
            </span>
            <button @click="changePage(sitemapStore.pagination.currentPage + 1)"
              :disabled="sitemapStore.pagination.currentPage >= sitemapStore.pagination.totalPages || sitemapStore.loading"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <GenerateSitemapModal :visible="showGenerateModal" :loading="sitemapStore.loading" :error="sitemapStore.error"
      @submit="handleGenerateSitemap" @cancel="closeGenerateModal" />

    <DeleteSitemapModal :visible="showDeleteModal" :sitemap="sitemapToDelete" :loading="sitemapStore.loading"
      @confirm="deleteSitemap" @cancel="closeDeleteModal" />

    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSitemapStore } from '~/stores/sitemap';
import { SitemapItemCard, GenerateSitemapModal, DeleteSitemapModal } from '@/components/sitemap';
import { IconRefresh, IconPlus, IconSearch, IconLoader, IconAlertTriangle, IconSitemap } from '@tabler/icons-vue';
import type { SitemapGenerationOptions, GenerateSitemapResponse, ShortLinkSitemap } from '@/types';

definePageMeta({
  layout: 'dashboard'
});

const sitemapStore = useSitemapStore();

const searchQuery = ref('');
const dateFilter = ref('all'); 
const urlCountFilter = ref('all'); 

const showGenerateModal = ref(false);
const showDeleteModal = ref(false);
const sitemapToDelete = ref<ShortLinkSitemap | null>(null);

// Notification
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
const showNotification = ref(false);
let notificationTimeout: NodeJS.Timeout | null = null;

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

// Watch for store errors
watch(() => sitemapStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

onMounted(() => {
  sitemapStore.fetchSitemaps();
});

const filteredSitemaps = computed(() => {
  let sitemaps = [...sitemapStore.sitemaps];

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    sitemaps = sitemaps.filter(sitemap =>
      (sitemap.title && sitemap.title.toLowerCase().includes(query)) ||
      sitemap.url.toLowerCase().includes(query)
    );
  }

  // Filtrage par date
  const now = new Date();
  if (dateFilter.value !== 'all') {
    sitemaps = sitemaps.filter(sitemap => {
      const sitemapDate = new Date(sitemap.lastGenerated);
      if (dateFilter.value === 'last7days') {
        return sitemapDate >= new Date(now.setDate(now.getDate() - 7));
      } else if (dateFilter.value === 'last30days') {
        return sitemapDate >= new Date(now.setMonth(now.getMonth() - 1));
      } else if (dateFilter.value === 'last90days') {
        return sitemapDate >= new Date(now.setMonth(now.getMonth() - 3));
      } else if (dateFilter.value === 'thisYear') {
        return sitemapDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }

  // Filtrage par nombre d'URLs
  if (urlCountFilter.value !== 'all') {
    sitemaps = sitemaps.filter(sitemap => {
      const count = sitemap.urlsCount;
      if (urlCountFilter.value === 'less10') {
        return count < 10;
      } else if (urlCountFilter.value === '10-50') {
        return count >= 10 && count <= 50;
      } else if (urlCountFilter.value === '51-100') {
        return count > 50 && count <= 100;
      } else if (urlCountFilter.value === 'more100') {
        return count > 100;
      }
      return true;
    });
  }

  return sitemaps;
});

const refreshSitemaps = async () => {
  await sitemapStore.fetchSitemaps(sitemapStore.pagination.currentPage, sitemapStore.pagination.sitemapsOnPage);
  if (!sitemapStore.error) {
    showFloatingNotification('Liste des sitemaps actualisée !', 'success');
  }
};

const changePage = async (page: number) => {
  await sitemapStore.fetchSitemaps(page, sitemapStore.pagination.sitemapsOnPage);
};

const openGenerateModal = () => {
  showGenerateModal.value = true;
  sitemapStore.clearError();
};

const closeGenerateModal = () => {
  showGenerateModal.value = false;
  sitemapStore.clearError();
};

const handleGenerateSitemap = async (options: SitemapGenerationOptions) => {
  const result: GenerateSitemapResponse | null = await sitemapStore.generateSitemap(options);
  if (result) {
    showFloatingNotification(`Sitemap généré avec succès pour ${result.urlsCount} URLs !`, 'success');
    closeGenerateModal();
  } else {
  }
};

const confirmDelete = (id: string) => {
  const sitemap = sitemapStore.sitemaps.find(s => s.id === id);
  if (sitemap) {
    sitemapToDelete.value = sitemap;
    showDeleteModal.value = true;
    sitemapStore.clearError();
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  sitemapToDelete.value = null;
  sitemapStore.clearError();
};

const deleteSitemap = async () => {
  if (!sitemapToDelete.value) return;
  const success = await sitemapStore.deleteSitemap(sitemapToDelete.value.id);
  if (success) {
    showFloatingNotification('Sitemap supprimé avec succès !', 'success');
    closeDeleteModal();
  } else {
  }
};

useSeoMeta({
  title: 'Gestion des Sitemaps',
  description: 'Générez et gérez les sitemaps de vos sites web.',
  robots: 'noindex, nofollow'
});
</script>

<style scoped>
.btn-danger {
  @apply bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors;
}
</style>

