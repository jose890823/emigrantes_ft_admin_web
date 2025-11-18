/**
 * PATCH /api/poa/admin/threads/:threadId/reopen
 * Reabrir un hilo de conversación cerrado
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const threadId = getRouterParam(event, 'threadId')

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'ID de hilo requerido',
    })
  }

  try {
    const response = await $fetch(`${config.public.apiUrl}/poa/admin/threads/${threadId}/reopen`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al reabrir el hilo',
    })
  }
})
