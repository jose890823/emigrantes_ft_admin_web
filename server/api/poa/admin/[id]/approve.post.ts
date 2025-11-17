/**
 * POST /api/poa/admin/:id/approve
 * Aprobar un POA
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID de POA requerido',
    })
  }

  try {
    const response = await $fetch(`${config.public.apiUrl}/poa/admin/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body,
    })

    return response
  } catch (error: any) {
    console.error('Error al aprobar POA:', error)
    const errorMessage = error.data?.message || error.message || 'Error al aprobar el POA'
    const errorDetails = error.data?.error || error.data?.details || ''

    throw createError({
      statusCode: error.statusCode || error.status || 500,
      message: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
    })
  }
})
