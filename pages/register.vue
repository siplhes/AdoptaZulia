<template>
  <div class="flex min-h-screen flex-col justify-center bg-amber-50 py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-emerald-800">Crear una cuenta</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="font-medium text-emerald-600 hover:text-emerald-500">
          Inicia sesión aquí
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

        <form class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="name"
                type="text"
                autocomplete="name"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              >
            </div>
          </div>

          <div>
            <label for="userName" class="block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <div class="mt-1">
              <input
                id="userName"
                v-model="userName"
                type="text"
                autocomplete="username"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              >
              <p class="mt-1 text-xs text-gray-500">Este nombre será visible para otros usuarios</p>
            </div>
          </div>

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
              >
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              >
              <p class="mt-1 text-xs text-gray-500">
                La contraseña debe tener al menos 6 caracteres
              </p>
            </div>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <div class="mt-1">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              >
            </div>
            <p v-if="passwordsDoNotMatch" class="mt-1 text-xs text-red-500">
              Las contraseñas no coinciden
            </p>
          </div>

          <div class="flex items-center">
            <input
              id="terms"
              v-model="acceptTerms"
              type="checkbox"
              required
              class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            >
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              Acepto los
              <a href="#" class="text-emerald-600 hover:text-emerald-500">términos y condiciones</a>
              y la
              <a href="#" class="text-emerald-600 hover:text-emerald-500">política de privacidad</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading || passwordsDoNotMatch"
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
              Registrarse
            </button>
          </div>
        </form>

        <div class="mt-6">
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
              <a
                class="inline-flex w-full cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                @click="registerWithGoogle"
              >
                <span class="sr-only">Sign up with Google</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const { register, loginWithGoogle, loginWithFacebook, error, loading } = useAuth()

const name = ref('')
const userName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)

const passwordsDoNotMatch = computed(() => {
  if (password.value && confirmPassword.value) {
    return password.value !== confirmPassword.value
  }
  return false
})

// Registrarse con email y contraseña
const handleRegister = async () => {
  if (passwordsDoNotMatch.value) {
    return
  }

  if (await register(email.value, password.value, name.value, userName.value)) {
    router.push('/')
  }
}

// Registrarse con Google
const registerWithGoogle = async () => {
  if (await loginWithGoogle()) {
    // Esperar a que el estado se actualice
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    // Si necesita completar su perfil (no tiene userName)
    if (needsProfileCompletion.value) {
      router.push('/register-step-two')
    } else {
      router.push('/')
    }
  }
}

// Registrarse con Facebook
const registerWithFacebook = async () => {
  if (await loginWithFacebook()) {
    // Esperar a que el estado se actualice
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    // Si necesita completar su perfil (no tiene userName)
    if (needsProfileCompletion.value) {
      router.push('/register-step-two')
    } else {
      router.push('/')
    }
  }
}
</script>
