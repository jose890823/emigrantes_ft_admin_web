/**
 * POST /api/poa/admin/:id/documents
 * Subir un documento a un POA
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const id = getRouterParam(event, 'id')
  const formData = await readMultipartFormData(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID de POA requerido',
    })
  }

  if (!formData) {
    throw createError({
      statusCode: 400,
      message: 'No se recibieron datos',
    })
  }

  try {
    // Recrear FormData para el backend
    const backendFormData = new FormData()

    for (const part of formData) {
      if (part.filename) {
        // Es un archivo - convertir Buffer a Uint8Array
        const uint8Array = new Uint8Array(part.data)
        const blob = new Blob([uint8Array], { type: part.type })
        backendFormData.append(part.name || 'file', blob, part.filename)
      } else {
        // Es un campo de texto
        backendFormData.append(part.name || '', part.data.toString())
      }
    }

    const response = await $fetch(`${config.public.apiUrl}/poa/admin/${id}/documents`, {
      method: 'POST',
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
      body: backendFormData,
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al subir el documento',
    })
  }
})
