import { useNuxtApp } from '#imports'
import type { PayPalButtonsComponentOptions } from '@paypal/paypal-js'

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
  
  if (!nuxt.$paypal) {
    console.error('PayPal SDK not loaded or not available')
    return null
  }

  try {
    return await nuxt.$paypal.Buttons({
      // Default configuration for PayPal buttons
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },
      // Merge user settings
      ...settings
    }).render(element ?? '#paypal-checkout')
  } catch (error) {
    console.error('Error rendering PayPal buttons:', error)
    return null
  }
}
