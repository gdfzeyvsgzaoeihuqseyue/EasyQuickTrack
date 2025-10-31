import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Initialiser l'authentification au démarrage
  if (process.client) {
    authStore.initAuth();
  }

  // Liste des routes protégées
  const protectedRoutes = ['/db'];
  const authRoutes = ['/auth/login', '/auth/register'];

  // Vérifier si la route actuelle est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => to.path === route);

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
  if (!authStore.isLoggedIn && isProtectedRoute) {
    return navigateTo('/auth/login');
  }

  // Si l'utilisateur est connecté et tente d'accéder à une page de connexion
  if (authStore.isLoggedIn && isAuthRoute) {
    return navigateTo('/db');
  }
});
