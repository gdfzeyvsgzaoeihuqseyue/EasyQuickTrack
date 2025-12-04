<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
    <div class="card p-8 w-full max-w-md lg:max-w-4xl">
      <!-- Loading -->
      <div v-if="linksStore.loading" class="space-y-4 text-center">
        <IconLoader class="animate-spin w-12 h-12 text-primary-600 mx-auto" />
        <h2 class="text-xl font-semibold text-gray-900">Vérification du statut du lien...</h2>
        <p class="text-gray-600">Veuillez patienter.</p>
      </div>

      <!-- Lien actif -->
      <div v-else-if="linksStore.currentLink && linkStatus.isActive"
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

      <!-- Lien inactif -->
      <div v-else-if="linksStore.currentLink && !linkStatus.isActive" class="space-y-4 text-center">
        <!-- Pas encore actif -->
        <div v-if="linkStatus.reason === 'not_yet_active'">
          <IconHourglassEmpty class="w-12 h-12 text-orange-500 mx-auto" />
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Lien pas encore actif</h2>
          <p class="text-gray-600">
            Ce lien n'est pas encore actif et sera disponible à partir du
            <span class="text-gray-900 font-bold text-lg mt-1">
              {{ formatDateTime(linkStatus.activateAt) }}
            </span>
          </p>
        </div>

        <!-- Expiré -->
        <div v-else-if="linkStatus.reason === 'expired'">
          <IconClockCancel class="w-12 h-12 text-orange-500 mx-auto" />
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Lien expiré</h2>
          <p class="text-gray-600">
            Ce lien a expiré depuis le
            <span class="text-gray-900 font-bold text-lg mt-1">
              {{ formatDateTime(linkStatus.expiresAt) }}
            </span>
          </p>
        </div>

        <!-- Désactivé manuellement -->
        <div v-else-if="linkStatus.reason === 'disabled'">
          <IconLinkOff class="w-12 h-12 text-orange-500 mx-auto" />
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Lien inaccessible</h2>
          <p class="text-gray-600">
            Ce lien a été désactivé par son propriétaire
          </p>
        </div>

        <div class="flex flex-col sm:flex-row justify-center gap-2 mt-6">
          <NuxtLink to="/" class="btn-primary">
            Retour à l'accueil
          </NuxtLink>
          <NuxtLink to="/db" class="btn-secondary">
            Créer un lien
          </NuxtLink>
        </div>
      </div>

      <!-- Lien non trouvé -->
      <div v-else class="space-y-4 text-center">
        <IconAlertTriangle class="w-12 h-12 text-red-500 mx-auto" />
        <h2 class="text-xl font-semibold text-gray-900">
          {{ linksStore.error ? 'Erreur' : 'Lien non trouvé' }}
        </h2>

        <template v-if="linksStore.error">
          <template v-if="typeof linksStore.error === 'object' && linksStore.error !== null">
            <!-- Pas encore actif -->
            <div v-if="linksStore.error.reason === 'not_yet_active'"
              class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 max-w-md mx-auto">
              <p class="text-gray-700 font-semibold text-lg mb-2">
                Ce lien n'est pas encore actif
              </p>
              <p class="text-gray-600">
                Il sera disponible à partir du :
              </p>
              <p class="text-gray-900 font-bold text-lg mt-1">
                {{ formatDateTime(linksStore.error.activateAt) }}
              </p>
            </div>

            <!-- Expiré -->
            <div v-else-if="linksStore.error.reason === 'expired'"
              class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 max-w-md mx-auto">
              <p class="text-gray-700 font-semibold text-lg mb-2">
                Ce lien a expiré
              </p>
              <p class="text-gray-600">
                Date d'expiration :
              </p>
              <p class="text-gray-900 font-bold text-lg mt-1">
                {{ formatDateTime(linksStore.error.expiresAt) }}
              </p>
            </div>

            <!-- Désactivé manuellement -->
            <div v-else-if="linksStore.error.reason === 'disabled'"
              class="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4 max-w-md mx-auto">
              <p class="text-gray-700 font-semibold text-lg">
                Ce lien a été désactivé
              </p>
              <p class="text-gray-600 mt-2">
                Le propriétaire de ce lien l'a désactivé manuellement.
              </p>
            </div>

            <!-- Message générique si raison inconnue -->
            <p v-else class="text-gray-600">{{ linksStore.error.message }}</p>
          </template>

          <!-- Erreur simple (string) -->
          <p v-else class="text-gray-600">{{ linksStore.error }}</p>
        </template>

        <div class="flex flex-col sm:flex-row justify-center gap-2 mt-6">
          <NuxtLink to="/" class="btn-primary">
            Retour à l'accueil
          </NuxtLink>
          <NuxtLink to="/db" class="btn-secondary">
            Créer un lien
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconClockCancel, IconHourglassEmpty, IconLinkOff, IconLoader, IconRobot, IconAlertCircle } from '@tabler/icons-vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useLinksStore } from '~/stores/links';

