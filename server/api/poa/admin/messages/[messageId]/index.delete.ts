/**
 * DELETE /api/poa/admin/messages/:messageId
 * Eliminar un mensaje no leído
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const messageId = getRouterParam(event, 'messageId')

  if (!messageId) {
    throw createError({
      statusCode: 400,
      message: 'ID de mensaje requerido',
    })
  }

  try {
    const response = await $fetch(`${config.public.apiUrl}/poa/admin/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al eliminar el mensaje',
    })
  }
})
