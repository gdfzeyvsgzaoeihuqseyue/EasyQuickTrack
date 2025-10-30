<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Rejoignez EasyQuickTrack aujourd'hui
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                required
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Jean"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                required
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Dupont"
              />
            </div>
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur <span class="text-gray-400">(optionnel)</span>
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="jeandupont"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe <span class="text-xs text-gray-500">(min. 8 caractères)</span>
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="error" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {{ error }}
        </div>

        <div v-if="success" class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {{ success }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="authStore.loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Inscription...
            </span>
            <span v-else>S'inscrire</span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Déjà un compte ?
            <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
              Se connecter
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import type { RegisterInput } from '~/types/auth';

definePageMeta({
  layout: 'default',
});

const authStore = useAuthStore();
const router = useRouter();

const formData = reactive<RegisterInput>({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
});

const confirmPassword = ref('');
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const handleRegister = async () => {
  error.value = null;
  success.value = null;

  // Validation
  if (formData.password !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }

  if (formData.password.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.';
    return;
  }

  try {
    // Supprimer le username s'il est vide
    const dataToSend = {
      ...formData,
      username: formData.username || undefined,
    };

    const response = await authStore.register(dataToSend);

    success.value = response.message || 'Inscription réussie ! Redirection vers la page de connexion...';

    // Rediriger vers la page de connexion après 2 secondes
    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  } catch (err: any) {
    error.value = authStore.error || 'Une erreur est survenue lors de l\'inscription.';
  }
};

useSeoMeta({
  title: 'Inscription',
  description: 'Créez votre compte EasyQuickTrack.',
  robots: 'noindex, nofollow',
});
</script>
