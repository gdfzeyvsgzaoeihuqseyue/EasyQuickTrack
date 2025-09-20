// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    ['nuxt-gtag', {
      id: process.env.GTAG_ID || 'G-Q5D4X1QWPK',
      enabled: process.env.NODE_ENV === 'production'
    }],
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
  ],

  site: {
    url: 'https://eqt.netlify.app',
    name: 'Easy Quick Track',
  },

  sitemap: {
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Priority', select: 'sitemap:priority', width: '12.5%' },
      { label: 'Change Frequency', select: 'sitemap:changefreq', width: '12.5%' },
      { label: 'Hreflangs', select: 'count(xhtml:link)', width: '25%' },
    ],
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      pgsBaseAPI: process.env.PGS_API_URL,
      pgsSharedFiles: process.env.PGS_SHARED_FILES,
      betaMode: process.env.NUXT_BETA_MODE === 'true',
      siteIdentifier: process.env.NUXT_PUBLIC_SITE_IDENTIFIER || 'eqt',
    }
  },

  googleFonts: {
    display: 'swap',
    families: {
      'Inter': [400, 500, 600, 700],
      'Poppins': [600, 700],
      'Genos': [100, 200, 300, 400, 500, 600, 700, 800, 900],
      'Space+Mono': [400, 700],
    }
  },

  app: {
    head: {
      title: 'EasyQuickTrack - Votre solution complète pour le web. Raccourcissez vos URLs, générez des QR codes, analysez les métadonnées de pages, sitemaps, robots.txt et plus encore pour booster votre SEO.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'author', content: 'Pro Gestion Soft' },
        { name: 'keywords', content: 'url, racourcie, diminuteur, Bénin, PGS, Pro Gestion Soft' },
        {
          name: 'google-site-verification',
          content: 'OdKxHpVkBSxk0mj4vD4OTmZPdVi5pWzyCu4QPIMHy9A'
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://eqt.netlify.app' }
      ]
    }
  },
})
