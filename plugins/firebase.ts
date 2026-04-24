import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { initializeDebugMode } from '~/utils/debugMode'

export default defineNuxtPlugin(async () => {
  if (typeof window === 'undefined') {
    return {}
  }

  initializeDebugMode()

  try {
    const { useFirebaseApp } = await import('vuefire')
    const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check')
    const firebaseApp = useFirebaseApp()
    const config = useRuntimeConfig()

    if (config.public.recaptchaSiteKey) {
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaV3Provider(config.public.recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      })
    }
  } catch (error) {
    console.warn('firebase client plugin skip initializeAppCheck:', error)
  }

  return {}
})
