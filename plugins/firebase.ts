import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useFirebaseApp } from 'vuefire'
import { initializeDebugMode } from '~/utils/debugMode'

export default defineNuxtPlugin((nuxtApp) => {
  // Inicializar modo debug
  if (typeof window !== 'undefined') {
    initializeDebugMode()
  }

  try {
    let firebaseApp
    try {
      firebaseApp = useFirebaseApp()
    } catch (error) {
      const apps = getApps()
      if (apps.length > 0) {
        firebaseApp = getApp()
      } else {
        const config = useRuntimeConfig()

        const firebaseConfig = {
          apiKey: config.public.firebase?.apiKey,
          authDomain: config.public.firebase?.authDomain,
          projectId: config.public.firebase?.projectId,
          appId: config.public.firebase?.appId,
          storageBucket: config.public.firebase?.storageBucket,
          messagingSenderId: config.public.firebase?.messagingSenderId,
          measurementId: config.public.firebase?.measurementId,
          databaseURL: config.public.firebase?.databaseURL,
        }
        firebaseApp = initializeApp(firebaseConfig)

        if (typeof window !== 'undefined') {
          initializeAppCheck(firebaseApp, {
            provider: new ReCaptchaV3Provider(config.public.recaptchaSiteKey),
            isTokenAutoRefreshEnabled: true,
          })
        }
      }
    }

    const auth = getAuth(firebaseApp)
    const database = getDatabase(firebaseApp)
    return {
      provide: {
        firebaseAuthHelper: {
          isProduction: process.env.NODE_ENV === 'production',
          getErrorMessage: (errorCode: string) => {
            const errorMessages: Record<string, string> = {
              'auth/user-not-found': 'Usuario no encontrado',
              'auth/wrong-password': 'Contraseña incorrecta',
              'auth/invalid-email': 'Email inválido',
              'auth/email-already-in-use': 'Email ya en uso',
              'auth/weak-password': 'Contraseña débil',
              'auth/operation-not-allowed': 'Operación no permitida',
              'auth/too-many-requests': 'Demasiadas solicitudes, inténtalo más tarde',
              'auth/invalid-verification-code': 'Código de verificación inválido',
              'auth/invalid-verification-id': 'ID de verificación inválido',
              'auth/expired-action-code': 'Código de acción expirado',
              'auth/invalid-action-code': 'Código de acción inválido',
              'auth/invalid-credential': 'Credencial inválida',
            }

            return errorMessages[errorCode] || `Error desconocido: ${errorCode}`
          },
        },
      },
    }
  } catch (error) {
    return {}
  }
})
