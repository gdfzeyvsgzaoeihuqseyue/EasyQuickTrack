<template>
  <div v-if="isModal && visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Vérificateur PageSpeed Insights</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <IconX class="w-6 h-6" />
        </button>
      </div>
      <!-- Contenu du composant PageSpeedChecker -->
      <div class="pagespeed-checker-content">
        <p class="text-gray-600 mb-4">
          Obtenez un score de performance et des métriques clés pour l'optimisation de votre site web.
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="pagespeed-url" class="block text-sm font-medium text-gray-700 mb-2">URL à analyser</label>
            <input id="pagespeed-url" v-model="url" type="url" required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :disabled="pageSpeedStore.loading" placeholder="https://www.example.com" />
          </div>

          <button type="submit" :disabled="pageSpeedStore.loading || !url"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="pageSpeedStore.loading" class="flex items-center justify-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Analyse en cours...
            </span>
            <span v-else>Obtenir les données PageSpeed</span>
          </button>
        </form>

        <div v-if="pageSpeedStore.error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700">{{ pageSpeedStore.error }}</p>
        </div>

        <div v-if="pageSpeedStore.result" class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 class="text-lg font-semibold text-blue-800 mb-4">Résultats PageSpeed pour {{ pageSpeedStore.result.url }}
          </h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-medium text-gray-700 mb-2">Score de performance:</h5>
              <div class="text-2xl font-bold" :class="getScoreColorClass(pageSpeedStore.result.performanceScore)">
                {{ Math.round(pageSpeedStore.result.performanceScore) }}
              </div>
              <p class="text-sm text-gray-600">
                (0-49: Mauvais, 50-89: Moyen, 90-100: Bon)
              </p>
            </div>

            <div>
              <h5 class="font-medium text-gray-700 mb-2">Métriques clés:</h5>
              <ul class="space-y-2">
                <li v-for="(metric, key) in pageSpeedStore.result.metrics" :key="key"
                  class="flex items-center justify-between">
                  <template v-if="metric">
                    <span class="text-gray-600">{{ metric.title }}:</span>
                    <span class="font-semibold" :class="getScoreColorClass(metric.score * 100)">
                      {{ metric.displayValue }}
                    </span>
                  </template>
                </li>
              </ul>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 mt-4">
            <button @click="copyResultsToClipboard" class="btn-secondary flex items-center">
              <IconCopy class="w-4 h-4 mr-2" />
              Copier les résultats
            </button>
            <button @click="downloadResultsAsTxt" class="btn-primary flex items-center">
              <IconDownload class="w-4 h-4 mr-2" />
              Télécharger
            </button>
            <button @click="pageSpeedStore.clearResults" class="btn-secondary">
              Effacer les résultats
            </button>
          </div>
        </div>
        <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
          @close="closeNotification" />
      </div>
    </div>
  </div>
  <!-- Non-modal version -->
  <div v-if="!isModal" class="pagespeed-checker-content">
    <h2 class="text-2xl font-bold text-gray-900">
      Vérificateur PageSpeed Insights
    </h2>
    <p class="text-gray-600 mb-4">
      Obtenez un score de performance et des métriques clés pour l'optimisation de votre site web.
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="pagespeed-url" class="block text-sm font-medium text-gray-700 mb-2">URL à analyser</label>
        <input id="pagespeed-url" v-model="url" type="url" required
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="pageSpeedStore.loading" placeholder="https://www.example.com" />
      </div>

      <button type="submit" :disabled="pageSpeedStore.loading || !url"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
        <span v-if="pageSpeedStore.loading" class="flex items-center justify-center">
          <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          Analyse en cours...
        </span>
        <span v-else>Obtenir les données PageSpeed</span>
      </button>
    </form>

    <div v-if="pageSpeedStore.error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
      <p class="text-red-700">{{ pageSpeedStore.error }}</p>
    </div>

    <div v-if="pageSpeedStore.result" class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
      <h4 class="text-lg font-semibold text-blue-800 mb-4">Résultats PageSpeed pour {{ pageSpeedStore.result.url }}</h4>
      <div class="space-y-4">
        <div>
          <h5 class="font-medium text-gray-700 mb-2">Score de performance:</h5>
          <div class="text-2xl font-bold" :class="getScoreColorClass(pageSpeedStore.result.performanceScore)">
            {{ Math.round(pageSpeedStore.result.performanceScore) }}
          </div>
          <p class="text-sm text-gray-600">
            (0-49: Mauvais, 50-89: Moyen, 90-100: Bon)
          </p>
        </div>

        <div>
          <h5 class="font-medium text-gray-700 mb-2">Métriques clés:</h5>
          <ul class="space-y-2">
            <li v-for="(metric, key) in pageSpeedStore.result.metrics" :key="key"
              class="flex items-center justify-between">
              <template v-if="metric">
                <span class="text-gray-600">{{ metric.title }}:</span>
                <span class="font-semibold" :class="getScoreColorClass(metric.score * 100)">
                  {{ metric.displayValue }}
                </span>
              </template>
            </li>
          </ul>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 mt-4">
        <button @click="copyResultsToClipboard" class="btn-secondary flex items-center">
          <IconCopy class="w-4 h-4 mr-2" />
          Copier les résultats
        </button>
        <button @click="downloadResultsAsTxt" class="btn-primary flex items-center">
          <IconDownload class="w-4 h-4 mr-2" />
          Télécharger
        </button>
        <button @click="pageSpeedStore.clearResults" class="btn-secondary">
          Effacer les résultats
        </button>
      </div>
    </div>
    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePageSpeedStore } from '~/stores/pageSpeed';
