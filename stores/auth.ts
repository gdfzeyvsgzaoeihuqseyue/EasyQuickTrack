import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Service, LoginResponse, RegisterResponse, RegisterInput, LoginInput } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const services = ref<Service[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isLoggedIn = computed(() => !!user.value && !!accessToken.value);

  // Actions
  const login = async (credentials: LoginInput) => {
    loading.value = true;
    error.value = null;

    try {
      const config = useRuntimeConfig();
      const apiUrl = config.public.pgsUserAPI;

      const response = await $fetch<LoginResponse>(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        body: credentials,
      });

      // Stocker les données d'authentification
      user.value = response.user;
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      services.value = response.services;

      // Persister dans le localStorage
      if (process.client) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('services', JSON.stringify(response.services));
      }

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erreur de connexion';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: RegisterInput) => {
    loading.value = true;
    error.value = null;

    try {
      const config = useRuntimeConfig();
      const apiUrl = config.public.pgsUserAPI;

      const response = await $fetch<RegisterResponse>(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        body: data,
      });

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erreur d\'inscription';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    error.value = null;

    try {
      const config = useRuntimeConfig();
      const apiUrl = config.public.pgsUserAPI;

      if (accessToken.value) {
        await $fetch(`${apiUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
          body: {
            token: accessToken.value,
          },
        });
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      // Réinitialiser l'état
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      services.value = [];

      // Nettoyer le localStorage
      if (process.client) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('services');
      }

      loading.value = false;
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available');
    }

    try {
      const config = useRuntimeConfig();
      const apiUrl = config.public.pgsUserAPI;

      const response = await $fetch<{ accessToken: string; expiresIn: number }>(`${apiUrl}/api/auth/refresh-token`, {
        method: 'POST',
        body: {
          refreshToken: refreshToken.value,
        },
      });

      accessToken.value = response.accessToken;

      if (process.client) {
        localStorage.setItem('accessToken', response.accessToken);
      }

      return response.accessToken;
    } catch (err) {
      // Si le refresh échoue, déconnecter l'utilisateur
      await logout();
      throw err;
    }
  };

  const initAuth = () => {
    if (process.client) {
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      const storedServices = localStorage.getItem('services');

      if (storedToken && storedUser) {
        accessToken.value = storedToken;
        refreshToken.value = storedRefreshToken;
        user.value = JSON.parse(storedUser);
        services.value = storedServices ? JSON.parse(storedServices) : [];
      }
    }
  };

  return {
    // État
    user: computed(() => user.value),
    accessToken: computed(() => accessToken.value),
    services: computed(() => services.value),
    isLoggedIn,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    // Actions
    login,
    register,
    logout,
    refreshAccessToken,
    initAuth,
  };
});
