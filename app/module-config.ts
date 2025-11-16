/**
 * Configuración de módulos
 *
 * Aquí se registran todos los módulos activos de la aplicación.
 * Para desactivar un módulo, simplemente comentar o eliminar su entrada.
 */

export interface ModuleConfig {
  name: string
  enabled: boolean
  route: string
  icon?: string
  label: string
}

export const modules: ModuleConfig[] = [
  {
    name: 'persona',
    enabled: true,
    route: '/personas',
    icon: 'users',
    label: 'Personas'
  },
  {
    name: 'users',
    enabled: true,
    route: '/users',
    icon: 'users',
    label: 'Usuarios'
  },
  {
    name: 'poa',
    enabled: true,
    route: '/poa',
    icon: 'file',
    label: 'Poderes Notariales'
  },
  {
    name: 'producto',
    enabled: true,
    route: '/productos',
    icon: 'package',
    label: 'Productos'
  }
]

/**
 * Obtener solo módulos activos
 */
export const getActiveModules = () => modules.filter(m => m.enabled)

/**
 * Verificar si un módulo está activo
 */
export const isModuleActive = (moduleName: string) => {
  const module = modules.find(m => m.name === moduleName)
  return module?.enabled ?? false
}
