import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Service, LoginResponse, RegisterResponse, RegisterInput, LoginInput } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.pgsBaseAPI;

  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const services = ref<Service[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoggedIn = computed(() => !!user.value && !!accessToken.value);

  const hasEqtMeAccess = computed(() => {
    return services.value.some(service => service.domain === 'https://eqt.me');
  });

  const login = async (credentials: LoginInput) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<LoginResponse>(`${apiUrl}/user/auth/login`, {
        method: 'POST',
        body: credentials,
      });

      user.value = response.user;
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      services.value = response.services.map(s => ({
        serviceId: s.serviceId,
        serviceName: s.serviceName,
        domain: s.domain,
        role: s.role as 'user' | 'admin' | 'moderator',
        permissions: s.permissions,
        lastAccess: s.lastAccess
      }));

      if (process.client) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('services', JSON.stringify(services.value));
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
      const response = await $fetch<RegisterResponse>(`${apiUrl}/user/auth/register`, {
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
    const tokenToRevoke = accessToken.value;

    try {
      if (tokenToRevoke) {
        try {
          await $fetch(`${apiUrl}/user/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokenToRevoke}`,
            },
            body: {
              token: tokenToRevoke,
            },
          });
        } catch (err) {
          console.log('Erreur lors de la déconnexion (ignorée):', err);
        }
      }
    } finally {
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      services.value = [];

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
      const response = await $fetch<{ accessToken: string; expiresIn: number }>(
        `${apiUrl}/user/auth/refresh-token`,
        {
          method: 'POST',
          body: {
            refreshToken: refreshToken.value,
          },
        }
      );

      accessToken.value = response.accessToken;

      if (process.client) {
        localStorage.setItem('accessToken', response.accessToken);
      }

      return response.accessToken;
    } catch (err) {
      await logout();
      throw err;
    }
  };

  const updateServices = (newServices: Service[]) => {
    services.value = newServices;
    if (process.client) {
      localStorage.setItem('services', JSON.stringify(newServices));
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
    user: computed(() => user.value),
    accessToken: computed(() => accessToken.value),
    services: computed(() => services.value),
    isLoggedIn,
    hasEqtMeAccess,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    login,
    register,
    logout,
    refreshAccessToken,
    updateServices,
    initAuth,
  };
});
