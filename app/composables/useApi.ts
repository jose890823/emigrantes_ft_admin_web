import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '~/types/api'

/**
 * Composable para manejo de API
 * Proporciona una instancia de axios configurada con interceptores
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const router = useRouter()

  // Crear instancia de axios
  const api: AxiosInstance = axios.create({
    baseURL: config.public.apiBaseUrl as string,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Interceptor para agregar token a las requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Interceptor para manejar respuestas
  api.interceptors.response.use(
    (response) => {
      // Extraer data del wrapper de respuesta estándar
      return response.data
    },
    async (error) => {
      const originalRequest = error.config

      // Si es 401 y no es el endpoint de login, intentar refrescar token
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
        originalRequest._retry = true

        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const response = await axios.post<ApiResponse>(
              `${config.public.apiBaseUrl}/auth/refresh`,
              { refreshToken }
            )

            if (response.data.success && response.data.data) {
              const { accessToken, refreshToken: newRefreshToken } = response.data.data
              localStorage.setItem('accessToken', accessToken)
              localStorage.setItem('refreshToken', newRefreshToken)

              // Reintentar request original con nuevo token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              return api(originalRequest)
            }
          }
        } catch (refreshError) {
          // Si falla el refresh, logout
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          router.push('/login')
          return Promise.reject(refreshError)
        }
      }

      // Si es 403, redirigir a página de acceso denegado
      if (error.response?.status === 403) {
        router.push('/access-denied')
      }

      return Promise.reject(error)
    }
  )

  // Métodos helper
  const get = <T = any>(url: string, config?: AxiosRequestConfig) => {
    return api.get<T, ApiResponse<T>>(url, config)
  }

  const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.post<T, ApiResponse<T>>(url, data, config)
  }

  const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.put<T, ApiResponse<T>>(url, data, config)
  }

  const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.patch<T, ApiResponse<T>>(url, data, config)
  }

  const del = <T = any>(url: string, config?: AxiosRequestConfig) => {
    return api.delete<T, ApiResponse<T>>(url, config)
  }

  return {
    api,
    get,
    post,
    put,
    patch,
    delete: del,
  }
}
