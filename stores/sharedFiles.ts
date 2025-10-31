import { defineStore } from 'pinia';

type FooterData = {
  brand: string;
  brandUrl: string
}

type CustomData = {
  eqt: { url: string }
}

export const useSharedFiles = defineStore('sharedFiles', () => {
  const config = useRuntimeConfig();

  const SHARED_URL = config.public.pgsSharedFiles;
  const GNR_IMG = `${SHARED_URL}/_General/Images`;
  const GNR_DOC = `${SHARED_URL}/_General/Docs`;
  const APP_IMG = `${SHARED_URL}/EQT`;

  // Chemins des fichiers
  const paths = {
    // IMAGES
    logo: {
      dc: `${GNR_IMG}/Logos/EQT-DC.png`,
      dw: `${GNR_IMG}/Logos/EQT-DW.png`,
      mc: `${GNR_IMG}/Logos/EQT-MC.png`,
      mw: `${GNR_IMG}/Logos/EQT-MW.png`,
      pgs: `${GNR_IMG}/Logos/PGS-MC.png`,
    },
    general: {
      error403: `${GNR_IMG}/Error/403.png`,
      error404: `${GNR_IMG}/Error/404.png`,
      error500: `${GNR_IMG}/Error/500.png`,
      indexHero: `${APP_IMG}/indexHero.png`
    },

    //JSON
    data: {
      footer: `${GNR_DOC}/JSON/pgs.json`,
      custom: `${GNR_DOC}/JSON/custom.json`
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
      return customData.eqt.url;
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
