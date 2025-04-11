<template>
  <div class="flex min-h-screen flex-col justify-center bg-amber-50 py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-emerald-800">Iniciar sesión</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        ¿No tienes cuenta?
        <NuxtLink to="/register" class="font-medium text-emerald-600 hover:text-emerald-500">
          Regístrate aquí
        </NuxtLink>
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

        <div v-if="showResetForm">
          <!-- Formulario de recuperación de contraseña -->
          <form class="space-y-6" @submit.prevent="handleResetPassword">
            <div>
              <label for="reset-email" class="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div class="mt-1">
                <input
                  id="reset-email"
                  v-model="resetEmail"
                  type="email"
                  autocomplete="email"
                  required
                  class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="loading"
                class="flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <span v-if="loading" class="mr-2">
                  <svg
                    class="h-5 w-5 animate-spin text-white"
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
                Enviar correo de recuperación
              </button>
            </div>

            <div class="mt-4 text-center">
              <button
                type="button"
                class="text-sm text-emerald-600 hover:text-emerald-500"
                @click="showResetForm = false"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        </div>

        <div v-else-if="resetSuccess">
          <!-- Mensaje de éxito tras enviar correo de recuperación -->
          <div class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-5 w-5 text-green-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">Correo enviado</h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>
                    Hemos enviado un correo con instrucciones para restablecer tu contraseña a
                    {{ resetEmail }}
                  </p>
                </div>
                <div class="mt-4">
                  <div class="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      class="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                      @click="() => { resetSuccess = false; showResetForm = false; }"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form v-else class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">Recordarme</label>
            </div>

            <div class="text-sm">
              <a
                class="cursor-pointer font-medium text-emerald-600 hover:text-emerald-500"
                @click="handleForgotPassword"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span v-if="loading" class="mr-2">
                <svg
                  class="h-5 w-5 animate-spin text-white"
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
              Iniciar sesión
            </button>
          </div>
        </form>

        <div v-if="!showResetForm && !resetSuccess" class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-white px-2 text-gray-500">O continuar con</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <div>
              <button
                type="button"
                class="inline-flex w-full cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                :disabled="loading"
                @click="handleLoginWithGoogle"
              >
                <span class="sr-only">Sign in with Google</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  />
                </svg>
              </button>
            </div>

            <div>
              <button
                type="button"
                class="inline-flex w-full cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                :disabled="loading"
                @click="handleLoginWithFacebook"
              >
                <span class="sr-only">Sign in with Facebook</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path
                    d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { CheckCircleIcon } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const {
  login,
  loginWithGoogle,
  loginWithFacebook,
  resetPassword,
  error: authError,
  loading: authLoading,
  isAdmin,
} = useAuth()

// Estado para login normal
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const error = ref('')
const loading = ref(false)

// Estado para recuperación de contraseña
const showResetForm = ref(false)
const resetEmail = ref('')
const resetSuccess = ref(false)

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

// Manejar inicio de sesión normal
const handleLogin = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Por favor ingresa tu correo y contraseña'
    return
  }

  console.log('Intentando iniciar sesión con:', email.value)
  const success = await login(email.value, password.value)

  if (success) {
    console.log('Login exitoso, redirigiendo...')

    // Esperar a que el estado de isAdmin se actualice
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Si es admin, redirigimos al panel de administración
    if (isAdmin.value) {
      console.log('Usuario es admin, redirigiendo a panel admin')
      router.push('/admin')
    } else {
      console.log('Usuario normal, redirigiendo a inicio')
      router.push('/')
    }
  }
}

// Manejar inicio de sesión con Google
const handleLoginWithGoogle = async () => {
  error.value = ''
  console.log('Intentando login con Google')
  const success = await loginWithGoogle()

  if (success) {
    console.log('Login con Google exitoso')

    // Esperar a que el estado de isAdmin se actualice
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Si es admin, redirigimos al panel de administración
    if (isAdmin.value) {
      console.log('Usuario Google es admin, redirigiendo a panel admin')
      router.push('/admin')
    } else {
      console.log('Usuario Google normal, redirigiendo a inicio')
      router.push('/')
    }
  }
}

// Manejar inicio de sesión con Facebook
const handleLoginWithFacebook = async () => {
  error.value = ''
  const success = await loginWithFacebook()

  if (success) {
    // Esperar a que el estado de isAdmin se actualice
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Si es admin, redirigimos al panel de administración
    if (isAdmin.value) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }
}

// Mostrar formulario de recuperación de contraseña
const handleForgotPassword = () => {
  showResetForm.value = true
  resetEmail.value = email.value // Pre-llenar con el email si ya lo ingresó
}

// Enviar correo de recuperación de contraseña
const handleResetPassword = async () => {
  error.value = ''
  if (!resetEmail.value) {
    error.value = 'Por favor ingresa tu correo electrónico'
    return
  }

  if (await resetPassword(resetEmail.value)) {
    resetSuccess.value = true
  }
}
</script>
