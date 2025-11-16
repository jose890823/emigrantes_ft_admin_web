import { ref, computed } from 'vue'
import type { User, LoginDto, AuthResponse } from '../types'

/**
 * Composable para gestionar autenticación
 * Maneja login, logout, tokens y estado del usuario
 */
export const useAuth = () => {
  // Estado
  const user = useState<User | null>('auth-user', () => null)
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const refreshToken = useState<string | null>('auth-refresh-token', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const isAdmin = computed(() => {
    const adminRoles = ['admin', 'super_admin', 'staff']
    return user.value ? adminRoles.includes(user.value.role) : false
  })

  /**
   * Inicializar auth desde localStorage (si existe) y obtener datos actualizados del usuario
   */
  const initAuth = async () => {
    if (process.client) {
      const storedToken = localStorage.getItem('auth-access-token')
      const storedRefreshToken = localStorage.getItem('auth-refresh-token')
      const storedUser = localStorage.getItem('auth-user')

      if (storedToken && storedUser) {
        accessToken.value = storedToken
        refreshToken.value = storedRefreshToken
        user.value = JSON.parse(storedUser)

        // Obtener información actualizada del usuario desde el backend
        await getMe()
      }
    }
  }

  /**
   * Login de usuario
   */
  const login = async (credentials: LoginDto): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials,
      })

      if (response.success && response.data) {
        // Guardar tokens y usuario
        accessToken.value = response.data.accessToken
        refreshToken.value = response.data.refreshToken
        user.value = response.data.user

        // Persistir en localStorage
        if (process.client) {
          localStorage.setItem('auth-access-token', response.data.accessToken)
          localStorage.setItem('auth-refresh-token', response.data.refreshToken)
          localStorage.setItem('auth-user', JSON.stringify(response.data.user))
        }

        return true
      }

      error.value = 'Error en el login'
      return false
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Error al iniciar sesión'
      console.error('Login error:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout de usuario
   */
  const logout = async () => {
    loading.value = true

    try {
      // Llamar al endpoint de logout
      await $fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      // Limpiar estado local
      user.value = null
      accessToken.value = null
      refreshToken.value = null

      // Limpiar localStorage
      if (process.client) {
        localStorage.removeItem('auth-access-token')
        localStorage.removeItem('auth-refresh-token')
        localStorage.removeItem('auth-user')
      }

      loading.value = false

      // Redirigir a login
      await navigateTo('/login')
    }
  }

  /**
   * Obtener usuario actual desde el backend
   */
  const getMe = async (retryWithRefresh = true): Promise<User | null> => {
    if (!accessToken.value) return null

    try {
      const response = await $fetch<{ success: boolean; data: User }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })

      if (response.success && response.data) {
        user.value = response.data

        // Actualizar en localStorage
        if (process.client) {
          localStorage.setItem('auth-user', JSON.stringify(response.data))
        }

        return response.data
      }

      return null
    } catch (e: any) {
      console.error('GetMe error:', e)

      // Si el token expiró (401) y podemos reintentar, intentar refrescar
      if (e.statusCode === 401 && retryWithRefresh && refreshToken.value) {
        console.log('Access token expirado, intentando refrescar...')

        const refreshed = await refreshAccessToken()

        if (refreshed) {
          // Reintentar getMe con el nuevo token (sin retry para evitar loop infinito)
          return await getMe(false)
        }
      }

      // Si no se pudo refrescar o es otro error, limpiar sesión
      await logout()
      return null
    }
  }

  /**
   * Refrescar access token usando refresh token
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value) return false

    try {
      const response = await $fetch<{
        success: boolean
        data: { accessToken: string; refreshToken: string }
      }>('/api/auth/refresh', {
        method: 'POST',
        body: {
          refreshToken: refreshToken.value,
        },
      })

      if (response.success && response.data) {
        accessToken.value = response.data.accessToken
        refreshToken.value = response.data.refreshToken

        // Actualizar en localStorage
        if (process.client) {
          localStorage.setItem('auth-access-token', response.data.accessToken)
          localStorage.setItem('auth-refresh-token', response.data.refreshToken)
        }

        return true
      }

      return false
    } catch (e) {
      console.error('Refresh token error:', e)
      await logout()
      return false
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: User['role'] | User['role'][]): boolean => {
    if (!user.value) return false

    if (Array.isArray(role)) {
      return role.includes(user.value.role)
    }

    return user.value.role === role
  }

  return {
    // Estado
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    // Computed
    isAuthenticated,
    isAdmin,
    // Métodos
    login,
    logout,
    getMe,
    refreshAccessToken,
    initAuth,
    hasRole,
  }
}
