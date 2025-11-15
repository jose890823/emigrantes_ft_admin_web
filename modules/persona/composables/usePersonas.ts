import { useCrud } from '~/composables/crud/useCrud'
import { useToast } from '~/composables/useToast'
import type { Persona, CreatePersonaDto, UpdatePersonaDto } from '../types'

/**
 * Composable para el módulo Persona
 * Maneja toda la lógica de negocio del módulo
 */
export const usePersonas = () => {
  const { items, loading, error, fetchAll, create, update, delete: deleteItem } = useCrud<Persona>({
    endpoint: '/api/personas'
  })

  /**
   * Obtener todas las personas
   */
  const obtenerPersonas = async () => {
    await fetchAll()
  }

  /**
   * Crear nueva persona
   */
  const crearPersona = async (data: CreatePersonaDto) => {
    const persona = await create({ ...data, activo: true })
    if (persona) {
      const { success } = useToast()
      success('Persona creada', `${data.nombre} ${data.apellido} fue creado exitosamente`)
    }
    return persona
  }

  /**
   * Actualizar persona
   */
  const actualizarPersona = async (id: number, data: UpdatePersonaDto) => {
    const persona = await update(id, data)
    if (persona) {
      const { success } = useToast()
      success('Persona actualizada', 'Los cambios se guardaron correctamente')
    }
    return persona
  }

  /**
   * Eliminar persona
   */
  const eliminarPersona = async (id: number) => {
    const result = await deleteItem(id)
    if (result) {
      const { success } = useToast()
      success('Persona eliminada', 'La persona fue eliminada correctamente')
    }
    return result
  }

  /**
   * Buscar personas por término
   */
  const buscarPersonas = (termino: string) => {
    return computed(() =>
      items.value.filter((p: Persona) =>
        p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        p.apellido.toLowerCase().includes(termino.toLowerCase()) ||
        p.email.toLowerCase().includes(termino.toLowerCase())
      )
    )
  }

  /**
   * Filtrar personas activas
   */
  const personasActivas = computed(() => items.value.filter((p: Persona) => p.activo))

  /**
   * Filtrar personas inactivas
   */
  const personasInactivas = computed(() => items.value.filter((p: Persona) => !p.activo))

  /**
   * Total de personas
   */
  const totalPersonas = computed(() => items.value.length)

  return {
    // Estado
    personas: items,
    loading,
    error,
    personasActivas,
    personasInactivas,
    totalPersonas,

    // Acciones
    obtenerPersonas,
    crearPersona,
    actualizarPersona,
    eliminarPersona,
    buscarPersonas,
  }
}
