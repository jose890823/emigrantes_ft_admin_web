import { ref } from 'vue'
import type {
  Plan,
  CreatePlanDto,
  UpdatePlanDto,
  PlanListResponse,
  PlanResponse,
} from '../types'
import { useAuth } from '~/modules/auth/composables/useAuth'

/**
 * Composable para gestionar planes de suscripción
 */
export const usePlans = () => {
  const { accessToken } = useAuth()

  // Estado
  const plans = ref<Plan[]>([])
  const currentPlan = ref<Plan | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtener headers de autenticación
   */
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${accessToken.value}`,
  })

  /**
   * Obtener todos los planes (admin)
   */
  const fetchPlans = async (includeInactive = true) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PlanListResponse>('/api/plans', {
        method: 'GET',
        params: { includeInactive },
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        plans.value = response.data
      }

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener planes'
      console.error('Error fetching plans:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener planes públicos (sin autenticación)
   */
  const fetchPublicPlans = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PlanListResponse>('/api/plans/public', {
        method: 'GET',
      })

      if (response.success && response.data) {
        plans.value = response.data
      }

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener planes'
      console.error('Error fetching public plans:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener un plan por ID
   */
  const fetchPlan = async (id: string): Promise<Plan | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PlanResponse>(`/api/plans/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        currentPlan.value = response.data
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener plan'
      console.error('Error fetching plan:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear un nuevo plan
   */
  const createPlan = async (data: CreatePlanDto): Promise<Plan | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PlanResponse>('/api/plans', {
        method: 'POST',
        body: data,
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        plans.value.push(response.data)
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al crear plan'
      console.error('Error creating plan:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar un plan
   */
  const updatePlan = async (id: string, data: UpdatePlanDto): Promise<Plan | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PlanResponse>(`/api/plans/${id}`, {
        method: 'PUT',
        body: data,
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        const index = plans.value.findIndex((p) => p.id === id)
        if (index !== -1) {
          plans.value[index] = response.data
        }
        currentPlan.value = response.data
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al actualizar plan'
      console.error('Error updating plan:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Desactivar un plan
   */
  const deletePlan = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PlanResponse>(`/api/plans/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.success) {
        const index = plans.value.findIndex((p) => p.id === id)
        if (index !== -1 && response.data) {
          plans.value[index] = response.data
        }
        return true
      }

      return false
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al desactivar plan'
      console.error('Error deleting plan:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar IDs de Stripe
   */
  const updateStripeIds = async (
    id: string,
    stripeIds: {
      stripeProductId?: string
      stripeMonthlyPriceId?: string
      stripeInitialPriceId?: string
      stripeInstallmentPriceId?: string
    }
  ): Promise<Plan | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<PlanResponse>(`/api/plans/${id}/stripe-ids`, {
        method: 'PUT',
        body: stripeIds,
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        const index = plans.value.findIndex((p) => p.id === id)
        if (index !== -1) {
          plans.value[index] = response.data
        }
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al actualizar IDs de Stripe'
      console.error('Error updating Stripe IDs:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Sembrar planes por defecto
   */
  const seedPlans = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; message: string }>('/api/plans/seed', {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (response.success) {
        await fetchPlans()
      }

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al sembrar planes'
      console.error('Error seeding plans:', e)
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
    plans.value = []
    currentPlan.value = null
    error.value = null
  }

  return {
    // Estado
    plans,
    currentPlan,
    loading,
    error,
    // Métodos
    fetchPlans,
    fetchPublicPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,
    updateStripeIds,
    seedPlans,
    clearError,
    resetState,
  }
}
