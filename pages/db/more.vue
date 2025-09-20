<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Outils d'analyse avancés</h1>
        <p class="text-gray-600">Explorez des fonctionnalités supplémentaires pour vos URLs</p>
      </div>

      <!-- Onglets de navigation -->
      <div class="flex bg-gray-100 rounded-lg p-1 mb-6 max-w-2xl mx-auto">
        <button @click="activeTab = 'socialsContacts'" :class="[
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          activeTab === 'socialsContacts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        ]">
          Extraction de contacts
        </button>
        <button @click="activeTab = 'pageSpeed'" :class="[
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          activeTab === 'pageSpeed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        ]">
          Analyse PageSpeed
        </button>
        <button @click="activeTab = 'metadata'" :class="[
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          activeTab === 'metadata' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        ]">
          Extraction de métadonnées
        </button>
        <button @click="activeTab = 'pagePreview'" :class="[
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          activeTab === 'pagePreview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        ]">
          Aperçu de page
        </button>
      </div>

      <!-- Onglets -->
      <div class="grid grid-cols-1 gap-8">
        <!-- Section Extraction -->
        <div v-if="activeTab === 'socialsContacts'" class="card p-6">
          <SocialsContactsExtractor />
        </div>

        <!-- Section Analyse PageSpeed -->
        <div v-else-if="activeTab === 'pageSpeed'" class="card p-6">
          <PageSpeedChecker />
        </div>

        <!-- Section Extraction de métadonnées -->
        <div v-else-if="activeTab === 'metadata'" class="card p-6">
          <MetadataExtractor />
        </div>

        <!-- Section Aperçu de page -->
        <div v-else-if="activeTab === 'pagePreview'" class="card p-6">
          <PagePreview />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SocialsContactsExtractor, PageSpeedChecker, MetadataExtractor, PagePreview } from '@/components/more';

definePageMeta({
  layout: 'dashboard',
});

const activeTab = ref('socialsContacts');

useSeoMeta({
  title: 'Outils avancés',
  description: 'Outils d\'analyse avancés pour l\'extraction d\'informations de contact et sociales, et l\'analyse PageSpeed.',
  robots: 'noindex, nofollow',
});
</script>
