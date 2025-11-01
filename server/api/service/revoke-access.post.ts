export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.pgsBaseAPI;
  const body = await readBody(event);
  
  // Validation des données
  if (!body.userId || !body.serviceId) {
    throw createError({
      statusCode: 400,
      message: 'userId et serviceId sont requis'
    });
  }
  
  try {
    const response = await $fetch(`${apiUrl}/user/service/revoke-access`, {
      method: 'POST',
      headers: {
        'x-api-key': config.serviceApiKey,
      },
      body: {
        userId: body.userId,
        serviceId: body.serviceId
      },
      credentials: 'include',
    });
    
    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Erreur lors de la révocation de l\'accès'
    });
  }
});
