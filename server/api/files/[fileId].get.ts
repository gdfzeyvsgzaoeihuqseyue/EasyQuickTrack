import { H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const fileId = getRouterParam(event, 'fileId');

  if (!fileId) {
    throw createError({
      statusCode: 400,
      message: 'File ID manquant',
    });
  }

  if (!config.mistralApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Clé API Mistral non configurée',
    });
  }

  try {
    console.log('🖼️ [Mistral Image Proxy] Récupération de l\'image:', fileId);

    // Récupérer l'image depuis l'API Mistral
    const imageResponse = await $fetch<ArrayBuffer>(
      `https://api.mistral.ai/v1/files/${fileId}/content`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.mistralApiKey}`,
        },
        responseType: 'arrayBuffer',
      }
    );

    // Convertir en Buffer pour Nuxt
    const buffer = Buffer.from(imageResponse);

    // Définir les headers appropriés
    setHeader(event, 'Content-Type', 'image/png');
    setHeader(event, 'Cache-Control', 'public, max-age=31536000');

    console.log('✅ [Mistral Image Proxy] Image servie avec succès');

    return buffer;
  } catch (error: any) {
    console.error('❌ [Mistral Image Proxy] Erreur:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: 'Erreur lors de la récupération de l\'image',
    });
  }
});
