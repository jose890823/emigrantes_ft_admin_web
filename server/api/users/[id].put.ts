/**
 * PUT /api/users/:id
 * Actualizar un usuario
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  console.log('🌐 API Route - Body received:', {
    isActive: body.isActive,
    emailVerified: body.emailVerified,
    phoneVerified: body.phoneVerified,
  })

  // Obtener token de autorización
  const authHeader = getHeader(event, 'authorization')

  try {
    const response = await $fetch(`${config.public.apiUrl}/users/admin/${id}`, {
      method: 'PUT',
      body,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    console.log('🌐 API Route - Backend response:', {
      success: (response as any).success,
      isActive: (response as any).data?.isActive,
      emailVerified: (response as any).data?.emailVerified,
      phoneVerified: (response as any).data?.phoneVerified,
    })

    return response
  } catch (error: any) {
    console.error('🌐 API Route - Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al actualizar usuario',
    })
  }
})
