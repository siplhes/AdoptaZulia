import { defineNuxtConfig } from 'nuxt/config'
import 'dotenv/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: false },
  ssr: true,

  experimental: {
    typescriptPlugin: true,
    extractAsyncDataHandlers: true, 
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'nuxt-vuefire',
    'nuxt-booster',
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
 admin: {
      // AQUÍ ESTÁ LA CLAVE:
      // Si existe la variable, la parseamos. Si no, undefined (para evitar error en build)
       serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON 
         ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) 
         : undefined,
     },
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
        {
          name: 'Content-Security-Policy',
          content: process.env.NODE_ENV === 'production'
            ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://firebaseio.com https://*.firebaseio.com https://www.google-analytics.com; frame-src 'self' https://www.paypal.com; object-src 'none';"
            : "default-src 'self' 'unsafe-inline' 'unsafe-eval' *"
        }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  image: {
    domains: [
      process.env.AWS_S3_BUCKET_DOMAIN
    ],
    ipx: {
      remote: {
        domains: [
          process.env.AWS_S3_BUCKET_DOMAIN
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
  },

  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        }
      }
    }
  },


})