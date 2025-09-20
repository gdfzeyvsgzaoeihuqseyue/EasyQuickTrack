<template>
  <!-- Modal version -->
  <div v-if="isModal && visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Aperçu de page</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <IconX class="w-6 h-6" />
        </button>
      </div>
      <!-- Contenu du composant PagePreview -->
      <div class="page-preview-content">        
        <p class="text-gray-600 mb-4">
          Visualisez n'importe quelle page web sur différents appareils et capturez des captures d'écran.
        </p>

        <form @submit.prevent="loadUrl" class="space-y-6 mb-8">
          <div>
            <label for="preview-url" class="block text-sm font-medium text-gray-700 mb-2">URL à prévisualiser</label>
            <input id="preview-url" v-model="url" type="url" required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :disabled="loading" placeholder="https://www.example.com" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Mode d'affichage</label>
            <div class="flex space-x-2 mb-4">
              <button type="button" @click="viewMode = 'desktop'" :class="[
                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
                viewMode === 'desktop' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]">
                <IconDeviceDesktop class="w-5 h-5 mr-2" /> Bureau
              </button>
              <button type="button" @click="viewMode = 'tablet'" :class="[
                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
                viewMode === 'tablet' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]">
                <IconDeviceTablet class="w-5 h-5 mr-2" /> Tablette
              </button>
              <button type="button" @click="viewMode = 'mobile'" :class="[
                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
                viewMode === 'mobile' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]">
                <IconDeviceMobile class="w-5 h-5 mr-2" /> Mobile
              </button>
              <button type="button" @click="viewMode = 'custom'" :class="[
                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
                viewMode === 'custom' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]">
                <IconSettings class="w-5 h-5 mr-2" /> Perso.
              </button>
            </div>

            <div v-if="viewMode === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="custom-width" class="block text-sm font-medium text-gray-700 mb-2">Largeur (px)</label>
                <input id="custom-width" v-model.number="customWidth" type="number" min="100" max="2560"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :disabled="loading" />
              </div>
              <div>
                <label for="custom-height" class="block text-sm font-medium text-gray-700 mb-2">Hauteur (px)</label>
                <input id="custom-height" v-model.number="customHeight" type="number" min="100" max="1440"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :disabled="loading" />
              </div>
            </div>
          </div>

          <button type="submit" :disabled="loading || !url"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading" class="flex items-center justify-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Chargement...
            </span>
            <span v-else>Charger la page</span>
          </button>
        </form>

        <div v-if="iframeSrc" class="mt-8">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Aperçu</h3>
          <div class="flex justify-center items-center p-4 bg-gray-100 rounded-xl">
            <div ref="previewContainerRef" :style="deviceFrameStyle"
              class="relative bg-gray-800 shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ease-in-out">
              <!-- Camera pour mobile tablette -->
              <div v-if="viewMode === 'mobile' || viewMode === 'tablet'"
                class="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
                <div class="w-4 h-4 bg-gray-600 rounded-full"
                  :class="{ 'mt-2': viewMode === 'mobile', 'mt-3': viewMode === 'tablet' }"></div>
              </div>
              <!-- Iframe wrapper -->
              <div :style="iframeWrapperStyle" class="relative z-10 bg-white overflow-hidden">
                <iframe ref="iframeRef" :src="iframeSrc" width="100%" height="100%" frameborder="0" class="bg-white"
                  @load="handleIframeLoad"></iframe>
              </div>
              <!-- Bouton d'acceuil sur mobile -->
              <div v-if="viewMode === 'mobile'" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20">
                <div class="w-8 h-1 bg-gray-600 rounded-full mb-2"></div>
              </div>

              <div v-if="loading"
                class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-30">
                <IconLoader2 class="animate-spin w-12 h-12 text-primary-600" />
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-3 mt-6 justify-center">
            <button @click="captureAndDownload" :disabled="loading" class="btn-primary flex items-center">
              <IconDownload class="w-4 h-4 mr-2" />
              Télécharger PNG
            </button>
            <button @click="captureAndCopyToClipboard" :disabled="loading" class="btn-secondary flex items-center">
              <IconCopy class="w-4 h-4 mr-2" />
              Copier l'image
            </button>
          </div>
        </div>
        <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
          @close="closeNotification" />
      </div>
    </div>
  </div>
  <!-- Non-modal version -->
  <div v-if="!isModal" class="page-preview-content">
    <h2 class="text-2xl font-bold text-gray-900">Aperçu de page</h2>
    <p class="text-gray-600 mb-4">
      Visualisez n'importe quelle page web sur différents appareils et capturez des captures d'écran.
    </p>

    <form @submit.prevent="loadUrl" class="space-y-6 mb-8">
      <div>
        <label for="preview-url" class="block text-sm font-medium text-gray-700 mb-2">URL à prévisualiser</label>
        <input id="preview-url" v-model="url" type="url" required
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="loading" placeholder="https://www.example.com" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Mode d'affichage</label>
        <div class="flex space-x-2 mb-4">
          <button type="button" @click="viewMode = 'desktop'" :class="[
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
            viewMode === 'desktop' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]">
            <IconDeviceDesktop class="w-5 h-5 mr-2" /> Bureau
          </button>
          <button type="button" @click="viewMode = 'tablet'" :class="[
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
            viewMode === 'tablet' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]">
            <IconDeviceTablet class="w-5 h-5 mr-2" /> Tablette
          </button>
          <button type="button" @click="viewMode = 'mobile'" :class="[
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
            viewMode === 'mobile' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]">
            <IconDeviceMobile class="w-5 h-5 mr-2" /> Mobile
          </button>
          <button type="button" @click="viewMode = 'custom'" :class="[
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
            viewMode === 'custom' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]">
            <IconSettings class="w-5 h-5 mr-2" /> Perso.
          </button>
        </div>

        <div v-if="viewMode === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="custom-width" class="block text-sm font-medium text-gray-700 mb-2">Largeur (px)</label>
            <input id="custom-width" v-model.number="customWidth" type="number" min="100" max="2560"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :disabled="loading" />
          </div>
          <div>
            <label for="custom-height" class="block text-sm font-medium text-gray-700 mb-2">Hauteur (px)</label>
            <input id="custom-height" v-model.number="customHeight" type="number" min="100" max="1440"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :disabled="loading" />
          </div>
        </div>
      </div>

      <button type="submit" :disabled="loading || !url"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
        <span v-if="loading" class="flex items-center justify-center">
          <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          Chargement...
        </span>
        <span v-else>Charger la page</span>
      </button>
    </form>

    <div v-if="iframeSrc" class="mt-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Aperçu</h3>
      <div class="flex justify-center items-center p-4 bg-gray-100 rounded-xl">
        <div ref="previewContainerRef" :style="deviceFrameStyle"
          class="relative bg-gray-800 shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ease-in-out">
          <!-- Camera pour mobile tablette -->
          <div v-if="viewMode === 'mobile' || viewMode === 'tablet'"
            class="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
            <div class="w-4 h-4 bg-gray-600 rounded-full"
              :class="{ 'mt-2': viewMode === 'mobile', 'mt-3': viewMode === 'tablet' }"></div>
          </div>
          <!-- Iframe wrapper -->
          <div :style="iframeWrapperStyle" class="relative z-10 bg-white overflow-hidden">
            <iframe ref="iframeRef" :src="iframeSrc" width="100%" height="100%" frameborder="0" class="bg-white"
              @load="handleIframeLoad"></iframe>
          </div>
          <!-- Bouton d'acceuil sur mobile -->
          <div v-if="viewMode === 'mobile'" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20">
            <div class="w-8 h-1 bg-gray-600 rounded-full mb-2"></div>
          </div>

          <div v-if="loading"
            class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-30">
            <IconLoader2 class="animate-spin w-12 h-12 text-primary-600" />
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 mt-6 justify-center">
        <button @click="captureAndDownload" :disabled="loading" class="btn-primary flex items-center">
          <IconDownload class="w-4 h-4 mr-2" />
          Télécharger PNG
        </button>
        <button @click="captureAndCopyToClipboard" :disabled="loading" class="btn-secondary flex items-center">
          <IconCopy class="w-4 h-4 mr-2" />
          Copier l'image
        </button>
      </div>
    </div>
    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { IconLoader2, IconDownload, IconCopy, IconDeviceDesktop, IconDeviceTablet, IconDeviceMobile, IconSettings, IconX } from '@tabler/icons-vue';
