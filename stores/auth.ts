import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Initialiser l'état de connexion depuis le localStorage
  if (process.client) { 
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    if (storedLoginStatus === 'true') {
      isLoggedIn.value = true;
    }
  }

  const login = async (usernameInput: string, passwordInput: string) => {
    loading.value = true;
    error.value = null;

    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Logique de connexion en mode démo
    if (usernameInput === 'demo-accunt@eqt.com' && passwordInput === '_Th!sIsJustD€m0P@55w0rd-') {
      isLoggedIn.value = true;
      if (process.client) {
        localStorage.setItem('isLoggedIn', 'true');
      }
    } else {
      isLoggedIn.value = false;
      error.value = 'Identifiant ou mot de passe incorrect.';
      if (process.client) {
        localStorage.setItem('isLoggedIn', 'false');
      }
    }
    loading.value = false;
  };

  const logout = async () => {
    loading.value = true;
    error.value = null;

    // Simuler un appel API de déconnexion
    await new Promise(resolve => setTimeout(resolve, 500));

    isLoggedIn.value = false;
    if (process.client) {
      localStorage.removeItem('isLoggedIn');
    }
    loading.value = false;
  };

  return {
    isLoggedIn: computed(() => isLoggedIn.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    login,
    logout,
  };
});

