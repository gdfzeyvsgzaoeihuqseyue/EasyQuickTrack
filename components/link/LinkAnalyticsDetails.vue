<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
    <div class="card p-6 md:p-8 rounded-xl shadow-lg relative bg-white w-full lg:w-[1024px] lg:max-w-5xl">
      
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20">
        <IconX class="w-6 h-6" />
      </button>

      <div class="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-6">
        <h3 class="text-xl font-bold text-gray-900">Détails des clics</h3>
        <button v-if="linkId" @click="viewAnalytics" class="btn-secondary text-sm">
          Voir plus de statistiques
        </button>
      </div>

      <!-- Chargement des données -->
      <div v-if="loading" class="flex justify-center py-8">
        <IconLoader class="animate-spin w-6 h-6 text-primary-600" />
      </div>
      <!-- Erreur -->
      <div v-else-if="error" class="text-center py-8">
        <IconAlertTriangle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p class="text-gray-600">{{ error }}</p>
      </div>
      <!-- Message sd'absence -->
      <div v-else-if="analytics.length === 0" class="text-center py-8">
        <IconChartBar class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun clic enregistré</h3>
        <p class="text-gray-500">Aucune donnée analytique n'est disponible pour ce lien.</p>
      </div>
      <!-- Affichage des données analytiques -->
      <div v-else>
        <div class="overflow-x-auto overflow-y-auto max-h-96">
          <table class="min-w-full divide-y divide-gray-200 text-sm md:text-base">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" class="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider md:px-6">
                  Heure
                </th>
                <th scope="col" class="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider md:px-6">
                  Pays
                </th>
                <th scope="col" class="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider md:px-6">
                  Appareil
                </th>
                <th scope="col" class="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider md:px-6">
                  Navigateur
                </th>
                <th scope="col" class="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider md:px-6">
                  Source
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="entry in analytics" :key="entry.id">
                <td class="px-3 py-4 whitespace-nowrap text-gray-900 md:px-6">
                  {{ formatDateTime(entry.timestamp) }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-gray-500 md:px-6">
                  {{ entry.geolocalisation?.pays || 'Inconnu' }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-gray-500 md:px-6">
                  {{ entry.appareil?.type || 'Inconnu' }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-gray-500 md:px-6">
                  {{ entry.appareil?.navigateur || 'Inconnu' }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-gray-500 md:px-6">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="getSourceTypeClass(entry.source.type)">
                    {{ entry.source.nom || 'Inconnue' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconLoader, IconAlertTriangle, IconChartBar, IconX } from '@tabler/icons-vue';
import type { ShortLinkAnalytics } from '~/types';
import { navigateTo } from '#app';

const emit = defineEmits(['close']);
const props = defineProps({
  linkId: {
    type: String,
    required: false,
  },
  analytics: {
    type: Array as () => readonly ShortLinkAnalytics[],
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  }
});

const viewAnalytics = () => {
  if (props.linkId) {
    navigateTo(`/db/analytics?linkId=${props.linkId}`);
  }
};

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR');
};

const getSourceTypeClass = (type: string) => {
  switch (type) {
    case 'social_media':
      return 'bg-blue-100 text-blue-800';
    case 'search_engine':
      return 'bg-green-100 text-green-800';
    case 'referral':
      return 'bg-purple-100 text-purple-800';
    case 'direct':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script>
