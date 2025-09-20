<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 hover:scale-105 overflow-hidden transition-all duration-300">
          <div class="hidden lg:block">
            <img :src="sharedFiles.paths.logo.dc" alt="Logo" class="h-8 w-auto sm:h-10 dark:hidden" />
            <img :src="sharedFiles.paths.logo.dw" alt="Logo" class="h-8 w-auto sm:h-10 hidden dark:block" />
          </div>
          <div class="lg:hidden flex-shrink-0 mr-3">
            <img :src="sharedFiles.paths.logo.mc" alt="Logo" class="h-8 w-auto sm:h-10 dark:hidden" />
            <img :src="sharedFiles.paths.logo.mw" alt="Logo" class="h-8 w-auto sm:h-10 hidden dark:block" />
          </div>
        </NuxtLink>

        <!-- Desktop menu -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <template v-for="item in computedNavItems" :key="item.to">
              <NuxtLink v-if="!item.isButton && !item.isDropdown" :to="item.to" :class="[
                'text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
              ]">
                {{ item.label }}
              </NuxtLink>
              <NuxtLink v-else-if="item.isButton && !item.isDropdown" :to="item.to" :class="[
                'btn-primary'
              ]">
                {{ item.label }}
              </NuxtLink>
              <div v-else-if="item.isDropdown" class="relative">
                <button @click="toggleProfileMenu"
                  class="btn-primary flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <IconUserCircle class="w-5 h-5 mr-2" />
                  Mon profil
                  <IconChevronDown class="w-4 h-4 ml-2 transition-transform"
                    :class="{ 'rotate-180': profileMenuOpen }" />
                </button>
                <div v-if="profileMenuOpen" ref="profileMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <NuxtLink to="/db" @click="closeProfileMenu"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <IconDeviceDesktop class="inline-block w-4 h-4 mr-2" /> Dashboard
                  </NuxtLink>
                  <NuxtLink to="/db/links" @click="closeProfileMenu"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <IconLink class="inline-block w-4 h-4 mr-2" /> Mes liens
                  </NuxtLink>
                  <NuxtLink to="/db/qrcode" @click="closeProfileMenu"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <IconQrcode class="inline-block w-4 h-4 mr-2" /> QR Code
                  </NuxtLink>
                  <NuxtLink to="/db/analytics" @click="closeProfileMenu"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <IconChartHistogram class="inline-block w-4 h-4 mr-2" /> Analytics
                  </NuxtLink>
                  <div class="border-t border-gray-100 my-1"></div>
                  <button @click="handleLogoutAndCloseMenu"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <IconLogout class="inline-block w-4 h-4 mr-2" /> Déconnexion
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Mobile button -->
        <div class="md:hidden">
          <button @click="toggleMobileMenu" class="text-gray-700 hover:text-primary-600">
            <IconMenu2 class="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile menu -->
    <div v-show="mobileMenuOpen" ref="mobileMenu" class="md:hidden bg-white border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <template v-for="item in computedNavItems" :key="item.to + '-mobile'">
          <NuxtLink v-if="!item.isDropdown" :to="item.to" @click="closeMobileMenu" :class="[
            item.isButton
              ? 'block px-3 py-2 text-primary-600 font-medium'
              : 'block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium'
          ]">
            {{ item.label }}
          </NuxtLink>
          <div v-else-if="item.isDropdown" class="py-2">
            <button @click="toggleProfileMenu"
              class="block w-full text-left px-3 py-2 text-primary-600 font-medium flex items-center">
              <IconUserCircle class="w-5 h-5 mr-2" />
              Mon profil
              <IconChevronDown class="w-4 h-4 ml-2 transition-transform" :class="{ 'rotate-180': profileMenuOpen }" />
            </button>
            <div v-if="profileMenuOpen" class="pl-6 pr-3 py-1 space-y-1">
              <NuxtLink to="/db" @click="closeMobileMenuAndProfileMenu"
                class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <IconDeviceDesktop class="inline-block w-4 h-4 mr-2" /> Dashboard
              </NuxtLink>
              <NuxtLink to="/db/links" @click="closeMobileMenuAndProfileMenu"
                class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <IconLink class="inline-block w-4 h-4 mr-2" /> Mes liens
              </NuxtLink>
              <NuxtLink to="/db/qrcode" @click="closeMobileMenuAndProfileMenu"
                class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <IconQrcode class="inline-block w-4 h-4 mr-2" /> QR Code
              </NuxtLink>
              <NuxtLink to="/db/analytics" @click="closeMobileMenuAndProfileMenu"
                class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <IconChartHistogram class="inline-block w-4 h-4 mr-2" /> Analytics
              </NuxtLink>
              <div class="border-t border-gray-100 my-1"></div>
              <button @click="handleLogoutAndCloseMenu"
                class="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                <IconLogout class="inline-block w-4 h-4 mr-2" /> Déconnexion
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import {
  IconMenu2, IconUserCircle, IconChevronDown, IconDeviceDesktop,
  IconLink, IconQrcode, IconChartHistogram, IconLogout
} from '@tabler/icons-vue'
import { useSharedFiles } from '~/stores/sharedFiles';

const sharedFiles = useSharedFiles();
const authStore = useAuthStore();
const router = useRouter();

const mobileMenuOpen = ref(false);
const profileMenuOpen = ref(false);

const profileMenu = ref(null); 
const mobileMenu = ref(null); 

const computedNavItems = computed(() => {
  if (authStore.isLoggedIn) {
    return [
      { label: 'Tarifs', to: '/pricing' },
      { label: 'À propos', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Mon profil', to: '#', isDropdown: true }
    ];
  } else {
    return [
      { label: 'Tarifs', to: '/pricing' },
      { label: 'À propos', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Se connecter', to: '/login', isButton: true }
    ];
  }
});

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    profileMenuOpen.value = false; 
  }
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value;
};

const closeProfileMenu = () => {
  profileMenuOpen.value = false;
};

const closeMobileMenuAndProfileMenu = () => {
  mobileMenuOpen.value = false;
  profileMenuOpen.value = false;
};

const handleLogoutAndCloseMenu = async () => {
  await authStore.logout();
  router.push('/login');
  closeMobileMenuAndProfileMenu();
};

const handleClickOutside = (event) => {
  if (profileMenu.value && !profileMenu.value.contains(event.target) && !event.target.closest('.btn-primary')) {
    profileMenuOpen.value = false;
  }
  if (mobileMenu.value && !mobileMenu.value.contains(event.target) && !event.target.closest('.md\\:hidden > button')) {
    mobileMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
