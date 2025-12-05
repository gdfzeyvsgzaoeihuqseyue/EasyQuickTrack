import { defineStore } from 'pinia';
import { useApiFetch } from '~/utils/api';
import type { QRCodeRecord, QRCodeOptions, QRCodeResponse, GetQRCodesResponse, GetQRCodeResponse, UpdateQRCodeResponse, DeleteQRCodeResponse } from '@/types';

export const useQRCodeStore = defineStore('qrcode', () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.pgsBaseAPI

  // State
  const qrCodes = ref<QRCodeRecord[]>([])
  const currentQRCode = ref<QRCodeRecord | null>(null)
  const loading = ref(false)
  const error = ref<string>('')
  const generatedQRCode = ref<Blob | null>(null)
  const qrCodeUrl = ref<string>('')

  // Pagination
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalQRCodes: 0,
    qrCodesOnPage: 0
  })

  // Actions
  const fetchQRCodes = async (page: number = 1, limit: number = 10): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const response = await useApiFetch<GetQRCodesResponse>('/user/eqt/get-qrcodes', {
        params: { page, limit }
      })

      qrCodes.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalQRCodes: response.nb,
        qrCodesOnPage: response.nbOnPage
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des QR codes:', err)
      error.value = err.data?.message || 'Une erreur est survenue lors de la récupération des QR codes'
    } finally {
      loading.value = false
    }
  }

  const fetchQRCodeById = async (id: string, download: boolean = false): Promise<QRCodeRecord | null> => {
    loading.value = true
    error.value = ''

    try {
      if (download) {
        // Pour télécharger le fichier binaire
        const response = await fetch(`${baseUrl}/user/eqt/get-qrcode/${id}?download=true`)
        if (!response.ok) {
          throw new Error('Erreur lors du téléchargement')
        }
        const blob = await response.blob()

        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `qrcode-${id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        return null
      } else {
        // Pour récupérer les données JSON
        const response = await useApiFetch<GetQRCodeResponse>(`/eqt/qrcode/${id}`, {
          params: { download: false }
        })

        currentQRCode.value = response.qrCode
        return response.qrCode
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération du QR code:', err)

      if (err.status === 404) {
        error.value = 'QR code non trouvé'
      } else {
        error.value = err.data?.message || 'Une erreur est survenue lors de la récupération du QR code'
      }

      return null
    } finally {
      loading.value = false
    }
  }

  const updateQRCode = async (id: string, options: Partial<QRCodeOptions>): Promise<QRCodeRecord | null> => {
    loading.value = true
    error.value = ''

    try {
      const response = await useApiFetch<UpdateQRCodeResponse>(`/eqt/qrcode/${id}`, {
        method: 'PUT',
        body: options
      })

      const updatedQRCode = response.qrCode

      // Mettre à jour dans la liste
      const index = qrCodes.value.findIndex(qr => qr.id === id)
      if (index !== -1) {
        qrCodes.value[index] = updatedQRCode
      }

      // Mettre à jour le QR code courant
      if (currentQRCode.value && currentQRCode.value.id === id) {
        currentQRCode.value = updatedQRCode
      }

      return updatedQRCode
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du QR code:', err)

      if (err.status === 404) {
        error.value = 'QR code non trouvé'
      } else if (err.status === 400) {
        error.value = err.data?.message || 'Données invalides fournies'
      } else {
        error.value = err.data?.message || 'Une erreur est survenue lors de la mise à jour'
      }

      return null
    } finally {
      loading.value = false
    }
  }

  const deleteQRCode = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = ''

    try {
      await useApiFetch<DeleteQRCodeResponse>(`/eqt/qrcode/${id}`, {
        method: 'DELETE'
      })

      // Supprimer de la liste
      const index = qrCodes.value.findIndex(qr => qr.id === id)
      if (index !== -1) {
        qrCodes.value.splice(index, 1)
        pagination.value.totalQRCodes--
      }

      // Nettoyer le QR code courant
      if (currentQRCode.value && currentQRCode.value.id === id) {
        currentQRCode.value = null
      }

      return true
    } catch (err: any) {
      console.error('Erreur lors de la suppression du QR code:', err)

      if (err.status === 404) {
        error.value = 'QR code non trouvé'
      } else {
        error.value = err.data?.message || 'Une erreur est survenue lors de la suppression'
      }

      return false
    } finally {
      loading.value = false
    }
  }

  const generateQRCodeFromLink = async (linkId: string, options: QRCodeOptions = {}): Promise<QRCodeResponse | null> => {
    loading.value = true
    error.value = ''

    try {
      const params = new URLSearchParams()

      // Ajouter les options comme paramètres de requête
      if (options.format) params.append('format', options.format)
      if (options.size) params.append('size', options.size.toString())
      if (options.quality) params.append('quality', options.quality.toString())
      if (options.foregroundColor) params.append('foregroundColor', options.foregroundColor)
      if (options.backgroundColor) params.append('backgroundColor', options.backgroundColor)
      if (options.errorCorrectionLevel) params.append('errorCorrectionLevel', options.errorCorrectionLevel)
      if (options.margin !== undefined) params.append('margin', options.margin.toString())
      if (options.logoSize) params.append('logoSize', options.logoSize.toString())
      if (options.addSignature !== undefined) params.append('addSignature', options.addSignature.toString())
      if (options.signatureColor) params.append('signatureColor', options.signatureColor)
      if (options.signatureFontSize) params.append('signatureFontSize', options.signatureFontSize.toString())

      const url = `${baseUrl}/user/eqt/create-sht-qrcode/${linkId}?${params.toString()}`

      // Créer FormData si un logo est fourni
      let requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Accept': `image/${options.format || 'png'}`
        }
      }

      if (options.logoFile) {
        const formData = new FormData()
        formData.append('logoFile', options.logoFile)

        // Ajouter les autres paramètres au FormData
        Object.entries(options).forEach(([key, value]) => {
          if (key !== 'logoFile' && value !== undefined) {
            formData.append(key, value.toString())
          }
        })

        requestOptions = {
          method: 'POST',
          body: formData
        }
      }

      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }

      const blob = await response.blob()
      generatedQRCode.value = blob

      // Créer une URL pour l'affichage
      if (qrCodeUrl.value) {
        URL.revokeObjectURL(qrCodeUrl.value)
      }
      qrCodeUrl.value = URL.createObjectURL(blob)

      return {
        success: true,
        message: 'QR Code généré avec succès',
        blob,
        url: qrCodeUrl.value
      }

    } catch (err: any) {
      console.error('Erreur lors de la génération du QR code:', err)
      error.value = err.message || 'Une erreur est survenue lors de la génération du QR code'
      return null
    } finally {
      loading.value = false
    }
  }

  const generateQRCodeFromUrl = async (url: string, options: QRCodeOptions = {}): Promise<QRCodeResponse | null> => {
    loading.value = true
    error.value = ''

    try {
      const endpoint = `${baseUrl}/user/eqt/create-url-qrcode`

      // Préparer les données
      const formData = new FormData()
      formData.append('url', url)

      // Ajouter les options
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'logoFile' && value instanceof File) {
            formData.append(key, value)
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }

      const blob = await response.blob()
      generatedQRCode.value = blob

      // Créer une URL pour l'affichage
      if (qrCodeUrl.value) {
        URL.revokeObjectURL(qrCodeUrl.value)
      }
      qrCodeUrl.value = URL.createObjectURL(blob)

      return {
        success: true,
        message: 'QR Code généré avec succès',
        blob,
        url: qrCodeUrl.value
      }

    } catch (err: any) {
      console.error('Erreur lors de la génération du QR code:', err)
      error.value = err.message || 'Une erreur est survenue lors de la génération du QR code'
      return null
    } finally {
      loading.value = false
    }
  }

  const downloadQRCode = (filename?: string) => {
    if (!generatedQRCode.value || !qrCodeUrl.value) {
      error.value = 'Aucun QR code à télécharger'
      return
    }

    const link = document.createElement('a')
    link.href = qrCodeUrl.value
    link.download = filename || `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearQRCode = () => {
    if (qrCodeUrl.value) {
      URL.revokeObjectURL(qrCodeUrl.value)
    }
    generatedQRCode.value = null
    qrCodeUrl.value = ''
    error.value = ''
  }

  const clearError = () => {
    error.value = ''
  }

  const clearCurrentQRCode = () => {
    currentQRCode.value = null
  }

  // ============================================
  // MÉTHODES PUBLIQUES (pour utilisateurs non authentifiés)
  // ============================================

  const generatePublicQRCodeFromUrl = async (url: string, options: Partial<QRCodeOptions> = {}): Promise<any | null> => {
    loading.value = true
    error.value = ''

    try {
      const endpoint = `${baseUrl}/public/eqt/create-url-qrcode`

      const params = new URLSearchParams()
      params.append('url', url)
      params.append('download', 'true')

      // Ajouter les options limitées pour les invités
      if (options.format) params.append('format', options.format)
      if (options.size) params.append('size', Math.min(options.size, 500).toString())
      if (options.foregroundColor) params.append('foregroundColor', options.foregroundColor)
      if (options.backgroundColor) params.append('backgroundColor', options.backgroundColor)
      if (options.errorCorrectionLevel) params.append('errorCorrectionLevel', options.errorCorrectionLevel)
      if (options.margin !== undefined) params.append('margin', Math.min(options.margin, 5).toString())

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))

        if (response.status === 429) {
          throw new Error('Limite atteinte: maximum 2 QR codes par jour. Connectez-vous pour en créer plus.')
        }

        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }

      const blob = await response.blob()
      generatedQRCode.value = blob

      // Créer une URL pour l'affichage
      if (qrCodeUrl.value) {
        URL.revokeObjectURL(qrCodeUrl.value)
      }
      qrCodeUrl.value = URL.createObjectURL(blob)

      return {
        success: true,
        message: 'QR Code généré avec succès',
        blob,
        url: qrCodeUrl.value
      }

    } catch (err: any) {
      console.error('Erreur lors de la génération du QR code public:', err)
      error.value = err.message || 'Une erreur est survenue lors de la génération du QR code'
      return null
    } finally {
      loading.value = false
    }
  }

  const generatePublicQRCodeFromLink = async (identifier: string, guestAccessToken: string, options: Partial<QRCodeOptions> = {}): Promise<any | null> => {
    loading.value = true
    error.value = ''

    try {
      // Validation des paramètres requis
      if (!identifier || identifier.trim() === '') {
        throw new Error('L\'identifiant du lien est requis')
      }

      if (!guestAccessToken || guestAccessToken.trim() === '') {
        throw new Error('Le jeton d\'accès invité est requis')
      }

      const params = new URLSearchParams()
      params.append('guestAccessToken', guestAccessToken)
      params.append('download', 'true')

      // Ajouter les options limitées pour les invités
      if (options.format) params.append('format', options.format)
      if (options.size) params.append('size', Math.min(options.size, 500).toString())
      if (options.errorCorrectionLevel) params.append('errorCorrectionLevel', options.errorCorrectionLevel)
      if (options.margin !== undefined) params.append('margin', Math.min(options.margin, 20).toString())

      const endpoint = `${baseUrl}/public/eqt/qrCode/create-sht-qrcode/${identifier}?${params.toString()}`

      console.log('🔍 DEBUG - generatePublicQRCodeFromLink:', {
        identifier,
        guestAccessToken: guestAccessToken.substring(0, 10) + '...',
        endpoint,
        params: params.toString()
      })

      const response = await fetch(endpoint, {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))

        if (response.status === 401) {
          throw new Error('Jeton invalide ou lien non trouvé')
        }

        if (response.status === 400) {
          throw new Error(errorData.message || 'Le lien a expiré')
        }

        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }

      const blob = await response.blob()
      generatedQRCode.value = blob

      // Créer une URL pour l'affichage
      if (qrCodeUrl.value) {
        URL.revokeObjectURL(qrCodeUrl.value)
      }
      qrCodeUrl.value = URL.createObjectURL(blob)

      return {
        success: true,
        message: 'QR Code généré avec succès',
        blob,
        url: qrCodeUrl.value
      }

    } catch (err: any) {
      console.error('Erreur lors de la génération du QR code public:', err)
      error.value = err.message || 'Une erreur est survenue lors de la génération du QR code'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchGuestQRCode = async (id: string, guestAccessToken: string): Promise<any | null> => {
    loading.value = true
    error.value = ''

    try {
      const params = new URLSearchParams()
      params.append('guestAccessToken', guestAccessToken)
      params.append('download', 'false')

      const endpoint = `${baseUrl}/public/eqt/get-qrcode/${id}?${params.toString()}`

      const response = await fetch(endpoint, {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))

        if (response.status === 401) {
          throw new Error('Jeton invalide ou accès non autorisé')
        }

        if (response.status === 404) {
          throw new Error('QR code non trouvé')
        }

        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.qrCode) {
        return data.qrCode
      }

      return data

    } catch (err: any) {
      console.error('Erreur lors de la récupération du QR code invité:', err)
      error.value = err.message || 'Une erreur est survenue lors de la récupération du QR code'
      return null
    } finally {
      loading.value = false
    }
  }

  // Getters
  const hasQRCode = computed(() => !!generatedQRCode.value)
  const isGenerating = computed(() => loading.value)
  const totalQRCodes = computed(() => pagination.value.totalQRCodes)

  return {
    // State
    qrCodes: readonly(qrCodes),
    currentQRCode: readonly(currentQRCode),
    loading: readonly(loading),
    error: readonly(error),
    generatedQRCode: readonly(generatedQRCode),
    qrCodeUrl: readonly(qrCodeUrl),
    pagination: readonly(pagination),

    // Actions
    fetchQRCodes,
    fetchQRCodeById,
    updateQRCode,
    deleteQRCode,
    generateQRCodeFromLink,
    generateQRCodeFromUrl,
    downloadQRCode,
    clearQRCode,
    clearError,
    clearCurrentQRCode,

    // Actions publiques (non authentifiées)
    generatePublicQRCodeFromUrl,
    generatePublicQRCodeFromLink,
    fetchGuestQRCode,

    // Getters
    hasQRCode,
    isGenerating,
    totalQRCodes
  }
})