// Variables
const route = useRoute();
const shortCode = route.params.shortCode as string;
const linksStore = useLinksStore();
const countdownSeconds = ref(10);
const redirectionCancelled = ref(false);

let redirectTimeout: NodeJS.Timeout | null = null;
let countdownInterval: NodeJS.Timeout | null = null;

// Computed pour vérifier le statut du lien
const linkStatus = computed(() => {
  if (!linksStore.currentLink) {
    return {
      isActive: false,
      reason: undefined,
      message: 'Lien non trouvé'
    };
  }

  const link = linksStore.currentLink;
  const now = new Date();

  // Vérifier si désactivé manuellement
  if (link.disabled) {
    return {
      isActive: false,
      reason: 'disabled',
      message: 'Ce lien a été désactivé.'
    };
  }

  // Vérifier si pas encore activé
  if (link.activateAt && new Date(link.activateAt) > now) {
    return {
      isActive: false,
      reason: 'not_yet_active',
      message: `Ce lien sera actif à partir du ${new Date(link.activateAt).toLocaleString('fr-FR')}.`,
      activateAt: link.activateAt
    };
  }

  // Vérifier si expiré
  if (link.expiresAt && new Date(link.expiresAt) <= now) {
    return {
      isActive: false,
      reason: 'expired',
      message: `Ce lien a expiré le ${new Date(link.expiresAt).toLocaleString('fr-FR')}.`,
      expiresAt: link.expiresAt
    };
  }

  // Le lien est actif
  return {
    isActive: true,
    reason: 'active',
    message: 'Le lien est actif.'
  };
});

// Function de date
const formatDateTime = (timestamp: number | string | undefined) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Date invalide';
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

// Fonction pour démarrer le compte à rebours
const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--;
    } else {
      if (countdownInterval) clearInterval(countdownInterval);
      performRedirect();
    }
  }, 1000);
};

onMounted(async () => {
  if (!shortCode) {
    linksStore.error = 'Code court manquant.';
    return;
  }

  try {
    await linksStore.fetchPublicLinkDetails(shortCode);

    // Tags dynamiquement avec les metadata du lien
    if (linksStore.currentLink && linksStore.currentLink.metadata) {
      const metadata = linksStore.currentLink.metadata;

      // Validation des types pour ogType
      const validOgTypes = ['website', 'article', 'book', 'profile', 'music.song', 'music.album', 'music.playlist', 'music.radio_status', 'video.movie', 'video.episode', 'video.tv_show', 'video.other'] as const;
      const ogType = metadata.ogType && validOgTypes.includes(metadata.ogType as any)
        ? metadata.ogType as typeof validOgTypes[number]
        : 'website';

      // Validation des types pour twitterCard
      const validTwitterCards = ['summary', 'summary_large_image', 'app', 'player'] as const;
      const twitterCard = metadata.twitterCard && validTwitterCards.includes(metadata.twitterCard as any)
        ? metadata.twitterCard as typeof validTwitterCards[number]
        : 'summary_large_image';

      useSeoMeta({
        title: metadata.title || `Redirection de ${shortCode}`,
        description: metadata.description || 'Redirection vers le lien original...',
        ogTitle: metadata.title || `Redirection de ${shortCode}`,
        ogDescription: metadata.description || 'Redirection vers le lien original...',
        ogImage: metadata.image || undefined,
        ogUrl: linksStore.currentLink.longUrl,
        ogType: ogType,
        twitterCard: twitterCard,
        twitterTitle: metadata.title || `Redirection de ${shortCode}`,
        twitterDescription: metadata.description || 'Redirection vers le lien original...',
        twitterImage: metadata.image || undefined,
        robots: 'noindex, follow'
      });
    }

    // Démarrer le compte à rebours si le lien est actif
    if (linksStore.currentLink && linkStatus.value.isActive) {
      startCountdown();
    }

  } catch (err: any) {
    console.error("Error in pages/[shortCode].vue onMounted:", err);
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

// SEO par defaut
useSeoMeta({
  title: `Redirection de ${shortCode}`,
  description: 'Redirection vers le lien original...',
  robots: 'noindex, follow'
});
</script>
