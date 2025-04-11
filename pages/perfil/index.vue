<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="mb-6 text-3xl font-bold text-emerald-800">Mi Perfil</h1>

      <!-- Mensajes de error/éxito -->
      <div v-if="error" class="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <AlertCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-if="updateSuccess" class="mb-6 rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-5 w-5 text-green-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">¡Perfil actualizado correctamente!</p>
          </div>
        </div>
      </div>

      <!-- Contenido del perfil -->
      <div v-if="!isLoggedIn()">
        <div class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center shadow-md">
          <h2 class="mb-2 text-xl font-semibold text-amber-800">Necesitas iniciar sesión</h2>
          <p class="mb-4 text-amber-700">
            Para ver tu perfil, por favor inicia sesión o regístrate.
          </p>
          <div class="flex justify-center space-x-4">
            <NuxtLink
              to="/login"
              class="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50"
            >
              Iniciar sesión
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
            >
              Registrarse
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Panel de información del perfil -->
        <div class="col-span-1">
          <div class="rounded-lg bg-white p-6 shadow-md">
            <div class="flex flex-col items-center text-center">
              <div class="relative mb-4">
                <img
                  :src="userProfile?.photoURL || '/placeholder.webp?height=120&width=120'"
                  alt="Foto de perfil"
                  class="h-24 w-24 rounded-full object-cover shadow-md"
                />
                <button
                  class="absolute bottom-0 right-0 rounded-full bg-emerald-600 p-1 text-white shadow-md hover:bg-emerald-700"
                  title="Cambiar foto"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
              </div>
              <h2 class="mb-1 text-xl font-semibold text-gray-800">
                {{ userProfile?.displayName || 'Usuario' }}
              </h2>
              <p class="text-sm text-gray-500">{{ userProfile?.email }}</p>

              <div class="mt-4 w-full border-t border-gray-200 pt-4">
                <div class="mb-3 flex items-center">
                  <CalendarIcon class="mr-2 h-4 w-4 text-gray-500" />
                  <span class="text-sm text-gray-600">
                    Miembro desde {{ formatDate(userProfile?.createdAt) }}
                  </span>
                </div>
                <div class="mb-3 flex items-center">
                  <ClockIcon class="mr-2 h-4 w-4 text-gray-500" />
                  <span class="text-sm text-gray-600">
                    Último acceso {{ formatDate(userProfile?.lastLogin) }}
                  </span>
                </div>
              </div>

              <button
                class="mt-4 flex w-full items-center justify-center rounded-lg border border-red-500 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                @click="handleLogout"
              >
                <LogOutIcon class="mr-2 h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        <!-- Formulario de edición de perfil -->
        <div class="col-span-1 lg:col-span-2">
          <div class="rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 text-lg font-semibold text-gray-800">Información del perfil</h3>
            <form @submit.prevent="saveProfile">
              <div class="mb-4">
                <label for="displayName" class="mb-1 block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  id="displayName"
                  v-model="formData.displayName"
                  type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div class="mb-4">
                <label for="phone" class="mb-1 block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="phone"
                  v-model="formData.phoneNumber"
                  type="tel"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div class="mb-6">
                <label for="bio" class="mb-1 block text-sm font-medium text-gray-700">
                  Biografía
                </label>
                <textarea
                  id="bio"
                  v-model="formData.bio"
                  rows="4"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <span v-if="loading" class="mr-2">
                    <svg
                      class="h-4 w-4 animate-spin text-white"
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
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>

          <!-- Sección de Seguridad -->
          <div class="mt-6 rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 text-lg font-semibold text-gray-800">Seguridad</h3>
            <div class="space-y-4">
              <div>
                <button
                  class="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                  @click="handleResetPassword"
                >
                  <LockIcon class="mr-1 h-4 w-4" />
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  LogOutIcon,
  LockIcon,
} from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { userProfile, error, loading, isLoggedIn, updateProfile, logout, resetPassword } = useAuth()

// Estado local
const formData = ref({
  displayName: '',
  phoneNumber: '',
  bio: '',
})

const updateSuccess = ref(false)

// Rellenar el formulario con los datos del perfil cuando estén disponibles
onMounted(() => {
  if (userProfile.value) {
    formData.value = {
      displayName: userProfile.value.displayName || '',
      phoneNumber: userProfile.value.phoneNumber || '',
      bio: userProfile.value.bio || '',
    }
  }
})

// Actualizar el formulario cuando cambie el perfil
watch(
  () => userProfile.value,
  (newProfile) => {
    if (newProfile) {
      formData.value = {
        displayName: newProfile.displayName || '',
        phoneNumber: newProfile.phoneNumber || '',
        bio: newProfile.bio || '',
      }
    }
  },
  { deep: true }
)

// Guardar el perfil actualizado
const saveProfile = async () => {
  try {
    await updateProfile(
      formData.value.displayName,
      userProfile.value?.photoURL || null,
      formData.value.bio,
      formData.value.phoneNumber
    )

    updateSuccess.value = true

    // Ocultar el mensaje de éxito después de unos segundos
    setTimeout(() => {
      updateSuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Error al actualizar perfil:', err)
  }
}

// Iniciar proceso de cambio de contraseña
const handleResetPassword = async () => {
  if (!userProfile.value?.email) return

  try {
    await resetPassword(userProfile.value.email)
    alert(
      `Se ha enviado un correo electrónico a ${userProfile.value.email} con instrucciones para cambiar tu contraseña.`
    )
  } catch (err) {
    console.error('Error al enviar correo de recuperación:', err)
  }
}

// Cerrar sesión
const handleLogout = async () => {
  if (await logout()) {
    router.push('/login')
  }
}

// Formatear fechas
const formatDate = (timestamp) => {
  if (!timestamp) return 'No disponible'

  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
</script>
