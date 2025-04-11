// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,

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
      awsRegion: process.env.AWS_REGION || 'us-east-2',
      awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
      awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || 'nsfwclothesmaracaibo',
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      // Configuración de Firebase para que esté disponible en runtime config
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBp6uTcTIyfiupWWK8j3Pv4z-NNSxuTFUU',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'adopta-zulia.firebaseapp.com',
        projectId: process.env.FIREBASE_PROJECT_ID || 'adopta-zulia',
        appId: process.env.FIREBASE_APP_ID || '1:325688912375:web:0bcbc3bd0ce1244578a6f2',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'adopta-zulia.appspot.com',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '325688912375',
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-XG09Q05X45',
        databaseURL:
          process.env.FIREBASE_DATABASE_URL || 'https://adopta-zulia-default-rtdb.firebaseio.com/',
      },
    },
  },

  vuefire: {
    auth: {
      enabled: true, // Habilitamos la autenticación
      modularAuth: true, // Soporte modular
    },
    config: {
      apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBp6uTcTIyfiupWWK8j3Pv4z-NNSxuTFUU',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'adopta-zulia.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID || 'adopta-zulia',
      appId: process.env.FIREBASE_APP_ID || '1:325688912375:web:0bcbc3bd0ce1244578a6f2',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'adopta-zulia.appspot.com',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '325688912375',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-XG09Q05X45',
      databaseURL:
        process.env.FIREBASE_DATABASE_URL || 'https://adopta-zulia-default-rtdb.firebaseio.com/',
    },
    // Opciones adicionales para servicios de Firebase
    admin: {
      serviceAccount: false, // No estamos usando Firebase Admin en el lado servidor
    },
    appCheck: {
      provider: 'reCaptcha', // Si usamos reCaptcha para AppCheck
      debug: process.env.NODE_ENV !== 'production',
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

  // Asegurarnos de que el plugin de firebase se cargue después de que nuxt-vuefire
  // haya inicializado Firebase
  plugins: ['~/plugins/firebase.ts', '~/plugins/paypal.ts'],

  // PayPal configuration
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || 'test',
    currency: 'USD',
  },
})
