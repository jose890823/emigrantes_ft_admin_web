/**
 * POST /api/users
 * Crear nuevo usuario (usa el endpoint de registro)
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Obtener token de autorización
  const authHeader = getHeader(event, 'authorization')

  try {
    const response = await $fetch(`${config.public.apiUrl}/auth/register`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al crear usuario',
    })
  }
})
