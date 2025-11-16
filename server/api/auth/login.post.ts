/**
 * API: POST /api/auth/login
 * Proxy al backend de autenticación
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    // Hacer proxy al backend real
    const response = await $fetch(`${config.public.apiUrl}/auth/login`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response
  } catch (error: any) {
    // Manejar errores del backend
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.message || 'Error en el login',
    })
  }
})
