<template>
  <div class="flex min-h-screen bg-white">
    <!-- Left Side: Login Form -->
    <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div class="text-center lg:text-left">
          <NuxtLink to="/" class="inline-block">
             <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
               <Icon name="ph:paw-print-fill" class="h-7 w-7" />
             </div>
          </NuxtLink>
          <h2 class="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
            Bienvenido de nuevo
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            ¿No tienes cuenta? 
            <span class="font-medium text-emerald-600">Se creará automáticamente al iniciar sesión</span>
          </p>
        </div>

        <div class="mt-8">
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white px-2 text-gray-500">Continuar con</span>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                :disabled="loading"
                class="group relative flex w-full justify-center rounded-xl border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                @click="handleLoginWithGoogle"
              >
                 <span v-if="loading" class="absolute left-4 flex items-center">
                    <Icon name="svg-spinners:ring-resize" class="h-5 w-5 text-emerald-600" />
                 </span>
                 <span v-else class="absolute left-4 flex items-center">
                    <Icon name="logos:google-icon" class="h-5 w-5" />
                 </span>
                <span :class="{ 'pl-6': !loading }">Google</span>
              </button>
            </div>
            
            <div v-if="error" class="mt-6 rounded-lg bg-red-50 p-4 border border-red-100">
              <div class="flex">
                <div class="flex-shrink-0">
                  <Icon name="heroicons:x-circle-solid" class="h-5 w-5 text-red-400" />
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Error de autenticación</h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>{{ error }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Image Banner -->
    <div class="relative hidden w-0 flex-1 lg:block">
      <NuxtImg
        class="absolute inset-0 h-full w-full object-cover"
        src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
        alt="Perro feliz esperando adopción"
        placeholder
      />
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent flex flex-col justify-end p-12">
        <blockquote class="mb-6 border-l-4 border-emerald-400 pl-4">
          <p class="text-xl font-medium text-white italic">
            "Adoptar es el acto de amor más puro que existe. Salvas una vida y cambias la tuya para siempre."
          </p>
        </blockquote>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false, // Full screen layout
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

// Watchers handled internally by composables mostly, but keeping local state syncing
watch(authError, (newVal) => { if(newVal) error.value = newVal })
watch(authLoading, (newVal) => { loading.value = newVal })

const handleLoginWithGoogle = async () => {
  error.value = ''
  loading.value = true
  
  try {
    const success = await loginWithGoogle()

    if (success) {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay for UX

      if (needsProfileCompletion.value) {
        router.push('/register-step-two')
      } else if (isAdmin.value) {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  } catch (err) {
    // Error is already handled by composable watcher usually, but safety fallback
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
