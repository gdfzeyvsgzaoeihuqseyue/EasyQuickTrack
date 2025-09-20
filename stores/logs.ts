import { defineStore } from 'pinia';
import { useApiFetch } from '~/utils/api';
import type { LogEntry, LinkDetails, GetLogsResponse } from '@/types';

export const useLogsStore = defineStore('logs', () => {
  // State
  const logs = ref<LogEntry[]>([])
  const linkDetails = ref<LinkDetails | null>(null)
  const loading = ref(false)
  const error = ref<string>('')

  // Actions
  const fetchLinkLogs = async (linkId: string): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const response = await useApiFetch<GetLogsResponse>(`/eqt/link/${linkId}/logs`);

      logs.value = response.data
      linkDetails.value = response.linkDetails
    } catch (err: any) {
      console.error('Erreur lors de la récupération des logs:', err)
      
      if (err.status === 404) {
        error.value = 'Aucun log trouvé pour ce lien'
      } else {
        error.value = err.data?.message || 'Une erreur est survenue lors de la récupération des logs'
      }
    } finally {
      loading.value = false
    }
  }

  const clearLogs = (): void => {
    logs.value = []
    linkDetails.value = null
    error.value = ''
  }

  const clearError = (): void => {
    error.value = ''
  }

  // Getters
  const totalLogs = computed(() => logs.value.length)

  const logsByEventType = computed(() => {
    const grouped: Record<string, LogEntry[]> = {}
    logs.value.forEach(log => {
      if (!grouped[log.eventType]) {
        grouped[log.eventType] = []
      }
      grouped[log.eventType].push(log)
    })
    return grouped
  })

  const recentLogs = computed(() => {
    return logs.value.slice(0, 10)
  })

  return {
    // State
    logs: readonly(logs),
    linkDetails: readonly(linkDetails),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    fetchLinkLogs,
    clearLogs,
    clearError,

    // Getters
    totalLogs,
    logsByEventType,
    recentLogs
  }
})
