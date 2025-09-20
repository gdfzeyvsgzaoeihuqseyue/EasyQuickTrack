<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="card p-8 text-center max-w-lg mx-auto">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Informations sur la suppression</h1>
        <p class="text-gray-700 mb-6">
          Pour des raisons de sécurité et en raison des tests en cours, la suppression manuelle des liens n'est pas
          possible pour le moment.
        </p>
        <p class="text-gray-700 mb-6">
          Votre lien sera automatiquement supprimé après 15 jours.
        </p>
        <p class="text-gray-700 mb-6">
          Si vous avez besoin d'une assistance immédiate, veuillez contacter l'administrateur.
        </p>
        <div class="flex justify-center mb-8">
          <NuxtLink to="/db/links" class="btn-primary flex items-center">
            <IconChevronLeft class="w-5 h-5 mr-2" />
            Retour au dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconChevronLeft } from '@tabler/icons-vue';

definePageMeta({
  layout: 'dashboard'
});
</script>