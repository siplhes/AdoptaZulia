import { defineNuxtPlugin } from '#imports'
import { loadScript } from '@paypal/paypal-js'
import type { PayPalNamespace } from '@paypal/paypal-js'

export default defineNuxtPlugin((nuxtApp) => {
const loadPayPalSDK = async () => {
    const config = nuxtApp.$config.public.paypal
    try {
      return await loadScript({
        clientId: config.clientId,
        currency: config.currency || 'USD',
        intent: 'capture',
        enableFunding: 'card,credit,venmo,mercadopago',
        locale: 'es_ES',
      })
    } catch (error) {
      console.error('Failed to load the PayPal SDK script', error)
      return null
    }
  }

  return {
    provide: {
      loadPayPalSDK,
    },
  }
})
