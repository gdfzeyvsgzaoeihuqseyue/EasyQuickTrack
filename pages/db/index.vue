<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">Gérez et analysez vos liens raccourcis</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <IconLink class="w-6 h-6 text-primary-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total des liens</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalLinks }}</p>
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
              <p class="text-2xl font-bold text-gray-900">{{ totalClicks }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <IconQrcode class="w-6 h-6 text-warning-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">QR Codes</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalQRCodes }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <IconTrendingUp class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Clics ce mois</p>
              <p class="text-2xl font-bold text-gray-900">{{ monthlyClicks }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <IconSitemap class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total Sitemaps</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalSitemaps }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IconFileText class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Robots.txt configs</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalRobotsTxtConfigs }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Récents -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Liens récents -->
        <RecentsLinks @open-create-link-modal="openCreateLinkModal"
          @show-floating-notification="showFloatingNotification" />

        <!-- QR Codes récents -->
        <RecentsQrCode @show-floating-notification="showFloatingNotification" />

        <!-- Sitemaps récents -->
        <RecentsSitemap @open-generate-sitemap-modal="openGenerateSitemapModal"
          @show-floating-notification="showFloatingNotification" />

        <!-- Robots.txt récents -->
        <RecentsRobottxt @open-generate-robots-txt-modal="openGenerateRobotsTxtModal"
          @show-floating-notification="showFloatingNotification" />
      </div>

      <!-- Actions rapides -->
      <div class="card p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button @click="openCreateLinkModal"
            class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <div class="text-center">
              <IconPlus class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm font-medium text-gray-700">Créer un lien</p>
            </div>
          </button>

          <NuxtLink to="/db/qrcode/create"
            class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <div class="text-center">
              <IconQrcode class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm font-medium text-gray-700">Générer QR Code</p>
            </div>
          </NuxtLink>

          <button @click="openGenerateSitemapModal"
            class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <div class="text-center">
              <IconSitemap class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm font-medium text-gray-700">Gérer Sitemaps</p>
            </div>
          </button>

          <button @click="openGenerateRobotsTxtModal"
            class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <div class="text-center">
              <IconFileText class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm font-medium text-gray-700">Gérer Robots.txt</p>
            </div>
          </button>

          <NuxtLink to="/db/analytics"
            class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <div class="text-center">
              <IconChartBar class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm font-medium text-gray-700">Voir Analytics</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />

    <CreateLinkModal :visible="showCreateLinkModal" @close="closeCreateLinkModal"
      @link-created="handleLinkCreatedAndRefresh" />

    <GenerateSitemapModal :visible="showGenerateSitemapModal" :loading="sitemapStore.loading"
      :error="sitemapStore.error" @submit="handleGenerateSitemap" @cancel="closeGenerateSitemapModal" />

    <GenerateRobotsTxtModal :visible="showGenerateRobotsTxtModal" :loading="robotsTxtStore.loading"
      :error="robotsTxtStore.error" @submit="handleGenerateRobotsTxt" @cancel="closeGenerateRobotsTxtModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useLinksStore } from '~/stores/links';
import { useQRCodeStore } from '~/stores/qrcode';
import { useSitemapStore } from '~/stores/sitemap';
import { useRobotsTxtStore } from '~/stores/robotstxt';
import {
  IconChartBar, IconClick, IconFileText, IconLink, IconLoader,
  IconPlus, IconQrcode, IconSitemap, IconTrendingUp
} from '@tabler/icons-vue'
import { CreateLinkModal } from '@/components/link'
import { GenerateSitemapModal } from '@/components/sitemap';
import { GenerateRobotsTxtModal } from '@/components/robotstxt';
import { RecentsLinks, RecentsQrCode, RecentsSitemap, RecentsRobottxt } from '@/components/dashboard';
import type { SitemapGenerationOptions, GenerateSitemapResponse, GenerateRobotsTxtPayload, GenerateRobotsTxtResponse } from '~/types';

definePageMeta({
  layout: 'dashboard'
});

const linksStore = useLinksStore();
const qrStore = useQRCodeStore();
const sitemapStore = useSitemapStore();
const robotsTxtStore = useRobotsTxtStore();

// Modales
const showCreateLinkModal = ref(false);
const showGenerateSitemapModal = ref(false);
const showGenerateRobotsTxtModal = ref(false);

// Notifications
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
const showNotification = ref(false);
let notificationTimeout: NodeJS.Timeout | null = null;

// Fonctions de notification
const showFloatingNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  notificationTimeout = setTimeout(() => {
    closeNotification();
  }, 3000);
};

const closeNotification = () => {
  showNotification.value = false;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
};

// Surveillance des erreurs des stores
watch(() => linksStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});
watch(() => sitemapStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});
watch(() => robotsTxtStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});
watch(() => qrStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

// Montage du composant
onMounted(async () => {
  // Fetch initial data for dashboard stats
  await linksStore.fetchLinks();
  await qrStore.fetchQRCodes();
  await sitemapStore.fetchSitemaps();
  await robotsTxtStore.fetchRobotsTxtConfigs();
});

// Statistiques
const totalLinks = computed(() => linksStore.pagination.totalLinks);
const totalClicks = computed(() => linksStore.stats.totalClicks);
const totalQRCodes = computed(() => qrStore.totalQRCodes);
const totalSitemaps = computed(() => sitemapStore.pagination.totalSitemaps);
const totalRobotsTxtConfigs = computed(() => robotsTxtStore.pagination.totalConfigs);

const monthlyClicks = computed(() => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return linksStore.links.reduce((total, link) => {
    const linkDate = new Date(typeof link.createdAt === 'number' ? link.createdAt : link.createdAt);
    if (linkDate >= startOfMonth) {
      return total + (link.clicks || 0);
    }
    return total;
  }, 0);
});

// Actions sur les modales
const openCreateLinkModal = () => {
  showCreateLinkModal.value = true;
};

const closeCreateLinkModal = () => {
  showCreateLinkModal.value = false;
  linksStore.clearError();
};

const handleLinkCreatedAndRefresh = async () => {
  await linksStore.fetchLinks();
};

// Fonctions pour la modale Sitemap
const openGenerateSitemapModal = () => {
  showGenerateSitemapModal.value = true;
  sitemapStore.clearError();
};

const closeGenerateSitemapModal = () => {
  showGenerateSitemapModal.value = false;
  sitemapStore.clearError();
};

const handleGenerateSitemap = async (options: SitemapGenerationOptions) => {
  const result: GenerateSitemapResponse | null = await sitemapStore.generateSitemap(options);
  if (result) {
    showFloatingNotification(`Sitemap généré avec succès pour ${result.urlsCount} URLs !`, 'success');
    closeGenerateSitemapModal();
  } else {
  }
};

// Fonctions pour la modale Robots.txt
const openGenerateRobotsTxtModal = () => {
  showGenerateRobotsTxtModal.value = true;
  robotsTxtStore.clearError();
};

const closeGenerateRobotsTxtModal = () => {
  showGenerateRobotsTxtModal.value = false;
  robotsTxtStore.clearError();
};

const handleGenerateRobotsTxt = async (payload: GenerateRobotsTxtPayload) => {
  const result: GenerateRobotsTxtResponse | null = await robotsTxtStore.generateRobotsTxt(payload);
  if (result) {
    showFloatingNotification(`Configuration robots.txt "${result.data.title}" générée avec succès !`, 'success');
    closeGenerateRobotsTxtModal();
  } else {
  }
};

// SEO
usePageSeo('dashboard')
</script>