import html2canvas from 'html2canvas';
import AppNotification from '~/components/AppNotification.vue';

// Etat
const props = defineProps<{
  initialUrl?: string;
  isModal?: boolean; 
  visible?: boolean;
}>();

const emit = defineEmits(['close']); 

const url = ref(props.initialUrl || '');
const iframeSrc = ref('');
const viewMode = ref<'desktop' | 'tablet' | 'mobile' | 'custom'>('desktop');
const customWidth = ref(1024);
const customHeight = ref(768);
const loading = ref(false);

const iframeRef = ref<HTMLIFrameElement | null>(null);
const previewContainerRef = ref<HTMLElement | null>(null);

// Réagir aux changements de la prop initialUrl
watch(() => props.initialUrl, (newUrl) => {
  if (newUrl) {
    url.value = newUrl;
  }
}, { immediate: true });

// Initialisation au chargement
onMounted(() => {
  if (props.initialUrl) {
    url.value = props.initialUrl;
  }
});

// Notification
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
let notificationTimeout: NodeJS.Timeout | null = null;

// Iframe dimensions
const iframeWidth = computed(() => {
  switch (viewMode.value) {
    case 'desktop': return 1280;
    case 'tablet': return 768;
    case 'mobile': return 375;
    case 'custom': return customWidth.value;
    default: return 1280;
  }
});

