import { useRuntimeConfig, useAsyncData } from '#app'
import { useSharedFiles } from '~/stores/sharedFiles'

export type SeoMeta = {
  title: string
  description?: string
  ogImage?: string
  url?: string
  keywords?: string
  robots?: string
}

export type SeoData = Record<'index' | 'guestLink' | '403' | '404' | 'dashboard', SeoMeta>

export const useSeo = () => {
  const sharedFiles = useSharedFiles()
  const runtimeConfig = useRuntimeConfig()
  const SHARED_URL = runtimeConfig.public.pgsSharedFiles || ''

  const { data: allSeoData, pending, error } = useAsyncData<SeoData>(
    'seoData',
    async () => {
      let baseUrl = 'https://eqt.netlify.app'

      try {
        const url = await sharedFiles.getBaseUrl()
        if (url && url !== '#') {
          baseUrl = url
        }
      } catch (err) {
        console.warn('Utilisation de baseUrl par défaut:', err)
      }

      return {
        index: {
          title: 'Easy Quick Track - Votre solution complète pour le web.',
          ogImage: SHARED_URL ? `${SHARED_URL}/SuitOps_Landing/Hero/index.png` : '/favicon.ico',
          url: baseUrl,
          keywords: 'url, racourcie, diminuteur, Bénin, PGS, Pro Gestion Soft',
          robots: 'index, follow',
        },
        guestLink: {
          title: 'Easy Quick Track - Votre solution complète pour le web.',
          ogImage: SHARED_URL ? `${SHARED_URL}/SuitOps_Landing/Hero/index.png` : '/favicon.ico',
          url: baseUrl,
          keywords: 'url, racourcie, diminuteur, Bénin, PGS, Pro Gestion Soft',
          robots: 'index, nofollow',
        },
        403: {
          title: 'Accès Interdit',
          description: "Vous n'avez pas l'autorisation d'accéder à cette page.",
          robots: 'noindex, nofollow',
        },
        404: {
          title: 'Page introuvable.',
          description: "Page introuvable.",
          robots: 'noindex, nofollow',
        },
        dashboard: {
          title: 'Tableau de bord',
          description: 'Gérez et analysez vos liens raccourcis.',
          robots: 'index, follow',
        },
      }
    },
    {
      lazy: false,
      server: true,
      // Valeur par défaut immédiate
      default: () => ({
        index: {
          title: 'Easy Quick Track',
          robots: 'index, follow',
        },
        guestLink: {
          title: 'Easy Quick Track',
          robots: 'index, nofollow',
        },
        403: {
          title: 'Accès Interdit',
          robots: 'noindex, nofollow',
        },
        404: {
          title: 'Page introuvable',
          robots: 'noindex, nofollow',
        },
        dashboard: {
          title: 'Tableau de bord',
          robots: 'index, follow',
        },
      })
    }
  )

  return { allSeoData, pending, error }
}
