/**
 * GET /api/poa/admin/:id/documents
 * Obtener los documentos de un POA
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID de POA requerido',
    })
  }

  try {
    const response = await $fetch(`${config.public.apiUrl}/poa/admin/${id}/documents`, {
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
      message: error.data?.message || 'Error al obtener los documentos',
    })
  }
})
