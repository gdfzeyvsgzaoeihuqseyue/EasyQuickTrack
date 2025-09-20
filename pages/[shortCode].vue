<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
    <div class="card p-8 w-full max-w-md lg:max-w-4xl">
      <div v-if="linksStore.loading" class="space-y-4 text-center">
        <IconLoader class="animate-spin w-12 h-12 text-primary-600 mx-auto" />
        <h2 class="text-xl font-semibold text-gray-900">Vérification du lien...</h2>
        <p class="text-gray-600">Veuillez patienter.</p>
      </div>

      <div v-else-if="linksStore.error" class="space-y-4 text-center">
        <IconAlertTriangle class="w-12 h-12 text-red-500 mx-auto" />
        <h2 class="text-xl font-semibold text-gray-900">Erreur</h2>
        <p class="text-gray-600">{{ linksStore.error }}</p>
        <div class="flex flex-col sm:flex-row justify-center gap-2">
          <NuxtLink to="/" class="btn-primary">
            Retour à l'accueil
          </NuxtLink>
          <NuxtLink to="/db" class="btn-secondary">
            Créer un lien
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="linksStore.currentLink"
        class="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 items-center">
        <div class="order-2 lg:order-1 space-y-6">
          <div class="bg-gray-100 p-4 rounded-lg text-left space-y-2">
            <div v-if="linksStore.currentLink.metadata?.image" class="mb-4">
              <img :src="linksStore.currentLink.metadata.image" alt="Image de prévisualisation"
                class="w-full h-auto rounded-md object-cover max-h-48" />
            </div>
            <div class="flex items-center">
              <img :src="linksStore.currentLink.metadata?.favicon" class="w-6 h-6 mr-2 inline-block" alt="Favicon" />
              <p class="text-lg font-semibold text-gray-800 break-words">
                {{ linksStore.currentLink.metadata?.title || linksStore.currentLink.longUrl }}
              </p>
            </div>
            <p v-if="linksStore.currentLink.metadata?.description" class="text-gray-600 text-sm">
              {{ linksStore.currentLink.metadata.description }}
            </p>
            <p class="text-gray-500 text-xs break-all">URL: {{ linksStore.currentLink.longUrl }}</p>
          </div>

          <p v-if="!redirectionCancelled" class="text-gray-700 text-lg text-center lg:text-left">
            Redirection automatique dans <span class="font-bold text-primary-600">{{ countdownSeconds }}</span>
            secondes...
          </p>
          <p v-else class="text-gray-700 text-lg font-bold text-red-600 text-center lg:text-left">
            Redirection annulée.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button @click="performRedirect" :disabled="redirectionCancelled"
              class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              Rediriger maintenant
            </button>
            <button @click="cancelRedirection" :disabled="redirectionCancelled"
              class="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              Annuler la redirection
            </button>
          </div>
        </div>

        <div class="order-1 lg:order-2 space-y-2 text-center lg:text-left">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">Informations de sécurité</h3>
            <p class="text-sm text-gray-600 flex items-center justify-center lg:justify-start">
              <IconRobot class="w-4 h-4 mr-2 text-primary-500" />
              Page scannée par <span class="font-semibold text-primary-700 ml-1">PGSBot</span>
            </p>
            <p v-if="linksStore.currentLink.metadata?.lastUpdated" class="text-sm text-gray-600 mt-1">
              Dernière mise à jour le {{ formatDateTime(linksStore.currentLink.metadata.lastUpdated) }}
            </p>
            <p class="text-red-600 font-medium text-sm flex items-center justify-center lg:justify-start mt-4">
              <IconAlertCircle class="w-4 h-4 mr-2" />
              Vérifiez toujours l'URL de destination avant de continuer.
            </p>
            <p class="text-gray-500 text-xs mt-4">
              Ce service est fourni par Pro Gestion Soft.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconLoader, IconRobot, IconAlertCircle } from '@tabler/icons-vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useLinksStore } from '~/stores/links';

// Récupérer le code court à partir des paramètres de l'URL
const route = useRoute();
const shortCode = route.params.shortCode as string;

// Initialiser le store des liens
const linksStore = useLinksStore();

// États du composant
const countdownSeconds = ref(10);
const redirectionCancelled = ref(false);

let redirectTimeout: NodeJS.Timeout | null = null;
let countdownInterval: NodeJS.Timeout | null = null;

// Function de date
const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fonction pour effectuer la redirection
const performRedirect = () => {
  if (redirectionCancelled.value) return;

  if (redirectTimeout) clearTimeout(redirectTimeout);
  if (countdownInterval) clearInterval(countdownInterval);

  const config = useRuntimeConfig();
  window.location.href = `${config.public.pgsBaseAPI}/eqt/redirect/${shortCode}`;
};

// Fonction pour annuler la redirection
const cancelRedirection = () => {
  if (redirectTimeout) clearTimeout(redirectTimeout);
  if (countdownInterval) clearInterval(countdownInterval);
  redirectionCancelled.value = true;
};

onMounted(async () => {
  if (!shortCode) {
    linksStore.error = 'Code court manquant.';
    return;
  }

  try {
    // Récupérer les détails du lien
    const linkDetails = await linksStore.fetchLinkById(shortCode);

    if (!linkDetails) {
      return;
    }

    // Si le lien est désactivé, afficher l'erreur immédiatement
    if (linkDetails.disabled) {
      linksStore.error = 'Ce lien est désactivé.';
      return;
    }

    // Démarrer le compte à rebours
    countdownInterval = setInterval(() => {
      if (redirectionCancelled.value) {
        clearInterval(countdownInterval!);
        return;
      }
      countdownSeconds.value--;
      if (countdownSeconds.value <= 0) {
        clearInterval(countdownInterval!);
        performRedirect();
      }
    }, 1000);

    // Définir le délai pour la redirection automatique
    redirectTimeout = setTimeout(() => {
      performRedirect();
    }, 10000);

  } catch (err: any) {
    linksStore.error = err.message || 'Une erreur est survenue lors du chargement du lien.';
  }
});

// Nettoyer les timers et le store lors du démontage du composant
onUnmounted(() => {
  if (redirectTimeout) clearTimeout(redirectTimeout);
  if (countdownInterval) clearInterval(countdownInterval);
  linksStore.clearCurrentLink();
  linksStore.clearMetadataError();
  linksStore.clearError();
});

// SEO
useSeoMeta({
  title: `Redirection de ${shortCode}`,
  description: 'Redirection vers le lien original...',
  robots: 'noindex, nofollow'
});
</script>
