<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p class="text-gray-600">Visualisez les statistiques détaillées de vos liens</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <label class="text-sm font-medium text-gray-700">Période:</label>
            <input v-model="dateRangeStart" type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" />
            <span class="text-gray-500 hidden sm:inline">à</span>
            <input v-model="dateRangeEnd" type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>

          <button @click="refreshAnalytics" :disabled="analyticsStore.loading"
            class="btn-secondary flex items-center justify-center disabled:opacity-50">
            <IconRefresh class="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <IconLink class="w-6 h-6 text-primary-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total des liens</p>
              <p class="text-2xl font-bold text-gray-900">{{ linksStore.pagination.totalLinks }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <IconClick class="w-6 h-6 text-success-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total des clics</p>
              <p class="text-2xl font-bold text-gray-900">{{ currentAnalyticsData.totalClicks }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <IconTrendingUp class="w-6 h-6 text-warning-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total de pays</p>
              <p class="text-2xl font-bold text-gray-900">{{ currentAnalyticsData.topCountries.length }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <IconUsers class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Visiteurs uniques</p>
              <p class="text-2xl font-bold text-gray-900">{{ currentAnalyticsData.uniqueVisitors }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="analyticsStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="analyticsStore.error" class="card p-8 text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
        <p class="text-gray-600 mb-4">{{ analyticsStore.error }}</p>
        <button @click="refreshAnalytics" class="btn-primary">Réessayer</button>
      </div>

      <div v-else>
        <div class="card p-6 mb-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 class="text-xl font-bold text-gray-900">Analytics détaillées</h2>
            <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label for="link-select" class="text-gray-700 text-sm font-medium whitespace-nowrap">Sélectionner un lien:</label>
              <select id="link-select" v-model="selectedLinkId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Tous les liens</option>
                <option v-for="link in linksStore.links" :key="link.id" :value="link.id">
                  {{ link.shortCode }} ({{ truncateUrl(link.longUrl, 30) }})
                </option>
              </select>
            </div>
          </div>

          <div v-if="currentAnalyticsData.totalClicks === 0" class="text-center py-8">
            <IconChartBar class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune donnée analytique disponible</h3>
            <p class="text-gray-500">Il n'y a pas encore de clics enregistrés pour ce lien ou pour tous les liens.</p>
          </div>

          <div v-else class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card p-6">
                <AreaChart :data="formatDataForChart(currentAnalyticsData.clicksByDay)" title="Clics par jour" />
              </div>
              <div class="card p-6">
                <RadarChart :data="formatDataForChart(currentAnalyticsData.clicksByHour)" title="Clics par heure"
                  label="Heure" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card p-6">
                <BarChart :data="formatDataForChart(currentAnalyticsData.topCountries)" title="Top Pays" label="Pays" />
              </div>
              <div class="card p-6">
                <BarChart :data="formatDataForChart(currentAnalyticsData.topCities)" title="Top Villes" label="Ville" />
              </div>
              <div class="card p-6">
                <DoughnutChart :data="formatDataForChart(currentAnalyticsData.topDevices)" title="Types d'appareils"
                  label="Appareil" />
              </div>
              <div class="card p-6">
                <PieChart :data="formatDataForChart(currentAnalyticsData.topBrowsers)" title="Navigateurs"
                  label="Navigateur" />
              </div>
              <div class="card p-6">
                <DoughnutChart :data="formatDataForChart(currentAnalyticsData.topSources)" title="Sources de trafic"
                  label="Source" />
              </div>

              <div class="card p-6">
                <DoughnutChart :data="formatDataForChart(currentAnalyticsData.topOs)" title="Systèmes d'exploitation"
                  label="OS" />
              </div>
            </div>
            <div class="card p-6">
              <HeartmapChart :data="formatDataForChart(currentAnalyticsData.topLanguages)" title="Langues" label="Langue" />
            </div>

          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Liens les plus performants</h3>
            <div class="space-y-4">
              <div v-for="(link, index) in analyticsStore.topPerformingLinks" :key="link.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-primary-600">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-xs" :title="link.longUrl">
                      {{ truncateUrl(link.longUrl, 30) }}
                    </p>
                    <p class="text-sm text-gray-500">{{ link.shortCode }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-gray-900">{{ link.clicks || 0 }}</p>
                  <p class="text-sm text-gray-500">clics</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Sources de trafic</h3>
            <div class="space-y-4">
              <div v-for="source in currentAnalyticsData.topSources.slice(0, 8)" :key="source[0]"
                class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 rounded-full" :class="getSourceColor(source[0])"></div>
                  <span class="text-gray-900">{{ source[0] }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-gray-900">{{ source[1] }}</span>
                  <span class="text-sm text-gray-500">
                    ({{ Math.round((source[1] / currentAnalyticsData.totalClicks) * 100) }}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6 mt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Navigateurs utilisés</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Navigateur
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clics
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pourcentage
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="browser in currentAnalyticsData.topBrowsers" :key="browser[0]">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <IconDeviceDesktop class="w-4 h-4 text-gray-600" />
                      </div>
                      <span class="font-medium text-gray-900">{{ browser[0] }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ browser[1] }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ Math.round((browser[1] / currentAnalyticsData.totalClicks) * 100) }}%
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-primary-600 h-2 rounded-full"
                        :style="{ width: `${(browser[1] / currentAnalyticsData.totalClicks) * 100}%` }"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useLinksStore } from '~/stores/links';
import { useAnalyticsStore } from '~/stores/analytics';
import { useRoute } from 'vue-router';
import { IconUsers, IconRefresh, IconAlertTriangle, IconChartBar, IconClick, IconLink, IconLoader, IconTrendingUp, IconDeviceDesktop, } from '@tabler/icons-vue';
import { AreaChart, BarChart, DoughnutChart, HeartmapChart, PieChart, RadarChart } from '@/components/charts'

definePageMeta({
  layout: 'dashboard',
});

const linksStore = useLinksStore();
const analyticsStore = useAnalyticsStore();

const selectedLinkId = ref<string>('');
const dateRangeStart = ref('');
const dateRangeEnd = ref('');

const initializeDates = () => {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

  dateRangeStart.value = start.toISOString().split('T')[0];
  dateRangeEnd.value = end.toISOString().split('T')[0];

  analyticsStore.dateRange.start = start;
  analyticsStore.dateRange.end = end;
};

const currentAnalyticsData = computed(() => {
  if (selectedLinkId.value) {
    return analyticsStore.selectedLinkAnalyticsData;
  } else {
    return analyticsStore.globalAnalyticsData;
  }
});

// Fonction pour formatter les données pour les graphiques
const formatDataForChart = (data: [string, number][]) => {
  return data.map(([label, value]) => ({ label, value }));
};

onMounted(async () => {
  initializeDates();

  const route = useRoute();
  if (route.query.linkId) {
    selectedLinkId.value = route.query.linkId as string;
    await analyticsStore.fetchAnalyticsForLink(selectedLinkId.value);
  } else {
    await refreshAnalytics();
  }
});

watch(selectedLinkId, async (newId) => {
  if (newId) {
    await analyticsStore.fetchAnalyticsForLink(newId);
  } else {
    await analyticsStore.fetchAllLinksAnalytics();
  }
});

watch([dateRangeStart, dateRangeEnd], () => {
  const start = new Date(dateRangeStart.value);
  const end = new Date(dateRangeEnd.value);

  analyticsStore.dateRange.start = start;
  analyticsStore.dateRange.end = end;
});

const refreshAnalytics = async () => {
  if (selectedLinkId.value) {
    await analyticsStore.fetchAnalyticsForLink(selectedLinkId.value);
  } else {
    await analyticsStore.fetchAllLinksAnalytics();
  }
};

const truncateUrl = (url: string, maxLength: number) => {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
};

const getSourceColor = (source: string) => {
  const colors = {
    'direct': 'bg-gray-400',
    'Google': 'bg-blue-400',
    'Bing': 'bg-blue-300',
    'Facebook': 'bg-purple-400',
    'Twitter': 'bg-sky-400',
    'Instagram': 'bg-pink-400',
    'LinkedIn': 'bg-blue-600'
  };
  return colors[source as keyof typeof colors] || 'bg-green-400';
};

useSeoMeta({
  title: 'Analytics',
  description: 'Visualisez les statistiques détaillées de vos liens courts.',
  robots: 'noindex, nofollow',
});
</script>
