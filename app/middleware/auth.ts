/**
 * Middleware de autenticación
 * Verifica que el usuario esté autenticado antes de acceder a rutas protegidas
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Solo ejecutar en cliente
  if (process.client) {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')

    // Si no hay token, redirigir a login
    if (!token || !userStr) {
      return navigateTo('/login')
    }

    // Verificar que el usuario sea admin
    try {
      const user = JSON.parse(userStr)
      const adminRoles = ['admin', 'super_admin', 'staff']

      if (!adminRoles.includes(user.role)) {
        // Si no es admin, hacer logout y redirigir
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        return navigateTo('/login')
      }
    } catch (error) {
      // Si hay error parseando el usuario, limpiar y redirigir
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      return navigateTo('/login')
    }
  }
})
