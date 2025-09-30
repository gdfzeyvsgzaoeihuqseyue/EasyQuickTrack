<template>
  <div>
    <!-- Bouton flottant -->
    <button @click="showModal = true"
      class="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
      aria-label="Ouvrir le menu d'aide et de feedback">
      <IconMessageCircle class="h-4 w-4" />
    </button>

    <!-- Modale -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button @click="showModal = false" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded-full">
          <IconX class="h-6 w-6 transform transition duration-300 ease-in-out hover:rotate-90 hover:text-red-600" />
        </button>
        <h2 class="text-2xl font-bold mb-6 text-center">Besoin d'aide ou de nous contacter ?</h2>
        <div class="space-y-4">
          <a :href="testimonyUrl" target="_blank" @click="showModal = false"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <IconStar class="h-6 w-6 text-primary-600 mr-3" />
            <span>Donner un avis / Témoignage</span>
          </a>
          <NuxtLink to="/privacy" @click="showModal = false"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <IconFileText class="h-6 w-6 text-primary-600 mr-3" />
            <span>Confidentialité</span>
          </NuxtLink>
          <NuxtLink to="/terms" @click="showModal = false"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <IconFileDescription class="h-6 w-6 text-primary-600 mr-3" />
            <span>Conditions Générales d'Utilisation</span>
          </NuxtLink>
          <a href="https://pgsdocs.netlify.app" target="_blank" @click="showModal = false"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-ashAct transition-colors">
            <IconBook class="h-6 w-6 text-primary-600 mr-3" />
            <span>Documentation</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IconMessageCircle, IconX, IconStar, IconFileText, IconFileDescription, IconBook } from '@tabler/icons-vue';

const showModal = ref(false);

const testimonyUrl = computed(() => {
  const pgsUrl = "https://progestionsoft.netlify.app/submit-testimony";
  const params = new URLSearchParams({
    platform: 'easyquicktrack',
  });
  return `${pgsUrl}?${params.toString()}`;
});
</script>
