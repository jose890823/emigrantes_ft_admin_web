import { useAuth } from '~/modules/auth/composables/useAuth'

/**
 * Middleware de autenticación
 * Verifica que el usuario esté autenticado antes de acceder a rutas protegidas
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
