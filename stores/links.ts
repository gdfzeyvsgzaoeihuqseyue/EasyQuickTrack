import { defineStore } from 'pinia';
import { useApiFetch } from '~/utils/api';
import type { ShortLink, CreateLinkResponse, GetLinksResponse, GetLinkResponse, UpdateLinkResponse, DeleteLinkResponse, ShortLinkAnalytics, ExtractMetadataResponse, LinkStatusError } from '@/types';

export const useLinksStore = defineStore('links', () => {
  const config = useRuntimeConfig()

  // State
  const links = ref<ShortLink[]>([])
  const currentLink = ref<ShortLink | null>(null)
  const guestLink = ref<ShortLink | null>(null)
  const guestToken = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | LinkStatusError | null>(null)
  const metadataLoading = ref(false)
  const metadataError = ref<string>('')
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalLinks: 0,
    linksOnPage: 0
  })

  // Actions

  // Créer un lien en tant qu'utilisateur authentifié
  const createUserLink = async (longUrl: string, alias?: string, activateAt?: string, expiresAt?: string): Promise<ShortLink | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await useApiFetch<CreateLinkResponse>('/eqt/link/user', {
        method: 'POST',
        body: { longUrl, alias, activateAt, expiresAt }
      });

      const newLink = response.link

      // Ajouter le nouveau lien au début de la liste
      const existingIndex = links.value.findIndex(link => link.id === newLink.id)
      if (existingIndex === -1) {
        links.value.unshift(newLink)
        pagination.value.totalLinks++
      }

      return newLink
    } catch (err: any) {
      console.error('Erreur lors de la création du lien utilisateur:', err)
      error.value = err.data?.message || 'Erreur lors de la création de votre lien court'
      return null
    } finally {
      loading.value = false
    }
  }

  // Créer un lien public (invité)
  const createPublicLink = async (longUrl: string): Promise<{ link: ShortLink; token: string } | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await useApiFetch<{
        message: string;
        link: ShortLink;
        guestAccessToken: string;
        warning?: string;
      }>('/eqt/link/public', {
        method: 'POST',
        body: { longUrl }
      });

      guestLink.value = response.link
      guestToken.value = response.guestAccessToken

      return {
        link: response.link,
        token: response.guestAccessToken
      }
    } catch (err: any) {
      console.error('Erreur lors de la création du lien public:', err)
      error.value = err.data?.message || 'Erreur lors de la création du lien'
      return null
    } finally {
      loading.value = false
    }
  }

  // Récupérer les liens de l'utilisateur authentifié
  const fetchUserLinks = async (page: number = 1, limit: number = 10): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await useApiFetch<GetLinksResponse>('/eqt/link/user', {
        params: { page, limit }
      })

      links.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalLinks: response.nb,
        linksOnPage: response.nbOnPage
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des liens utilisateur:', err)
      error.value = err.data?.message || 'Erreur lors de la recuperation de vos liens'
    } finally {
      loading.value = false
    }
  }

  // Récupérer les liens publics avec un token
  const fetchPublicLinks = async (token: string, page: number = 1, limit: number = 10): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await useApiFetch<GetLinksResponse>('/eqt/link/public', {
        params: { guestAccessToken: token, page, limit }
      })

      links.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalLinks: response.nb,
        linksOnPage: response.nbOnPage
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des liens publics:', err)
      if (err.status === 401) {
        error.value = 'Token invalide ou expiré.';
      } else {
        error.value = err.data?.message || 'Une erreur est survenue lors de la récupération des liens'
      }
    } finally {
      loading.value = false
    }
  }

  // Fonction de compatibilité (utilise createUserLink par défaut)
  const createShortLink = async (longUrl: string, alias?: string, activateAt?: string, expiresAt?: string): Promise<ShortLink | null> => {
    return createUserLink(longUrl, alias, activateAt, expiresAt)
  }

  // Fonction de compatibilité (utilise fetchUserLinks par défaut)
  const fetchLinks = async (page: number = 1, limit: number = 10): Promise<void> => {
    return fetchUserLinks(page, limit)
  }

  const fetchLinkById = async (identifier: string): Promise<ShortLink | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await useApiFetch<GetLinkResponse>(`/eqt/link/${identifier}`);

      currentLink.value = response.data
      return response.data
    } catch (err: any) {
      console.error('Erreur lors de la récupération du lien:', err)

      if (err.status === 404) {
        error.value = 'Lien non trouvé'
      } else if (err.status === 403 && err.data) {
        error.value = {
          message: err.data.message || 'Ce lien est inaccessible.',
          reason: err.data.reason,
          activateAt: err.data.activateAt,
          expiresAt: err.data.expiresAt,
        };
      } else {
        error.value = err.data?.message || 'Une erreur est survenue lors de la récupération du lien'
      }

      return null
    } finally {
      loading.value = false
    }
  }

  const extractMetadata = async (url: string): Promise<void> => {
    metadataLoading.value = true
    metadataError.value = ''

    try {
      const response = await useApiFetch<ExtractMetadataResponse>('/eqt/get-metadata', {
        params: { url }
      });

      // Mettre à jour les métadonnées du lien courant
      if (currentLink.value) {
        currentLink.value = {
          ...currentLink.value,
          metadata: response.data
        }
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'extraction des métadonnées:', err)
      metadataError.value = err.data?.message || 'Une erreur est survenue lors de l\'extraction des métadonnées'
    } finally {
      metadataLoading.value = false
    }
  }

  const updateLink = async (id: string, longUrl: string, activateAt?: string, expiresAt?: string): Promise<ShortLink | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await useApiFetch<UpdateLinkResponse>(`/eqt/link/${id}`, {
        method: 'PUT',
        body: { longUrl, activateAt, expiresAt }
      });

      const updatedLink = response.data

      // Mettre à jour le lien dans la liste
      const index = links.value.findIndex(link => link.id === id)
      if (index !== -1) {
        links.value[index] = updatedLink
      }

      // Mettre à jour le lien courant si c'est le même
      if (currentLink.value && currentLink.value.id === id) {
        currentLink.value = updatedLink
      }

      return updatedLink
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du lien:', err)

      if (err.status === 404) {
        error.value = 'Lien non trouvé.'
      } else if (err.status === 400 && err.data?.message?.includes('nombre maximum')) {
        error.value = 'Limite de 10 mises à jour atteinte pour ce lien.';
      } else if (err.status === 400 && err.data?.message?.includes('date')) {
        error.value = err.data?.message || 'Dates d\'activation/expiration invalides.';
      } else if (err.status === 400) {
        error.value = err.data?.message || 'Données invalides fournies.'
      } else {
        error.value = err.data?.message || 'Une erreur inattendue est survenue lors de la mise à jour.'
      }

      return null
    } finally {
      loading.value = false
    }
  }

  const deleteLink = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await useApiFetch<DeleteLinkResponse>(`/eqt/link/${id}`, {
        method: 'DELETE'
      });

      // Supprimer le lien de la liste
      const index = links.value.findIndex(link => link.id === id)
      if (index !== -1) {
        links.value.splice(index, 1)
        pagination.value.totalLinks--
      }

      // Nettoyer le lien courant si c'est le même
      if (currentLink.value && currentLink.value.id === id) {
        currentLink.value = null
      }

      return true
    } catch (err: any) {
      console.error('Erreur lors de la suppression du lien:', err)

      if (err.status === 404) {
        error.value = 'Lien non trouvé'
      } else {
        error.value = err.data?.message || 'Une erreur est survenue lors de la suppression du lien'
      }

      return false
    } finally {
      loading.value = false
    }
  }

  const refreshLinks = async (): Promise<void> => {
    await fetchLinks(pagination.value.currentPage)
  }

  const clearError = (): void => {
    error.value = null
  }

  const clearMetadataError = (): void => {
    metadataError.value = ''
  }

  const clearCurrentLink = (): void => {
    currentLink.value = null
    metadataError.value = ''
  }

  const toggleLinkStatus = async (id: string, disable: boolean): Promise<ShortLink | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await useApiFetch<{ success: boolean; message: string; data: ShortLink }>(`/eqt/link/${id}/toggle`, {
        method: 'PUT',
        body: { disable }
      });

      const updatedLink = response.data

      // Mettre à jour le lien dans la liste
      const index = links.value.findIndex(link => link.id === id)
      if (index !== -1) {
        links.value[index] = updatedLink
      }

      // Mettre à jour le lien courant si c'est le même
      if (currentLink.value && currentLink.value.id === id) {
        currentLink.value = updatedLink
      }

      return updatedLink
    } catch (err: any) {
      console.error('Erreur lors du changement de statut du lien:', err)

      if (err.status === 404) {
        error.value = 'Lien non trouvé.'
      } else {
        error.value = err.data?.message || 'Une erreur est survenue lors du changement de statut.'
      }

      return null
    } finally {
      loading.value = false
    }
  }

  // Récupérer un lien invité avec son token

  const fetchGuestLink = async (identifier: string, token: string): Promise<ShortLink | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{
        success: boolean;
        message: string;
        data: ShortLink
      }>(`${config.public.pgsBaseAPI}/eqt/link/guest/${identifier}`, {
        params: { token }
      });

      guestLink.value = response.data
      return response.data
    } catch (err: any) {
      console.error('Erreur lors de la récupération du lien invité:', err)

      if (err.status === 401) {
        error.value = 'Accès refusé : Identifiant ou Jeton invalide.'
      } else {
        error.value = err.data?.message || 'Une erreur est survenue'
      }

      return null
    } finally {
      loading.value = false
    }
  }

  const clearGuestLink = (): void => {
    guestLink.value = null
    guestToken.value = null
  }

  // Getters
  const totalClicks = computed(() => {
    return links.value.reduce((sum, link) => sum + (link.clicks || 0), 0)
  })

  const averageClicksPerLink = computed(() => {
    const total = links.value.length
    return total > 0 ? Math.round(totalClicks.value / total) : 0
  })

  const recentLinks = computed(() => {
    return links.value.slice(0, 5)
  })

  const topPerformingLinks = computed(() => {
    return [...links.value]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5)
  })

  const stats = computed(() => ({
    totalLinks: pagination.value.totalLinks,
    totalClicks: totalClicks.value,
    avgClicksPerLink: averageClicksPerLink.value,
  }))

  return {
    // State
    links: readonly(links),
    currentLink: readonly(currentLink),
    guestLink: readonly(guestLink),
    guestToken: readonly(guestToken),
    loading: readonly(loading),
    error: readonly(error),
    metadataLoading: readonly(metadataLoading),
    metadataError: readonly(metadataError),
    pagination: readonly(pagination),

    // Actions
    createShortLink,
    createUserLink,
    createPublicLink,
    fetchLinks,
    fetchUserLinks,
    fetchPublicLinks,
    fetchLinkById,
    fetchGuestLink,
    extractMetadata,
    updateLink,
    deleteLink,
    refreshLinks,
    toggleLinkStatus,
    clearError,
    clearMetadataError,
    clearCurrentLink,
    clearGuestLink,

    // Getters
    totalClicks,
    averageClicksPerLink,
    recentLinks,
    topPerformingLinks,
    stats
  }
})
