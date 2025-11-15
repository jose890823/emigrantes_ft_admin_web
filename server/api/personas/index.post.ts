import type { Persona, CreatePersonaDto } from '~/modules/persona/types'

/**
 * API: POST /api/personas
 * Crear nueva persona
 */

export default defineEventHandler(async (event) => {
  const body = await readBody<CreatePersonaDto>(event)

  // Validación básica
  if (!body.nombre || !body.apellido || !body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nombre, apellido y email son requeridos'
    })
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email inválido'
    })
  }

  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Crear nueva persona (en producción guardar en DB)
  const nuevaPersona: Persona = {
    id: Date.now(), // ID temporal
    ...body,
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return nuevaPersona
})
