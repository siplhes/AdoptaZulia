<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto max-w-3xl px-4">
      <!-- Título de la página -->
      <h1 class="mb-6 text-2xl font-bold text-emerald-800">Configuración de perfil</h1>

      <!-- Formulario de configuración -->
      <div class="overflow-hidden rounded-lg bg-white shadow-lg">
        <!-- Estado de carga -->
        <div v-if="loading" class="flex justify-center p-8">
          <div
            class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
          />
        </div>

        <!-- Error general -->
        <div v-else-if="error" class="m-6 border-l-4 border-red-500 bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-500" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Formulario -->
        <form v-else class="p-6 md:p-8" @submit.prevent="saveChanges" >
          <!-- Mensaje de éxito -->
          <div v-if="successMessage" class="mb-6 border-l-4 border-green-500 bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon name="heroicons:check-circle" class="h-5 w-5 text-green-500" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">{{ successMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Foto de perfil -->
          <div class="mb-8">
            <label class="mb-2 block text-sm font-medium text-gray-700">Foto de perfil</label>
            <div class="flex items-center space-x-6">
              <!-- Vista previa de la foto -->
              <div class="h-24 w-24 overflow-hidden rounded-full border border-gray-200">
                <NuxtImg
                  v-if="photoPreview || profileData.photoURL"
                  :src="photoPreview || profileData.photoURL"
                  alt="Foto de perfil"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full w-full items-center justify-center bg-emerald-100">
                  <span class="text-3xl font-bold text-emerald-600">
                    {{ profileData.displayName?.charAt(0).toUpperCase() || 'U' }}
                  </span>
                </div>
              </div>

              <!-- Botones para la foto -->
              <div class="flex flex-col space-y-2">
                <label
                  class="inline-flex cursor-pointer items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <Icon name="heroicons:arrow-up-tray" class="mr-2 h-4 w-4" />
                  Cambiar foto
                  <input
                     ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handlePhotoChange"
                  >
                </label>
                <button
                  v-if="photoPreview || profileData.photoURL"
                  type="button"
                  class="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                  @click="removePhoto"
                >
                  <Icon name="heroicons:trash" class="mr-2 inline-block h-4 w-4" />
                  Eliminar foto
                </button>
              </div>
            </div>
            <p v-if="photoError" class="mt-1 text-sm text-red-600">{{ photoError }}</p>
            <p class="mt-1 text-xs text-gray-500">
              Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB.
            </p>
          </div>

          <!-- Información básica -->
          <div class="border-t border-gray-200 pt-6">
            <h2 class="mb-4 text-lg font-medium text-gray-900">Información básica</h2>

            <!-- Nombre completo -->
            <div class="mb-4">
              <label for="displayName" class="mb-1 block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="displayName"
                v-model="profileData.displayName"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Tu nombre y apellido"
              >
            </div>

            <!-- Nombre de usuario -->
            <div class="mb-4">
              <label for="userName" class="mb-1 block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <div class="relative rounded-md shadow-sm">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span class="text-gray-500 sm:text-sm">@</span>
                </div>
                <input
                  id="userName"
                  v-model="profileData.userName"
                  type="text"
                  class="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="username"
                >
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Este nombre de usuario será utilizado para tu perfil público: adoptazulia.com/{{
                  profileData.userName
                }}
              </p>
            </div>

            <!-- Email (solo lectura) -->
            <div class="mb-4">
              <label for="email" class="mb-1 block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                :value="profileData.email"
                type="email"
                readonly
                disabled
                class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm"
              >
              <p class="mt-1 text-xs text-gray-500">
                Para cambiar tu correo electrónico, contacta con soporte.
              </p>
            </div>

            <!-- Teléfono -->
            <div class="mb-4">
              <label for="phoneNumber" class="mb-1 block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                id="phoneNumber"
                v-model="profileData.phoneNumber"
                type="tel"
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="+58 412 1234567"
              >
              <p class="mt-1 text-xs text-gray-500">
                Se mostrará solo en tu perfil si estás autenticado.
              </p>
            </div>

            <!-- Biografía -->
            <div class="mb-4">
              <label for="bio" class="mb-1 block text-sm font-medium text-gray-700">
                Biografía
              </label>
              <textarea
                id="bio"
                v-model="profileData.bio"
                rows="4"
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Cuéntanos un poco sobre ti..."
              />
              <p class="mt-1 text-xs text-gray-500">
                {{ profileData.bio ? profileData.bio.length : 0 }}/500 caracteres
              </p>
            </div>
          </div>

          <!-- Preferencias de notificaciones (para futura implementación) -->
          <div class="border-t border-gray-200 pt-6">
            <h2 class="mb-4 text-lg font-medium text-gray-900">Preferencias de notificaciones</h2>

            <div class="space-y-3">
              <div class="flex items-center">
                <input
                  id="emailNotifications"
                  v-model="profileData.preferences.emailNotifications"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <label for="emailNotifications" class="ml-3 text-sm text-gray-700">
                  Recibir notificaciones por correo electrónico
                </label>
              </div>

              <div class="flex items-center">
                <input
                  id="newPets"
                  v-model="profileData.preferences.newPets"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <label for="newPets" class="ml-3 text-sm text-gray-700">
                  Notificarme sobre nuevas mascotas en adopción
                </label>
              </div>

              <div class="flex items-center">
                <input
                  id="adoptionUpdates"
                  v-model="profileData.preferences.adoptionUpdates"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <label for="adoptionUpdates" class="ml-3 text-sm text-gray-700">
                  Notificarme sobre actualizaciones de mis adopciones
                </label>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-6">
            <button
              type="button"
            
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                @click="cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
              :disabled="loading"
            >
              <span v-if="loading">
                <svg
                  class="-ml-1 mr-2 inline-block h-4 w-4 animate-spin text-white"
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
                Guardando...
              </span>
              <span v-else>Guardar cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useS3 } from '~/composables/useS3'

// Composables
const router = useRouter()
const {
  user,
  userProfile,
  updateProfile,
  loading: authLoading,
  error: authError,
  isAuthenticated,
} = useAuth()
const { uploadImage } = useS3()

// Estado local
const loading = ref(false)
const error = ref(null)
const successMessage = ref(null)
const photoPreview = ref(null)
const photoError = ref(null)
const fileInput = ref(null)
const photoFile = ref(null)

// Datos del perfil
const profileData = reactive({
  displayName: '',
  userName: '',
  email: '',
  phoneNumber: '',
  bio: '',
  photoURL: '',
  preferences: {
    emailNotifications: true,
    newPets: true,
    adoptionUpdates: true,
  },
})

// Cargar datos del perfil al montar el componente
onMounted(async () => {
  // Verificar si el usuario está autenticado
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    loading.value = true

    // Cargar datos del perfil desde userProfile
    if (userProfile.value) {
      profileData.displayName = userProfile.value.displayName || ''
      profileData.userName = userProfile.value.userName || ''
      profileData.email = userProfile.value.email || ''
      profileData.phoneNumber = userProfile.value.phoneNumber || ''
      profileData.bio = userProfile.value.bio || ''
      profileData.photoURL = userProfile.value.photoURL || ''

      // Cargar preferencias de notificaciones (si existen)
      if (userProfile.value.preferences) {
        profileData.preferences = {
          ...profileData.preferences,
          ...userProfile.value.preferences,
        }
      }
    }
  } catch (err) {
    console.error('Error al cargar perfil:', err)
    error.value = 'Error al cargar la información del perfil'
  } finally {
    loading.value = false
  }
})

