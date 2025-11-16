/**
 * Composable para gestión de POA (Power of Attorney)
 *
 * Este composable maneja todas las operaciones relacionadas con
 * los poderes notariales, incluyendo CRUD, aprobaciones, ejecuciones, etc.
 */

import { ref, computed } from 'vue'
import { useAuth } from '~/modules/auth/composables/useAuth'
import type {
  POA,
  POAFilters,
  POAPaginationParams,
  POAPaginatedResponse,
  CreatePOADto,
  UpdatePOADto,
  SubmitPOADto,
  AssignPOADto,
  ReviewPOADto,
  ApprovePOADto,
  RejectPOADto,
  NotarizePOADto,
  ActivatePOADto,
  ExecutePOADto,
  CompleteExecutionDto,
  CancelPOADto,
  POAStats,
  POAHistory,
  POAExecution,
  POADocument,
  AdminPOAStats,
} from '../types'

// Estado global
const poas = ref<POA[]>([])
const currentPOA = ref<POA | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export const usePoa = () => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()

  /**
   * Obtener headers de autenticación
   */
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken.value && { Authorization: `Bearer ${accessToken.value}` }),
    }
  }

  // ==========================================================================
  // CRUD Básico
  // ==========================================================================

  /**
   * Obtener lista de POAs con filtros y paginación
   */
  const fetchPOAs = async (filters?: POAFilters, pagination?: POAPaginationParams) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()

      // Agregar filtros
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value))
          }
        })
      }

      // Agregar paginación
      if (pagination) {
        Object.entries(pagination).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value))
          }
        })
      }

      const queryString = queryParams.toString()
      const url = `/api/poa/admin${queryString ? `?${queryString}` : ''}`

      // El backend devuelve: { success: true, data: POA[], message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA[]; message?: string }>(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (response.data) {
        poas.value = response.data
      }

      return response
    } catch (e: any) {
      error.value = e.data?.message || 'Error al cargar los POAs'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener un POA por ID
   */
  const fetchPOA = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      currentPOA.value = response.data
      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al cargar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear un nuevo POA
   */
  const createPOA = async (data: CreatePOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>('/api/poa/admin', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data,
      })

      // Agregar a la lista local
      poas.value.unshift(response.data)
      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al crear el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar un POA
   */
  const updatePOA = async (id: string, data: UpdatePOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: data,
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual si es el mismo
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al actualizar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un POA (soft delete)
   */
  const deletePOA = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await $fetch<any>(`/api/poa/admin/${id}`, {
        method: 'DELETE' as any,
        headers: getAuthHeaders(),
      })

      // Remover de la lista local
      poas.value = poas.value.filter((p) => p.id !== id)

      // Limpiar POA actual si es el mismo
      if (currentPOA.value?.id === id) {
        currentPOA.value = null
      }

      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Error al eliminar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================================================================
  // Flujo de Aprobación
  // ==========================================================================

  /**
   * Enviar un POA para revisión (cambiar de draft a pending)
   */
  const submitPOA = async (id: string, data?: SubmitPOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data || {},
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al enviar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Asignar un POA a un administrador
   */
  const assignPOA = async (id: string, data: AssignPOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data,
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al asignar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Marcar un POA como en revisión
   */
  const reviewPOA = async (id: string, data?: ReviewPOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}/review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data || {},
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al marcar el POA en revisión'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Aprobar un POA
   */
  const approvePOA = async (id: string, data?: ApprovePOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data || {},
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al aprobar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Rechazar un POA
   */
  const rejectPOA = async (id: string, data: RejectPOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data,
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al rechazar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Notarizar un POA
   */
  const notarizePOA = async (id: string, data?: NotarizePOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}/notarize`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data || {},
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al notarizar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Activar un POA
   */
  const activatePOA = async (id: string, data?: ActivatePOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}/activate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data || {},
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al activar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancelar un POA
   */
  const cancelPOA = async (id: string, data: CancelPOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POA, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POA; message?: string }>(`/api/poa/admin/${id}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data,
      })

      // Actualizar en la lista local
      const index = poas.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        poas.value[index] = response.data
      }

      // Actualizar POA actual
      if (currentPOA.value?.id === id) {
        currentPOA.value = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al cancelar el POA'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================================================================
  // Ejecuciones
  // ==========================================================================

  /**
   * Crear una nueva ejecución de POA
   */
  const createExecution = async (poaId: string, data: ExecutePOADto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POAExecution, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POAExecution; message?: string }>(`/api/poa/admin/${poaId}/executions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data,
      })

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al crear la ejecución'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener ejecuciones de un POA
   */
  const getExecutions = async (poaId: string) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POAExecution[], message, timestamp }
      const response = await $fetch<{ success: boolean; data: POAExecution[]; message?: string }>(`/api/poa/admin/${poaId}/executions`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al obtener las ejecuciones'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Completar una ejecución
   */
  const completeExecution = async (poaId: string, executionId: string, data: CompleteExecutionDto) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POAExecution, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POAExecution; message?: string }>(
        `/api/poa/admin/${poaId}/executions/${executionId}/complete`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: data,
        }
      )

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al completar la ejecución'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================================================================
  // Historial y Documentos
  // ==========================================================================

  /**
   * Obtener historial de un POA
   */
  const getHistory = async (poaId: string) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POAHistory[], message, timestamp }
      const response = await $fetch<{ success: boolean; data: POAHistory[]; message?: string }>(`/api/poa/admin/${poaId}/history`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al obtener el historial'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener documentos de un POA
   */
  const getDocuments = async (poaId: string) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POADocument[], message, timestamp }
      const response = await $fetch<{ success: boolean; data: POADocument[]; message?: string }>(`/api/poa/admin/${poaId}/documents`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al obtener los documentos'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Subir un documento
   */
  const uploadDocument = async (poaId: string, file: File, description?: string) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (description) {
        formData.append('description', description)
      }

      // El backend devuelve: { success: true, data: POADocument, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POADocument; message?: string }>(`/api/poa/admin/${poaId}/documents`, {
        method: 'POST',
        headers: {
          ...(accessToken.value && { Authorization: `Bearer ${accessToken.value}` }),
        },
        body: formData,
      })

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al subir el documento'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un documento
   */
  const deleteDocument = async (poaId: string, documentId: string) => {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/poa/admin/${poaId}/documents/${documentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Error al eliminar el documento'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================================================================
  // Estadísticas
  // ==========================================================================

  /**
   * Obtener estadísticas generales de POAs
   */
  const getStats = async () => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: POAStats, message, timestamp }
      const response = await $fetch<{ success: boolean; data: POAStats; message?: string }>('/api/poa/admin/stats', {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al obtener las estadísticas'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener estadísticas de un administrador
   */
  const getAdminStats = async (adminId: string) => {
    loading.value = true
    error.value = null

    try {
      // El backend devuelve: { success: true, data: AdminPOAStats, message, timestamp }
      const response = await $fetch<{ success: boolean; data: AdminPOAStats; message?: string }>(`/api/poa/admin/stats/${adminId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Error al obtener las estadísticas del administrador'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================================================================
  // Utilidades
  // ==========================================================================

  /**
   * Limpiar errores
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Limpiar POA actual
   */
  const clearCurrentPOA = () => {
    currentPOA.value = null
  }

  /**
   * Limpiar todo el estado
   */
  const clearState = () => {
    poas.value = []
    currentPOA.value = null
    error.value = null
    loading.value = false
  }

  // Computed
  const hasPOAs = computed(() => poas.value.length > 0)
  const hasError = computed(() => error.value !== null)
  const isLoading = computed(() => loading.value)

  return {
    // Estado
    poas,
    currentPOA,
    loading,
    error,

    // CRUD
    fetchPOAs,
    fetchPOA,
    createPOA,
    updatePOA,
    deletePOA,

    // Flujo de aprobación
    submitPOA,
    assignPOA,
    reviewPOA,
    approvePOA,
    rejectPOA,
    notarizePOA,
    activatePOA,
    cancelPOA,

    // Ejecuciones
    createExecution,
    getExecutions,
    completeExecution,

    // Historial y documentos
    getHistory,
    getDocuments,
    uploadDocument,
    deleteDocument,

    // Estadísticas
    getStats,
    getAdminStats,

    // Utilidades
    clearError,
    clearCurrentPOA,
    clearState,

    // Computed
    hasPOAs,
    hasError,
    isLoading,
  }
}
