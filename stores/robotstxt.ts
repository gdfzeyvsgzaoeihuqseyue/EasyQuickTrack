import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';
import { useApiFetch } from '~/utils/api';
import type { RobotsTxtConfig, GenerateRobotsTxtPayload, GenerateRobotsTxtResponse, GetRobotsTxtsResponse, GetRobotsTxtResponse, UpdateRobotsTxtResponse, DeleteRobotsTxtResponse, } from '@/types';

export const useRobotsTxtStore = defineStore('robotstxt', () => {
  const robotsTxtConfigs = ref<RobotsTxtConfig[]>([]);
  const currentRobotsTxtConfig = ref<RobotsTxtConfig | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalConfigs: 0,
    configsOnPage: 0,
  });

  // Actions
  const fetchRobotsTxtConfigs = async (page: number = 1, limit: number = 10): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await useApiFetch<GetRobotsTxtsResponse>('/eqt/robottxt', {
        params: { page, limit },
      });
      robotsTxtConfigs.value = response.data; // Assigner des données mutables
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalConfigs: response.nb,
        configsOnPage: response.nbOnPage,
      };
    } catch (err: any) {
      console.error('Erreur lors de la récupération des configs robots.txt:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la récupération des configs robots.txt.';
    } finally {
      loading.value = false;
    }
  };

  const fetchRobotsTxtById = async (id: string): Promise<RobotsTxtConfig | null> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await useApiFetch<GetRobotsTxtResponse>(`/eqt/robottxt/${id}`);
      currentRobotsTxtConfig.value = response.data; 
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la récupération de la config robots.txt:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la récupération de la config robots.txt.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateRobotsTxt = async (id: string, payload: Partial<GenerateRobotsTxtPayload>): Promise<RobotsTxtConfig | null> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await useApiFetch<UpdateRobotsTxtResponse>(`/eqt/robottxt/${id}`, {
        method: 'PUT',
        body: payload,
      });
      // Mettre à jour la config dans la liste et la config courante
      const index = robotsTxtConfigs.value.findIndex(c => c.id === id);
      if (index !== -1) {
        robotsTxtConfigs.value[index] = response.data;
      }
      if (currentRobotsTxtConfig.value && currentRobotsTxtConfig.value.id === id) {
        currentRobotsTxtConfig.value = response.data;
      }
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la config robots.txt:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la mise à jour de la config robots.txt.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteRobotsTxt = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await useApiFetch<DeleteRobotsTxtResponse>(`/eqt/robottxt/${id}`, {
        method: 'DELETE',
      });
      // Supprimer de la liste
      robotsTxtConfigs.value = robotsTxtConfigs.value.filter(c => c.id !== id);
      pagination.value.totalConfigs--;
      if (currentRobotsTxtConfig.value && currentRobotsTxtConfig.value.id === id) {
        currentRobotsTxtConfig.value = null;
      }
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la config robots.txt:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la suppression de la config robots.txt.';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const generateRobotsTxt = async (payload: GenerateRobotsTxtPayload): Promise<GenerateRobotsTxtResponse | null> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await useApiFetch<GenerateRobotsTxtResponse>('/eqt/robottxt', {
        method: 'POST',
        body: payload,
      });
      // Après génération, rafraîchir la liste des configs
      await fetchRobotsTxtConfigs(pagination.value.currentPage, pagination.value.configsOnPage);
      return response;
    } catch (err: any) {
      console.error('Erreur lors de la génération du robots.txt:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la génération du robots.txt.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const serveRobotsTxt = async (sitemapUrl?: string): Promise<string | null> => {
    loading.value = true;
    error.value = null;
    try {
      const params = sitemapUrl ? { sitemapUrl } : {};
      const response = await $fetch<string>('/eqt/robotstxt-serve', {
        baseURL: useRuntimeConfig().public.pgsBaseAPI, 
        params,
        responseType: 'text', // Réponse texte
      });
      return response;
    } catch (err: any) {
      console.error('Erreur lors du service du robots.txt:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la récupération du contenu robots.txt.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  const clearCurrentRobotsTxtConfig = (): void => {
    currentRobotsTxtConfig.value = null;
  };

  return {
    robotsTxtConfigs: readonly(robotsTxtConfigs),
    currentRobotsTxtConfig: readonly(currentRobotsTxtConfig),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    generateRobotsTxt,
    fetchRobotsTxtConfigs,
    fetchRobotsTxtById,
    updateRobotsTxt,
    deleteRobotsTxt,
    serveRobotsTxt,
    clearError,
    clearCurrentRobotsTxtConfig,
  };
});
