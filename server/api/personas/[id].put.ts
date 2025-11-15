import type { UpdatePersonaDto } from '~/modules/persona/types'

/**
 * API: PUT /api/personas/:id
 * Actualizar persona existente
 */

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<UpdatePersonaDto>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID es requerido'
    })
  }

  // Validar email si se proporciona
  if (body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email inválido'
      })
    }
  }

  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // En producción, actualizar en DB
  const personaActualizada = {
    id: Number(id),
    ...body,
    updatedAt: new Date().toISOString(),
  }

  return personaActualizada
})
