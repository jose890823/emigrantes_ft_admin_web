/**
 * Composable for admin dashboard statistics and data
 */

import { ref } from 'vue'
import { useAuth } from '~/modules/auth/composables/useAuth'

export interface POAStatsByStatus {
  draft: number
  pending: number
  in_review: number
  approved: number
  notarized: number
  activated: number
  executed: number
  rejected: number
  cancelled: number
}

export interface POAStats {
  total: number
  byStatus: POAStatsByStatus
  recentCount: number
  avgProcessingTime?: number
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  verified: number
  byRole?: {
    client: number
    admin: number
    super_admin: number
  }
}

export interface DashboardStats {
  poa: POAStats
  users: UserStats
}

export const useDashboard = () => {
  const { accessToken } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const stats = ref<DashboardStats | null>(null)
  const recentPOAs = ref<any[]>([])

  /**
   * Get auth headers
   */
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken.value && { Authorization: `Bearer ${accessToken.value}` }),
    }
  }

  /**
   * Fetch dashboard statistics
   */
  const fetchDashboardStats = async () => {
    loading.value = true
    error.value = null

    try {
      // Fetch POAs to calculate statistics
      const poaResponse = await $fetch<{ success: boolean; data: any[] }>('/api/poa/admin/all', {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const poas = poaResponse.data || []

      // Calculate POA stats by status
      const byStatus: POAStatsByStatus = {
        draft: poas.filter(p => p.status === 'draft').length,
        pending: poas.filter(p => p.status === 'pending').length,
        in_review: poas.filter(p => p.status === 'in_review').length,
        approved: poas.filter(p => p.status === 'approved').length,
        notarized: poas.filter(p => p.status === 'notarized').length,
        activated: poas.filter(p => p.status === 'activated').length,
        executed: poas.filter(p => p.status === 'executed').length,
        rejected: poas.filter(p => p.status === 'rejected').length,
        cancelled: poas.filter(p => p.status === 'cancelled').length,
      }

      // Get recent POAs (last 5)
      const sortedPOAs = [...poas].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
      recentPOAs.value = sortedPOAs.slice(0, 5)

      // Fetch user statistics
      const userStatsResponse = await $fetch<{ success: boolean; data: any }>('/api/users/admin/stats', {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const userStatsData = userStatsResponse.data || {}

      // Combine statistics
      stats.value = {
        poa: {
          total: poas.length,
          byStatus,
          recentCount: recentPOAs.value.length,
        },
        users: {
          total: userStatsData.total || 0,
          active: userStatsData.active || 0,
          inactive: userStatsData.inactive || 0,
          verified: userStatsData.verified || 0,
          byRole: userStatsData.byRole || { client: 0, admin: 0, super_admin: 0 },
        },
      }

      return stats.value
    } catch (e: any) {
      console.error('Error fetching dashboard stats:', e)
      error.value = e.data?.message || 'Error al cargar las estadísticas del dashboard'

      // Set default values on error
      stats.value = {
        poa: {
          total: 0,
          byStatus: {
            draft: 0,
            pending: 0,
            in_review: 0,
            approved: 0,
            notarized: 0,
            activated: 0,
            executed: 0,
            rejected: 0,
            cancelled: 0,
          },
          recentCount: 0,
        },
        users: {
          total: 0,
          active: 0,
          inactive: 0,
          verified: 0,
          byRole: { client: 0, admin: 0, super_admin: 0 },
        },
      }

      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    stats,
    recentPOAs,
    loading,
    error,

    // Methods
    fetchDashboardStats,
    clearError,
  }
}
