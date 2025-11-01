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
    const eqtService = services.value.find(service => service.domain === 'https://eqt.me');
    return eqtService ? (eqtService.isActive === true || eqtService.isActive === undefined) : false;
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
      
      // Mapper les services avec toutes les données
      services.value = response.services.map(s => ({
        serviceId: s.serviceId,
        serviceName: s.serviceName,
        domain: s.domain,
        role: s.role as 'user' | 'admin' | 'moderator',
        permissions: s.permissions || {}, // S'assurer que permissions n'est jamais undefined
        lastAccess: s.lastAccess,
        isActive: s.isActive !== undefined ? s.isActive : true // Par défaut true si non défini
      }));
      
      // Persister les données dans localStorage si disponible
      if (process.client) {
        localStorage.setItem('userProfile', JSON.stringify(profile.value));
        localStorage.setItem('userServices', JSON.stringify(services.value));
      }
      
      return response;
    } catch (err: any) {
      error.value = err.data?.message || 'Erreur lors de la récupération du profil';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const updateServiceLastAccess = (serviceDomain: string, lastAccess: string) => {
    const serviceIndex = services.value.findIndex(s => s.domain === serviceDomain);
    if (serviceIndex !== -1) {
      services.value[serviceIndex].lastAccess = lastAccess;
      
      // Mettre à jour le localStorage
      if (process.client) {
        localStorage.setItem('userServices', JSON.stringify(services.value));
      }
    }
  };
  
  const initProfile = () => {
    if (process.client) {
      const storedProfile = localStorage.getItem('userProfile');
      const storedServices = localStorage.getItem('userServices');
      
      if (storedProfile) {
        profile.value = JSON.parse(storedProfile);
      }
      
      if (storedServices) {
        services.value = JSON.parse(storedServices);
      }
    }
  };
  
  const clearProfile = () => {
    profile.value = null;
    services.value = [];
    error.value = null;
    
    if (process.client) {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userServices');
    }
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
    updateServiceLastAccess,
    initProfile,
    clearProfile,
    clearError,
  };
});
