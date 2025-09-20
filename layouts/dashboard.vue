<template>
  <div class="min-h-screen bg-gray-50 flex">
    <div v-if="sidebarOpen && isMobile" @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"></div>

    <div :class="[
      'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out bg-white shadow-lg lg:translate-x-0',
      'h-screen overflow-y-auto',
      sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
      sidebarCollapsed && !isMobile ? 'lg:w-16' : 'lg:w-64'
    ]">
      <div class="flex flex-col h-full">
        <div class="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div v-if="!sidebarCollapsed || isMobile" class="flex items-center">
            <NuxtLink to="/"
              class="flex items-center gap-2 hover:scale-105 overflow-hidden transition-all duration-300">
              <div class="hidden lg:block">
                <img :src="sharedFiles.paths.logo.dc" alt="Logo" class="h-8 w-auto sm:h-10 dark:hidden" />
                <img :src="sharedFiles.paths.logo.dw" alt="Logo" class="h-8 w-auto sm:h-10 hidden dark:block" />
              </div>
              <div class="lg:hidden flex-shrink-0 mr-3">
                <img :src="sharedFiles.paths.logo.mc" alt="Logo" class="h-8 w-auto sm:h-10 dark:hidden" />
                <img :src="sharedFiles.paths.logo.mw" alt="Logo" class="h-8 w-auto sm:h-10 hidden dark:block" />
              </div>
            </NuxtLink>
          </div>
          <div v-else class="flex justify-center w-full">
            <div class="flex-shrink-0">
              <img :src="sharedFiles.paths.logo.mc" alt="Logo" class="h-8 w-auto sm:h-10 dark:hidden" />
              <img :src="sharedFiles.paths.logo.mw" alt="Logo" class="h-8 w-auto sm:h-10 hidden dark:block" />
            </div>
          </div>

          <button v-if="isMobile" @click="sidebarOpen = false"
            class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <IconX class="w-5 h-5" />
          </button>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
          <NuxtLink to="/db" :class="[
            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            $route.path === '/db'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]">
            <IconDeviceDesktop class="w-5 h-5 mr-3 flex-shrink-0" />
            <span v-if="!sidebarCollapsed || isMobile">Dashboard</span>
          </NuxtLink>

          <NuxtLink to="/db/links" :class="[
            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            $route.path.startsWith('/db/links')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]">
            <IconLink class="w-5 h-5 mr-3 flex-shrink-0" />
            <span v-if="!sidebarCollapsed || isMobile">Mes liens</span>
          </NuxtLink>

          <NuxtLink to="/db/qrcode" :class="[
            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            $route.path.startsWith('/db/qrcode')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]">
            <IconQrcode class="w-5 h-5 mr-3 flex-shrink-0" />
            <span v-if="!sidebarCollapsed || isMobile">QR Code</span>
          </NuxtLink>

          <NuxtLink to="/db/sitemap" :class="[
            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            $route.path === '/db/sitemap'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]">
            <IconSitemap class="w-5 h-5 mr-3 flex-shrink-0" />
            <span v-if="!sidebarCollapsed || isMobile">Sitemap</span>
          </NuxtLink>

          <NuxtLink to="/db/robotstxt" :class="[
            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            $route.path === '/db/robotstxt'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]">
            <IconRobot class="w-5 h-5 mr-3 flex-shrink-0" />
            <span v-if="!sidebarCollapsed || isMobile">Robots.txt</span>
          </NuxtLink>

          <NuxtLink to="/db/analytics" :class="[
            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            $route.path === '/db/analytics'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]">
            <IconChartHistogram class="w-5 h-5 mr-3 flex-shrink-0" />
            <span v-if="!sidebarCollapsed || isMobile">Analytics</span>
          </NuxtLink>

          <NuxtLink to="/db/more" :class="[
            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            $route.path === '/db/more'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]">
            <IconFilterStar class="w-5 h-5 mr-3 flex-shrink-0" />
            <span v-if="!sidebarCollapsed || isMobile">Analyse avancés</span>
          </NuxtLink>

          <div class="border-t border-gray-200 my-4"></div>

          <!-- Menu de profil déroulant -->
          <div class="relative">
            <button @click="toggleProfileMenu" :class="[
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left',
              profileMenuExpanded ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            ]">
              <IconUserCircle class="w-5 h-5 mr-3 flex-shrink-0" />
              <span v-if="!sidebarCollapsed || isMobile">Mon profil</span>
              <IconChevronDown v-if="!sidebarCollapsed || isMobile"
                :class="['w-4 h-4 ml-auto transition-transform', profileMenuExpanded ? 'rotate-180' : '']" />
            </button>
            <div v-if="profileMenuExpanded" :class="[
              'absolute bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50',
              // Positionnement pour la barre latérale réduite (desktop)
              sidebarCollapsed && !isMobile ? 'left-full top-0 ml-2 w-48' : 'pl-6 mt-1 w-full'
            ]">
              <NuxtLink to="/db/settings" @click="closeSidebarAndProfileMenu"
                class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                <IconSettings class="w-5 h-5 mr-3 flex-shrink-0" />
                Paramètres
              </NuxtLink>
              <button @click="handleLogout"
                class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full text-left">
                <IconLogout class="w-5 h-5 mr-3 flex-shrink-0" />
                Déconnexion
              </button>
            </div>
          </div>
        </nav>

        <div class="border-t border-gray-200 p-4 mt-auto">
          <button v-if="!isMobile" @click="sidebarCollapsed = !sidebarCollapsed"
            class="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <IconChevronsLeft :class="['w-5 h-5 transition-transform', sidebarCollapsed ? 'rotate-180' : '']" />
            <span v-if="!sidebarCollapsed" class="ml-2">Réduire</span>
          </button>

          <NuxtLink to="/" :class="[
            'flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors',
            isMobile || !sidebarCollapsed ? 'justify-start' : 'justify-center'
          ]">
            <IconArrowLeft class="w-5 h-5 mr-3 flex-shrink-0" />
            <span v-if="!sidebarCollapsed || isMobile">Retour au site</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div :class="[
      'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
    ]">
      <div class="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div class="flex items-center justify-between h-16 px-4">
          <button @click="sidebarOpen = true"
            class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <IconMenuDeep class="w-6 h-6" />
          </button>

          <div class="text-lg font-semibold text-gray-900">
            {{ pageTitle }}
          </div>

          <div class="w-10"></div>
        </div>
      </div>

      <!-- Notifications -->
      <SiteNotificationManager />

      <main class="flex-1 overflow-auto">
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth';
import {
  IconArrowLeft, IconChartHistogram, IconChevronsLeft, IconDeviceDesktop,
  IconLink, IconMenuDeep, IconQrcode, IconSitemap, IconRobot, IconSettings, IconX,
  IconUserCircle, IconChevronDown, IconLogout, IconFilterStar
} from '@tabler/icons-vue'
import { useSharedFiles } from '~/stores/sharedFiles';

