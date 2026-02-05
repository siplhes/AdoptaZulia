<template>
  <div>
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-emerald-800">Iniciar sesión</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Accede a tu cuenta de Adopta Zulia
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <div
          v-if="error"
          class="relative mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {{ error }}
        </div>

        <div>
          <button
            type="button"
            class="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            :disabled="loading"
            @click="handleLoginWithGoogle"
          >
            <span v-if="loading" class="mr-2">
              <svg
                class="h-5 w-5 animate-spin text-emerald-600"
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
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            <span v-else class="mr-2">
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                />
              </svg>
            </span>
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const {
  loginWithGoogle,
  error: authError,
  loading: authLoading,
  isAdmin,
  needsProfileCompletion,
} = useAuth()

const error = ref('')
const loading = ref(false)

// Observar errores del composable
watch(
  () => authError.value,
  (newError) => {
    if (newError) {
      error.value = newError
    }
  }
)

// Observar loading del composable
watch(
  () => authLoading.value,
  (newLoading) => {
    loading.value = newLoading
  }
)

// Manejar inicio de sesión con Google
const handleLoginWithGoogle = async () => {
  error.value = ''
  const success = await loginWithGoogle()

  if (success) {
    // Esperar a que el estado se actualice
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Si necesita completar su perfil, redirigir a register-step-two
    if (needsProfileCompletion.value) {
      router.push('/register-step-two')
    }
    // Si es admin, redirigimos al panel de administración
    else if (isAdmin.value) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }
}
</script>
