/**
 * GET /api/poa/admin/stats
 * Obtener estadísticas generales de POAs
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  try {
    const response = await $fetch(`${config.public.apiUrl}/poa/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    return response
  } catch (error: any) {
    console.error('Error fetching POA stats:', error)
    console.error('Error data:', error.data)
    console.error('Error statusCode:', error.statusCode)
    throw createError({
      statusCode: error.statusCode || error.status || 500,
      message: error.data?.message || error.message || 'Error al obtener las estadísticas',
    })
  }
})
