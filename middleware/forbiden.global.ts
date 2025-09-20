import { useRuntimeConfig } from '#app';
import { withoutTrailingSlash } from 'ufo';
import { createError } from '#app';

export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig();
  const isBetaMode = config.public.betaMode;

  // Routes privées
  const privateRoutes = [
    '/about', '/contact', '/legal', '/pricing'
  ].map(route => withoutTrailingSlash(route));
  
  // Normalisation du chemin
  const normalizedPath = withoutTrailingSlash(to.path);
  
  // Si le mode bêta est activé
  if (isBetaMode) {
    const isDashboardRoute = normalizedPath.startsWith('/db');
    const isPrivate = privateRoutes.includes(normalizedPath);

    // Rediriger vers la page d'erreur 403.
    if (!isDashboardRoute && isPrivate) {
      throw createError({
      statusCode: 403,
      statusMessage: "Accès Interdit au dossier 'events'",
      fatal: true,
    });
    }
  }
});
