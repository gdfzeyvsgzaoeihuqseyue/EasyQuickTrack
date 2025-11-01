import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  GrantAccessInput, GrantAccessResponse,
  RevokeAccessInput, RevokeAccessResponse, VerifyTokenInput, VerifyTokenResponse
} from '@/types/userService';

export const useUserServiceStore = defineStore('userService', () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.pgsBaseAPI;
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Accorder l'accès à un service
   */
  const grantAccess = async (input: GrantAccessInput) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<GrantAccessResponse>(
        '/api/service/grant-access',
        {
          method: 'POST',
          body: input,
          credentials: 'include',
        }
      );

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erreur lors de l\'attribution de l\'accès';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Révoquer l'accès à un service
   */
  const revokeAccess = async (input: RevokeAccessInput) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<RevokeAccessResponse>(
        '/api/service/revoke-access',
        {
          method: 'POST',
          body: input,
          credentials: 'include',
        }
      );

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erreur lors de la révocation de l\'accès';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Vérifier l'accès au service
   */
  const verifyServiceAccess = async (serviceDomain: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<VerifyTokenResponse>(
        `${apiUrl}/user/auth/verify-token`,
        {
          method: 'POST',
          body: {
            serviceDomain: serviceDomain
          },
          credentials: 'include',
        }
      );

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erreur lors de la vérification de l\'accès';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    loading,
    error,
    grantAccess,
    revokeAccess,
    verifyServiceAccess,
    clearError,
  };
});
