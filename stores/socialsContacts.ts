import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';
import { useApiFetch } from '~/utils/api';
import type { SocialLinks, ExtractionResult, ProgressMessage } from '@/types';


export const useSocialsContactsStore = defineStore('socialsContacts', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const result = ref<ExtractionResult | null>(null);
  const progressMessages = ref<ProgressMessage[]>([]);

  const extractData = async (
    url: string,
    analyzeContactPage: boolean,
    analyzeAllPages: boolean,
    specificPages: string[]
  ): Promise<ExtractionResult | null> => {
    loading.value = true;
    error.value = null;
    result.value = null;
    progressMessages.value = [];

    const nuxtApp = useNuxtApp();
    const socket = nuxtApp.$socket;

    if (!socket || !socket.connected) {
      error.value = 'Connexion WebSocket non établie. Veuillez réessayer.';
      loading.value = false;
      return null;
    }

    const socketId = socket.id;

    const progressListener = (message: ProgressMessage) => {
      progressMessages.value.push(message);
    };
    socket.on('socialsContactsProgress', progressListener);

    try {
      const response = await useApiFetch<{ success: boolean; message: string; data: ExtractionResult }>(
        '/eqt/extract-socials',
        {
          method: 'POST',
          body: { url, analyzeContactPage, analyzeAllPages, specificPages, socketId },
        }
      );
      result.value = response.data;
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de l\'extraction des données sociales et de contact:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de l\'extraction.';
      return null;
    } finally {
      loading.value = false;
      socket.off('socialsContactsProgress', progressListener);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearResults = () => {
    result.value = null;
    progressMessages.value = [];
    error.value = null;
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    result: readonly(result),
    progressMessages: readonly(progressMessages),
    extractData,
    clearError,
    clearResults,
  };
});
