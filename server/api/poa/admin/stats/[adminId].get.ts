/**
 * GET /api/poa/admin/stats/:adminId
 * Obtener estadísticas de POA de un administrador específico
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const adminId = getRouterParam(event, 'adminId')

  if (!adminId) {
    throw createError({
      statusCode: 400,
      message: 'ID de administrador requerido',
    })
  }

  try {
    const response = await $fetch(`${config.public.apiUrl}/poa/admin/stats/${adminId}`, {
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
      message: error.data?.message || 'Error al obtener las estadísticas del administrador',
    })
  }
})
