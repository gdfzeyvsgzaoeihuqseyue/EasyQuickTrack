export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  // Initialiser l'authentification si ce n'est pas déjà fait
  if (process.client && !authStore.sessionChecked) {
    await authStore.initAuth();
  }

  // Si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    // Vérifier si l'utilisateur est connecté
    if (!authStore.isLoggedIn) {
      const { getSSOUrl } = useSSO();
      const url = useRequestURL();
      const returnUrl = url.origin + to.fullPath;
      return navigateTo(getSSOUrl('login', returnUrl), { external: true });
    }

    // Vérifier l'accès au service pour les routes du dashboard
    if (to.path.startsWith('/db')) {
      // Logic removed as it is handled by SSO and dashboard middleware
    }
  }
});
