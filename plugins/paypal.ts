import { defineNuxtPlugin } from '#imports'
import { loadScript } from '@paypal/paypal-js'
import type { PayPalNamespace } from '@paypal/paypal-js'

export default defineNuxtPlugin(async (nuxtApp) => {
  let paypal: PayPalNamespace | null = null

  const config = nuxtApp.$config.public.paypal

  try {
    paypal = await loadScript({
      clientId: config.clientId,
      currency: config.currency || 'USD',
      intent: 'capture',
      enableFunding: 'card,credit,venmo,mercadopago',
      locale: 'es_ES',
      // Puedes agregar más opciones aquí según sea necesario
      // https://developer.paypal.com/sdk/js/configuration/
    })
  } catch (error) {
    console.error('Failed to load the PayPal SDK script', error)
  }

  return {
    provide: {
      paypal,
    },
  }
})
