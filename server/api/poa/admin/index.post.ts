/**
 * POST /api/poa/admin
 * Crear un nuevo POA
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const body = await readBody(event)

  try {
    const response = await $fetch(`${config.public.apiUrl}/poa/admin`, {
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
      message: error.data?.message || 'Error al crear el POA',
    })
  }
})
