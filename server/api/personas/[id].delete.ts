/**
 * API: DELETE /api/personas/:id
 * Eliminar persona
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

  // En producción, eliminar de DB
  // await db.personas.delete(id)

  return {
    success: true,
    message: 'Persona eliminada correctamente',
    id: Number(id)
  }
})
