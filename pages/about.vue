<template>
  <div class="py-12">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          À propos de EasyQuickTrack
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Nous transformons la façon dont vous partagez et analysez vos liens en ligne avec une technologie moderne et une approche centrée sur l'utilisateur.
        </p>
      </div>

      <!-- Mission Section -->
      <div class="card p-12 mb-16">
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-success-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <IconBolt class="w-8 h-8 text-white" />
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Simplifier le partage de liens tout en fournissant des analyses puissantes pour optimiser votre impact digital.
          </p>
        </div>
      </div>

      <!-- Values Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div class="text-center">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IconCircleCheck class="w-6 h-6 text-primary-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Simplicité</h3>
          <p class="text-gray-600">
            Une interface intuitive qui permet de raccourcir et gérer vos liens en quelques clics.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IconTrendingUp class="w-6 h-6 text-success-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Performance</h3>
          <p class="text-gray-600">
            Des analyses détaillées pour comprendre et optimiser l'engagement de votre audience.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IconLock class="w-6 h-6 text-warning-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Sécurité</h3>
          <p class="text-gray-600">
            Infrastructure sécurisée et protection contre le spam pour garantir la fiabilité de vos liens.
          </p>
        </div>
      </div>

      <!-- Story Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
          <p class="text-gray-600 mb-6">
            EasyQuickTrack a été créé par une équipe de développeurs passionnés qui ont identifié le besoin d'un service de raccourcissement d'URL moderne, rapide et fiable.
          </p>
          <p class="text-gray-600 mb-6">
            Lancé en 2024, nous nous sommes rapidement imposés comme une alternative innovante aux solutions existantes en mettant l'accent sur l'expérience utilisateur et la puissance des analyses.
          </p>
          <p class="text-gray-600">
            Aujourd'hui, des milliers d'utilisateurs font confiance à EasyQuickTrack pour gérer leurs liens et optimiser leur présence en ligne.
          </p>
        </div>
        <div class="bg-gradient-to-br from-primary-50 to-success-50 rounded-2xl p-8">
          <div class="grid grid-cols-2 gap-6 text-center">
            <div>
              <div class="text-3xl font-bold text-primary-600">
                <template v-if="!isLoadingAnyStore">
                  {{ analyticsStore.globalAnalyticsData.uniqueVisitors }}
                </template>
                <template v-else>
                  {{ loadingCounters.users }}
                </template>
              </div>
              <div class="text-gray-600">Visiteurs uniques</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-success-600">
                <template v-if="!isLoadingAnyStore">
                  {{ linksStore.pagination.totalLinks }}
                </template>
                <template v-else>
                  {{ loadingCounters.linksCreated }}
                </template>
              </div>
              <div class="text-gray-600">Liens créés</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-warning-600">99.9%</div>
              <div class="text-gray-600">Disponibilité</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-purple-600">24/7</div>
              <div class="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-12">Notre Équipe</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div class="card p-8">
            <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white font-bold text-xl">JD</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Jean Dupont</h3>
            <p class="text-primary-600 mb-3">CEO & Fondateur</p>
            <p class="text-gray-600 text-sm">
              Expert en produits SaaS avec 10 ans d'expérience dans le développement de solutions web innovantes.
            </p>
          </div>
          
          <div class="card p-8">
            <div class="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white font-bold text-xl">SM</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Sophie Martin</h3>
            <p class="text-success-600 mb-3">CTO</p>
            <p class="text-gray-600 text-sm">
              Architecte logiciel passionnée par les performances et l'évolutivité des systèmes distribués.
            </p>
          </div>
          
          <div class="card p-8">
            <div class="w-20 h-20 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white font-bold text-xl">AL</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Alex Laurent</h3>
            <p class="text-warning-600 mb-3">Head of Design</p>
            <p class="text-gray-600 text-sm">
              Designer UX/UI créatif, spécialisé dans la création d'expériences utilisateur intuitives et engageantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { useLinksStore } from '~/stores/links';
import { useAnalyticsStore } from '~/stores/analytics';
import { IconBolt, IconCircleCheck, IconLock, IconTrendingUp } from '@tabler/icons-vue'

const linksStore = useLinksStore();
const analyticsStore = useAnalyticsStore();

// Variables d'état pour les compteurs animés
const loadingCounters = ref({
  users: 0,
  linksCreated: 0,
});
let intervalId = null;

// Déterminez si l'un des stores est en chargement
const isLoadingAnyStore = computed(() => linksStore.loading || analyticsStore.loading);

// Fonctions de gestion du compteur aléatoire
const startRandomCounting = () => {
  if (intervalId) return; 
  intervalId = setInterval(() => {
    loadingCounters.value.users = Math.floor(Math.random() * 99) + 1; 
    loadingCounters.value.linksCreated = Math.floor(Math.random() * 99) + 1; 
  }, 50); // 50ms
};

const stopRandomCounting = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// Surveillance de l'état de chargement des stores
watch(isLoadingAnyStore, (isLoading) => {
  if (isLoading) {
    startRandomCounting();
  } else {
    stopRandomCounting();
  }
});

// Au montage du composant, déclenchez la récupération des données
onMounted(() => {
  linksStore.fetchLinks();
  analyticsStore.fetchAllLinksAnalytics();
});

// Au démontage du composant, nettoyez l'intervalle
onUnmounted(() => {
  stopRandomCounting();
});

useSeoMeta({
  title: 'À propos',
  description: 'Découvrez l\'histoire et la mission de EasyQuickTrack, votre solution moderne de raccourcissement d\'URLs.',
})
</script>
