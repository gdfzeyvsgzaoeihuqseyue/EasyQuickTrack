<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p class="text-gray-600">Gérez votre profil et vos accès aux services</p>
      </div>

      <!-- Loading State -->
      <LogoLoader v-if="profileStore.loading" :show-text="true" size="lg"
        text="Chargement des informations du profil..." />

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
              <span v-if="profileStore.profile.emailVerified"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Vérifié
              </span>
              <span v-else
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
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
            <span v-if="profileStore.profile.isActive"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Actif
            </span>
            <span v-else
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
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
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
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
                  <span v-for="(value, key) in profileStore.eqtMeService.permissions" :key="key"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {{ key }}: {{ value }}
                  </span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      <!-- Aucun service -->
      <div v-else-if="!profileStore.loading" class="card p-6">
        <div class="text-center py-8">
          <IconLock class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun accès</h3>
          <p class="mt-1 text-sm text-gray-500">Vous n'avez pas encore accès au service EQT.me</p>
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

import { LogoLoader } from '@/components/utils';
import { IconLock, IconAlertTriangle, IconLoader } from '@tabler/icons-vue'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true
});

const authStore = useAuthStore();
const profileStore = useUserProfileStore();
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

onMounted(async () => {
  // Charger le profil complet
  await profileStore.fetchProfile();
});

useSeoMeta({
  title: 'Paramètres',
  description: 'Gérez votre profil et vos accès aux services',
  robots: 'noindex, nofollow',
});
</script>
