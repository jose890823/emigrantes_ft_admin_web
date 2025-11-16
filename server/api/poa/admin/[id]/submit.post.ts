/**
 * POST /api/poa/admin/:id/submit
 * Enviar un POA para revisión
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
    const response = await $fetch(`${config.public.apiUrl}/poa/admin/${id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body,
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al enviar el POA',
    })
  }
})
