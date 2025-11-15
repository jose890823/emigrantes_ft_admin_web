# Plantilla Base de Administración

Plantilla profesional y modular para proyectos de administración con **Nuxt 3**, **shadcn-vue**, **i18n** y **Vitest**.

Esta plantilla está diseñada con componentes reutilizables, composables para operaciones CRUD y configurada para ser completamente testeable.

## 🚀 Características

- ✅ **Nuxt 3** - Framework Vue.js de última generación
- ✅ **shadcn-vue** - Componentes UI elegantes y accesibles
- ✅ **Tailwind CSS** - Estilos utility-first
- ✅ **i18n** - Soporte multiidioma (Español/Inglés)
- ✅ **Vitest** - Testing unitario con cobertura
- ✅ **TypeScript** - Tipado estático
- ✅ **Composables CRUD** - Lógica reutilizable para operaciones CRUD
- ✅ **Componentes Reutilizables** - DataTable, FormField, ConfirmDialog, etc.

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm run test

# Tests con UI
npm run test:ui

# Coverage de tests
npm run test:coverage
```

## 📁 Estructura del Proyecto

```
plantilla_base/
├── assets/
│   └── css/
│       └── main.css              # Estilos globales y variables CSS
├── components/
│   ├── common/                   # Componentes comunes
│   │   ├── DataTable.vue         # Tabla de datos reutilizable
│   │   └── ConfirmDialog.vue     # Diálogo de confirmación
│   ├── forms/                    # Componentes de formulario
│   │   └── FormField.vue         # Campo de formulario con validación
│   ├── layout/                   # Componentes de layout
│   │   └── AppHeader.vue         # Cabecera de la aplicación
│   └── ui/                       # Componentes de shadcn-vue
├── composables/
│   ├── crud/
│   │   └── useCrud.ts            # Composable para operaciones CRUD
│   ├── api/
│   │   └── useFetch.ts           # Composable para peticiones API
│   └── useToast.ts               # Composable para notificaciones
├── locales/
│   ├── en.json                   # Traducciones en inglés
│   └── es.json                   # Traducciones en español
├── pages/
│   └── index.vue                 # Página de inicio con ejemplos
├── tests/
│   ├── unit/
│   │   ├── components/           # Tests de componentes
│   │   └── composables/          # Tests de composables
│   └── setup.ts                  # Configuración de tests
└── lib/
    └── utils.ts                  # Utilidades (cn para clases)
```

## 🎨 Componentes Incluidos

### DataTable

Tabla de datos reutilizable con acciones de editar y eliminar.

```vue
<template>
  <DataTable
    :data="items"
    :columns="columns"
    :loading="loading"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<script setup>
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
]
</script>
```

### FormField

Campo de formulario con label, validación y hints.

```vue
<template>
  <FormField
    v-model="form.email"
    label="Email"
    type="email"
    placeholder="usuario@ejemplo.com"
    :required="true"
    :error="errors.email"
    hint="Ingrese un email válido"
  />
</template>
```

### ConfirmDialog

Diálogo de confirmación reutilizable.

```vue
<template>
  <ConfirmDialog
    v-model:is-open="showDialog"
    title="Confirmar eliminación"
    description="¿Estás seguro de eliminar este registro?"
    confirm-variant="destructive"
    @confirm="handleConfirm"
  />
</template>
```

## 🔧 Composables

### useCrud

Composable para operaciones CRUD completas.

```typescript
import { useCrud } from '~/composables/crud/useCrud'

interface User {
  id?: number
  name: string
  email: string
}

const {
  items,
  loading,
  error,
  selectedItem,
  fetchAll,
  fetchOne,
  create,
  update,
  delete: deleteItem,
  setSelectedItem,
} = useCrud<User>({
  endpoint: '/api/users',
})

// Obtener todos los usuarios
await fetchAll()

// Crear nuevo usuario
await create({ name: 'Juan', email: 'juan@example.com' })

// Actualizar usuario
await update(1, { name: 'Juan Actualizado' })

// Eliminar usuario
await deleteItem(1)
```

### useToast

Composable para mostrar notificaciones.

```typescript
import { useToast } from '~/composables/useToast'

const { success, error, info, warning } = useToast()

// Mostrar notificaciones
success('Operación exitosa', 'El registro fue creado')
error('Error', 'No se pudo completar la operación')
info('Información', 'Datos actualizados')
warning('Advertencia', 'Verifica los datos')
```

## 🌐 i18n - Internacionalización

El proyecto soporta Español e Inglés por defecto.

```vue
<template>
  <div>
    <!-- Uso básico -->
    <h1>{{ $t('welcome') }}</h1>

    <!-- Con interpolación -->
    <p>{{ $t('crud.created', { resource: 'Usuario' }) }}</p>

    <!-- Cambiar idioma -->
    <button @click="locale = 'en'">English</button>
    <button @click="locale = 'es'">Español</button>
  </div>
</template>

<script setup>
const { locale } = useI18n()
</script>
```

### Agregar traducciones

Edita los archivos en `locales/`:

```json
// locales/es.json
{
  "welcome": "Bienvenido",
  "app": {
    "title": "Mi Aplicación"
  }
}

// locales/en.json
{
  "welcome": "Welcome",
  "app": {
    "title": "My Application"
  }
}
```

## 🧪 Testing

### Ejecutar tests

```bash
# Ejecutar todos los tests
npm run test

# Modo watch
npm run test -- --watch

# Con UI interactiva
npm run test:ui

# Generar coverage
npm run test:coverage
```

### Ejemplo de test

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '~/components/forms/FormField.vue'

describe('FormField', () => {
  it('should render label', () => {
    const wrapper = mount(FormField, {
      props: {
        label: 'Test Label',
        modelValue: '',
      },
    })

    expect(wrapper.text()).toContain('Test Label')
  })
})
```

## 🎨 Agregar Componentes de shadcn-vue

Puedes agregar más componentes de shadcn-vue usando el CLI:

```bash
# Ver componentes disponibles
npx shadcn-vue@latest add

# Agregar componentes específicos
npx shadcn-vue@latest add dialog select checkbox
```

## 🔨 Desarrollo

### Crear un nuevo módulo CRUD

1. Crea el composable:

```typescript
// composables/useProducts.ts
export const useProducts = () => {
  return useCrud<Product>({
    endpoint: '/api/products',
  })
}
```

2. Usa en tu componente:

```vue
<script setup>
const { items, loading, create, update, delete: deleteProduct } = useProducts()

await fetchAll()
</script>
```

### Crear un nuevo componente testeable

1. Crea el componente en `components/`
2. Crea el test en `tests/unit/components/`
3. Ejecuta los tests: `npm run test`

## 📝 Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run generate` - Generar sitio estático
- `npm run preview` - Preview de producción
- `npm run test` - Ejecutar tests
- `npm run test:ui` - Tests con interfaz visual
- `npm run test:coverage` - Generar reporte de cobertura

## 🤝 Contribuir

Esta plantilla está diseñada para ser extendida. Siéntete libre de:

- Agregar más componentes reutilizables
- Crear nuevos composables
- Mejorar los tests existentes
- Agregar más idiomas en i18n

## 📄 Licencia

MIT