const sharedFiles = useSharedFiles();
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore();

// État du sidebar
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const isMobile = ref(false)
const profileMenuExpanded = ref(false);

// Titre de la page basé sur la route
const pageTitle = computed(() => {
  const path = route.path
  if (path === '/db') return 'Dashboard'
  if (path.startsWith('/db/links')) return 'Mes liens'
  if (path.startsWith('/db/qrcode')) return 'QR Code'
  if (path === '/db/analytics') return 'Analytics'
  if (path === '/db/sitemap') return 'Sitemap'
  if (path === '/db/robotstxt') return 'Robots.txt'
  if (path === '/db/more') return 'Analyse avancés'
  if (path === '/db/settings') return 'Paramètres'
  return 'Dashboard'
})

// Détection de la taille d'écran
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

// Fermer le sidebar mobile lors du changement de route
watch(() => route.path, () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
  profileMenuExpanded.value = false; // Fermer le menu de profil à chaque changement de route
})

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)

  // Récupérer l'état du sidebar depuis le localStorage
  const savedCollapsed = localStorage.getItem('sidebarCollapsed')
  if (savedCollapsed !== null) {
    sidebarCollapsed.value = JSON.parse(savedCollapsed)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Sauvegarder l'état du sidebar
watch(sidebarCollapsed, (newValue) => {
  localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue))
})

// Logique du menu de profil
const toggleProfileMenu = () => {
  profileMenuExpanded.value = !profileMenuExpanded.value;
};

const closeSidebarAndProfileMenu = () => {
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
  profileMenuExpanded.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
  closeSidebarAndProfileMenu();
};
</script>
