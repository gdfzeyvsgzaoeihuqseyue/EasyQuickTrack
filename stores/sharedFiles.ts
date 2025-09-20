import { defineStore } from 'pinia';

type FooterData = { 
  brand: string; 
  brandUrl: string 
}

type CustomData = {
  sl: { url: string }
}

export const useSharedFiles = defineStore('sharedFiles', () => {
  const runtimeConfig = useRuntimeConfig();
  const SHARED_URL = runtimeConfig.public.pgsSharedFiles;

  // Chemins des fichiers
  const paths = {
    // IMAGES
    logo: {
      dc: `${SHARED_URL}/Logos/EQT-DC.png`,
      dw: `${SHARED_URL}/Logos/EQT-DW.png`,
      mc: `${SHARED_URL}/Logos/EQT-MC.png`,
      mw: `${SHARED_URL}/Logos/EQT-MW.png`,
      pgs: `${SHARED_URL}/Logos/PGS-MC.png`,
    },
    general: {
      error403: `${SHARED_URL}/General/Error403.png`,
      error404: `${SHARED_URL}/General/Error404.png`,
      error500: `${SHARED_URL}/General/Error500.png`,
    },

    //JSON
    data: {
      footer: `${SHARED_URL}/JSON/pgs.json`,
      custom: `${SHARED_URL}/JSON/custom.json`
    }
  };

  // Getter pour les données JSON
  async function getFooterData() {
    try {
      return await $fetch<FooterData>(paths.data.footer);
    } catch (err) {
      console.error('Erreur lors du chargement des données footer:', err);
      return {
        brand: 'PGS SARL',
        brandUrl: '#'
      };
    }
  }

  async function getBaseUrl() {
    try {
      const customData = await $fetch<CustomData>(paths.data.custom);
      return customData.sl.url;
    } catch (err) {
      console.error('Erreur lors du chargement des données custom:', err);
      return '#'; 
    }
  }

  return {
    paths,
    getFooterData,
    getBaseUrl
  };
});