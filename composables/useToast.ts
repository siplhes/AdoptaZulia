import { ref } from 'vue'

interface Toast {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
    const showToast = (toast: Omit<Toast, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const newToast = { ...toast, id, duration: toast.duration || 3000 }
        toasts.value.push(newToast)

        setTimeout(() => {
            removeToast(id)
        }, newToast.duration)

        return id
    }

    const removeToast = (id: string) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    const success = (title: string, message: string, duration?: number) => {
        return showToast({ type: 'success', title, message, duration })
    }

    const error = (title: string, message: string, duration?: number) => {
        return showToast({ type: 'error', title, message, duration: duration || 5000 })
    }

    const warning = (title: string, message: string, duration?: number) => {
        return showToast({ type: 'warning', title, message, duration })
    }

    const info = (title: string, message: string, duration?: number) => {
        return showToast({ type: 'info', title, message, duration })
    }

    return {
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info
    }
}
