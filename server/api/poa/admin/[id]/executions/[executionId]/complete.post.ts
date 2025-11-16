/**
 * POST /api/poa/admin/:id/executions/:executionId/complete
 * Completar una ejecución
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const id = getRouterParam(event, 'id')
  const executionId = getRouterParam(event, 'executionId')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID de POA requerido',
    })
  }

  if (!executionId) {
    throw createError({
      statusCode: 400,
      message: 'ID de ejecución requerido',
    })
  }

  try {
    const response = await $fetch(
      `${config.public.apiUrl}/poa/admin/${id}/executions/${executionId}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
        body,
      }
    )

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al completar la ejecución',
    })
  }
})
