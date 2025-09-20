import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';
import { useApiFetch } from '~/utils/api';
import type { ShortLinkSitemap, SitemapGenerationOptions, GenerateSitemapResponse, GetSitemapsResponse, GetSitemapResponse, UpdateSitemapResponse, DeleteSitemapResponse, SitemapProgressMessage } from '@/types';

export const useSitemapStore = defineStore('sitemap', () => {
  // State
  const sitemaps = ref<ShortLinkSitemap[]>([]);
  const currentSitemap = ref<ShortLinkSitemap | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalSitemaps: 0,
    sitemapsOnPage: 0,
  });

  const sitemapProgressMessages = ref<SitemapProgressMessage[]>([]);
  const sitemapScannedUrls = ref<string[]>([]);
  const sitemapIgnoredUrls = ref<string[]>([]);
  const sitemapErrorMessages = ref<string[]>([]);
  const sitemapProgressLoading = ref(false);

  // Actions
  const generateSitemap = async (options: SitemapGenerationOptions): Promise<GenerateSitemapResponse | null> => {
    sitemapProgressLoading.value = true;
    error.value = null;
    sitemapProgressMessages.value = [];
    sitemapScannedUrls.value = [];
    sitemapIgnoredUrls.value = [];
    sitemapErrorMessages.value = [];

    const nuxtApp = useNuxtApp();
    const socket = nuxtApp.$socket;

    if (!socket || !socket.connected) {
      error.value = 'Connexion WebSocket non établie. Veuillez réessayer.';
      sitemapProgressLoading.value = false;
      return null;
    }

    const socketId = socket.id;

    const progressListener = (message: SitemapProgressMessage) => {
      sitemapProgressMessages.value.push(message);
      if (message.type === 'progress' && message.url) {
        sitemapScannedUrls.value.push(message.url);
      } else if (message.type === 'ignored' && message.url) {
        sitemapIgnoredUrls.value.push(message.url);
      } else if (message.type === 'error' && message.error) {
        sitemapErrorMessages.value.push(message.error);
      }
    };

    socket.on('sitemapProgress', progressListener);

    try {
      const response = await useApiFetch<GenerateSitemapResponse>('/eqt/sitemap', {
        method: 'POST',
        body: { ...options, socketId },
      });

      // Raffarichir la liste
      await fetchSitemaps(pagination.value.currentPage, pagination.value.sitemapsOnPage);
      return response;
    } catch (err: any) {
      console.error('Erreur lors de la génération du sitemap:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la génération du sitemap.';
      if (error.value) {
        sitemapErrorMessages.value.push(error.value);
      }
      return null;
    } finally {
      sitemapProgressLoading.value = false;
      socket.off('sitemapProgress', progressListener);
    }
  };

  const fetchSitemaps = async (page: number = 1, limit: number = 10): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await useApiFetch<GetSitemapsResponse>('/eqt/sitemap', {
        params: { page, limit },
      });
      sitemaps.value = response.data;
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalSitemaps: response.nb,
        sitemapsOnPage: response.nbOnPage,
      };
    } catch (err: any) {
      console.error('Erreur lors de la récupération des sitemaps:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la récupération des sitemaps.';
    } finally {
      loading.value = false;
    }
  };

  const fetchSitemapById = async (id: string): Promise<ShortLinkSitemap | null> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await useApiFetch<GetSitemapResponse>(`/eqt/sitemap/${id}`);
      currentSitemap.value = response.data;
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la récupération du sitemap:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la récupération du sitemap.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateSitemap = async (id: string, title: string): Promise<ShortLinkSitemap | null> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await useApiFetch<UpdateSitemapResponse>(`/eqt/sitemap/${id}`, {
        method: 'PUT',
        body: { title },
      });
      const index = sitemaps.value.findIndex(s => s.id === id);
      if (index !== -1) {
        sitemaps.value[index] = response.data;
      }
      if (currentSitemap.value && currentSitemap.value.id === id) {
        currentSitemap.value = response.data;
      }
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du sitemap:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la mise à jour du sitemap.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteSitemap = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await useApiFetch<DeleteSitemapResponse>(`/eqt/sitemap/${id}`, {
        method: 'DELETE',
      });
      sitemaps.value = sitemaps.value.filter(s => s.id !== id);
      pagination.value.totalSitemaps--;
      if (currentSitemap.value && currentSitemap.value.id === id) {
        currentSitemap.value = null;
      }
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression du sitemap:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la suppression du sitemap.';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  const clearCurrentSitemap = (): void => {
    currentSitemap.value = null;
  };

  const clearProgress = (): void => {
    sitemapProgressMessages.value = [];
    sitemapScannedUrls.value = [];
    sitemapIgnoredUrls.value = [];
    sitemapErrorMessages.value = [];
    sitemapProgressLoading.value = false;
  };

  return {
    sitemaps: readonly(sitemaps),
    currentSitemap: readonly(currentSitemap),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    sitemapProgressMessages: readonly(sitemapProgressMessages),
    sitemapScannedUrls: readonly(sitemapScannedUrls),
    sitemapIgnoredUrls: readonly(sitemapIgnoredUrls),
    sitemapErrorMessages: readonly(sitemapErrorMessages),
    sitemapProgressLoading: readonly(sitemapProgressLoading),

    generateSitemap,
    fetchSitemaps,
    fetchSitemapById,
    updateSitemap,
    deleteSitemap,
    clearError,
    clearCurrentSitemap,
    clearProgress,
  };
});
