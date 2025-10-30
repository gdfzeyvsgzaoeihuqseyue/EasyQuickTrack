import { defineEventHandler, getRequestHeader, setResponseStatus, setResponseHeader } from 'h3'
import type { ShortLinkResponse } from '@/types';

export default defineEventHandler(async (event) => {
  if (!process.server) return

  const url = event.node.req.url || ''
  const userAgent = getRequestHeader(event, 'user-agent') || ''

  // Liste de bots
  const socialBots = [
    'facebookexternalhit', 'facebookcatalog', 'Facebot',
    'Twitterbot', 'twitterbot', 'LinkedInBot', 'linkedin',
    'WhatsApp', 'TelegramBot', 'Discordbot', 'Slackbot',
    'SkypeUriPreview', 'Pinterest', 'redditbot', 'tumblr',
    'Applebot', 'FlipboardProxy', 'Mastodon'
  ]

  const isSocialBot = socialBots.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )

  // Vérifie si l’URL correspond à /:shortCode
  const shortCodeMatch = url.match(/^\/([a-zA-Z0-9_-]+)$/)

  // Si ce n’est pas un bot social ou pas un shortlink, on laisse passer
  if (!isSocialBot || !shortCodeMatch) return

  const shortCode = shortCodeMatch[1]
  const config = useRuntimeConfig()

  try {
    // Appel au backend
    const apiUrl = `${config.public.pgsBaseAPI}/eqt/shortlinks/${shortCode}`
    const response = await $fetch<ShortLinkResponse>(apiUrl)

    if (!response?.link?.metadata) return

    const metadata = response.link.metadata
    const longUrl = response.link.longUrl

    // Construction de la page HTML
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${metadata.title || 'EasyQuickTrack - Redirection'}</title>
  <meta name="description" content="${metadata.description || 'Redirection vers le contenu demandé'}">

  <!-- Open Graph -->
  <meta property="og:type" content="${metadata.ogType || 'website'}">
  <meta property="og:url" content="${longUrl}">
  <meta property="og:title" content="${metadata.title || 'EasyQuickTrack'}">
  <meta property="og:description" content="${metadata.description || 'Redirection vers le contenu demandé'}">
  ${metadata.image ? `<meta property="og:image" content="${metadata.image}">` : ''}
  ${metadata.siteName ? `<meta property="og:site_name" content="${metadata.siteName}">` : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="${metadata.twitterCard || 'summary_large_image'}">
  <meta name="twitter:url" content="${longUrl}">
  <meta name="twitter:title" content="${metadata.title || 'EasyQuickTrack'}">
  <meta name="twitter:description" content="${metadata.description || 'Redirection vers le contenu demandé'}">
  ${metadata.image ? `<meta name="twitter:image" content="${metadata.image}">` : ''}

  <meta http-equiv="refresh" content="0; url=${longUrl}">
  ${metadata.favicon ? `<link rel="icon" href="${metadata.favicon}" type="image/x-icon">` : ''}
</head>
<body>
  <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 100px auto; text-align: center; padding: 20px;">
    ${metadata.image ? `<img src="${metadata.image}" alt="Preview" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">` : ''}
    <h1 style="color: #1f2937; margin-bottom: 16px;">${metadata.title || 'Redirection en cours...'}</h1>
    <p style="color: #6b7280; margin-bottom: 24px;">${metadata.description || 'Vous allez être redirigé vers le contenu demandé.'}</p>
    <p style="color: #9ca3af; font-size: 14px;">Si vous n'êtes pas redirigé automatiquement, <a href="${longUrl}" style="color: #3b82f6;">cliquez ici</a>.</p>
  </div>
</body>
</html>
    `

    setResponseStatus(event, 200)
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return html
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées pour le bot social :', error)
    // En cas d’erreur, ne pas bloquer la requête normale
    return
  }
})
