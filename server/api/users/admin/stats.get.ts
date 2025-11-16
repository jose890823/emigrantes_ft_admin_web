/**
 * GET /api/users/admin/stats
 * Obtener estadísticas de usuarios (Admin)
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Obtener token de autorización
  const authHeader = getHeader(event, 'authorization')

  try {
    const response = await $fetch(`${config.public.apiUrl}/users/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al obtener estadísticas de usuarios',
    })
  }
})
