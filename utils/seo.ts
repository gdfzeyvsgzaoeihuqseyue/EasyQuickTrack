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

export type SeoData = Record<'index' | '403' | 'dashboard', SeoMeta>

export const useSeo = () => {
  const sharedFiles = useSharedFiles()
  const runtimeConfig = useRuntimeConfig()
  const SHARED_URL = runtimeConfig.public.pgsSharedFiles

  const { data: allSeoData, pending, error } = useAsyncData<SeoData>(
    'seoData',
    async () => {
      const baseUrl = await sharedFiles.getBaseUrl()

      return {
        index: {
          title: 'EasyQuickTrack',
          ogImage: `${SHARED_URL}/SuitOps_Landing/Hero/index.png`,
          url: baseUrl,
          keywords: 'url, racourcie, diminuteur, Bénin, PGS, Pro Gestion Soft',
          robots: 'index, follow',
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
    }
  )

  return { allSeoData, pending, error }
}
