import type { Persona } from '~/modules/persona/types'

/**
 * API: GET /api/personas
 * Obtener todas las personas
 */

// Datos mock (en producción esto vendría de una base de datos)
let personas: Persona[] = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    telefono: '+34 600 000 001',
    edad: 30,
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: 'María',
    apellido: 'García',
    email: 'maria.garcia@example.com',
    telefono: '+34 600 000 002',
    edad: 25,
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'López',
    email: 'carlos.lopez@example.com',
    telefono: '+34 600 000 003',
    edad: 35,
    activo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default defineEventHandler(async (event) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500))

  // Obtener query params para filtros
  const query = getQuery(event)

  let result = [...personas]

  // Filtrar por búsqueda
  if (query.search) {
    const search = String(query.search).toLowerCase()
    result = result.filter(p =>
      p.nombre.toLowerCase().includes(search) ||
      p.apellido.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search)
    )
  }

  // Filtrar por activo
  if (query.activo !== undefined) {
    const activo = query.activo === 'true'
    result = result.filter(p => p.activo === activo)
  }

  return result
})
