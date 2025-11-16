/**
 * GET /api/users/admin/search
 * Buscar usuarios (Admin)
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  // Obtener token de autorización
  const authHeader = getHeader(event, 'authorization')

  try {
    const response = await $fetch(`${config.public.apiUrl}/users/admin/search`, {
      method: 'GET',
      query,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al buscar usuarios',
    })
  }
})
