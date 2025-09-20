<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <IconX class="w-6 h-6" />
      </button>
      <UrlShortener @link-created="handleLinkCreated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'
import UrlShortener from '~/components/link/UrlShortener.vue';

// Définit les props acceptées par ce composant
const props = defineProps({
  visible: {
    type: Boolean,
    default: false 
  }
});

// Définit les événements que ce composant peut émettre
const emit = defineEmits(['close', 'linkCreated']);

// Gère l'événement 'linkCreated' émis par UrlShortener
const handleLinkCreated = () => {
  emit('linkCreated'); 
  emit('close'); 
};
</script>

