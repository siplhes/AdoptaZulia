<template>
  <div
    class="hover:scale-102 pointer-events-auto w-full max-w-sm transform overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all"
    role="alert"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <Icon
            v-if="toast.type === 'success'"
            name="heroicons:check-circle"
            class="h-6 w-6 text-green-400"
          />
          <Icon
            v-else-if="toast.type === 'error'"
            name="heroicons:x-circle"
            class="h-6 w-6 text-red-400"
          />
          <Icon
            v-else-if="toast.type === 'warning'"
            name="heroicons:exclamation-triangle"
            class="h-6 w-6 text-amber-400"
          />
          <Icon v-else name="heroicons:information-circle" class="h-6 w-6 text-blue-400" />
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p v-if="toast.title" class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
          <p class="text-sm text-gray-500" :class="{ 'mt-1': toast.title }">{{ toast.message }}</p>
        </div>
        <div class="ml-4 flex flex-shrink-0">
          <button
            type="button"
            class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            @click="$emit('close')"
          >
            <span class="sr-only">Close</span>
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Toast } from '~/composables/useToast'

defineProps<{
  toast: Toast
}>()

defineEmits(['close'])
</script>
