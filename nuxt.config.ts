// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/eslint', '@vueuse/nuxt', 'shadcn-nuxt'],

  // shadcn-vue configuration
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    // Server-side environment variables
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-change-me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    databaseUrl: process.env.DATABASE_URL,

    // Public variables (exposed to client)
    public: {
      appName: 'Nuxt Base Project',
    },
  },

  app: {
    head: {
      title: 'Nuxt Base Project',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nuxt 3 base project with RBAC, Prisma, and shadcn-vue' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // Enable SSR for server-side rendering
  ssr: true,

  // Nitro server configuration
  nitro: {
    preset: 'node-server',
  },
})
