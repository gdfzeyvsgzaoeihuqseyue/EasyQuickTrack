<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connectez-vous à votre compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Accédez au tableau de bord EasyQuickTrack
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="authStore.error" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {{ authStore.error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="authStore.loading" class="flex items-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5" />
              Connexion...
            </span>
            <span v-else>Se connecter</span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Pas encore de compte ?
            <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
              S'inscrire
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { IconLoader2 } from '@tabler/icons-vue'

definePageMeta({
  layout: 'default',
});

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });

    // Redirection vers la page de paramétrage d'accès au service
    // Cette page vérifiera si l'utilisateur a accès et accordera l'accès si nécessaire
    router.push('/auth/grant-access');
  } catch (err) {
    console.error('Erreur de connexion:', err);
  }
};

useSeoMeta({
  title: 'Connexion',
  description: 'Connectez-vous à votre compte EasyQuickTrack.',
  robots: 'noindex, nofollow',
});
</script>
