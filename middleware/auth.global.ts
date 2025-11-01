export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const userServiceStore = useUserServiceStore();
  const config = useRuntimeConfig();
  
  const SERVICE_DOMAIN = 'https://eqt.me';
  
  // Initialiser l'authentification si ce n'est pas déjà fait
  if (process.client && !authStore.isLoggedIn) {
    authStore.initAuth();
  }
  
  // Si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    // Vérifier si l'utilisateur est connecté
    if (!authStore.isLoggedIn) {
      return navigateTo('/auth/login');
    }
    
    // Vérifier et rafraîchir le token si nécessaire
    try {
      await checkAndRefreshToken(authStore);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      await authStore.logout();
      return navigateTo('/auth/login');
    }
    
    // Vérifier l'accès au service pour les routes du dashboard
    if (to.path.startsWith('/db')) {
      try {
        // Vérifier l'accès au service et mettre à jour lastAccess
        const verifyResult = await userServiceStore.verifyServiceAccess({
          token: authStore.accessToken!,
          serviceDomain: SERVICE_DOMAIN
        });
        
        if (!verifyResult.valid || !verifyResult.userAccess) {
          // L'utilisateur n'a pas accès au service
          return navigateTo('/auth/grant-access');
        }
        
      } catch (error: any) {
        console.error('Erreur lors de la vérification de l\'accès:', error);
        
        // 403 (service inactif)
        if (error.statusCode === 403) {
          return navigateTo('/auth/grant-access');
        }
        
        // 401 (token invalide)
        if (error.statusCode === 401) {
          try {
            await authStore.refreshAccessToken();
            const retryResult = await userServiceStore.verifyServiceAccess({
              token: authStore.accessToken!,
              serviceDomain: SERVICE_DOMAIN
            });
            
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

// Fonction helper pour vérifier et rafraîchir le token
async function checkAndRefreshToken(authStore: any) {
  if (!authStore.accessToken) {
    throw new Error('No access token');
  }
  
  // Décoder le token pour vérifier l'expiration
  const tokenParts = authStore.accessToken.split('.');
  if (tokenParts.length !== 3) {
    throw new Error('Invalid token format');
  }
  
  try {
    const payload = JSON.parse(atob(tokenParts[1]));
    const expiresAt = payload.exp * 1000; // Convertir en millisecondes
    const now = Date.now();
    
    // Si le token expire dans moins de 5 minutes, le rafraîchir
    const fiveMinutes = 5 * 60 * 1000;
    if (expiresAt - now < fiveMinutes) {
      await authStore.refreshAccessToken();
    }
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    // Si on ne peut pas décoder, essayer de rafraîchir quand même
    await authStore.refreshAccessToken();
  }
}
