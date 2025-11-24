import { ref } from 'vue'
import type {
  Subscription,
  Payment,
  SubscriptionFilters,
  SubscriptionListResponse,
  SubscriptionResponse,
  PaymentListResponse,
  CancelSubscriptionDto,
} from '../types'
import { useAuth } from '~/modules/auth/composables/useAuth'

/**
 * Composable para gestionar suscripciones
 */
export const useSubscriptions = () => {
  const { accessToken } = useAuth()

  // Estado
  const subscriptions = ref<Subscription[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const payments = ref<Payment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)

  /**
   * Obtener headers de autenticación
   */
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${accessToken.value}`,
  })

  /**
   * Listar suscripciones con filtros y paginación (admin)
   */
  const fetchSubscriptions = async (filters?: SubscriptionFilters) => {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: filters?.page || page.value,
        limit: filters?.limit || limit.value,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.planType && { planType: filters.planType }),
      }

      const response = await $fetch<SubscriptionListResponse>('/api/payments/subscriptions', {
        method: 'GET',
        params,
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        subscriptions.value = response.data
        if (response.meta) {
          total.value = response.meta.total
          page.value = response.meta.page
          limit.value = response.meta.limit
        }
      }

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener suscripciones'
      console.error('Error fetching subscriptions:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener una suscripción por ID
   */
  const fetchSubscription = async (id: string): Promise<Subscription | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<SubscriptionResponse>(`/api/payments/subscriptions/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        currentSubscription.value = response.data
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener suscripción'
      console.error('Error fetching subscription:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancelar suscripción (admin)
   */
  const cancelSubscription = async (id: string, dto: CancelSubscriptionDto): Promise<Subscription | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<SubscriptionResponse>(`/api/payments/subscriptions/${id}/cancel`, {
        method: 'POST',
        body: dto,
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        const index = subscriptions.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          subscriptions.value[index] = response.data
        }
        currentSubscription.value = response.data
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al cancelar suscripción'
      console.error('Error canceling subscription:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Activar suscripción después de firma de contrato (admin)
   */
  const activateSubscription = async (
    id: string,
    contractUrl: string,
    envelopeId?: string
  ): Promise<Subscription | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<SubscriptionResponse>(`/api/payments/subscriptions/${id}/activate`, {
        method: 'PUT',
        body: { contractUrl, envelopeId },
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        const index = subscriptions.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          subscriptions.value[index] = response.data
        }
        currentSubscription.value = response.data
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al activar suscripción'
      console.error('Error activating subscription:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener pagos de una suscripción
   */
  const fetchSubscriptionPayments = async (subscriptionId: string): Promise<Payment[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PaymentListResponse>(`/api/payments/subscriptions/${subscriptionId}/payments`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        payments.value = response.data
        return response.data
      }

      return []
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener pagos'
      console.error('Error fetching payments:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpiar estado
   */
  const clearError = () => {
    error.value = null
  }

  const resetState = () => {
    subscriptions.value = []
    currentSubscription.value = null
    payments.value = []
    error.value = null
    total.value = 0
    page.value = 1
  }

  return {
    // Estado
    subscriptions,
    currentSubscription,
    payments,
    loading,
    error,
    total,
    page,
    limit,
    // Métodos
    fetchSubscriptions,
    fetchSubscription,
    cancelSubscription,
    activateSubscription,
    fetchSubscriptionPayments,
    clearError,
    resetState,
  }
}
