<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Left Side: Login Form with Glassmorphism -->
    <div
      class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10"
    >
      <div class="mx-auto w-full max-w-sm lg:w-96 rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-2xl border border-white/40">
        <div class="text-center lg:text-left">
          <NuxtLink to="/" class="inline-block transition-transform hover:scale-105">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200"
            >
              <Icon name="ph:paw-print-fill" class="h-8 w-8" />
            </div>
          </NuxtLink>
          <h2 class="mt-8 text-3xl font-extrabold tracking-tight text-gray-900">
            Bienvenido de nuevo
          </h2>
          <p class="mt-3 text-sm text-gray-600">
            Únete a nuestra comunidad. 
            <span class="font-medium text-emerald-600">
              Tu cuenta se creará automáticamente.
            </span>
          </p>
        </div>

        <div class="mt-10">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-transparent px-2 text-gray-500 backdrop-blur-md">Continuar con</span>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 gap-4">
            <button
              type="button"
              :disabled="loading"
              class="group relative flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              @click="handleLoginWithGoogle"
            >
              <div class="absolute left-4 flex items-center justify-center h-8 w-8 rounded-full bg-gray-50 group-hover:bg-white transition-colors duration-300">
                <Icon v-if="loading" name="svg-spinners:ring-resize" class="h-5 w-5 text-emerald-600" />
                <Icon v-else name="logos:google-icon" class="h-5 w-5" />
              </div>
              <span :class="{ 'pl-8': !loading }">Continuar con Google</span>
            </button>
          </div>

          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-4 opacity-0"
          >
            <div v-if="error" class="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-0.5">
                  <Icon name="heroicons:x-circle-solid" class="h-5 w-5 text-red-500" />
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-semibold text-red-800">Error de autenticación</h3>
                  <p class="mt-1 text-sm text-red-600">{{ error }}</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Right Side: Image Banner -->
    <div class="relative hidden w-0 flex-1 lg:block overflow-hidden">
      <NuxtImg
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-[20s] hover:scale-105 ease-in-out"
        src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
        alt="Perrito feliz esperando adopción"
        placeholder
      />
      <!-- Gradient Overlay -->
      <div
        class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-emerald-900/90 via-emerald-900/30 to-transparent p-16"
      >
        <div class="max-w-xl backdrop-blur-md bg-black/20 p-8 rounded-3xl border border-white/20 shadow-2xl">
          <Icon name="heroicons:heart-solid" class="h-10 w-10 text-emerald-400 mb-4" />
          <blockquote class="mb-2">
            <p class="text-3xl font-bold leading-tight text-white">
              "Adoptar es el acto de amor más puro que existe. Salvas una vida y cambias la tuya para siempre."
            </p>
          </blockquote>
          <p class="text-emerald-100 mt-4 font-medium tracking-wide text-sm uppercase">— La familia AdoptaZulia</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false, // Full screen layout
})

useSeoMeta({
  title: 'Iniciar sesión | Adopta Zulia',
  description: 'Inicia sesión en Adopta Zulia para publicar mascotas en adopción y gestionar tus publicaciones.',
})

const router = useRouter()
const route = useRoute()
const {
  loginWithGoogle,
  error: authError,
  loading: authLoading,
  isAdmin,
  needsProfileCompletion,
} = useAuth()

const error = ref('')
const loading = ref(false)

watch(authError, (newVal) => {
  if (newVal) error.value = newVal
})
watch(authLoading, (newVal) => {
  loading.value = newVal
})

const handleLoginWithGoogle = async () => {
  error.value = ''
  loading.value = true

  try {
    const success = await loginWithGoogle()

    if (success) {
      // Allow watch effect to update profile state
      await new Promise((resolve) => setTimeout(resolve, 500))

      const redirectPath = route.query.redirect

      if (needsProfileCompletion.value) {
        router.push({ path: '/register-step-two', query: redirectPath ? { redirect: redirectPath } : {} })
      } else if (redirectPath && typeof redirectPath === 'string') {
        router.push(redirectPath)
      } else if (isAdmin.value) {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
