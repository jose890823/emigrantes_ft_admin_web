// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Módulos
  modules: [
    '@nuxtjs/tailwindcss',
  ],

  // Configuración del servidor de desarrollo
  devServer: {
    port: 3002, // Puerto diferente para admin
  },

  // Runtime config (variables de entorno)
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    },
  },

  // Configuración de la app
  app: {
    head: {
      title: 'Admin - Emigrantes FT',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Panel de administración - Emigrantes FT' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
    },
  },

  // TailwindCSS config
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },

  // TypeScript
  typescript: {
    strict: true,
    shim: false,
  },

  // Imports automáticos
  imports: {
    dirs: ['composables/**', 'utils/**'],
  },
})
