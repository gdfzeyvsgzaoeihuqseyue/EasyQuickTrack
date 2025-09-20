<template>
  <div>
    <section class="relative py-20 lg:py-32 overflow-hidden">
      <div class="absolute inset-0">
        <img src="https://2ad.ir/2ad_theme/img/heading-image.webp" alt="Illustration de l'arrière-plan"
          class="w-full h-full object-cover opacity-20" />
      </div>

      <div class="absolute inset-0 bg-gradient-to-br from-primary-400 via-purple-400 to-success-400 opacity-60"></div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Votre boîte à outils web
            <span class="bg-gradient-to-r from-primary-600 to-success-500 bg-clip-text text-transparent">
              complète
            </span>
          </h1>
          <p class="text-xl text-gray-800 mb-12 max-w-2xl mx-auto">
            Raccourcissez vos URLs, générez des QR codes, analysez les performances de vos pages, gérez vos sitemaps et
            robots.txt, extrayez des contacts, et bien plus encore pour optimiser votre présence en ligne.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <NuxtLink to="/db" class="btn-primary text-lg px-8 py-4">
              Commencer gratuitement
            </NuxtLink>
            <NuxtLink to="/contact" class="btn-secondary text-lg px-8 py-4">
              Nous contacter
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex bg-gray-100 rounded-lg p-1 mb-6 max-w-lg mx-auto">
          <button @click="componentMode = 'shortener'" :class="[
            'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            componentMode === 'shortener' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          ]">
            Réducteur de lien
          </button>
          <button @click="componentMode = 'qrcode'" :class="[
            'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            componentMode === 'qrcode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          ]">
            Générateur de QR Code
          </button>
        </div>

        <UrlShortener v-if="componentMode === 'shortener'" />
        <QRCodeGenerator v-else-if="componentMode === 'qrcode'" />
      </div>
    </section>

    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Pourquoi choisir EasyQuickTrack ?
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Des fonctionnalités puissantes pour optimiser vos liens et maximiser votre impact.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(feature, index) in features" :key="index"
            class="card p-8 text-center hover:shadow-2xl transition-shadow duration-300">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              :class="feature.iconBgColor">
              <component :is="feature.icon" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ feature.title }}</h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 bg-gradient-to-r from-primary-600 to-success-600">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <template v-if="!analyticsStore.loading">
            <div class="text-white">
              <div class="text-4xl md:text-5xl font-bold mb-2">{{ linksStore.pagination.totalLinks }}</div>
              <div class="text-primary-100 text-lg">Liens raccourcis</div>
            </div>
            <div class="text-white">
              <div class="text-4xl md:text-5xl font-bold mb-2">{{ analyticsStore.globalAnalyticsData.totalClicks }}
              </div>
              <div class="text-primary-100 text-lg">Total des clics</div>
            </div>
            <div class="text-white">
              <div class="text-4xl md:text-5xl font-bold mb-2">{{ analyticsStore.globalAnalyticsData.uniqueVisitors }}
              </div>
              <div class="text-primary-100 text-lg">Visiteurs uniques</div>
            </div>
          </template>
          <div v-else class="text-white md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-white">
              <div class="text-4xl md:text-5xl font-bold mb-2">{{ loadingCounters.links }}</div>
              <div class="text-primary-100 text-lg">Liens raccourcis</div>
            </div>
            <div class="text-white">
              <div class="text-4xl md:text-5xl font-bold mb-2">{{ loadingCounters.clicks }}</div>
              <div class="text-primary-100 text-lg">Total des clics</div>
            </div>
            <div class="text-white">
              <div class="text-4xl md:text-5xl font-bold mb-2">{{ loadingCounters.visitors }}</div>
              <div class="text-primary-100 text-lg">Visiteurs uniques</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section a réintéGré -->
    <!-- <section class="py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Prêt à optimiser vos liens ?
        </h2>
        <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Rejoignez des milliers d'utilisateurs qui font confiance à EasyQuickTrack pour leurs besoins de raccourcissement de
          liens.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/db" class="btn-primary text-lg px-8 py-4">
            Commencer maintenant
          </NuxtLink>
          <NuxtLink to="/contact" class="btn-secondary text-lg px-8 py-4">
            Nous contacter
          </NuxtLink>
        </div>
      </div>
    </section> -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useLinksStore } from '~/stores/links';
import { useAnalyticsStore } from '~/stores/analytics';
import { IconLink, IconDeviceAnalytics, IconLock } from '@tabler/icons-vue';
import { UrlShortener } from '@/components/link'
import { QRCodeGenerator } from '@/components/qrcode'

const componentMode = ref('shortener');
const linksStore = useLinksStore();
const analyticsStore = useAnalyticsStore();

// Variables d'état pour le compteur animé
const loadingCounters = ref({
  links: 0,
  clicks: 0,
  visitors: 0,
});
let intervalId = null;

// Fonctions de gestion du compteur
const startRandomCounting = () => {
  if (intervalId) return;
  intervalId = setInterval(() => {
    loadingCounters.value.links = Math.floor(Math.random() * 99);
    loadingCounters.value.clicks = Math.floor(Math.random() * 99);
    loadingCounters.value.visitors = Math.floor(Math.random() * 99);
  }, 50); // 50ms
};

const stopRandomCounting = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// Variable de chargement du store
watch(() => analyticsStore.loading, (isLoading) => {
  if (isLoading) {
    startRandomCounting();
  } else {
    stopRandomCounting();
  }
});

onMounted(() => {
  linksStore.fetchLinks();
  analyticsStore.fetchAllLinksAnalytics();
});

const features = [
  {
    icon: IconLink,
    iconBgColor: 'bg-gradient-to-br from-primary-500 to-primary-600',
    title: 'Raccourcissement instantané',
    description: 'Transformez n\'importe quel lien long en URL courte et mémorables en quelques secondes.'
  },
  {
    icon: IconDeviceAnalytics,
    iconBgColor: 'bg-gradient-to-br from-success-500 to-success-600',
    title: 'Analytics détaillées',
    description: 'Suivez les clics, analysez l\'audience et mesurez la performance de vos liens.'
  },
  {
    icon: IconLock,
    iconBgColor: 'bg-gradient-to-br from-warning-500 to-warning-600',
    title: 'Sécurisé & Fiable',
    description: 'Infrastructure sécurisée avec 99.9% de disponibilité et protection contre le spam.'
  },
];

usePageSeo('index')
</script>
