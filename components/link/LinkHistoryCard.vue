<template>
  <div class="card p-8">
    <div class="flex flex-col md:flex-row md:justify-between items-center gap-4 mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Historique des événements</h2>
      <button @click="$emit('refreshLogs')" :disabled="loading"
        class="btn-secondary flex items-center disabled:opacity-50">
        <IconRefresh class="w-4 h-4 mr-2" />
        Actualiser
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <IconLoader class="animate-spin w-6 h-6 text-primary-600 mx-auto mb-2" />
      <p class="text-gray-500">Chargement de l'historique...</p>
    </div>
    <div v-else-if="error" class="text-center py-8">
      <IconAlertTriangle class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <button @click="$emit('refreshLogs')" class="btn-secondary">Réessayer</button>
    </div>
    <div v-else-if="logs.length === 0" class="text-center py-8">
      <IconFileText class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun événement</h3>
      <p class="text-gray-500">Aucun événement n'a été enregistré pour ce lien.</p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="log in logs" :key="log.id"
        class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getEventTypeClass(log.eventType)">
                {{ getEventTypeLabel(log.eventType) }}
              </span>
              <span class="text-sm text-gray-500">{{ formatDateTime(log.LogAt) }}</span>
            </div>
            <div v-if="log.oldUrl || log.newUrl" class="text-sm text-gray-600 space-y-1">
              <div v-if="log.oldUrl" class="flex items-start">
                <span class="font-medium mr-2">Ancienne URL:</span>
                <span class="break-all">{{ log.oldUrl }}</span>
              </div>
              <div v-if="log.newUrl" class="flex items-start">
                <span class="font-medium mr-2">Nouvelle URL:</span>
                <span class="break-all">{{ log.newUrl }}</span>
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-500">{{ log.updatedBy || 'Système' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconFileText, IconLoader, IconRefresh } from '@tabler/icons-vue';
import type { LogEntry } from '~/types';

// Définir les props
defineProps({
  logs: {
    type: Array as PropType<readonly LogEntry[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

// Définir les événements émis
const emit = defineEmits(['refreshLogs']);

// Fonctions d'aide
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR');
};

type EventType = 'created' | 'updated' | 'clicked' | 'deleted' | 'default';

const getEventTypeClass = (eventType: string) => {
  const classes: Record<EventType, string> = {
    'created': 'bg-green-100 text-green-800',
    'updated': 'bg-yellow-100 text-yellow-800',
    'clicked': 'bg-blue-100 text-blue-800',
    'deleted': 'bg-red-100 text-red-800',
    'default': 'bg-gray-100 text-gray-800',
  };
  const key = eventType as EventType;
  return classes[key] || classes.default;
};

const getEventTypeLabel = (eventType: string) => {
  const labels: Record<EventType, string> = {
    'created': 'Créé',
    'updated': 'Modifié',
    'clicked': 'Cliqué',
    'deleted': 'Supprimé',
    'default': eventType,
  };
  const key = eventType as EventType;
  return labels[key] || labels.default;
};
</script>
