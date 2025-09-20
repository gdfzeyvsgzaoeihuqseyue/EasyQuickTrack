<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <NuxtLink to="/db/robotstxt" class="text-primary-600 hover:text-primary-700 flex items-center">
            <IconChevronLeft class="w-5 h-5 mr-2" />
            <span class="hidden sm:inline">Retour aux configurations robots.txt</span>
            <span class="sm:hidden">Retour</span>
          </NuxtLink>
        </div>

        <div v-if="robotsTxtStore.currentRobotsTxtConfig">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Détails de la configuration robots.txt</h1>
          <p class="text-gray-600">Informations et contenu pour "{{ robotsTxtStore.currentRobotsTxtConfig.title }}"</p>
        </div>
      </div>

      <div v-if="robotsTxtStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="robotsTxtStore.error" class="card p-8 text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
        <p class="text-gray-600 mb-4">{{ robotsTxtStore.error }}</p>
        <NuxtLink to="/db/robotstxt" class="btn-primary">Retour à la liste</NuxtLink>
      </div>

      <div v-else-if="config" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Informations générales -->
          <div class="card p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Informations générales</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <span class="text-gray-900">{{ config.title }}</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">User-agents configurés</label>
                <div class="p-3 bg-gray-50 rounded-lg border flex flex-wrap gap-2">
                  <span v-for="ua in Object.keys(config.userAgents)" :key="ua"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    {{ ua }}
                  </span>
                </div>
              </div>
              <div v-if="config.sitemapUrl">
                <label class="block text-sm font-medium text-gray-700 mb-2">URL du Sitemap</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <a :href="config.sitemapUrl" target="_blank" class="text-primary-600 hover:underline break-all">
                    {{ config.sitemapUrl }}
                  </a>
                </div>
              </div>
              <div v-if="config.customRules">
                <label class="block text-sm font-medium text-gray-700 mb-2">Règles personnalisées</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <pre class="text-gray-900 whitespace-pre-wrap">{{ config.customRules }}</pre>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Dernière génération</label>
                <div class="p-3 bg-gray-50 rounded-lg border">
                  <span class="text-gray-900">{{ formatDateTime(config.lastGenerated) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenu robots.txt généré -->
          <div class="card p-8">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <h2 class="text-2xl font-bold text-gray-900">Contenu robots.txt</h2>
              <div class="flex gap-2 mx-auto">
                <button @click="copyContentToClipboard" class="btn-secondary flex items-center justify-center text-sm py-2 px-4">
                  <IconCopy class="w-4 h-4" />
                  <span class="hidden sm:inline ml-2">{{ copied ? 'Copié!' : 'Copier' }}</span>
                </button>
                <button @click="downloadRobotsTxt" class="btn-primary flex items-center justify-center text-sm py-2 px-4">
                  <IconDownload class="w-4 h-4" />
                  <span class="hidden sm:inline ml-2">Télécharger</span>
                </button>
              </div>
            </div>
            <pre class="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">{{ robotsTxtContent }}</pre>
          </div>
        </div>

        <!-- Actions -->
        <div class="card p-8 flex flex-col sm:flex-row sm:justify-end gap-4">
          <button @click="openEditModal" class="btn-secondary flex items-center justify-center">
            <IconEdit class="w-5 h-5 mr-2 sm:mr-2" />
            <span class="text-sm">Modifier</span>
          </button>
          <button @click="confirmDelete" class="btn-danger flex items-center justify-center">
            <IconTrash class="w-5 h-5 mr-2 sm:mr-2" />
            <span class="text-sm">Supprimer cette config</span>
          </button>
        </div>
      </div>
    </div>

    <GenerateRobotsTxtModal :visible="showEditModal" :loading="robotsTxtStore.loading" :error="robotsTxtStore.error"
      :initial-config="config" @submit="handleUpdateRobotsTxt" @cancel="closeEditModal" />
    <DeleteRobotsTxtModal :visible="showDeleteModal" :config="config" :loading="robotsTxtStore.loading"
      @confirm="deleteRobotsTxt" @cancel="closeDeleteModal" />
    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRobotsTxtStore } from '~/stores/robotstxt';
import { GenerateRobotsTxtModal, DeleteRobotsTxtModal } from '@/components/robotstxt';
import {
  IconChevronLeft, IconLoader, IconAlertTriangle, IconCopy, IconTrash,
  IconEdit, IconDownload
} from '@tabler/icons-vue';
import type { RobotsTxtConfig, GenerateRobotsTxtPayload } from '@/types';

definePageMeta({
  layout: 'dashboard'
});

const route = useRoute();
const router = useRouter();
const robotsTxtStore = useRobotsTxtStore();

const configId = route.params.id as string;
const config = computed<any>(() => robotsTxtStore.currentRobotsTxtConfig);
const copied = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const robotsTxtContent = ref('');

// Notification
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
const showNotification = ref(false);
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

// Watch for store errors
watch(() => robotsTxtStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

onMounted(async () => {
  if (configId) {
    await robotsTxtStore.fetchRobotsTxtById(configId);
    if (config.value) {
      robotsTxtContent.value = buildRobotsTxtContent(config.value);
    }
  }
});

watch(config, (newConfig) => {
  if (newConfig) {
    robotsTxtContent.value = buildRobotsTxtContent(newConfig);
  }
});

const buildRobotsTxtContent = (cfg: RobotsTxtConfig): string => {
  let content = '';
  for (const userAgent in cfg.userAgents) {
    content += `User-agent: ${userAgent}\n`;
    const rules = cfg.userAgents[userAgent];
    if (rules.disallow && Array.isArray(rules.disallow)) {
      rules.disallow.forEach(rule => {
        content += `Disallow: ${rule}\n`;
      });
    }
    if (rules.allow && Array.isArray(rules.allow)) {
      rules.allow.forEach(rule => {
        content += `Allow: ${rule}\n`;
      });
    }
    content += '\n';
  }
  if (cfg.sitemapUrl) {
    content += `Sitemap: ${cfg.sitemapUrl}\n\n`;
  }
  if (cfg.customRules) {
    content += cfg.customRules + '\n';
  }
  return content;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR');
};

const copyContentToClipboard = async () => {
  if (!robotsTxtContent.value) return;
  try {
    await navigator.clipboard.writeText(robotsTxtContent.value);
    copied.value = true;
    showFloatingNotification('Contenu copié !', 'success');
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier le contenu.', 'error');
  }
};

const downloadRobotsTxt = () => {
  if (!robotsTxtContent.value) return;
  const blob = new Blob([robotsTxtContent.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `robots-${config.value?.title.replace(/\s/g, '-') || config.value?.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showFloatingNotification('Fichier robots.txt téléchargé !', 'success');
};

const openEditModal = () => {
  showEditModal.value = true;
  robotsTxtStore.clearError();
};

const closeEditModal = () => {
  showEditModal.value = false;
  robotsTxtStore.clearError();
};

const handleUpdateRobotsTxt = async (payload: GenerateRobotsTxtPayload) => {
  if (!config.value) return;
  const result = await robotsTxtStore.updateRobotsTxt(config.value.id, payload);
  if (result) {
    showFloatingNotification('Configuration robots.txt mise à jour avec succès !', 'success');
    closeEditModal();
  }
};

const confirmDelete = () => {
  showDeleteModal.value = true;
  robotsTxtStore.clearError();
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  robotsTxtStore.clearError();
};

const deleteRobotsTxt = async () => {
  if (!config.value) return;
  const success = await robotsTxtStore.deleteRobotsTxt(config.value.id);
  if (success) {
    showFloatingNotification('Configuration robots.txt supprimée avec succès !', 'success');
    router.push('/db/robotstxt');
  }
};

useSeoMeta({
  title: computed(() => config.value ? `robots.txt: ${config.value.title}` : 'Détails robots.txt'),
  description: 'Affichez les détails et le contenu d\'une configuration robots.txt.',
  robots: 'noindex, nofollow'
});
</script>

<style scoped>
.btn-danger {
  @apply bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors;
}
</style>
