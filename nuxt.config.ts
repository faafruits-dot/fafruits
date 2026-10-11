// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      title: 'FA Fruits — منصة هدايا الفواكه الفاخرة',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Amiri:ital,wght@0,400;0,700;1,700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap'
        },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // ⭐ SSR + Nitro — التصحيح الأساسي
  // ═══════════════════════════════════════════════════
  ssr: true,

  nitro: {
    preset: 'vercel',   // ⭐ SSR + API routes على Vercel
  },

  vite: {
    optimizeDeps: { include: ['lucide-vue-next'] },
  },

  // ═══════════════════════════════════════════════════
  // ⭐ Runtime Config
  // ═══════════════════════════════════════════════════
  runtimeConfig: {
    // ═══ Private (سيرفر فقط — لا تُرسل للعميل) ═══
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,

    // ═══ Public (متاح في العميل + السيرفر) ═══
    public: {
      supabaseUrl:     process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
})