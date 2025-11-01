export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const userServiceStore = useUserServiceStore();
  const config = useRuntimeConfig();

  const SERVICE_DOMAIN = 'https://eqt.me';

  // Initialiser l'authentification si ce n'est pas déjà fait
  if (process.client && !authStore.sessionChecked) {
    await authStore.initAuth();
  }

  // Si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    // Vérifier si l'utilisateur est connecté
    if (!authStore.isLoggedIn) {
      return navigateTo('/auth/login');
    }

    // Vérifier l'accès au service pour les routes du dashboard
    if (to.path.startsWith('/db')) {
      try {
        const verifyResult = await userServiceStore.verifyServiceAccess(SERVICE_DOMAIN);

        if (!verifyResult.valid || !verifyResult.userAccess) {
          return navigateTo('/auth/grant-access');
        }

      } catch (error: any) {
        console.error('Erreur lors de la vérification de l\'accès:', error);

        // Si c'est une erreur 403 (service inactif), rediriger vers grant-access
        if (error.statusCode === 403) {
          return navigateTo('/auth/grant-access');
        }

        // Si c'est une erreur 401 (token invalide), tenter de rafraîchir
        if (error.statusCode === 401) {
          try {
            await authStore.refreshAccessToken();
            // Réessayer la vérification après rafraîchissement
            const retryResult = await userServiceStore.verifyServiceAccess(SERVICE_DOMAIN);

            if (!retryResult.valid || !retryResult.userAccess) {
              return navigateTo('/auth/grant-access');
            }
          } catch (refreshError) {
            await authStore.logout();
            return navigateTo('/auth/login');
          }
        }
      }
    }
  }
});
