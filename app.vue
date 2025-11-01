<template>
  <div class="min-h-screen bg-gray-50 font-body">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useUserProfileStore } from '~/stores/userProfile';

const authStore = useAuthStore();
const profileStore = useUserProfileStore();

const runtimeConfig = useRuntimeConfig();
const sharedFilesUrl = runtimeConfig.public.pgsSharedFiles;

const heroImagePath = `${sharedFilesUrl}/EQT/metaImg.png`;
const baseUrl = "https://eqt.netlify.app";

onMounted(() => {
  authStore.initAuth();

  if (authStore.isLoggedIn) {
    profileStore.initProfile();
  }
});

useHead({
  titleTemplate: '%s | EASY QUICK TRACK',
  meta: [
    {
      key: 'description',
      name: 'description',
      content: 'Raccourcisseur de liens moderne.'
    },

    // Open Graph (Facebook, LinkedIn)
    { property: 'og:title', content: 'EasyQuickTrack - Raccourcisseur d\'URL intelligent' },
    { property: 'og:description', content: 'Votre solution complète pour le web. Raccourcissez vos URLs, générez des QR codes, analysez les métadonnées de pages, sitemaps, robots.txt et plus encore pour booster votre SEO.' },
    { property: 'og:image', content: heroImagePath },
    { property: 'og:url', content: baseUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'fr_FR' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'EasyQuickTrack - Raccourcisseur d\'URL intelligent' },
    { name: 'twitter:description', content: 'Votre solution complète pour le web. Raccourcissez vos URLs, générez des QR codes, analysez les métadonnées de pages, sitemaps, robots.txt et plus encore pour booster votre SEO.' },
    { name: 'twitter:image', content: heroImagePath },
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.ico' },
    { rel: 'canonical', href: baseUrl }
  ]
});
</script>