// Manejar cambio de foto
const handlePhotoChange = (event) => {
  const file = event.target.files[0]
  photoError.value = null

  if (!file) return

  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!validTypes.includes(file.type)) {
    photoError.value = 'El archivo debe ser una imagen (JPG o PNG)'
    return
  }

  // Validar tamaño (2MB)
  if (file.size > 2 * 1024 * 1024) {
    photoError.value = 'La imagen no debe superar los 2MB'
    return
  }

  // Crear preview
  photoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Eliminar foto
const removePhoto = () => {
  photoPreview.value = null
  photoFile.value = null
  profileData.photoURL = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Cancelar cambios
const cancel = () => {
  router.back()
}

// Guardar cambios
const saveChanges = async () => {
  try {
    loading.value = true
    error.value = null
    successMessage.value = null

    let photoURL = profileData.photoURL

    // Si hay una nueva foto, subirla primero
    if (photoFile.value) {
      photoURL = await uploadImage(photoFile.value, 'profile-photos')
    }

    // Actualizar perfil
    await updateProfile(
      profileData.displayName,
      photoURL,
      profileData.bio,
      profileData.phoneNumber,
      profileData.userName
    )

    // Mostrar mensaje de éxito
    successMessage.value = 'Perfil actualizado correctamente'

    // Limpiar el file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    // Reset de la foto temporal
    photoFile.value = null
    photoPreview.value = null

    // Actualizamos la URL de la foto en el perfil local
    profileData.photoURL = photoURL
  } catch (err) {
    console.error('Error al actualizar perfil:', err)
    error.value = 'Error al guardar los cambios. Por favor, inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>
