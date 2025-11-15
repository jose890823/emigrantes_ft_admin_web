# Sistema de Layouts Dinámicos

Este proyecto incluye un sistema de layouts dinámicos que te permite cambiar fácilmente entre diferentes diseños de interfaz.

## Layouts Disponibles

### 1. **Layout Vacío** (`empty`)
- Sin menú ni navegación
- Contenido a pantalla completa
- Ideal para: páginas de login, landing pages, páginas 404, etc.
- Ubicación: `layouts/empty.vue`

### 2. **Sidebar Vertical** (`sidebar-vertical`) - **Default**
- Menú lateral colapsable a la izquierda
- Header con breadcrumbs
- Navegación moderna estilo dashboard
- Sidebar que se puede colapsar a iconos solamente
- Ideal para: aplicaciones administrativas, dashboards complejos
- Ubicación: `layouts/sidebar-vertical.vue`
- Componente: `components/layout/AppSidebar.vue`

### 3. **Menú Horizontal** (`horizontal-menu`)
- Menú en la parte superior
- Navegación horizontal responsive
- Menú móvil con drawer lateral
- Ideal para: aplicaciones con menos opciones de navegación, sitios web tradicionales
- Ubicación: `layouts/horizontal-menu.vue`

### 4. **Default** (`default`)
- Layout antiguo simple con sidebar básico
- Ubicación: `layouts/default.vue`

## Cómo Cambiar de Layout

### Método 1: Desde la Interfaz (Recomendado)

Cada layout (excepto el vacío) incluye un botón para cambiar de layout:

1. En **Sidebar Vertical**: Click en "Cambiar Layout" en el menú lateral
2. En **Menú Horizontal**: Click en el icono de cuadrícula (LayoutGridIcon) en la parte superior derecha
3. Selecciona el layout deseado del diálogo
4. La página se recargará automáticamente con el nuevo layout

### Método 2: Programáticamente

```typescript
// En cualquier componente
import { useLayout } from '~/composables/useLayout'

const { setLayout } = useLayout()

// Cambiar a sidebar vertical
setLayout('sidebar-vertical')

// Cambiar a menú horizontal
setLayout('horizontal-menu')

// Cambiar a layout vacío
setLayout('empty')

// Recargar para aplicar cambios
window.location.reload()
```

### Método 3: Por Página (No recomendado con sistema actual)

Si necesitas un layout específico para una página particular sin afectar el layout global, puedes usar `definePageMeta`:

```typescript
definePageMeta({
  layout: 'empty' // o 'sidebar-vertical', 'horizontal-menu', 'default'
})
```

**Nota:** El sistema actual gestiona el layout globalmente desde `app.vue`, por lo que si usas este método, puede entrar en conflicto con el layout global.

## Componentes del Sistema

### 1. `composables/useLayout.ts`
Composable que gestiona el estado del layout actual:

```typescript
export const useLayout = () => {
  const currentLayout: Ref<LayoutType>
  const setLayout: (layout: LayoutType) => void
  const getLayout: () => LayoutType
  const availableLayouts: Array<LayoutConfig>
}
```

### 2. `components/layout/LayoutSwitcher.vue`
Diálogo modal que permite seleccionar entre los layouts disponibles. Se incluye globalmente en `app.vue`.

### 3. `components/layout/AppSidebar.vue`
Componente de sidebar para el layout vertical con navegación modular y colapsable.

### 4. `components/layout/LanguageSwitcher.vue`
Selector de idioma reutilizable (ES/EN).

### 5. `app.vue`
Archivo principal que aplica el layout dinámicamente:

```vue
<template>
  <NuxtLayout :name="layoutName">
    <NuxtPage />
  </NuxtLayout>
  <LayoutSwitcher />
</template>
```

## Personalización

### Agregar un Nuevo Layout

1. **Crear el archivo de layout:**
   ```bash
   # Crear nuevo layout
   touch layouts/mi-nuevo-layout.vue
   ```

2. **Actualizar el tipo en `composables/useLayout.ts`:**
   ```typescript
   export type LayoutType = 'default' | 'empty' | 'sidebar-vertical' | 'horizontal-menu' | 'mi-nuevo-layout'
   ```

