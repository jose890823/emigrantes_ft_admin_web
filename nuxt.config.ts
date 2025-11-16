// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Emigrantes FT Admin',
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode'
  ],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },

  i18n: {
    defaultLocale: 'es',
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'es', file: 'es.json', name: 'Español' },
    ],
    langDir: './lang',
  },

  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  css: ['~/assets/css/main.css'],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    // Auto-descubrimiento de componentes de módulos
    {
      path: '~/modules/*/components',
      pathPrefix: false,
      global: false
    },
    {
      path: '~/modules/_shared/components',
      pathPrefix: false,
      global: true
    }
  ],
})
