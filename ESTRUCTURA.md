# Estructura del Proyecto - Plantilla Base de Administración

## ✅ Estado del Proyecto

**Compilación:** ✅ Exitosa
**Servidor Dev:** ✅ Funcionando en http://localhost:3001
**Tests:** ✅ Configurados (Vitest)
**TypeScript:** ✅ Sin errores

---

## 📁 Estructura Completa

```
plantilla_base/
├── .nuxt/                      # Archivos generados por Nuxt (auto)
├── .output/                    # Build de producción
├── assets/
│   └── css/
│       └── main.css           # Variables CSS y Tailwind
├── components/
│   ├── common/
│   │   ├── DataTable.vue      # ✅ Tabla de datos con acciones
│   │   └── ConfirmDialog.vue  # ✅ Diálogo de confirmación
│   ├── forms/
│   │   └── FormField.vue      # ✅ Campo de formulario validado
│   ├── layout/
│   │   └── AppHeader.vue      # ✅ Header con cambio de idioma
│   └── ui/                    # Componentes shadcn-vue
│       ├── button/            # ✅ Button
│       ├── card/              # ✅ Card + CardHeader, etc.
│       ├── input/             # ✅ Input
│       └── label/             # ✅ Label
├── composables/
│   ├── crud/
│   │   └── useCrud.ts         # ✅ CRUD completo (fetch, create, update, delete)
│   ├── api/
│   │   └── useFetch.ts        # ✅ Fetch con manejo de estado
│   └── useToast.ts            # ✅ Sistema de notificaciones
├── lang/                       # Traducciones (copia de locales)
├── locales/                    # Traducciones originales
│   ├── en.json                # ✅ Inglés
│   └── es.json                # ✅ Español
├── lib/
│   └── utils.ts               # ✅ Utilidad cn() para clases
├── pages/
│   └── index.vue              # ✅ Página demo con ejemplos
├── public/                     # Archivos estáticos
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── DataTable.test.ts    # ✅ Tests de DataTable
│   │   │   └── FormField.test.ts    # ✅ Tests de FormField
│   │   └── composables/
│   │       ├── useCrud.test.ts      # ✅ Tests de useCrud
│   │       └── useToast.test.ts     # ✅ Tests de useToast
│   └── setup.ts               # ✅ Setup de tests (mocks i18n)
├── app.vue                    # ✅ App principal
├── components.json            # ✅ Config shadcn-vue
├── i18n.config.ts             # ✅ Config i18n inline
├── nuxt.config.ts             # ✅ Config Nuxt principal
├── package.json               # ✅ Dependencias
├── tailwind.config.js         # ✅ Config Tailwind + animaciones
├── tsconfig.json              # ✅ Config TypeScript
├── vitest.config.ts           # ✅ Config Vitest
└── README.md                  # ✅ Documentación completa
```

---

## 🎯 Componentes Creados

### 1. **DataTable** (`components/common/DataTable.vue`)
- Tabla de datos genérica con tipos TypeScript
- Estados: loading, error, data
- Acciones: edit, delete
- Slots customizables para celdas
- Totalmente reutilizable

### 2. **FormField** (`components/forms/FormField.vue`)
- Campo de formulario con label
- Validación y mensajes de error
- Hints opcionales
- Required indicator (*)
- Disabled state

### 3. **ConfirmDialog** (`components/common/ConfirmDialog.vue`)
- Modal de confirmación reutilizable
- Customizable (title, description, buttons)
- Variantes de botón (default, destructive)
- Slots para contenido personalizado

### 4. **AppHeader** (`components/layout/AppHeader.vue`)
- Header con cambio de idioma ES/EN
- Logo y título i18n
- Sticky header con backdrop blur

---

## 🔧 Composables Creados

### 1. **useCrud** (`composables/crud/useCrud.ts`)
```typescript
const {
  items,          // ref<T[]>
  loading,        // ref<boolean>
  error,          // ref<string | null>
  selectedItem,   // ref<T | null>
  fetchAll,       // () => Promise<void>
  fetchOne,       // (id) => Promise<T | null>
  create,         // (data) => Promise<T | null>
  update,         // (id, data) => Promise<T | null>
  delete,         // (id) => Promise<boolean>
  setSelectedItem // (item) => void
} = useCrud<User>({ endpoint: '/api/users' })
```

