import { defineStore } from 'pinia';
import { useApiFetch } from '~/utils/api';
import { useLinksStore } from '~/stores/links';
import { toRaw } from 'vue';
import type { ShortLinkAnalytics, AnalyticsStats, GetLinkWithAnalyticsResponse } from '@/types'

export const useAnalyticsStore = defineStore('analytics', () => {
  const linksStore = useLinksStore();

  const allAnalytics = ref<ShortLinkAnalytics[]>([]);
  const currentLinkAnalytics = ref<ShortLinkAnalytics[]>([]);
  const loading = ref(false);
  const error = ref<string>('');
  const dateRange = ref({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  const fetchAllLinksAnalytics = async (): Promise<void> => {
    loading.value = true;
    error.value = '';
    allAnalytics.value = [];

    try {
      if (linksStore.links.length === 0) {
        await linksStore.fetchLinks();
      }

      const fetchPromises = linksStore.links.map(async (link) => {
        try {
          const response = await useApiFetch<GetLinkWithAnalyticsResponse>(`/eqt/link/${link.id}`);

          const analytics = (response.data.analytics || []).map((a: ShortLinkAnalytics) => ({
            ...a,
            shortLink: response.data.shortCode || response.data.shortLink || link.shortCode,
            timestamp: typeof a.timestamp === 'string' ? parseInt(a.timestamp) : a.timestamp
          }));

          return analytics;
        } catch (err: any) {
          console.error(`Error fetching analytics for link ${link.id}:`, err);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      allAnalytics.value = results.flat();

    } catch (err: any) {
      console.error('Error fetching all analytics:', err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la récupération des analytics.';
    } finally {
      loading.value = false;
    }
  };

  const fetchAnalyticsForLink = async (linkId: string): Promise<void> => {
    loading.value = true;
    error.value = '';
    currentLinkAnalytics.value = [];

    try {
      const response = await useApiFetch<GetLinkWithAnalyticsResponse>(`/eqt/link/${linkId}`);

      // Correction: accès correct aux analytics
      currentLinkAnalytics.value = (response.data.analytics || []).map((a: ShortLinkAnalytics) => ({
        ...a,
        shortLink: response.data.shortCode || response.data.shortLink || linkId,
        timestamp: typeof a.timestamp === 'string' ? parseInt(a.timestamp) : a.timestamp
      }));

    } catch (err: any) {
      console.error(`Error fetching analytics for link ${linkId}:`, err);
      error.value = err.data?.message || 'Une erreur est survenue lors de la récupération des analytics pour ce lien.';
    } finally {
      loading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = '';
  };

  const getAnalyticsData = (data: ShortLinkAnalytics[]): AnalyticsStats => {
    const startOfDay = dateRange.value.start.setHours(0, 0, 0, 0);
    const endOfDay = dateRange.value.end.setHours(23, 59, 59, 999);

    const filteredAnalytics = data.filter(click => {
      const clickDate = new Date(click.timestamp);
      return clickDate.getTime() >= startOfDay && clickDate.getTime() <= endOfDay;
    });

    // Si aucune donnée n'est filtrée, renvoyer des statistiques par défaut
    if (filteredAnalytics.length === 0) {
      return {
        totalClicks: 0,
        uniqueVisitors: 0,
        topCountries: [],
        topCities: [],
        topDevices: [],
        topBrowsers: [],
        topSources: [],
        topOs: [],
        topLanguages: [],
        clicksByDay: [],
        clicksByHour: []
      };
    }

    const uniqueIPs = new Set(filteredAnalytics.map(click => click.ipAddress));
    const countryCounts: { [key: string]: number } = {};
    const cityCounts: { [key: string]: number } = {};
    const deviceCounts: { [key: string]: number } = {};
    const browserCounts: { [key: string]: number } = {};
    const sourceCounts: { [key: string]: number } = {};
    const osCounts: { [key: string]: number } = {};
    const languageCounts: { [key: string]: number } = {};

    filteredAnalytics.forEach(entry => {
      const country = entry.geolocalisation?.pays || 'Inconnu';
      countryCounts[country] = (countryCounts[country] || 0) + 1;

      const city = entry.geolocalisation?.ville || 'Inconnue'; 
      cityCounts[city] = (cityCounts[city] || 0) + 1; 

      const device = entry.appareil?.type || 'Inconnu';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;

      const browser = entry.appareil?.navigateur || 'Inconnu';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;

      const sourceName = entry.source?.nom || 'Inconnu';
      sourceCounts[sourceName] = (sourceCounts[sourceName] || 0) + 1;

      const os = entry.appareil?.os || 'Inconnu'; // Ajoute cette ligne
      osCounts[os] = (osCounts[os] || 0) + 1; // Ajoute cette ligne

      const language = entry.langue || 'Inconnu'; // Ajoute cette ligne
      languageCounts[language] = (languageCounts[language] || 0) + 1; // Ajoute cette ligne
    });

    const getClicksByDay = (): [string, number][] => {
      const dailyCounts: { [key: string]: number } = {};
      filteredAnalytics.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString('fr-FR');
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      const dates = [];
      let currentDate = new Date(dateRange.value.start);
      while (currentDate <= dateRange.value.end) {
        dates.push(currentDate.toLocaleDateString('fr-FR'));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Retourner au format [string, number][]
      return dates.map(date => [date, dailyCounts[date] || 0] as [string, number]);
    };

    const getClicksByHour = (): [string, number][] => {
      const hourlyCounts: { [key: number]: number } = {};
      filteredAnalytics.forEach(entry => {
        const hour = new Date(entry.timestamp).getHours();
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
      });

      // Retourner au format [string, number][]
      return Array.from({ length: 24 }, (_, hour) =>
        [`${hour}h`, hourlyCounts[hour] || 0] as [string, number]
      );
    };

    return {
      totalClicks: filteredAnalytics.length,
      uniqueVisitors: uniqueIPs.size,
      topCountries: Object.entries(countryCounts).sort(([, a], [, b]) => b - a) as [string, number][],
      topCities: Object.entries(cityCounts).sort(([, a], [, b]) => b - a) as [string, number][],
      topDevices: Object.entries(deviceCounts).sort(([, a], [, b]) => b - a) as [string, number][],
      topBrowsers: Object.entries(browserCounts).sort(([, a], [, b]) => b - a) as [string, number][],
      topSources: Object.entries(sourceCounts).sort(([, a], [, b]) => b - a) as [string, number][],
      topOs: Object.entries(osCounts).sort(([, a], [, b]) => b - a) as [string, number][],
      topLanguages: Object.entries(languageCounts).sort(([, a], [, b]) => b - a) as [string, number][],
      clicksByDay: getClicksByDay(),
      clicksByHour: getClicksByHour()
    };
  };

  const globalAnalyticsData = computed(() => getAnalyticsData(toRaw(allAnalytics.value)));
  const selectedLinkAnalyticsData = computed(() => getAnalyticsData(toRaw(currentLinkAnalytics.value)));

  const topPerformingLinks = computed(() => {
    return [...linksStore.links]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5);
  });

  return {
    allAnalytics: readonly(allAnalytics),
    currentLinkAnalytics: readonly(currentLinkAnalytics),
    loading: readonly(loading),
    error: readonly(error),
    dateRange,
    topPerformingLinks,

    fetchAllLinksAnalytics,
    fetchAnalyticsForLink,
    clearError,

    globalAnalyticsData,
    selectedLinkAnalyticsData,
  };
});
