import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Service } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.pgsBaseAPI;

  const user = ref<User | null>(null);
  const services = ref<Service[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const sessionChecked = ref(false);

  let refreshInterval: NodeJS.Timeout | null = null;

  const isLoggedIn = computed(() => !!user.value);

  const logout = async () => {
    loading.value = true;

    try {
      await $fetch(`${apiUrl}/user/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.log('Erreur lors de la déconnexion (ignorée):', err);
    } finally {
      // Arrêter le rafraîchissement automatique
      stopTokenRefresh();

      user.value = null;
      services.value = [];
      sessionChecked.value = false;

      loading.value = false;
    }
  };

  const refreshAccessToken = async () => {
    try {
      await $fetch<{ message: string; expiresIn: number }>(
        `${apiUrl}/user/auth/refresh-token`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      return true;
    } catch (err) {
      // En cas d'erreur, déconnecter l'utilisateur
      await logout();
      throw err;
    }
  };

  // Fonction pour démarrer le rafraîchissement automatique du token
  const startTokenRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Rafraîchir le token toutes les 50 minutes (le token expire après 1h)
    refreshInterval = setInterval(async () => {
      try {
        await refreshAccessToken();
        console.log('Token rafraîchi automatiquement');
      } catch (error) {
        console.error('Erreur lors du rafraîchissement automatique:', error);
      }
    }, 50 * 60 * 1000); // 50 minutes
  };

  // Fonction pour arrêter le rafraîchissement automatique
  const stopTokenRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  // Récupérer la session depuis le serveur (basée sur les cookies)
  const fetchSession = async () => {
    if (sessionChecked.value) {
      return;
    }

    loading.value = true;

    try {
      const response = await $fetch<{
        user: User;
        services: Service[];
      }>(`${apiUrl}/user/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });

      user.value = response.user;
      services.value = response.services.map(s => ({
        serviceId: s.serviceId,
        serviceName: s.serviceName,
        domain: s.domain,
        role: s.role as 'user' | 'admin' | 'moderator',
        permissions: s.permissions || {},
        lastAccess: s.lastAccess,
        isActive: s.isActive !== undefined ? s.isActive : true
      }));

      sessionChecked.value = true;

      // Démarrer le rafraîchissement automatique si l'utilisateur est connecté
      if (user.value) {
        startTokenRefresh();
      }
    } catch (err: any) {
      sessionChecked.value = true;
      user.value = null;
      services.value = [];
    } finally {
      loading.value = false;
    }
  };

  const initAuth = async () => {
    if (process.client && !sessionChecked.value) {
      await fetchSession();
    }
  };

  return {
    user: computed(() => user.value),
    services: computed(() => services.value),
    isLoggedIn,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    sessionChecked: computed(() => sessionChecked.value),
    logout,
    refreshAccessToken,
    fetchSession,
    initAuth,
  };
});
