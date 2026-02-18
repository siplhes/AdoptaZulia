/**
 * Toast Composable
 * Uses Ionic's toastController for native-style notifications
 */

import { toastController } from '@ionic/vue'

export function useToast() {
  async function showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'primary',
    duration = 3000
  ) {
    const toast = await toastController.create({
      message,
      duration,
      color,
      position: 'bottom',
      cssClass: 'custom-toast',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    })
    await toast.present()
  }

  async function success(message: string) {
    await showToast(message, 'success')
  }

  async function error(message: string) {
    await showToast(message, 'danger', 4000)
  }

  async function warning(message: string) {
    await showToast(message, 'warning')
  }

  async function info(message: string) {
    await showToast(message, 'primary')
  }

  return {
    showToast,
    success,
    error,
    warning,
    info,
  }
}
