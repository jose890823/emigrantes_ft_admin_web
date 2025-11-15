/**
 * Middleware para rutas de invitados (login, etc.)
 * Redirige al dashboard si el usuario ya está autenticado
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Solo ejecutar en cliente
  if (process.client) {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')

    // Si ya está autenticado, redirigir al dashboard
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        const adminRoles = ['admin', 'super_admin', 'staff']

        if (adminRoles.includes(user.role)) {
          return navigateTo('/dashboard')
        }
      } catch (error) {
        // Si hay error, dejar pasar al login
      }
    }
  }
})
