<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">{{ isEditMode ? 'Modifier le Sitemap' : 'Générer un nouveau Sitemap' }}</h3>
        <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600">
          <IconX class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <div>
          <label for="url" class="block text-sm font-medium text-gray-700 mb-2">URL du site à analyser <span class="text-red-500">*</span></label>
          <input id="url" v-model="form.url" type="url" required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="sitemapStore.sitemapProgressLoading || isEditMode" placeholder="https://example.com" />
        </div>

        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Titre du Sitemap (optionnel)</label>
          <input id="title" v-model="form.title" type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="sitemapStore.sitemapProgressLoading" placeholder="Mon super site" />
        </div>

        <div class="border-t pt-6">
          <button type="button" @click="showAdvanced = !showAdvanced"
            class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4">
            <IconChevronRight :class="['w-4 h-4 mr-2 transition-transform', showAdvanced ? 'rotate-90' : '']" />
            Options avancées
          </button>

          <div v-show="showAdvanced" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center">
              <input id="includePriority" v-model="form.includePriority" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="sitemapStore.sitemapProgressLoading" />
              <label for="includePriority" class="ml-2 text-sm font-medium text-gray-700">Inclure la priorité</label>
            </div>
            <div class="flex items-center">
              <input id="includeLastmod" v-model="form.includeLastmod" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="sitemapStore.sitemapProgressLoading" />
              <label for="includeLastmod" class="ml-2 text-sm font-medium text-gray-700">Inclure la dernière modification</label>
            </div>
            <div class="flex items-center">
              <input id="includeChangefreq" v-model="form.includeChangefreq" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="sitemapStore.sitemapProgressLoading" />
              <label for="includeChangefreq" class="ml-2 text-sm font-medium text-gray-700">Inclure la fréquence de changement</label>
            </div>
            <div>
              <label for="changefreq" class="block text-sm font-medium text-gray-700 mb-2">Fréquence de changement</label>
              <select id="changefreq" v-model="form.changefreq"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                :disabled="sitemapStore.sitemapProgressLoading">
                <option value="always">Toujours</option>
                <option value="hourly">Horaire</option>
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
                <option value="never">Jamais</option>
              </select>
            </div>
            <div>
              <label for="maxPages" class="block text-sm font-medium text-gray-700 mb-2">Nombre max de pages (0 pour illimité)</label>
              <input id="maxPages" v-model.number="form.maxPages" type="number" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                :disabled="sitemapStore.sitemapProgressLoading" />
            </div>
            <div class="flex items-center">
              <input id="followRobotsTxt" v-model="form.followRobotsTxt" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="sitemapStore.sitemapProgressLoading" />
              <label for="followRobotsTxt" class="ml-2 text-sm font-medium text-gray-700">Respecter robots.txt</label>
            </div>
            <div class="flex items-center">
              <input id="ignoreNoindex" v-model="form.ignoreNoindex" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="sitemapStore.sitemapProgressLoading" />
              <label for="ignoreNoindex" class="ml-2 text-sm font-medium text-gray-700">Ignorer "noindex"</label>
            </div>
            <div class="flex items-center">
              <input id="ignoreNofollow" v-model="form.ignoreNofollow" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="sitemapStore.sitemapProgressLoading" />
              <label for="ignoreNofollow" class="ml-2 text-sm font-medium text-gray-700">Ignorer "nofollow"</label>
            </div>
            <div class="flex items-center">
              <input id="ignoreNonCanonical" v-model="form.ignoreNonCanonical" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="sitemapStore.sitemapProgressLoading" />
              <label for="ignoreNonCanonical" class="ml-2 text-sm font-medium text-gray-700">Ignorer non-canonique</label>
            </div>
            <div class="flex items-center">
              <input id="includeImages" v-model="form.includeImages" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="sitemapStore.sitemapProgressLoading" />
              <label for="includeImages" class="ml-2 text-sm font-medium text-gray-700">Inclure les images</label>
            </div>
          </div>
        </div>

        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700">{{ error }}</p>
        </div>

        <div class="flex space-x-3 pt-6">
          <button type="submit" :disabled="sitemapStore.sitemapProgressLoading" class="flex-1 btn-primary disabled:opacity-50">
            <span v-if="sitemapStore.sitemapProgressLoading" class="flex items-center justify-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              {{ isEditMode ? 'Mise à jour...' : 'Génération en cours...' }}
            </span>
            <span v-else>{{ isEditMode ? 'Mettre à jour' : 'Générer' }}</span>
          </button>
          <button type="button" @click="$emit('cancel')" class="flex-1 btn-secondary" :disabled="sitemapStore.sitemapProgressLoading">
            Annuler
          </button>
        </div>
      </form>

      <!-- Real-time progress display -->
      <div v-if="sitemapStore.sitemapProgressLoading || sitemapStore.sitemapProgressMessages.length > 0" class="mt-8 border-t pt-6">
        <h4 class="text-lg font-bold text-gray-900 mb-4">Progression de la génération</h4>
        <div class="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto text-sm space-y-2">
          <div v-for="(message, index) in sitemapStore.sitemapProgressMessages" :key="index"
            :class="{
              'text-blue-700': message.type === 'info',
              'text-green-700': message.type === 'start' || message.type === 'complete',
              'text-gray-700': message.type === 'progress',
              'text-orange-700': message.type === 'warning' || message.type === 'ignored',
              'text-red-700': message.type === 'error',
            }">
            <span class="font-semibold">[{{ message.type.toUpperCase() }}]</span>
            <span v-if="message.url" class="ml-1">{{ message.url }}:</span>
            <span class="ml-1">{{ message.message || message.error || message.reason }}</span>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="font-medium text-blue-800">URLs scannées: {{ sitemapStore.sitemapScannedUrls.length }}</p>
          </div>
          <div class="bg-orange-50 p-3 rounded-lg">
            <p class="font-medium text-orange-800">URLs ignorées: {{ sitemapStore.sitemapIgnoredUrls.length }}</p>
          </div>
          <div v-if="sitemapStore.sitemapErrorMessages.length > 0" class="bg-red-50 p-3 rounded-lg md:col-span-2">
            <p class="font-medium text-red-800">Erreurs: {{ sitemapStore.sitemapErrorMessages.length }}</p>
            <ul class="list-disc list-inside mt-1">
              <li v-for="(errMsg, idx) in sitemapStore.sitemapErrorMessages" :key="idx" class="text-red-700 break-all">
                {{ errMsg }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { IconX, IconChevronRight, IconLoader2 } from '@tabler/icons-vue';
import type { SitemapGenerationOptions, ShortLinkSitemap } from '@/types'; 
import { useSitemapStore } from '~/stores/sitemap';

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  error?: string | null; 
  initialUrl?: string; 
  initialSitemap?: ShortLinkSitemap | null;
}>();