### 2. **useFetch** (`composables/api/useFetch.ts`)
```typescript
const {
  data,      // ref<T | null>
  loading,   // ref<boolean>
  error,     // ref<Error | null>
  execute,   // () => Promise<void>
  refresh    // () => Promise<void>
} = useApiFetch<User>('/api/user')
```

### 3. **useToast** (`composables/useToast.ts`)
```typescript
const {
  toasts,       // ref<Toast[]>
  success,      // (title, desc?) => string
  error,        // (title, desc?) => string
  info,         // (title, desc?) => string
  warning,      // (title, desc?) => string
  removeToast   // (id) => void
} = useToast()
```

---

## 🧪 Testing

### Configurado con:
- Vitest + @vue/test-utils
- Happy DOM
- Coverage con v8
- 4 archivos de test creados

### Ejecutar tests:
```bash
npm run test              # Ejecutar todos los tests
npm run test:ui           # UI interactiva
npm run test:coverage     # Con coverage
```

---

## 🌐 i18n (Internacionalización)

### Configuración
- **Idiomas:** Español (por defecto) e Inglés
- **Configuración:** `i18n.config.ts` (inline)
- **Módulo:** @nuxtjs/i18n v10+

### Uso en componentes:
```vue
<template>
  <h1>{{ $t('welcome') }}</h1>
  <p>{{ $t('crud.created', { resource: 'Usuario' }) }}</p>
</template>

<script setup>
const { locale } = useI18n()
locale.value = 'en' // Cambiar idioma
</script>
```

---

## 🎨 shadcn-vue

### Componentes instalados:
- ✅ Button (con variantes)
- ✅ Card (con Header, Content, Footer)
- ✅ Input
- ✅ Label

### Agregar más componentes:
```bash
npx shadcn-vue@latest add dialog select checkbox
```

---

## 📦 Scripts NPM

```bash
npm run dev              # Desarrollo (http://localhost:3001)
npm run build            # Build de producción
npm run generate         # Generar sitio estático
npm run preview          # Preview del build
npm run test             # Tests con Vitest
npm run test:ui          # Tests con UI
npm run test:coverage    # Coverage de tests
```

---

## 🚀 Características Principales

1. ✅ **Arquitectura Modular**
   - Componentes reutilizables
   - Composables para lógica compartida
   - Separación clara de responsabilidades

2. ✅ **100% TypeScript**
   - Tipado estricto
   - Genéricos en composables
   - Sin errores de compilación

3. ✅ **Testeable**
   - Tests unitarios configurados
   - Mocks para i18n
   - Ejemplos de tests para componentes y composables

4. ✅ **i18n Ready**
   - Español e Inglés
   - Fácil agregar más idiomas
   - Traducciones inline

5. ✅ **UI Moderna**
   - shadcn-vue + Tailwind CSS
   - Dark mode preparado
   - Responsive by default

6. ✅ **Developer Experience**
   - Hot reload
   - TypeScript autocompletado
   - DevTools incluidas

---

## 📝 Próximos Pasos

1. **Agregar más componentes shadcn-vue:**
   ```bash
   npx shadcn-vue@latest add dialog select checkbox toast
   ```

2. **Crear más páginas:**
   - Crear archivos en `/pages`
   - Nuxt crea rutas automáticamente

3. **Configurar API:**
   - Usar `useCrud` con tu endpoint real
   - Configurar proxy en `nuxt.config.ts` si es necesario

4. **Agregar autenticación:**
   - Crear composable `useAuth`
   - Middleware de rutas protegidas

5. **Mejorar tests:**
   - Aumentar coverage
   - Tests e2e con Playwright

---

## 🎓 Ejemplos de Uso

Ver `pages/index.vue` para ejemplos completos de:
- Uso de DataTable
- Formularios con FormField
- Diálogos de confirmación
- Cambio de idioma
- Integración de shadcn-vue

---

## 📚 Documentación

- **Nuxt 3:** https://nuxt.com/docs
- **shadcn-vue:** https://www.shadcn-vue.com
- **Tailwind CSS:** https://tailwindcss.com
- **i18n:** https://i18n.nuxtjs.org
- **Vitest:** https://vitest.dev

---

**Creado con ❤️ usando Nuxt 3 + shadcn-vue + TypeScript**
