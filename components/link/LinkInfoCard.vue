<template>
  <div class="card p-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Informations du lien</h2>
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" :checked="!link.disabled" @change="$emit('toggleStatus', $event)"
              :disabled="statusLoading" class="sr-only" />
            <div class="relative">
              <div :class="[
                'block w-14 h-8 rounded-full transition-colors duration-200',
                !link.disabled ? 'bg-success-600' : 'bg-gray-300'
              ]"></div>
              <div :class="[
                'absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200',
                !link.disabled ? 'transform translate-x-6' : ''
              ]"></div>
            </div>
            <span :class="[
              'ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              !link.disabled
                ? 'bg-success-100 text-success-800'
                : 'bg-red-100 text-red-800'
            ]">
              {{ !link.disabled ? 'Actif' : 'Désactivé' }}
            </span>
          </label>
          <div v-if="statusLoading" class="ml-2">
            <IconLoader class="animate-spin w-4 h-4 text-primary-600" />
          </div>
        </div>
        <button @click="$emit('showAnalytics')" class="btn-secondary text-sm flex-shrink-0">
          Voir les détails
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">URL originale</label>
          <div class="p-3 bg-gray-50 rounded-lg border">
            <a :href="link.longUrl" target="_blank" class="text-primary-600 hover:text-primary-700 break-all">
              {{ link.longUrl }}
            </a>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Lien raccourci</label>
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex-1 p-3 bg-gray-50 rounded-lg border min-w-[150px]">
              <a :href="link.shortLink" target="_blank"
                class="text-primary-600 hover:text-primary-700 font-medium break-all">
                {{ link.shortLink }}
              </a>
            </div>
            <button @click="$emit('copyLink', link.shortLink)" class="btn-secondary">
              {{ copied ? 'Copié!' : 'Copier' }}
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <button @click="$emit('generateQrCode')" class="btn-primary flex items-center p-3 sm:px-4 sm:py-2">
            <IconQrcode class="w-4 h-4" />
            <span class="ml-2 hidden sm:inline">QrCode</span>
          </button>
          <button @click="$emit('editLink')" class="btn-secondary flex items-center p-3 sm:px-4 sm:py-2">
            <IconEdit class="w-4 h-4" />
            <span class="ml-2 hidden sm:inline">Modifier</span>
          </button>
          <button disabled
            class="bg-red-300 text-white p-3 rounded-xl font-medium transition-colors flex items-center sm:px-4 sm:py-2 cursor-not-allowed">
            <IconTrashFilled class="w-4 h-4" />
            <span class="ml-2 hidden sm:inline">Supprimer</span>
          </button>
          <button @click="$emit('showDeleteInfo')"
            class="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-xl font-medium transition-colors flex items-center sm:px-4 sm:py-2">
            <IconInfoCircle class="w-4 h-4" />
            <span class="ml-2 hidden sm:inline">Info suppr.</span>
          </button>
        </div>
      </div>
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-primary-50 rounded-lg">
            <div class="text-2xl font-bold text-primary-600">{{ link.clicks || 0 }}</div>
            <div class="text-sm text-primary-700">Clics total</div>
          </div>
          <div class="text-center p-4 bg-success-50 rounded-lg">
            <div class="text-2xl font-bold text-success-600">{{ totalLogs }}</div>
            <div class="text-sm text-success-700">Événements</div>
          </div>
        </div>
        <div class="space-y-3">
          <div>
            <span class="text-sm font-medium text-gray-700">Créé le :</span>
            <span class="text-gray-900 ml-2">{{ formatDate(link.createdAt) }}</span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-700">Modifié le :</span>
            <span class="text-gray-900 ml-2">{{ formatDate(link.updatedAt) }}</span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-700">Code court :</span>
            <span class="text-gray-900 ml-2 font-mono">{{ link.shortCode }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconEdit, IconLoader, IconQrcode, IconTrashFilled, IconInfoCircle } from '@tabler/icons-vue';

// Définir les props
defineProps({
  link: {
    type: Object,
    required: true,
  },
  statusLoading: {
    type: Boolean,
    default: false,
  },
  copied: {
    type: Boolean,
    default: false,
  },
  totalLogs: {
    type: Number,
    default: 0,
  },
});

// Définir les événements
const emit = defineEmits([
  'toggleStatus',
  'showAnalytics',
  'copyLink',
  'generateQrCode',
  'editLink',
  'confirmDelete', 
  'showDeleteInfo'
]);

// Fonctions d'aide
const formatDate = (dateString: string | number) => {
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};
</script>

