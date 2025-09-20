import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Liste des routes protégées (commençant par /db)
  const protectedRoutes = ['/db'];

  // Vérifier si la route actuelle est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route));

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
  if (!authStore.isLoggedIn && isProtectedRoute) {
    return navigateTo('/login');
  }

  // Si l'utilisateur est connecté et tente d'accéder à la page de connexion
  if (authStore.isLoggedIn && to.path === '/login') {
    return navigateTo('/db');
  }
});