3. **Agregar a la lista de layouts disponibles:**
   ```typescript
   const availableLayouts = [
     // ... layouts existentes
     {
       value: 'mi-nuevo-layout',
       label: 'Mi Nuevo Layout',
       description: 'Descripción de mi layout'
     }
   ]
   ```

4. **Agregar icono en `LayoutSwitcher.vue`:**
   ```typescript
   const layoutIcons: Record<LayoutType, any> = {
     // ... iconos existentes
     'mi-nuevo-layout': MiIcono,
   }
   ```

### Modificar un Layout Existente

Simplemente edita el archivo del layout correspondiente en la carpeta `layouts/`.

### Cambiar el Layout por Defecto

Edita `composables/useLayout.ts`:

```typescript
const currentLayout = ref<LayoutType>('horizontal-menu') // Cambia aquí
```

## Estructura de Archivos

```
.
├── app.vue                           # Aplicación principal con layout dinámico
├── layouts/
│   ├── empty.vue                    # Layout vacío
│   ├── sidebar-vertical.vue         # Layout con sidebar vertical
│   ├── horizontal-menu.vue          # Layout con menú horizontal
│   └── default.vue                  # Layout por defecto antiguo
├── components/
│   └── layout/
│       ├── AppSidebar.vue          # Sidebar para layout vertical
│       ├── AppHeader.vue           # Header antiguo
│       ├── LanguageSwitcher.vue    # Selector de idioma
│       └── LayoutSwitcher.vue      # Modal para cambiar layouts
└── composables/
    └── useLayout.ts                 # Composable para gestión de layouts
```

## Características Adicionales

### Persistencia
El layout seleccionado se mantiene en memoria durante la sesión. Para persistir entre sesiones, podrías usar `localStorage`:

```typescript
// En useLayout.ts
const currentLayout = ref<LayoutType>(
  (localStorage.getItem('layout') as LayoutType) || 'sidebar-vertical'
)

const setLayout = (layout: LayoutType) => {
  currentLayout.value = layout
  localStorage.setItem('layout', layout)
}
```

### Navegación Modular
Los layouts `sidebar-vertical` y `horizontal-menu` obtienen automáticamente los módulos activos de `app/module-config.ts`, por lo que cualquier módulo nuevo que agregues aparecerá automáticamente en la navegación.

### Responsive
Todos los layouts son completamente responsive:
- **Sidebar Vertical**: Se colapsa a iconos en pantallas pequeñas
- **Menú Horizontal**: Se convierte en menú hamburguesa móvil

## Iconos Utilizados

Los layouts usan `lucide-vue-next` para los iconos. Iconos disponibles:
- HomeIcon
- UsersIcon
- PackageIcon
- SettingsIcon
- ChartBarIcon
- FileTextIcon
- LayoutGridIcon
- MenuIcon
- UserIcon

Para agregar más iconos, impórtalos de `lucide-vue-next`.

## Troubleshooting

### El layout no cambia
- Verifica que `app.vue` tenga `<NuxtLayout :name="layoutName">`
- Asegúrate de que no haya `definePageMeta` con layout en las páginas
- Recarga la página después de cambiar el layout

### Error "Cannot find module"
- Asegúrate de tener instalado `@radix-icons/vue`: `npm install @radix-icons/vue`
- Verifica que `lucide-vue-next` esté instalado

### El sidebar no aparece
- Verifica que el archivo `layouts/sidebar-vertical.vue` exista
- Asegúrate de tener todos los componentes de `ui/sidebar` instalados: `npx shadcn-vue@latest add sidebar`

## Migración desde Layout Fijo

Si tenías páginas con `definePageMeta({ layout: 'default' })`, simplemente elimina esa línea. El layout ahora se gestiona globalmente desde `app.vue`.

Antes:
```vue
<script setup>
definePageMeta({
  layout: 'default'
})
</script>
```

Después:
```vue
<script setup>
// Sin definePageMeta - el layout se gestiona desde app.vue
</script>
```
