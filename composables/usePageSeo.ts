import { useSeo } from '~/utils/seo'
import type { SeoData } from '~/utils/seo'
import { useSeoMeta } from '#app'
import { watch } from 'vue'

export function usePageSeo(page: keyof SeoData) {
  const { allSeoData, pending } = useSeo()

  watch([allSeoData, pending], ([data, isLoading]) => {
    if (!isLoading && data) {
      const meta = data[page]
      
      if (meta) {
        useSeoMeta({
          title: meta.title,
          description: meta.description,
          ogImage: meta.ogImage,
          keywords: meta.keywords,
          robots: meta.robots,
        })
      }
    }
  }, { immediate: true })
}
