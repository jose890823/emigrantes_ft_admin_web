import { ref } from 'vue'
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilters,
  UserListResponse,
  UserResponse,
} from '../types'
import { useAuth } from '~/modules/auth/composables/useAuth'

/**
 * Composable para gestionar usuarios
 */
export const useUsers = () => {
  const { accessToken } = useAuth()

  // Estado
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  /**
   * Obtener headers de autenticación
   */
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${accessToken.value}`,
  })

  /**
   * Listar usuarios con filtros y paginación
   */
  const fetchUsers = async (filters?: UserFilters) => {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: filters?.page || page.value,
        limit: filters?.limit || limit.value,
        ...(filters?.search && { search: filters.search }),
        ...(filters?.role && { role: filters.role }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      }

      const response = await $fetch<UserListResponse>('/api/users', {
        method: 'GET',
        params,
        headers: getAuthHeaders(),
      })

      console.log('📦 Response from API:', response)

      if (response.success && response.data) {
        // El backend devuelve los usuarios en data.data, no en data.users
        const usersData = (response.data as any).data || response.data.users
        users.value = Array.isArray(usersData) ? usersData : []
        total.value = response.data.total || 0
        page.value = response.data.page || 1
        limit.value = response.data.limit || 10
      } else {
        // Si no hay data, asegurar que users sea un array vacío
        users.value = []
        total.value = 0
      }

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener usuarios'
      console.error('Error fetching users:', e)
      // Asegurar que users sea un array vacío en caso de error
      users.value = []
      total.value = 0
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener un usuario por ID
   */
  const fetchUser = async (id: string): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<UserResponse>(`/api/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        currentUser.value = response.data
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener usuario'
      console.error('Error fetching user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear un nuevo usuario
   */
  const createUser = async (data: CreateUserDto): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<UserResponse>('/api/users', {
        method: 'POST',
        body: data,
        headers: getAuthHeaders(),
      })

      if (response.success && response.data) {
        // Agregar el nuevo usuario a la lista
        users.value.unshift(response.data)
        total.value += 1
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al crear usuario'
      console.error('Error creating user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar un usuario
   */
  const updateUser = async (id: string, data: UpdateUserDto): Promise<User | null> => {
    loading.value = true
    error.value = null

    console.log('🔧 useUsers.updateUser - Data to send:', {
      isActive: data.isActive,
      emailVerified: data.emailVerified,
      phoneVerified: data.phoneVerified,
    })

    try {
      const response = await $fetch<UserResponse>(`/api/users/${id}`, {
        method: 'PUT',
        body: data,
        headers: getAuthHeaders(),
      })

      console.log('🔧 useUsers.updateUser - Response:', {
        success: response.success,
        isActive: response.data?.isActive,
        emailVerified: response.data?.emailVerified,
        phoneVerified: response.data?.phoneVerified,
      })

      if (response.success && response.data) {
        // Actualizar el usuario en la lista
        const index = users.value.findIndex((u) => u.id === id)
        if (index !== -1) {
          users.value[index] = response.data
        }
        currentUser.value = response.data
        return response.data
      }

      return null
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al actualizar usuario'
      console.error('Error updating user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un usuario
   */
  const deleteUser = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; message?: string }>(
        `/api/users/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      )

      if (response.success) {
        // Remover el usuario de la lista
        users.value = users.value.filter((u) => u.id !== id)
        total.value -= 1
        return true
      }

      return false
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al eliminar usuario'
      console.error('Error deleting user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener estadísticas de usuarios (Admin)
   */
  const getStats = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<any>('/api/users/admin/stats', {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener estadísticas'
      console.error('Error getting stats:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar usuarios (Admin)
   */
  const searchUsers = async (query: string, limit: number = 10) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<any>('/api/users/admin/search', {
        method: 'GET',
        params: { q: query, limit },
        headers: getAuthHeaders(),
      })

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al buscar usuarios'
      console.error('Error searching users:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Activar/Desactivar usuario (Admin)
   */
  const toggleActive = async (id: string, isActive: boolean) => {
    loading.value = true
    error.value = null

    try {
      const endpoint = isActive ? 'activate' : 'deactivate'
      const response = await $fetch<UserResponse>(`/api/users/admin/${id}/${endpoint}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      // Actualizar el usuario en la lista si está presente
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1 && response.data) {
        users.value[index] = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || e.message || `Error al ${isActive ? 'activar' : 'desactivar'} usuario`
      console.error('Error toggling active:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener historial de actividad del usuario (Admin)
   */
  const getUserActivity = async (id: string, limit: number = 50, offset: number = 0) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<any>(`/api/users/admin/${id}/activity`, {
        method: 'GET',
        params: { limit, offset },
        headers: getAuthHeaders(),
      })

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener actividad del usuario'
      console.error('Error getting user activity:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener estadísticas de actividad del usuario (Admin)
   */
  const getUserActivityStats = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<any>(`/api/users/admin/${id}/activity/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      return response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al obtener estadísticas de actividad'
      console.error('Error getting activity stats:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Cambiar rol del usuario (Solo Super Admin)
   */
  const updateRole = async (id: string, role: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<UserResponse>(`/api/users/admin/${id}/role`, {
        method: 'PATCH',
        body: { role },
        headers: getAuthHeaders(),
      })

      // Actualizar el usuario en la lista si está presente
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1 && response.data) {
        users.value[index] = response.data
      }

      return response.data
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al cambiar rol del usuario'
      console.error('Error updating role:', e)
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
    users.value = []
    currentUser.value = null
    error.value = null
    total.value = 0
    page.value = 1
  }

  return {
    // Estado
    users,
    currentUser,
    loading,
    error,
    total,
    page,
    limit,
    // Métodos
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    getStats,
    searchUsers,
    toggleActive,
    getUserActivity,
    getUserActivityStats,
    updateRole,
    clearError,
    resetState,
  }
}
