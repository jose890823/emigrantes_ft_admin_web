/**
 * API: GET /api/personas/:id
 * Obtener una persona por ID
 */

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID es requerido'
    })
  }

  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // En producción, buscar en DB
  // const persona = await db.personas.findById(id)

  // Mock de persona
  const persona = {
    id: Number(id),
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    telefono: '+34 600 000 001',
    edad: 30,
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (!persona) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Persona no encontrada'
    })
  }

  return persona
})
