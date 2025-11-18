<template>
  <div class="space-x-4 flex justify-center sm:justify-start">
    <p v-if="loading" class="text-gray-600 text-sm">Chargement des liens sociaux...</p>
    <p v-else-if="error" class="text-red-600 text-sm">Impossible de charger les liens sociaux</p>
    <ul v-else class="flex flex-wrap gap-4 justify-center md:justify-start">
      <li v-for="link in displayedLinks" :key="link.name">
        <a :href="link.href" target="_blank" rel="noopener noreferrer" :title="link.title"
          class="text-sm leading-6 text-gray-400 hover:text-primary transition-colors duration-200"
          aria-label="Accéder à notre profil social">
          <component :is="link.icon" class="w-6 h-6" aria-hidden="true" />
          <span class="sr-only">{{ link.name }}</span>
        </a>
      </li>
    </ul>
    <p v-if="!loading && !error && displayedLinks.length === 0" class="text-gray-600 text-sm">Aucun lien social à
      afficher pour le moment.</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSocialLinksDisplay } from '@/composables/useSocialLinks';

const router = useRouter()

// Réseaux sociaux
const { displayedLinks, loading, error } = useSocialLinksDisplay(); 
</script>
