<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">

      <!-- Cas 1: Utilisateur déjà connecté avec accès actif au service -->
      <div v-if="hasActiveEqtMeAccess" class="text-center">
        <div class="mb-6">
          <IconCircleCheck class="mx-auto h-12 w-12 text-green-600" />
        </div>
        <h2 class="text-2xl font-extrabold text-gray-900 mb-2">Accès confirmé</h2>
        <p class="text-sm text-gray-600 mb-8">
          Vous avez déjà accès au service EasyQuickTrack. Redirection en cours...
        </p>
      </div>

      <!-- Cas 2: Utilisateur non connecté -->
      <div v-else-if="!authStore.isLoggedIn" class="text-center">
        <h2 class="text-2xl font-extrabold text-gray-900 mb-2">Accès refusé</h2>
        <p class="text-sm text-gray-600 mb-8">
          Vous devez d'abord vous connecter.
        </p>
        <NuxtLink to="/auth/login"
          class="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Retour à la connexion
        </NuxtLink>
      </div>

      <!-- Cas 3: Formulaire pour accorder/réactiver l'accès -->
      <div v-else>
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {{ hasInactiveEqtMeAccess ? 'Réactiver l\'accès au service' : 'Activer l\'accès au service' }}
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            {{ hasInactiveEqtMeAccess
              ? 'Votre accès a été désactivé. Acceptez à nouveau les conditions pour le réactiver.'
              : 'Acceptez les conditions d\'utilisation pour accéder au tableau de bord'
            }}
          </p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleGrantAccess">
          <!-- Checkbox pour accepter les conditions -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="acceptTerms" v-model="acceptTerms" type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" required />
            </div>
            <div class="ml-3 text-sm">
              <label for="acceptTerms" class="font-medium text-gray-700">
                J'accepte les conditions d'utilisation
              </label>
              <p class="text-gray-500 text-xs mt-1">
                En cochant cette case, vous acceptez les conditions d'utilisation de EasyQuickTrack (eqt.me).
              </p>
            </div>
          </div>

          <!-- Messages d'erreur -->
          <div v-if="userServiceStore.error || localError"
            class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {{ localError || userServiceStore.error }}
          </div>

          <!-- Messages de succès -->
          <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {{ successMessage }}
          </div>

          <!-- Bouton soumettre -->
          <div>
            <button type="submit" :disabled="userServiceStore.loading || !acceptTerms"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span v-if="userServiceStore.loading" class="flex items-center">
                <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5" />
                {{ hasInactiveEqtMeAccess ? 'Réactivation...' : 'Attribution de l\'accès...' }}
              </span>
              <span v-else>{{ hasInactiveEqtMeAccess ? 'Réactiver l\'accès' : 'Activer l\'accès' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useUserServiceStore } from '~/stores/userService';
import { IconCircleCheck, IconLoader2 } from '@tabler/icons-vue'

definePageMeta({
  layout: 'default',
});

const authStore = useAuthStore();
const userServiceStore = useUserServiceStore();
const router = useRouter();

const acceptTerms = ref(false);
const localError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const config = useRuntimeConfig();
const SERVICE_DOMAIN = 'https://eqt.me';
const SERVICE_ID = config.public.serviceId as string;
const SERVICE_API_KEY = config.public.serviceApiKey as string;

// Vérifier si l'utilisateur a un accès ACTIF
const hasActiveEqtMeAccess = computed(() => {
  const eqtService = authStore.services.find(s => s.domain === SERVICE_DOMAIN);
  return eqtService ? (eqtService.isActive === true || eqtService.isActive === undefined) : false;
});

// Vérifier si l'utilisateur a un accès INACTIF (existe mais isActive = false)
const hasInactiveEqtMeAccess = computed(() => {
  const eqtService = authStore.services.find(s => s.domain === SERVICE_DOMAIN);
  return eqtService ? eqtService.isActive === false : false;
});

onMounted(() => {
  // Si l'utilisateur n'est pas connecté, rediriger vers login
  if (!authStore.isLoggedIn) {
    router.push('/auth/login');
    return;
  }

  // Si l'utilisateur a déjà l'accès actif, rediriger vers le tableau de bord après 2 secondes
  if (hasActiveEqtMeAccess.value) {
    setTimeout(() => {
      router.push('/db');
    }, 2000);
  }
});

const handleGrantAccess = async () => {
  if (!acceptTerms.value) {
    localError.value = 'Veuillez accepter les conditions d\'utilisation.';
    return;
  }

  if (!authStore.user || !authStore.accessToken) {
    localError.value = 'Erreur d\'authentification. Veuillez vous reconnecter.';
    return;
  }

  try {
    localError.value = null;
    successMessage.value = null;

    // Si l'accès existe mais est inactif, le réactiver
    if (hasInactiveEqtMeAccess.value) { }

    // Appel à grantAccess avec le serviceApiKey
    const response = await userServiceStore.grantAccess(
      {
        userId: authStore.user.id,
        serviceId: SERVICE_ID,
        role: 'user',
        customPermissions: {}
      },
      SERVICE_API_KEY
    );

    successMessage.value = hasInactiveEqtMeAccess.value
      ? 'Accès réactivé avec succès! Redirection en cours...'
      : 'Accès accordé avec succès! Redirection en cours...';

    // Mettre à jour les services dans le store auth
    const existingServiceIndex = authStore.services.findIndex(s => s.serviceId === SERVICE_ID);

    if (existingServiceIndex !== -1) {
      // Mettre à jour le service existant
      const updatedServices = [...authStore.services];
      updatedServices[existingServiceIndex] = {
        ...updatedServices[existingServiceIndex],
        isActive: true,
        lastAccess: new Date().toISOString()
      };
      authStore.updateServices(updatedServices);
    } else {
      // Ajouter le nouveau service
      const newService = {
        serviceId: SERVICE_ID,
        serviceName: 'EasyQuickTrack',
        domain: SERVICE_DOMAIN,
        role: 'user' as const,
        permissions: {},
        lastAccess: new Date().toISOString(),
        isActive: true
      };
      authStore.updateServices([...authStore.services, newService]);
    }

    // Redirection après un court délai
    setTimeout(() => {
      router.push('/db');
    }, 1500);

  } catch (err: any) {
    console.error('Erreur lors de l\'attribution de l\'accès:', err);

    // Si l'erreur dit que l'accès existe déjà, proposer de contacter l'admin
    if (err.statusCode === 409) {
      localError.value = 'Votre accès existe déjà mais est désactivé. Veuillez contacter l\'administrateur.';
    } else {
      localError.value = 'Impossible d\'accorder l\'accès. Veuillez contacter l\'administrateur.';
    }
  }
};

useSeoMeta({
  title: 'Activation de l\'accès',
  description: 'Activez votre accès au service EasyQuickTrack.',
  robots: 'noindex, nofollow',
});
</script>