const emit = defineEmits<{
  (e: 'submit', options: SitemapGenerationOptions, sitemapId: string | null): void;
  (e: 'cancel'): void;
}>();

const sitemapStore = useSitemapStore();

const showAdvanced = ref(false);
const isEditMode = computed(() => !!props.initialSitemap); 

const form = reactive<SitemapGenerationOptions>({
  url: '',
  title: '',
  includePriority: true,
  includeLastmod: false,
  includeChangefreq: true,
  changefreq: 'weekly',
  maxPages: 0,
  followRobotsTxt: true,
  ignoreNoindex: true,
  ignoreNofollow: false,
  ignoreNonCanonical: false,
  includeImages: false,
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    sitemapStore.clearProgress();
    if (props.initialSitemap) {
      form.url = props.initialSitemap.url;
      form.title = props.initialSitemap.title || '';
    } else {
      Object.assign(form, {
        url: props.initialUrl || '',
        title: '',
        includePriority: true,
        includeLastmod: false,
        includeChangefreq: true,
        changefreq: 'weekly',
        maxPages: 0,
        followRobotsTxt: true,
        ignoreNoindex: true,
        ignoreNofollow: false,
        ignoreNonCanonical: true,
        includeImages: false,
      });
    }
    showAdvanced.value = false; 
  }
});

const onSubmit = () => {
  emit('submit', { ...form }, props.initialSitemap?.id || null);
};
</script>
