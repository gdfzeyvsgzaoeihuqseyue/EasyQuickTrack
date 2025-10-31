import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ProfileResponse, UserProfile, ServiceAccess } from '@/types/userProfile';

export const useUserProfileStore = defineStore('userProfile', () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.pgsBaseAPI;

  const profile = ref<UserProfile | null>(null);
  const services = ref<ServiceAccess[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasEqtMeAccess = computed(() => {
    return services.value.some(service => service.domain === 'https://eqt.me');
  });

  const eqtMeService = computed(() => {
    return services.value.find(service => service.domain === 'https://eqt.me');
  });

  const fetchProfile = async (token: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<ProfileResponse>(`${apiUrl}/user/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      profile.value = response.user;

      services.value = response.services.map(s => ({
        serviceId: s.serviceId,
        serviceName: s.serviceName,
        domain: s.domain,
        role: s.role as 'user' | 'admin' | 'moderator',
        permissions: s.permissions,
        lastAccess: s.lastAccess
      }));

      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erreur lors de la récupération du profil';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearProfile = () => {
    profile.value = null;
    services.value = [];
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    profile: computed(() => profile.value),
    services: computed(() => services.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    hasEqtMeAccess,
    eqtMeService,
    fetchProfile,
    clearProfile,
    clearError,
  };
});
