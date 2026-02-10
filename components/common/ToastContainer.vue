<template>
  <div class="fixed right-4 top-4 z-50 max-w-sm space-y-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-start gap-3 rounded-lg p-4 shadow-lg backdrop-blur-sm"
        :class="toastClasses(toast.type)"
        role="alert"
      >
        <Icon :name="toastIcon(toast.type)" class="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div class="min-w-0 flex-1">
          <h4 class="text-sm font-semibold">{{ toast.title }}</h4>
          <p class="mt-1 text-sm opacity-90">{{ toast.message }}</p>
        </div>
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Cerrar notificación"
        >
          <Icon name="mdi:close" class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500 text-white'
    case 'error':
      return 'bg-red-500 text-white'
    case 'warning':
      return 'bg-amber-500 text-white'
    case 'info':
    default:
      return 'bg-blue-500 text-white'
  }
}

const toastIcon = (type) => {
  switch (type) {
    case 'success':
      return 'mdi:check-circle'
    case 'error':
      return 'mdi:alert-circle'
    case 'warning':
      return 'mdi:alert'
    case 'info':
    default:
      return 'mdi:information'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}
</style>
