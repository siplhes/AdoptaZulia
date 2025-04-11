import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useFirebaseApp } from 'vuefire'

export default defineNuxtPlugin((nuxtApp) => {
  const logger = {
    log: (message: string) => console.log(`[Firebase Plugin] ${message}`),
    error: (message: string, error?: any) =>
      console.error(`[Firebase Plugin] ${message}`, error || ''),
  }

  logger.log('Iniciando plugin de Firebase')

  try {
    let firebaseApp
    try {
      firebaseApp = useFirebaseApp()
      logger.log('Usando instancia de Firebase ya existente de VueFire')
    } catch (error) {
      const apps = getApps()
      if (apps.length > 0) {
        firebaseApp = getApp()
        logger.log('Usando instancia existente de Firebase')
      } else {
        logger.log('No hay instancia de Firebase, configurando una nueva')
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

        logger.log('Inicializando nueva instancia de Firebase')
        firebaseApp = initializeApp(firebaseConfig)
      }
    }

    const auth = getAuth(firebaseApp)
    const database = getDatabase(firebaseApp)

    logger.log('Firebase inicializado correctamente')


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
    logger.error('Error al configurar Firebase:', error)
    return {}
  }
})