import { IconLoader2, IconCopy, IconDownload, IconX } from '@tabler/icons-vue';
import type { PageSpeedResult, PageSpeedMetric } from '~/types';
import AppNotification from '~/components/AppNotification.vue';

const props = defineProps<{
  initialUrl?: string;
  isModal?: boolean;
  visible?: boolean; 
}>();

const emit = defineEmits(['close']); 

const pageSpeedStore = usePageSpeedStore();
const url = ref(props.initialUrl || '');

// Réagir aux changements de la prop initialUrl
watch(() => props.initialUrl, (newUrl) => {
  if (newUrl) {
    url.value = newUrl;
  }
}, { immediate: true });

// Initialize url with initialUrl prop on mount
onMounted(() => {
  if (props.initialUrl) {
    url.value = props.initialUrl;
  }
});

// États pour la notification
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
let notificationTimeout: NodeJS.Timeout | null = null;

const showFloatingNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
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

const handleSubmit = async () => {
  await pageSpeedStore.analyzeUrl(url.value);
  if (pageSpeedStore.result) {
    showFloatingNotification('Analyse PageSpeed terminée !', 'success');
  } else if (pageSpeedStore.error) {
    showFloatingNotification(pageSpeedStore.error, 'error');
  }
};

const getScoreColorClass = (score: number) => {
  if (score >= 90) {
    return 'text-green-600';
  } else if (score >= 50) {
    return 'text-orange-600';
  } else {
    return 'text-red-600';
  }
};

const formatResultsForCopy = (result: PageSpeedResult) => {
  let text = `PageSpeed Results for: ${result.url}\n\n`;
  text += `Performance Score: ${Math.round(result.performanceScore)}\n\n`;
  text += `Key Metrics:\n`;
  for (const key in result.metrics) {
    const metric = result.metrics[key as keyof typeof result.metrics];
    if (metric) {
      text += `- ${metric.title}: ${metric.displayValue} (Score: ${Math.round(metric.score * 100)})\n`;
    }
  }
  return text;
};

const copyResultsToClipboard = async () => {
  if (!pageSpeedStore.result) return;
  try {
    await navigator.clipboard.writeText(formatResultsForCopy(pageSpeedStore.result));
    showFloatingNotification('Résultats copiés dans le presse-papiers !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier les résultats.', 'error');
  }
};

const downloadResultsAsTxt = () => {
  if (!pageSpeedStore.result) return;
  const textContent = formatResultsForCopy(pageSpeedStore.result);
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'pagespeed_results.txt';
  link.click();
  URL.revokeObjectURL(link.href);
  showFloatingNotification('Fichier TXT téléchargé !', 'success');
};
</script>
