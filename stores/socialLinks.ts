import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
import type { SocialLinkApi, SocialLink } from '@/types';
import {
  IconBrandLinkedin, IconBrandFacebook, IconBrandYoutube,
  IconBrandGithub, IconBrandTiktok, IconBrandInstagram, IconBrandX, IconBrandGoogle, IconBrandTelegram, IconBrandDiscord
} from '@tabler/icons-vue';


// Mappage des noms de médias 
const iconMap: Record<string, any> = {
  'linkedin': IconBrandLinkedin,
  'facebook': IconBrandFacebook,
  'youtube': IconBrandYoutube,
  'github': IconBrandGithub,
  'tiktok': IconBrandTiktok,
  'instagram': IconBrandInstagram,
  'x': IconBrandX,
  'google': IconBrandGoogle,
  'telegram': IconBrandTelegram,
  'discord': IconBrandDiscord,
};

export const useSocialLinksStore = defineStore('socialLinks', () => {
  const config = useRuntimeConfig();

  // État
  const links = ref<SocialLink[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchLinks = async () => {
    if (links.value.length > 0 || loading.value) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        message: string;
        nb: number;
        socialLinks: SocialLinkApi[];
      }>(`${config.public.pgsBaseAPI}/pgs-social-link`);

      const formattedLinks: SocialLink[] = response.socialLinks.map(item => ({
        name: item.media,
        href: item.link,
        icon: iconMap[item.media.toLowerCase().trim()] || null
      }));

      links.value = formattedLinks;
    } catch (e: any) {
      error.value = e.message || 'Une erreur est survenue lors de la récupération des liens sociaux.';
      console.error('Erreur de récupération des liens sociaux:', e);
    } finally {
      loading.value = false;
    }
  };

  // Getters
  const allLinks = computed(() => links.value);

  const filteredLinks = (mediaFilter: string[] | null) => {
    if (!links.value.length) {
      return [];
    }

    if (!mediaFilter || mediaFilter.length === 0) {
      return links.value;
    }

    const normalizedFilter = mediaFilter.map(name => name.toLowerCase().trim());

    return links.value.filter(item =>
      normalizedFilter.includes(item.name.toLowerCase().trim())
    );
  };

  return {
    links: readonly(links),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    fetchLinks,

    // Getters/Fonctions
    allLinks,
    filteredLinks
  };
});
