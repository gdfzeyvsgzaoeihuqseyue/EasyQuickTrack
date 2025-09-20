import { computed, onMounted } from 'vue'; 
import { useSocialLinksStore } from '@/stores/socialLinks'; 

interface UseSocialLinksDisplayOptions {
  filterMedia?: string[]; // Tableau optionnel de noms de médias à inclure (ex: ['facebook', 'linkedin'])
}


interface DisplayedSocialLink {
  name: string;
  href: string;
  icon: any;
  title: string;
}


export function useSocialLinksDisplay(options: UseSocialLinksDisplayOptions = {}) {
  const socialLinksStore = useSocialLinksStore();

  onMounted(() => {
    if (socialLinksStore.links.length === 0 && !socialLinksStore.loading) {
      socialLinksStore.fetchLinks();
    }
  });

  const displayedLinks = computed<DisplayedSocialLink[]>(() => {
   
    const linksToFormat = socialLinksStore.filteredLinks(options.filterMedia ?? null);

    if (!linksToFormat) {
      return [];
    }

    return linksToFormat.map((link: { name: string; href: string; icon: any }) => {
      const formattedName = link.name
        ? link.name.charAt(0).toUpperCase() + link.name.slice(1).toLowerCase()
        : ''; 

      return {
        ...link, 
        title: formattedName, 
      };
    });
  });

  return {
    displayedLinks,
    loading: socialLinksStore.loading, 
    error: socialLinksStore.error,  
  };
}
