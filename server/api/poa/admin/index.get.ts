/**
 * GET /api/poa/admin
 * Obtener lista de POAs con filtros y paginación
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const query = getQuery(event)

  try {
    // Construir query string con los filtros
    const queryParams = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })

    const queryString = queryParams.toString()
    // CORRECCIÓN: El backend usa /poa/admin/all para listar todos los POAs
    const url = `${config.public.apiUrl}/poa/admin/all${queryString ? `?${queryString}` : ''}`

    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Error al obtener los POAs',
    })
  }
})
