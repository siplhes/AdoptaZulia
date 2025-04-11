<template>
  <div class="mt-4 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <ShieldAlertIcon class="h-5 w-5 text-red-600" aria-hidden="true" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">
          {{ title || 'Acceso denegado' }}
        </h3>
        <div class="mt-2 text-sm text-red-700">
          <p>{{ message || 'No tienes permisos para acceder a esta funcionalidad.' }}</p>
        </div>
        <div v-if="redirectRoute" class="mt-4">
          <div class="-mx-2 -my-1.5 flex">
            <NuxtLink
              :to="redirectRoute"
              class="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              {{ redirectText || 'Volver' }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShieldAlertIcon } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    default: 'Acceso denegado'
  },
  message: {
    type: String,
    default: 'No tienes permisos para acceder a esta funcionalidad. Se requiere rol de administrador.'
  },
  redirectRoute: {
    type: String,
    default: '/'
  },
  redirectText: {
    type: String,
    default: 'Volver a inicio'
  }
})
</script>