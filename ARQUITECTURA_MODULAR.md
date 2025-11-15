# 🏗️ Arquitectura Modular - Nuxt 3

## 📋 Índice

1. [Visión General](#visión-general)
2. [Estructura de un Módulo](#estructura-de-un-módulo)
3. [Sistema de Auto-Descubrimiento](#sistema-de-auto-descubrimiento)
4. [Crear un Nuevo Módulo](#crear-un-nuevo-módulo)
5. [API Endpoints](#api-endpoints)
6. [Componentes Compartidos](#componentes-compartidos)
7. [Activar/Desactivar Módulos](#activardesactivar-módulos)
8. [Copiar y Pegar Módulos](#copiar-y-pegar-módulos)
9. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🎯 Visión General

Esta arquitectura modular permite:

✅ **Independencia Total**: Cada módulo contiene todo lo necesario para funcionar
✅ **Auto-Descubrimiento**: Las páginas y componentes se registran automáticamente
✅ **Plug & Play**: Copiar/pegar módulos entre proyectos
✅ **Activación/Desactivación**: Habilitar o deshabilitar módulos sin romper la app
✅ **Escalabilidad**: Agregar infinitos módulos sin complejidad
✅ **Organización**: Código agrupado por dominio de negocio

---

## 📦 Estructura de un Módulo

Cada módulo es completamente autónomo y sigue esta estructura:

```
modules/
└── persona/                    # Nombre del módulo
    ├── components/             # Componentes específicos del módulo
    │   ├── PersonaForm.vue
    │   ├── PersonaList.vue
    │   └── PersonaCard.vue
    ├── composables/            # Lógica de negocio reutilizable
    │   └── usePersonas.ts
    ├── pages/                  # Páginas del módulo
    │   ├── index.vue          # Ruta: /personas
    │   ├── crear.vue          # Ruta: /personas/crear
    │   └── [id].vue           # Ruta: /personas/:id
    ├── server/                 # API endpoints (opcional)
    │   └── api/
    │       └── personas/
    │           ├── index.get.ts
    │           ├── index.post.ts
    │           ├── [id].get.ts
    │           ├── [id].put.ts
    │           └── [id].delete.ts
    ├── types/                  # Tipos TypeScript
    │   └── index.ts
    ├── stores/                 # Stores Pinia (opcional)
    │   └── persona.store.ts
    ├── utils/                  # Utilidades específicas
    │   └── validators.ts
    └── tests/                  # Tests del módulo
        ├── components/
        └── composables/
```

### 🔍 Descripción de Carpetas

- **components/**: Componentes Vue exclusivos de este módulo
- **composables/**: Lógica de negocio (llamadas API, estado, validaciones)
- **pages/**: Páginas del módulo (se auto-registran en el router)
- **server/api/**: Endpoints de API del módulo
- **types/**: Interfaces y tipos TypeScript
- **stores/**: Estado global del módulo (Pinia)
- **utils/**: Funciones auxiliares
- **tests/**: Tests unitarios y de integración

---

## 🔄 Sistema de Auto-Descubrimiento

### Configuración de Módulos

Archivo: `modules/module-config.ts`

```typescript
export interface ModuleConfig {
  name: string      // Nombre del módulo (debe coincidir con la carpeta)
  enabled: boolean  // true = activo, false = desactivado
  route: string     // Ruta base del módulo
  icon?: string     // Icono para navegación
  label: string     // Etiqueta para mostrar
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
    name: 'producto',
    enabled: true,
    route: '/productos',
    icon: 'package',
    label: 'Productos'
  }
]
```

### Hook de Auto-Descubrimiento

En `nuxt.config.ts`:

```typescript
hooks: {
  'pages:extend'(pages) {
    const { modules } = require('./modules/module-config')
    const activeModules = modules.filter(m => m.enabled)

    activeModules.forEach((module) => {
      // Buscar páginas en modules/{nombre}/pages/
      const modulePath = path.resolve(__dirname, `modules/${module.name}/pages`)

      if (fs.existsSync(modulePath)) {
        // Registrar cada página automáticamente
        modulePages.forEach((pagefile) => {
          pages.push({
            name: `${module.name}-${pageName}`,
            path: routePath,
            file: path.resolve(modulePath, pagefile)
          })
        })
      }
    })
  }
}
```

### Auto-Descubrimiento de Componentes

En `nuxt.config.ts`:

```typescript
components: [
  // Componentes globales
  { path: '~/components', pathPrefix: false },

  // Componentes de módulos (locales)
  { path: '~/modules/*/components', pathPrefix: false, global: false },

  // Componentes compartidos entre módulos
  { path: '~/modules/_shared/components', pathPrefix: false, global: true }
]
```

---

## 🆕 Crear un Nuevo Módulo

### Paso 1: Crear Estructura de Carpetas

```bash
mkdir -p modules/producto/{components,composables,pages,server/api,types,stores,utils}
```

### Paso 2: Definir Tipos

`modules/producto/types/index.ts`:

```typescript
export interface Producto {
  id?: number
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  activo: boolean
}

export interface CreateProductoDto {
  nombre: string
  descripcion?: string
  precio: number
  stock: number
}
```

### Paso 3: Crear Composable

`modules/producto/composables/useProductos.ts`:

```typescript
import type { Producto, CreateProductoDto } from '../types'

export const useProductos = () => {
  const { items, loading, error, fetchAll, create, update, delete: deleteItem } =
    useCrud<Producto>({ endpoint: '/api/productos' })

  const obtenerProductos = async () => await fetchAll()

  const crearProducto = async (data: CreateProductoDto) => {
    const producto = await create({ ...data, activo: true })
    return producto
  }

  return {
    productos: items,
    loading,
    error,
    obtenerProductos,
    crearProducto,
  }
}
```

### Paso 4: Crear Página Principal

`modules/producto/pages/index.vue`:

```vue
<template>
  <div class="container py-8">
    <h1 class="text-2xl font-bold">Productos</h1>
    <div v-if="loading">Cargando...</div>
    <ul v-else>
      <li v-for="producto in productos" :key="producto.id">
        {{ producto.nombre }} - {{ producto.precio }}€
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { productos, loading, obtenerProductos } = useProductos()

onMounted(() => {
  obtenerProductos()
})

definePageMeta({
  layout: 'default'
})
</script>
```

### Paso 5: Registrar en module-config.ts

```typescript
{
  name: 'producto',
  enabled: true,
  route: '/productos',
  icon: 'package',
  label: 'Productos'
}
```

### Paso 6: Crear API Endpoints (opcional)

`server/api/productos/index.get.ts`:

```typescript
export default defineEventHandler(async (event) => {
  // Lógica para obtener productos
  return [
    { id: 1, nombre: 'Producto 1', precio: 10, stock: 50, activo: true }
  ]
})
```

---

## 🌐 API Endpoints

Los endpoints se crean dentro de `server/api/{modulo}/`:

### Convenciones de Nombres

| Archivo | Método | Ruta | Acción |
|---------|--------|------|--------|
| `index.get.ts` | GET | `/api/personas` | Listar todos |
| `index.post.ts` | POST | `/api/personas` | Crear nuevo |
| `[id].get.ts` | GET | `/api/personas/:id` | Obtener uno |
| `[id].put.ts` | PUT | `/api/personas/:id` | Actualizar |
| `[id].delete.ts` | DELETE | `/api/personas/:id` | Eliminar |

### Ejemplo Completo

`server/api/personas/index.get.ts`:

```typescript
import type { Persona } from '~/modules/persona/types'

export default defineEventHandler(async (event) => {
  // Obtener query params
  const query = getQuery(event)

  // Simular llamada a DB
  await new Promise(resolve => setTimeout(resolve, 500))

  // Retornar datos
  return [
    { id: 1, nombre: 'Juan', email: 'juan@test.com', activo: true }
  ]
})
```

`server/api/personas/index.post.ts`:

```typescript
import type { CreatePersonaDto } from '~/modules/persona/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CreatePersonaDto>(event)

  // Validación
  if (!body.nombre || !body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nombre y email requeridos'
    })
  }

  // Guardar en DB
  const nuevaPersona = {
    id: Date.now(),
    ...body,
    activo: true
  }

  return nuevaPersona
})
```

---

## 🔗 Componentes Compartidos

### Módulo `_shared`

Para componentes usados por múltiples módulos:

```
modules/
└── _shared/
    ├── components/
    │   ├── DataCard.vue
    │   ├── StatusBadge.vue
    │   └── LoadingSpinner.vue
    ├── composables/
    │   └── useSharedLogic.ts
    └── utils/
        └── helpers.ts
```

Estos componentes se auto-importan globalmente.

---

## ⚙️ Activar/Desactivar Módulos

### Desactivar un Módulo

En `modules/module-config.ts`:

```typescript
{
  name: 'producto',
  enabled: false,  // ← Cambiar a false
  route: '/productos',
  icon: 'package',
  label: 'Productos'
}
```

**Resultado:**
- ❌ No se registran sus páginas
- ❌ No aparece en el menú
- ✅ La app NO se rompe
- ✅ El código sigue ahí (solo desactivado)

### Reactivar

```typescript
enabled: true  // ← Cambiar a true
```

---

## 📋 Copiar y Pegar Módulos

### Entre Proyectos

```bash
# Copiar módulo completo
cp -r proyecto1/modules/persona proyecto2/modules/

# Copiar endpoints de API
cp -r proyecto1/server/api/personas proyecto2/server/api/
```

### Checklist al Pegar

- [ ] Copiar carpeta `modules/{nombre}/`
- [ ] Copiar `server/api/{nombre}/` (si existe)
- [ ] Agregar entrada en `module-config.ts`
- [ ] Verificar dependencias (composables globales)
- [ ] Ejecutar `npm run dev`

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Módulo Completo de Persona

Ver carpeta `modules/persona/`

**Incluye:**
- ✅ CRUD completo (crear, listar, editar, eliminar)
- ✅ Formulario con validación
- ✅ Tabla de datos
- ✅ API endpoints
- ✅ Composable con lógica de negocio
- ✅ Tipos TypeScript
- ✅ Componentes reutilizables

### Ejemplo 2: Módulo Simple

**Módulo Mínimo** (solo lectura):

```
modules/dashboard/
├── pages/
│   └── index.vue
└── types/
    └── index.ts
```

### Ejemplo 3: Módulo con Subpáginas

```
modules/configuracion/
├── pages/
│   ├── index.vue          # /configuracion
│   ├── perfil.vue         # /configuracion/perfil
│   ├── seguridad.vue      # /configuracion/seguridad
│   └── notificaciones.vue # /configuracion/notificaciones
```

---

## 🚀 Ventajas de Esta Arquitectura

1. **Modularidad**: Cada módulo es independiente
2. **Escalabilidad**: Agregar módulos sin complejidad
3. **Mantenibilidad**: Código organizado por dominio
4. **Reusabilidad**: Copiar módulos entre proyectos
5. **Testing**: Tests aislados por módulo
6. **Team Work**: Equipos pueden trabajar en módulos separados
7. **Deploy Selectivo**: Desactivar features sin eliminar código

---

## 📚 Recursos

- [Documentación Nuxt 3](https://nuxt.com/docs)
- [Nuxt Server Directory](https://nuxt.com/docs/guide/directory-structure/server)
- [Nuxt Pages](https://nuxt.com/docs/guide/directory-structure/pages)
- [Auto Imports](https://nuxt.com/docs/guide/concepts/auto-imports)

---

**¡Tu aplicación ahora es completamente modular!** 🎉
