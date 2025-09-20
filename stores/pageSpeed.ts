import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';
import { useApiFetch } from '~/utils/api';
import type { PageSpeedMetric, PageSpeedResult } from '@/types';

export const usePageSpeedStore = defineStore('pageSpeed', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const result = ref<PageSpeedResult | null>(null);

  const analyzeUrl = async (url: string): Promise<PageSpeedResult | null> => {
    loading.value = true;
    error.value = null;
    result.value = null;

    try {
      const response = await useApiFetch<{ success: boolean; message: string; data: PageSpeedResult }>(
        '/eqt/get-pagespeed',
        {
          method: 'POST',
          body: { url },
        }
      );
      result.value = response.data;
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de l\'analyse PageSpeed:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de l\'analyse PageSpeed.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearResults = () => {
    result.value = null;
    error.value = null;
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    result: readonly(result),
    analyzeUrl,
    clearError,
    clearResults,
  };
});