const iframeHeight = computed(() => {
  switch (viewMode.value) {
    case 'desktop': return 800;
    case 'tablet': return 1024;
    case 'mobile': return 667;
    case 'custom': return customHeight.value;
    default: return 800;
  }
});

// Device frame style
const deviceFrameStyle = computed(() => {
  let width = iframeWidth.value;
  let height = iframeHeight.value;
  let borderRadius = '0.5rem'; // defaut pour desktop etcustom
  let borderWidth = '8px'; // defaut pour desktop

  switch (viewMode.value) {
    case 'tablet':
      width += 32; // 16px de bordure pour chaque côté
      height += 32;
      borderRadius = '1.5rem'; // rounded-3xl
      borderWidth = '16px';
      break;
    case 'mobile':
      width += 20; // 10px de bordure pour chaque côté
      height += 20;
      borderRadius = '3rem'; // rounded-[3rem]
      borderWidth = '10px';
      break;
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: borderRadius,
    borderWidth: borderWidth,
    borderColor: '#4b5563', // gray-700
  };
});

const iframeWrapperStyle = computed(() => {
  let padding = '0px';
  switch (viewMode.value) {
    case 'tablet':
      padding = '16px';
      break;
    case 'mobile':
      padding = '10px';
      break;
  }
  return {
    width: '100%',
    height: '100%',
    padding: padding,
    boxSizing: 'border-box',
  };
});

// Methodes
const loadUrl = () => {
  if (url.value) {
    loading.value = true;
    iframeSrc.value = url.value;
  }
};

const handleIframeLoad = () => {
  loading.value = false;
  showFloatingNotification('Page chargée avec succès !', 'success');
};

const captureAndDownload = async () => {
  if (!previewContainerRef.value) {
    showFloatingNotification('Impossible de capturer l\'aperçu.', 'error');
    return;
  }
  loading.value = true;
  try {
    const canvas = await html2canvas(previewContainerRef.value, {
      useCORS: true,
      allowTaint: true,
      logging: true,
      scale: 2,
    });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `page-preview-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFloatingNotification('Capture d\'écran téléchargée !', 'success');
  } catch (error) {
    console.error('Error capturing and downloading:', error);
    showFloatingNotification('Échec du téléchargement de la capture d\'écran. Assurez-vous que la page autorise l\'intégration (CORS) ou qu\'elle est sur le même domaine.', 'error');
  } finally {
    loading.value = false;
  }
};

const captureAndCopyToClipboard = async () => {
  if (!previewContainerRef.value) {
    showFloatingNotification('Impossible de capturer l\'aperçu.', 'error');
    return;
  }
  loading.value = true;
  try {
    const canvas = await html2canvas(previewContainerRef.value, {
      useCORS: true,
      allowTaint: true,
      logging: true,
      scale: 2,
    });
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showFloatingNotification('Capture d\'écran copiée dans le presse-papiers !', 'success');
    } else {
      throw new Error('Failed to create blob from canvas.');
    }
  } catch (error) {
    console.error('Error capturing and copying:', error);
    showFloatingNotification('Échec de la copie de la capture d\'écran. Assurez-vous que la page autorise l\'intégration (CORS) et que votre navigateur supporte la copie d\'images.', 'error');
  } finally {
    loading.value = false;
  }
};

// Notification methods
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

// Watchers
watch(viewMode, (newMode) => {
  if (newMode !== 'custom') {
    customWidth.value = 1024;
    customHeight.value = 768;
  }
});
</script>

<style scoped>
/* Cadre de l'appareil */
.device-frame {
  box-sizing: content-box;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
