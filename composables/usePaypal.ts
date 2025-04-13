import { useNuxtApp } from '#imports'
import type { PayPalButtonsComponentOptions, PayPalNamespace } from '@paypal/paypal-js'

interface BaseOptions {
  /**
   *  Render Element
   *
   * @default #paypal-checkout
   *
   */
  element?: string
}

export async function usePaypalButton(options?: BaseOptions & PayPalButtonsComponentOptions) {
  const nuxt = useNuxtApp()
  const { element, ...settings } = options || {}
  
  try {
    if (!nuxt.$paypal) {
      if (typeof nuxt.$loadPayPalSDK !== 'function') {
        console.error('PayPal SDK loader not available')
        return null
      }
      const paypalSDK = await nuxt.$loadPayPalSDK()
      if (!paypalSDK) {
        console.error('Failed to load PayPal SDK')
        return null
      }
      nuxt.$paypal = paypalSDK
    }
    const paypal = nuxt.$paypal as any
    if (!paypal || typeof paypal.Buttons !== 'function') {
      console.error('PayPal Buttons functionality not available')
      return null
    }
    return await paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },
      ...settings
    }).render(element ?? '#paypal-checkout')
  } catch (error) {
    console.error('Error rendering PayPal buttons:', error)
    return null
  }
}
