/**
 * DELETE /api/poa/admin/:id/documents/:documentId
 * Eliminar un documento de un POA
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const id = getRouterParam(event, 'id')
  const documentId = getRouterParam(event, 'documentId')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID de POA requerido',
    })
  }

  if (!documentId) {
    throw createError({
      statusCode: 400,
      message: 'ID de documento requerido',
    })
  }

  try {
    const response = await $fetch(
      `${config.public.apiUrl}/poa/admin/${id}/documents/${documentId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    )

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al eliminar el documento',
    })
  }
})
