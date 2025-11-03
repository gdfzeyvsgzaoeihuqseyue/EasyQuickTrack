export default defineNuxtRouteMiddleware(async (to, from) => {
  // Vérifier si la route commence par /db
  if (to.path.startsWith('/db')) {
    console.log('🔒 Middleware dashboard global déclenché pour:', to.path);

    const authStore = useAuthStore();
    const userServiceStore = useUserServiceStore();

    const SERVICE_DOMAIN = 'https://eqt.me';

    // Initialiser l'authentification si ce n'est pas déjà fait
    if (process.client && !authStore.sessionChecked) {
      console.log('🔄 Initialisation de l\'auth...');
      await authStore.initAuth();
    }

    // Vérifier si l'utilisateur est connecté
    if (!authStore.isLoggedIn) {
      console.log('❌ Utilisateur non connecté, redirection vers /auth/login');
      return navigateTo('/auth/login');
    }

    console.log('✅ Utilisateur connecté, vérification de l\'accès service...');

    // Vérifier l'accès au service EQT
    try {
      const verifyResult = await userServiceStore.verifyServiceAccess(SERVICE_DOMAIN);

      if (!verifyResult.valid || !verifyResult.userAccess) {
        console.log('❌ Accès service non valide, redirection vers /auth/grant-access');
        return navigateTo('/auth/grant-access');
      }

      console.log('✅ Accès service validé');

    } catch (error: any) {
      console.error('🚨 Erreur lors de la vérification de l\'accès:', error);

      if (error.statusCode === 403) {
        console.log('🔒 Accès désactivé, redirection vers /auth/grant-access');
        return navigateTo('/auth/grant-access');
      }

      if (error.statusCode === 401) {
        console.log('🔄 Token invalide, tentative de rafraîchissement...');
        try {
          await authStore.refreshAccessToken();
          const retryResult = await userServiceStore.verifyServiceAccess(SERVICE_DOMAIN);

          if (!retryResult.valid || !retryResult.userAccess) {
            return navigateTo('/auth/grant-access');
          }
        } catch (refreshError) {
          console.log('❌ Échec rafraîchissement, déconnexion...');
          await authStore.logout();
          return navigateTo('/auth/login');
        }
      } else {
        console.log('🚨 Erreur inconnue, déconnexion...');
        await authStore.logout();
        return navigateTo('/auth/login');
      }
    }
  }
});
