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

      <!-- Message d'information sur le mode démo -->
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <IconInfoCircle class="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              Vous êtes en mode démontration. <br>
              Aucune donnée n'est persistante et aucune information n'est collectée. Les données d'authentification sont
              stockées localement dans votre navigateur.
            </p>
          </div>
        </div>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Identifiant</label>
            <input id="email-address" name="email" type="text" autocomplete="username" required v-model="username"
              :readonly="isDemoAccountSelected"
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Identifiant" />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required
              v-model="password" :readonly="isDemoAccountSelected"
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Mot de passe" />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" v-model="isDemoAccountSelected"
              @change="toggleDemoAccount"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Utiliser le compte démo
            </label>
          </div>
        </div>

        <div v-if="authStore.error" class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {{ authStore.error }}
        </div>

        <div>
          <button type="submit" :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="authStore.loading" class="flex items-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Connexion...
            </span>
            <span v-else>Se connecter</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { IconInfoCircle, IconLoader2 } from '@tabler/icons-vue';

definePageMeta({
  layout: 'default', 
});

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const isDemoAccountSelected = ref(false);

const DEMO_USERNAME = 'demo-accunt@eqt.com';
const DEMO_PASSWORD = '_Th!sIsJustD€m0P@55w0rd-';

const toggleDemoAccount = () => {
  if (isDemoAccountSelected.value) {
    username.value = DEMO_USERNAME;
    password.value = DEMO_PASSWORD;
  } else {
    username.value = '';
    password.value = '';
  }
};

const handleLogin = async () => {
  await authStore.login(username.value, password.value);
  if (authStore.isLoggedIn) {
    router.push('/db');
  }
};

// Initialiser les champs si le compte démo est sélectionné au chargement (par exemple, si l'utilisateur revient sur la page)
watch(isDemoAccountSelected, (newValue) => {
  if (newValue) {
    username.value = DEMO_USERNAME;
    password.value = DEMO_PASSWORD;
  }
}, { immediate: true });

// SEO
useSeoMeta({
  title: 'Connexion',
  description: 'Connectez-vous à votre compte EasyQuickTrack en mode démo.',
  robots: 'noindex, nofollow',
});
</script>
