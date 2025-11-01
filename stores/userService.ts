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

  const grantAccess = async (input: GrantAccessInput, serviceApiKey: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<GrantAccessResponse>(
        `${apiUrl}/user/service/grant-access`,
        {
          method: 'POST',
          headers: {
            'x-api-key': serviceApiKey,
          },
          body: input,
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

  const revokeAccess = async (input: RevokeAccessInput, serviceApiKey: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<RevokeAccessResponse>(
        `${apiUrl}/user/service/revoke-access`,
        {
          method: 'POST',
          headers: {
            'x-api-key': serviceApiKey,
          },
          body: input,
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

  const verifyServiceAccess = async (input: VerifyTokenInput) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<VerifyTokenResponse>(
        `${apiUrl}/user/auth/verify-token`,
        {
          method: 'POST',
          body: input,
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
