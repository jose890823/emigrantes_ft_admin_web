/**
 * PATCH /api/users/admin/:id/role
 * Cambiar rol del usuario (Solo Super Admin)
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Obtener token de autorización
  const authHeader = getHeader(event, 'authorization')

  try {
    const response = await $fetch(`${config.public.apiUrl}/users/admin/${id}/role`, {
      method: 'PATCH',
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
      message: error.data?.message || 'Error al cambiar rol del usuario',
    })
  }
})
