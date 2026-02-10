import { ref } from 'vue'

export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const add = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      duration: 3000, // Duración por defecto
      ...toast,
    }

    toasts.value.push(newToast)

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, newToast.duration)
    }
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (message: string, title?: string) => {
    add({ type: 'success', message, title })
  }

  const error = (message: string, title?: string) => {
    add({ type: 'error', message, title, duration: 5000 })
  }

  const info = (message: string, title?: string) => {
    add({ type: 'info', message, title })
  }

  const warning = (message: string, title?: string) => {
    add({ type: 'warning', message, title })
  }

  return {
    toasts,
    add,
    remove,
    success,
    error,
    info,
    warning,
  }
}
