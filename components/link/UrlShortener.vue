<template>
  <div class="card p-8 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
      Raccourcissez votre lien instantanément
    </h2>

    <form @submit.prevent="shortenUrl" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          URL à raccourcir
        </label>
        <div class="relative">
          <input
            v-model="longUrl"
            type="url"
            placeholder="https://exemple.com/votre-lien-tres-long"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            :disabled="linksStore.loading"
            required
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Alias personnalisé (optionnel)
        </label>
        <div class="relative">
          <input
            v-model="alias"
            type="text"
            placeholder="monlienperso"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            :disabled="linksStore.loading"
          />
        </div>
        <p v-if="linksStore.error && linksStore.error.includes('alias')" class="mt-2 text-sm text-red-600">
          {{ linksStore.error }}
        </p>
      </div>

      <!-- Advanced Options Section -->
      <div class="border-t pt-6">
        <button type="button" @click="showAdvanced = !showAdvanced"
          class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4">
          <IconChevronRight :class="['w-4 h-4 mr-2 transition-transform', showAdvanced ? 'rotate-90' : '']" />
          Options avancées
        </button>

        <div v-show="showAdvanced" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Activer à partir de (optionnel)
              </label>
              <input
                v-model="activateAt"
                type="datetime-local"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                :disabled="linksStore.loading"
              />
              <p class="mt-1 text-xs text-gray-500">Le lien ne sera actif qu'à partir de cette date et heure.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Désactiver le (optionnel)
              </label>
              <input
                v-model="expiresAt"
                type="datetime-local"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                :disabled="linksStore.loading"
              />
              <p class="mt-1 text-xs text-gray-500">Le lien expirera et ne sera plus redirigé après cette date et heure.</p>
            </div>
          </div>
          <p v-if="linksStore.error && linksStore.error.includes('date')" class="mt-2 text-sm text-red-600">
            {{ linksStore.error }}
          </p>
        </div>
      </div>

      <button
        type="submit"
        :disabled="linksStore.loading || !longUrl"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="linksStore.loading" class="flex items-center justify-center">
          <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          Création en cours...
        </span>
        <span v-else>Raccourcir le lien</span>
      </button>
    </form>

    <!-- Résultat -->
    <div v-if="shortLink" class="mt-8 p-6 bg-success-50 rounded-xl border border-success-200">
      <h3 class="lg:text-left text-lg font-semibold text-success-800 mb-4 text-center">
        Lien raccourci avec succès !
      </h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-success-700 mb-1">Lien raccourci :</label>
          <div class="flex items-center space-x-2">
            <input
              ref="shortUrlInput"
              :value="shortLink.shortLink"
              readonly
              class="flex-1 px-3 py-2 bg-white border border-success-300 rounded-lg text-sm"
            />
            <button
              @click="copyToClipboard"
              class="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium"
            >
              {{ copied ? 'Copié!' : 'Copier' }}
            </button>
          </div>
        </div>

        <div class="text-sm text-success-600">
          <span class="font-medium">Clics:</span> {{ shortLink.clicks || 0 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'; 
import { useLinksStore } from '~/stores/links';
import { IconLoader2, IconChevronRight } from '@tabler/icons-vue'

const emit = defineEmits(['linkCreated']);

const linksStore = useLinksStore();

const longUrl = ref('');
const alias = ref(''); 
const activateAt = ref('');
const expiresAt = ref('');
const shortLink = ref(null);
const copied = ref(false);
const shortUrlInput = ref(null);
const showAdvanced = ref(false);

const notificationMessage = ref('');
const notificationType = ref('success');
const showNotification = ref(false);
let notificationTimeout = null;

const showFloatingNotification = (message, type = 'success') => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  notificationTimeout = setTimeout(() => {
    closeNotification();
  }, 3000);
};

const closeNotification = () => {
  showNotification.value = false;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
};

watch(() => linksStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

const shortenUrl = async () => {
  linksStore.clearError();
  shortLink.value = null;

  const result = await linksStore.createShortLink(
    longUrl.value, 
    alias.value.trim() || undefined,
    activateAt.value || undefined,
    expiresAt.value || undefined
  );

  if (result) {
    shortLink.value = result;
    showFloatingNotification('Lien raccourci avec succès !', 'success');
    emit('linkCreated', result); 
    longUrl.value = '';
    alias.value = ''; 
    activateAt.value = '';
    expiresAt.value = '';
    showAdvanced.value = false;
  }
};

const copyToClipboard = async () => {
  if (!shortLink.value) return;

  try {
    await navigator.clipboard.writeText(shortLink.value.shortLink);
    copied.value = true;
    showFloatingNotification('Lien copié dans le presse-papiers !', 'success');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Échec de la copie:', err);
    showFloatingNotification('Impossible de copier le lien.', 'error');
  }
};
</script>
