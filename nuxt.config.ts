// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  ssr: true,

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
    'nuxt-paypal',
  ],

  // Variables de entorno públicas y privadas
  runtimeConfig: {
    // Claves privadas (solo del lado del servidor)
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    // Claves que se exponen al cliente
    public: {
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || 'test',
        currency: 'USD',
      },
      awsRegion: process.env.AWS_REGION,
      awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
      awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
      baseUrl: process.env.BASE_URL,
      // Configuración de Firebase para que esté disponible en runtime config
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
    },
  },

  vuefire: {
    auth: {
      enabled: true, // Habilitamos la autenticación
      modularAuth: true, // Soporte modular
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
    // IMPORTANTE: Desactivamos la inicialización automática de Firebase Admin
    // ya que lo estamos manejando manualmente a través de nuestro plugin de Nitro
    admin: false,
    appCheck: {
      provider: 'reCaptcha', // Si usamos reCaptcha para AppCheck
      debug: process.env.NODE_ENV !== 'production',
    },
  },

  plugins: ['~/plugins/firebase.ts', '~/plugins/paypal.ts'],

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || 'test',
    currency: 'USD',

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
    inject: true,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      '2xl': 1536,
    },
  },
})
