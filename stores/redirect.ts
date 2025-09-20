import { defineStore } from 'pinia';
import { useApiFetch } from '~/utils/api';
import type { RedirectResponse } from '@/types';

export const useRedirectStore = defineStore('redirect', () => {
  // State
  const loading = ref(false)
  const error = ref<string>('')

  // Actions
  const redirectToLongUrl = async (shortCode: string): Promise<string | null> => {
    loading.value = true
    error.value = ''

    try {
      const response = await useApiFetch<RedirectResponse>(`/eqt/redirect/${shortCode}`, {
        method: 'GET'
      });

      if (response.redirectUrl) {
        // Rediriger vers l'URL longue
        await navigateTo(response.redirectUrl, { external: true })
        return response.redirectUrl
      }

      error.value = response.message || 'URL de redirection non fournie par le serveur.';
      return null;
      
    } catch (err: any) {
      console.error('Erreur lors de la redirection:', err)
      
      if (err.status === 404) {
        error.value = 'Lien court non trouvé'
      } else if (err.status === 403) {
        error.value = 'Ce lien court est désactivé et ne peut pas être redirigé.'
      }
      else {
        error.value = err.data?.message || 'Une erreur est survenue lors de la redirection'
      }
      
      return null
    } finally {
      loading.value = false
    }
  }

  const clearError = (): void => {
    error.value = ''
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    redirectToLongUrl,
    clearError
  }
})
