export default defineNuxtRouteMiddleware(async (to, from) => {
  // Vérifier si la route commence par /db
  if (to.path.startsWith('/db')) {
    console.log('🔒 Middleware dashboard global déclenché pour:', to.path);

    const authStore = useAuthStore();

    // Initialiser l'authentification si ce n'est pas déjà fait
    if (process.client && !authStore.sessionChecked) {
      console.log('🔄 Initialisation de l\'auth...');
      await authStore.initAuth();
    }

    // Vérifier si l'utilisateur est connecté
    if (!authStore.isLoggedIn) {
      console.log('❌ Utilisateur non connecté, redirection vers la page d\acceuil');
      return navigateTo('/');
    }

    console.log('✅ Utilisateur connecté, accès autorisé au dashboard');
  }
});
