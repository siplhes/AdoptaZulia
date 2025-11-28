// nuxt.config.ts - Optimizado para Nuxt 4

import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // ✨ 1. Alineación con Nuxt 4
  // La fecha de compatibilidad debería ser '2024-11-01' para alinearse con Nuxt 4
  compatibilityDate: '2024-11-01',

  devtools: { enabled: false },
  // **Nota sobre ssr: false:** Si buscas el máximo rendimiento (Modo Turbo) para renderizado
  // en el servidor o pre-renderizado, ssr debe ser true. ssr: false (SPA) evita muchas
  // de las optimizaciones de Nuxt en el servidor. Lo mantengo como lo tenías.
  ssr: false,

  // --- Optimizaciones de Rendimiento y DX (Modo Turbo) ---
  experimental: {
    // Activa el plugin de TypeScript mejorado para la Experiencia de Desarrollo (DX)
    typescriptPlugin: true,

    // Si usaras ssr: true, esto reduciría el bundle del cliente al extraer los handlers de datos:
    // extractAsyncDataHandlers: true, 
  },

  // --- Configuraciones Existentes ---
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    // "@pinia/nuxt",
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'nuxt-vuefire',
    'nuxt-booster'
  ],

  runtimeConfig: {
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    public: {
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
      awsRegion: process.env.AWS_REGION,
      awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
      awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
      awsS3BucketDomain: process.env.AWS_S3_BUCKET_DOMAIN,
      baseUrl: process.env.BASE_URL,
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        appId: process.env.FIREBASE_APP_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      },
      adminEmails: process.env.ADMIN_EMAILS,
    },
  },

  vuefire: {
    auth: {
      enabled: true,
      modularAuth: true,
    },
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      appId: process.env.FIREBASE_APP_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    },
    admin: false,
  },

  // 3. Optimizaciones de 'nitro' (Core del Modo Turbo)
  nitro: {
    // Esta es una buena práctica y ya está incluida:
    compressPublicAssets: true,
  },

  plugins: ['~/plugins/firebase.ts'],
  tailwindcss: {
    exposeConfig: true,
  },
  app: {
    head: {
      title: 'Adopta Zulia',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  image: {
    domains: [
      process.env.AWS_S3_BUCKET_DOMAIN || 'nsfwclothesmaracaibo.s3.us-east-2.amazonaws.com'
    ],
    ipx: {
      remote: {
        domains: [
          process.env.AWS_S3_BUCKET_DOMAIN || 'nsfwclothesmaracaibo.s3.us-east-2.amazonaws.com'
        ]
      }
    }
  },
  booster: {
    detection: {
      performance: true,
      browserSupport: true
    },
  },
  performanceMetrics: {
    device: {
      hardwareConcurrency: { min: 2, max: 48 },
      deviceMemory: { min: 2 }
    },
    timing: {
      fcp: 800,
      dcl: 1200
    }
  }
})