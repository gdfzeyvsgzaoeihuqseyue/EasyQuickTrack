import { useSeo } from '~/utils/seo'
import type { SeoData } from '~/utils/seo'
import { useSeoMeta } from '#app'
import { watchEffect } from 'vue'

export function usePageSeo(page: keyof SeoData) {
  const { allSeoData } = useSeo()

  watchEffect(() => {
    if (allSeoData.value) {
      const meta = allSeoData.value[page]

      useSeoMeta({
        title: meta.title,
        description: meta.description,
        ogImage: meta.ogImage,
        keywords: meta.keywords,
        robots: meta.robots,
      })
    }
  })
}
