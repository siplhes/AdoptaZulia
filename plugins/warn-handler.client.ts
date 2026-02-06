import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const originalWarnHandler = nuxtApp.vueApp.config.warnHandler

  nuxtApp.vueApp.config.warnHandler = (msg: string, instance: any, trace: string) => {
    // Suppress Suspense warning
    if (msg.includes('<Suspense> is an experimental feature')) {
      return
    }
    
    // Suppress specific ToastContainer warnings if they still appear (though we removed the component)
    if (msg.includes('Failed to resolve component: ToastContainer')) {
      return
    }

    if (originalWarnHandler) {
      originalWarnHandler(msg, instance, trace)
    } else {
      console.warn(`[Vue warn]: ${msg}`, trace)
    }
  }
})
