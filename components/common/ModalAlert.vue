<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <div class="mb-4 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          :class="typeClasses.bgColor"
        >
          <Icon :name="typeClasses.icon" class="h-6 w-6" :class="typeClasses.iconColor" />
        </div>
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ message }}</p>
      </div>

      <div class="mt-6 flex justify-center">
        <button
          class="rounded-md px-4 py-2 text-sm font-medium text-white"
          :class="typeClasses.buttonColor"
          @click="$emit('confirm')"
        >
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confirmButtonText: {
    type: String,
    default: 'Aceptar',
  },
})

defineEmits(['confirm'])

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        icon: 'mdi:check-circle-outline',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        buttonColor: 'bg-green-600 hover:bg-green-700',
      }
    case 'warning':
      return {
        icon: 'mdi:alert-outline',
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      }
    case 'error':
      return {
        icon: 'mdi:close-circle-outline',
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        buttonColor: 'bg-red-600 hover:bg-red-700',
      }
    case 'info':
    default:
      return {
        icon: 'mdi:information-outline',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
      }
  }
})
</script>
