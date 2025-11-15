# 🎛️ Emigrantes FT - Panel de Administración

Panel de administración para gestionar el sistema de Emigrantes FT.

## 🚀 Tech Stack

- **Framework**: Nuxt 3
- **UI Components**: shadcn-vue
- **Styling**: TailwindCSS
- **Icons**: lucide-vue-next
- **HTTP Client**: Axios
- **Utilities**: @vueuse/core

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar .env
cp .env.example .env

# Configurar la URL del API
# NUXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🏃 Ejecutar

```bash
# Modo desarrollo (Puerto 3002)
pnpm dev

# Build para producción
pnpm build

# Preview de producción
pnpm preview
```

## 🔑 Credenciales de prueba

Para probar el admin panel, necesitas crear un usuario admin en el backend.

## 📁 Estructura del Proyecto

```
app/
├── components/        # Componentes Vue
├── composables/      # Composables de Vue
├── layouts/          # Layouts
├── middleware/       # Middlewares de Nuxt
├── pages/            # Páginas
├── types/            # TypeScript types
└── utils/            # Utilidades
```

## 🌐 URLs

- **Frontend Admin**: http://localhost:3002
- **Frontend Clientes**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

---

**Fecha de creación**: 2025-11-15
**Versión**: 1.0.0
