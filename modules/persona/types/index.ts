/**
 * Tipos del módulo Persona
 */

export interface Persona {
  id?: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  edad?: number
  activo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreatePersonaDto {
  nombre: string
  apellido: string
  email: string
  telefono?: string
  edad?: number
}

export interface UpdatePersonaDto extends Partial<CreatePersonaDto> {
  activo?: boolean
}

export interface PersonaFilters {
  search?: string
  activo?: boolean
  minEdad?: number
  maxEdad?: number
}
