// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

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
    locales: ['en', 'es'],
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
