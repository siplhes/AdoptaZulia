<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center rounded-md px-4 py-2 text-base font-medium shadow-sm',
      variantClass,
      { 'cursor-not-allowed opacity-70': loading || disabled },
    ]"
    :disabled="loading || disabled"
    @click="$emit('click', $event)"
    aria-busy="false"
  >
    <span v-if="loading" class="inline-flex items-center">
      <svg
        class="-ml-1 mr-2 h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
      <span>{{ loadingLabel }}</span>
    </span>
    <span v-else>
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  loadingLabel: { type: String, default: 'Procesando...' },
})

const emit = defineEmits(['click'])

const variantClass = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-emerald-600 text-white hover:bg-emerald-700'
    case 'ghost':
      return 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700'
    default:
      return 'bg-emerald-600 text-white hover:bg-emerald-700'
  }
})
</script>

<style scoped>
button:disabled {
  pointer-events: none;
}
</style>
