import type { User, LoginRequest, LoginResponse } from '~/types/api'

/**
 * Composable para manejo de autenticación de administradores
 */
export const useAuth = () => {
  const api = useApi()
  const router = useRouter()

  // Estado reactivo del usuario
  const user = useState<User | null>('user', () => {
    if (process.client) {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    }
    return null
  })

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'super_admin' || user.value?.role === 'staff'
  })
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')

  /**
   * Login de administrador
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials)

      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data

        // Verificar que el usuario sea admin
        if (!['admin', 'super_admin', 'staff'].includes(userData.role)) {
          return {
            success: false,
            error: 'Acceso denegado. Solo administradores pueden acceder.',
          }
        }

        // Guardar tokens y usuario
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(userData))
        user.value = userData

        return { success: true, user: userData }
      }

      return {
        success: false,
        error: response.error?.message || 'Error al iniciar sesión',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Error al iniciar sesión',
      }
    }
  }

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Error al hacer logout:', error)
    } finally {
      // Limpiar datos locales
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      user.value = null
      router.push('/login')
    }
  }

  /**
   * Obtener usuario actual
   */
  const getMe = async () => {
    try {
      const response = await api.get<User>('/auth/me')

      if (response.success && response.data) {
        // Verificar que siga siendo admin
        if (!['admin', 'super_admin', 'staff'].includes(response.data.role)) {
          await logout()
          return { success: false, error: 'Acceso denegado' }
        }

        localStorage.setItem('user', JSON.stringify(response.data))
        user.value = response.data
        return { success: true, user: response.data }
      }

      return { success: false, error: 'Error al obtener usuario' }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      }
    }
  }

  /**
   * Verificar autenticación al cargar la app
   */
  const checkAuth = async () => {
    if (process.client) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        await getMe()
      }
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    login,
    logout,
    getMe,
    checkAuth,
  }
}
