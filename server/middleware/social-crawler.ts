import { defineEventHandler, getRequestHeader, setResponseStatus, setResponseHeader } from 'h3';

interface ShortLinkResponse {
  success: boolean;
  message: string;
  link: {
    id: string;
    longUrl: string;
    shortCode: string;
    shortLink: string;
    clicks: number;
    createdAt: number;
    updatedAt: number;
    disabled?: boolean;
    activateAt?: string;
    expiresAt?: string;
    metadata?: {
      url: string;
      title?: string;
      description?: string;
      image?: string;
      favicon?: string;
      keywords?: string;
      language?: string;
      author?: string;
      source?: string;
      siteName?: string;
      ogType?: string;
      twitterCard?: string;
      lastUpdated?: number;
    };
  };
}

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || '';
  const userAgent = getRequestHeader(event, 'user-agent') || '';

  // Liste des bots de reseaux sociaux
  const socialBots = [
    'facebookexternalhit', 'facebookcatalog', 'Facebot',
    'Twitterbot', 'twitterbot', 'LinkedInBot', 'linkedin',
    'WhatsApp', 'WhatsApp/', 'TelegramBot', 'Telegram',
    'Discordbot', 'Discord', 'Slackbot', 'Slack',
    'SkypeUriPreview', 'Skype', 'Pinterest', 'Pinterestbot',
    'reddit', 'redditbot', 'tumblr', 'Applebot',
    'FlipboardProxy', 'Mastodon'
  ];

  const isSocialBot = socialBots.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  // Verifier si l'URL correspond a un shortCode (format: /:shortCode)
  const shortCodeMatch = url.match(/^\/([a-zA-Z0-9_-]+)$/);

  if (isSocialBot && shortCodeMatch) {
    const shortCode = shortCodeMatch[1];
    const config = useRuntimeConfig();

    try {
      // Faire une requete au backend pour recuperer les metadonnees
      const apiUrl = `${config.public.pgsBaseAPI}/eqt/shortlinks/${shortCode}`;
      const response = await $fetch<ShortLinkResponse>(apiUrl);

      if (response && response.link && response.link.metadata) {
        const metadata = response.link.metadata;
        const longUrl = response.link.longUrl;

        // Construire une page HTML avec les meta tags appropriees
        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Meta tags de base -->
  <title>${metadata.title || 'EasyQuickTrack - Redirection'}</title>
  <meta name="description" content="${metadata.description || 'Redirection vers le contenu demande'}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${metadata.ogType || 'website'}">
  <meta property="og:url" content="${longUrl}">
  <meta property="og:title" content="${metadata.title || 'EasyQuickTrack'}">
  <meta property="og:description" content="${metadata.description || 'Redirection vers le contenu demande'}">
  ${metadata.image ? `<meta property="og:image" content="${metadata.image}">` : ''}
  ${metadata.siteName ? `<meta property="og:site_name" content="${metadata.siteName}">` : ''}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${metadata.twitterCard || 'summary_large_image'}">
  <meta name="twitter:url" content="${longUrl}">
  <meta name="twitter:title" content="${metadata.title || 'EasyQuickTrack'}">
  <meta name="twitter:description" content="${metadata.description || 'Redirection vers le contenu demande'}">
  ${metadata.image ? `<meta name="twitter:image" content="${metadata.image}">` : ''}
  
  <!-- Redirection immediate -->
  <meta http-equiv="refresh" content="0; url=${longUrl}">
  
  ${metadata.favicon ? `<link rel="icon" type="image/x-icon" href="${metadata.favicon}">` : ''}
</head>
<body>
  <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 100px auto; text-align: center; padding: 20px;">
    ${metadata.image ? `<img src="${metadata.image}" alt="Preview" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">` : ''}
    <h1 style="color: #1f2937; margin-bottom: 16px;">${metadata.title || 'Redirection en cours...'}</h1>
    <p style="color: #6b7280; margin-bottom: 24px;">${metadata.description || 'Vous allez etre redirige vers le contenu demande.'}</p>
    <p style="color: #9ca3af; font-size: 14px;">Si vous n'etes pas redirige automatiquement, <a href="${longUrl}" style="color: #3b82f6; text-decoration: none;">cliquez ici</a>.</p>
  </div>
</body>
</html>`;

        setResponseStatus(event, 200);
        setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8');
        return html;
      }
    } catch (error) {
      console.error('Error fetching metadata for social bot:', error);
      // Laisser passer la requete normale en cas d'erreur
    }
  }
});
