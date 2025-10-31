<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p class="text-gray-600">Gérez votre profil et vos accès aux services</p>
      </div>

      <!-- Loading State -->
      <div v-if="profileStore.loading" class="flex justify-center items-center py-12">
        <svg class="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Error State -->
      <div v-if="profileStore.error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md mb-6">
        {{ profileStore.error }}
      </div>

      <!-- Profil Utilisateur -->
      <div v-if="profileStore.profile" class="card p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Profil utilisateur</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <p class="text-gray-900">{{ profileStore.profile.firstName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <p class="text-gray-900">{{ profileStore.profile.lastName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div class="flex items-center gap-2">
              <p class="text-gray-900">{{ profileStore.profile.email }}</p>
              <span v-if="profileStore.profile.emailVerified" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Vérifié
              </span>
              <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Non vérifié
              </span>
            </div>
          </div>
          <div v-if="profileStore.profile.username">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
            <p class="text-gray-900">{{ profileStore.profile.username }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <span v-if="profileStore.profile.isActive" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Actif
            </span>
            <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Inactif
            </span>
          </div>
          <div v-if="profileStore.profile.lastLogin">
            <label class="block text-sm font-medium text-gray-700 mb-1">Dernière connexion</label>
            <p class="text-gray-900">{{ formatDate(profileStore.profile.lastLogin) }}</p>
          </div>
        </div>
      </div>

      <!-- Service EQT.me -->
      <div v-if="profileStore.eqtMeService" class="card p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Accès au service</h2>
        
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ profileStore.eqtMeService.serviceName }}</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {{ profileStore.eqtMeService.role }}
                </span>
              </div>
              
              <p class="text-sm text-gray-600 mb-2">
                <span class="font-medium">Domaine:</span> {{ profileStore.eqtMeService.domain }}
              </p>

              <div v-if="profileStore.eqtMeService.lastAccess" class="text-sm text-gray-600 mb-3">
                <span class="font-medium">Dernier accès:</span> {{ formatDate(profileStore.eqtMeService.lastAccess) }}
              </div>

              <div v-if="Object.keys(profileStore.eqtMeService.permissions).length > 0" class="mt-3">
                <p class="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(value, key) in profileStore.eqtMeService.permissions" 
                    :key="key"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {{ key }}: {{ value }}
                  </span>
                </div>
              </div>
            </div>

            <button
              @click="showRevokeModal = true"
              :disabled="userServiceStore.loading"
              class="ml-4 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Révoquer l'accès
            </button>
          </div>
        </div>
      </div>

      <!-- Aucun service -->
      <div v-else-if="!profileStore.loading" class="card p-6">
        <div class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun accès</h3>
          <p class="mt-1 text-sm text-gray-500">Vous n'avez pas encore accès au service EQT.me</p>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de révocation -->
    <div v-if="showRevokeModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showRevokeModal = false"></div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Révoquer l'accès au service
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir révoquer votre accès au service EQT.me ? Vous serez déconnecté immédiatement et redirigé vers la page d'accueil.
                </p>
              </div>
            </div>
          </div>

          <div v-if="userServiceStore.error" class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {{ userServiceStore.error }}
          </div>

          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              @click="handleRevokeAccess"
              :disabled="userServiceStore.loading"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="userServiceStore.loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Révocation...
              </span>
              <span v-else>Confirmer la révocation</span>
            </button>
            <button
              @click="showRevokeModal = false"
              :disabled="userServiceStore.loading"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useUserProfileStore } from '~/stores/userProfile';
import { useUserServiceStore } from '~/stores/userService';

definePageMeta({
  layout: 'dashboard',
});

const authStore = useAuthStore();
const profileStore = useUserProfileStore();
const userServiceStore = useUserServiceStore();
const router = useRouter();

const showRevokeModal = ref(false);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleRevokeAccess = async () => {
  if (!authStore.user || !authStore.accessToken || !profileStore.eqtMeService) {
    return;
  }

  try {
    await userServiceStore.revokeAccess(
      {
        userId: authStore.user.id,
        serviceId: profileStore.eqtMeService.serviceId,
      },
      authStore.accessToken
    );

    // Déconnexion et redirection vers la page d'accueil
    await authStore.logout();
    router.push('/');
  } catch (err) {
    console.error('Erreur lors de la révocation:', err);
  }
};

onMounted(async () => {
  if (authStore.accessToken) {
    await profileStore.fetchProfile(authStore.accessToken);
  }
});

useSeoMeta({
  title: 'Paramètres',
  description: 'Gérez votre profil et vos accès aux services',
  robots: 'noindex, nofollow',
});
</script>
