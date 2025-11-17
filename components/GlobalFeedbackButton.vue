<template>
  <div class="relative">
    <button @click="showModal = !showModal"
      class="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
      :class="{ 'rotate-180': showModal }" aria-label="Ouvrir/fermer le menu d'aide et de feedback">
      <IconCircleChevronUp v-if="showModal" class="h-6 w-6" />
      <IconHelp v-else class="h-6 w-6" />
    </button>

    <Transition name="menu-slide-in">
      <div v-if="showModal" ref="menuRef"
        class="fixed bottom-[100px] right-6 w-80 bg-white rounded-xl shadow-2xl flex flex-col z-40 border border-gray-100">

        <div class="p-4 border-b">
          <h2 class="text-lg font-bold text-gray-800">Menu d'aide et de contact</h2>
        </div>

        <div class="p-4 space-y-3 overflow-y-auto max-h-[400px]">
          <!-- NOAH AI -->
          <button @click="openNoahAI"
            class="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <div class="flex items-center">
              <img :src="sharedFiles.paths.logo.noah" alt="NOAH AI" class="h-5 w-5 mr-3 flex-shrink-0" />
              <span>Discuter avec NOAH AI</span>
            </div>
            <IconSparkles class="h-4 w-4 text-gray-400" />
          </button>

          <!-- ChatGPT -->
          <a :href="chatgptUrl" target="_blank" rel="noopener noreferrer"
            class="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <div class="flex items-center">
              <IconBrandOpenai class="h-5 w-5 text-primary-600 mr-3" />
              <span>Demander à ChatGPT</span>
            </div>
            <IconExternalLink class="h-4 w-4 text-gray-400" />
          </a>

          <!-- Témoignage -->
          <a :href="testimonyUrl" target="_blank" rel="noopener noreferrer"
            class="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <div class="flex items-center">
              <IconStar class="h-5 w-5 text-primary-600 mr-3" />
              <span>Donner un avis / Témoignage</span>
            </div>
            <IconExternalLink class="h-4 w-4 text-gray-400" />
          </a>

          <!-- Documentation -->
          <a href="https://pgsdocs.netlify.app" target="_blank" rel="noopener noreferrer"
            class="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <div class="flex items-center">
              <IconBook class="h-5 w-5 text-primary-600 mr-3" />
              <span>Documentation</span>
            </div>
            <IconExternalLink class="h-4 w-4 text-gray-400" />
          </a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useChatbotStore } from '@/stores/NoahBot';
import { IconSparkles, IconBrandOpenai, IconHelp, IconCircleChevronUp, IconExternalLink, IconStar, IconBook } from '@tabler/icons-vue';
import { useSharedFiles } from '~/stores/sharedFiles';

const sharedFiles = useSharedFiles();
const showModal = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const chatbotStore = useChatbotStore();

// Fermeture au clic extérieur
const handleOutsideClick = (event: MouseEvent) => {
  if (showModal.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showModal.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
});

// URL ChatGPT
const chatgptUrl = computed(() => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pageTitle = typeof document !== 'undefined' ? document.title : '';

  const customText = `Peux-tu analyser et résumer le contenu de cette page web ? Voici les informations :
Titre de la page : ${pageTitle}
URL : ${currentUrl}

Merci de me donner un résumé clair et concis des informations principales présentées sur cette page.`;

  return `https://chatgpt.com/?q=${encodeURIComponent(customText)}`;
});

const openNoahAI = () => {
  showModal.value = false;
  chatbotStore.toggleChatbot();
};

// Avis
const testimonyUrl = computed(() => {
  const pgsUrl = "https://progestionsoft.netlify.app/submit-testimony";
  const params = new URLSearchParams({
    platform: 'easyquicktrack',
  });
  return `${pgsUrl}?${params.toString()}`;
});
</script>

<style scoped>
/* Transition pour l'ouverture du menu flottant (du bas vers le haut) */
.menu-slide-in-enter-active,
.menu-slide-in-leave-active {
  transition: all 0.3s ease-out;
}

.menu-slide-in-enter-from,
.menu-slide-in-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
