import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SiteInfo } from '@/types';
import { useRuntimeConfig } from '#app';

export const useSiteInfoStore = defineStore('siteInfo', () => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.pgsBaseAPI;
  const SITE_IDENTIFIER = config.public.siteIdentifier;

  const activeNotifications = ref<SiteInfo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Récupère les informations de site actives et pertinentes pour l'identifiant du site actuel.
  async function fetchActiveSiteInfos() {
    loading.value = true;
    error.value = null;
    try {
      if (!SITE_IDENTIFIER) {
        throw new Error('L\'identifiant du site n\'est pas configuré dans runtimeConfig.');
      }

      const response = await $fetch<{
        message: string;
        SiteInfos: SiteInfo[];
      }>(`${API_BASE_URL}/site-info/active`, {
        params: { site: SITE_IDENTIFIER }
      });

      activeNotifications.value = response.SiteInfos;
    } catch (err: any) {
      error.value = 'Erreur lors du chargement des notifications de site: ' + (err.data?.message || err.message);
      console.error(error.value, err);
    } finally {
      loading.value = false;
    }
  }

  // Enregistre un événement pour une notification de site.
  async function trackEvent(siteInfoId: string, eventType: 'views' | 'clicks' | 'closes' | 'dismissals') {
    try {
      if (!SITE_IDENTIFIER) {
        console.warn('SITE_IDENTIFIER non configuré, impossible de tracker l\'événement.');
        return;
      }
      await $fetch(`${API_BASE_URL}/site-info/track`, {
        method: 'POST',
        body: {
          siteInfoId: siteInfoId,
          site: SITE_IDENTIFIER,
          eventType: eventType
        }
      });
      console.log(`Event tracked: ${eventType} for ${siteInfoId}`);
    } catch (err: any) {
      console.error(`Erreur lors du suivi de l'événement ${eventType} pour ${siteInfoId}:`, err.data?.message || err.message);
    }
  }

  return {
    activeNotifications,
    loading,
    error,
    fetchActiveSiteInfos,
    trackEvent,
  };
});

