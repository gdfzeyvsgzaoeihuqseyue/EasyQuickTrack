import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Initialiser l'authentification au démarrage
  if (process.client) {
    authStore.initAuth();
  }

  // Liste des routes protégées
  const protectedRoutes = ['/db'];
  const publicRoutes = ['/auth'];

  // Vérifier si la route actuelle est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => to.path === route);

  // Si l'utilisateur n'est pas connecté
  if (!authStore.isLoggedIn && isProtectedRoute) {
    return navigateTo('/auth/login');
  }

  // Si l'utilisateur est connecté
  if (authStore.isLoggedIn && isPublicRoute) {
    return navigateTo('/db');
  }
});
