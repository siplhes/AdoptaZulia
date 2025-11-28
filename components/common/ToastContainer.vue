<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="rounded-lg shadow-lg p-4 flex items-start gap-3 backdrop-blur-sm"
        :class="toastClasses(toast.type)"
        role="alert"
      >
        <Icon :name="toastIcon(toast.type)" class="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-sm">{{ toast.title }}</h4>
          <p class="text-sm mt-1 opacity-90">{{ toast.message }}</p>
        </div>
        <button 
          @click="removeToast(toast.id)" 
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
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
