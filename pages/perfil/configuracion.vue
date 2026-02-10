<template>
  <div class="min-h-screen bg-amber-50 py-12">
    <div class="container mx-auto max-w-4xl px-4">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Configuración de Perfil</h1>
          <p class="mt-1 text-gray-600">Administra tu información personal y preferencias.</p>
        </div>
        <NuxtLink
          to="/perfil"
          class="flex items-center font-medium text-emerald-600 hover:text-emerald-700"
        >
          <Icon name="heroicons:arrow-left" class="mr-1 h-5 w-5" />
          Volver
        </NuxtLink>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center p-12">
          <div
            class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
          ></div>
        </div>

        <div v-else class="flex flex-col md:flex-row">
          <!-- Sidebar / Photo Section -->
          <div
            class="flex flex-col items-center border-r border-gray-100 bg-gray-50 p-6 md:w-1/3 md:p-8"
          >
            <div class="group relative mb-6">
              <div
                class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-100 shadow-md"
              >
                <NuxtImg
                  v-if="photoPreview || profileData.photoURL"
                  :src="photoPreview || profileData.photoURL"
                  class="h-full w-full object-cover"
                  fit="cover"
                />
                <span v-else class="text-4xl font-bold text-emerald-600">
                  {{ profileData.displayName?.charAt(0).toUpperCase() || 'U' }}
                </span>
              </div>

              <!-- Edit Overlay -->
              <label
                class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Icon name="heroicons:camera" class="h-8 w-8" />
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  class="hidden"
                  @change="handlePhotoChange"
                />
              </label>
            </div>

            <h2 class="text-center text-lg font-bold text-gray-900">
              {{ profileData.displayName || 'Usuario' }}
            </h2>
            <p class="mb-6 text-sm text-gray-500">@{{ profileData.userName || 'username' }}</p>

            <div class="w-full space-y-3">
              <button
                @click="$refs.fileInput.click()"
                type="button"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Cambiar foto
              </button>
              <button
                v-if="profileData.photoURL || photoPreview"
                @click="removePhoto"
                type="button"
                class="w-full rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Eliminar foto
              </button>
            </div>

            <p v-if="photoError" class="mt-3 text-center text-xs text-red-600">{{ photoError }}</p>
            <p class="mt-2 text-center text-xs text-gray-400">JPG, PNG máx 2MB</p>
          </div>

          <!-- Main Form Section -->
          <div class="p-6 md:w-2/3 md:p-8">
            <form @submit.prevent="saveChanges" class="space-y-6">
              <!-- Success Banner -->
              <div
                v-if="successMessage"
                class="flex items-center rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-green-700"
              >
                <Icon name="heroicons:check-circle" class="mr-2 h-5 w-5 text-green-500" />
                {{ successMessage }}
              </div>
              <!-- Error Banner -->
              <div
                v-if="error"
                class="flex items-center rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700"
              >
                <Icon name="heroicons:exclamation-circle" class="mr-2 h-5 w-5 text-red-500" />
                {{ error }}
              </div>

              <!-- Basic Info Grid -->
              <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div class="col-span-2 md:col-span-2">
                  <label class="mb-1 block text-sm font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <input
                    v-model="profileData.displayName"
                    type="text"
                    class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Tu nombre legal"
                  />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">
                    Nombre de Usuario
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      @
                    </span>
                    <input
                      v-model="profileData.userName"
                      type="text"
                      class="w-full rounded-lg border-gray-300 py-2.5 pl-8 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    v-model="profileData.phoneNumber"
                    type="tel"
                    class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="+58 412 1234567"
                  />
                </div>

                <div class="col-span-2">
                  <label class="mb-1 block text-sm font-medium text-gray-700">Biografía</label>
                  <textarea
                    v-model="profileData.bio"
                    rows="3"
                    class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Cuenta algo sobre ti y tus mascotas..."
                  ></textarea>
                  <p class="mt-1 text-right text-xs text-gray-500">
                    {{ profileData.bio ? profileData.bio.length : 0 }}/500
                  </p>
                </div>

                <div class="col-span-2">
                  <label class="mb-1 block text-sm font-medium text-gray-700">
                    Email
                    <span class="text-xs font-normal text-gray-500">(No modificable)</span>
                  </label>
                  <input
                    :value="profileData.email"
                    type="email"
                    disabled
                    class="w-full cursor-not-allowed rounded-lg border-gray-200 bg-gray-50 py-2.5 text-gray-500 shadow-sm"
                  />
                </div>
              </div>

              <hr class="border-gray-100" />

              <!-- Notifications -->
              <div>
                <h3 class="mb-4 text-lg font-medium text-gray-900">Notificaciones</h3>
                <div class="space-y-3">
                  <label class="flex cursor-pointer items-center space-x-3">
                    <input
                      v-model="profileData.preferences.emailNotifications"
                      type="checkbox"
                      class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="text-gray-700">Recibir correos electrónicos</span>
                  </label>
                  <label class="flex cursor-pointer items-center space-x-3">
                    <input
                      v-model="profileData.preferences.newPets"
                      type="checkbox"
                      class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="text-gray-700">Avisos de nuevas mascotas</span>
                  </label>
                  <label class="flex cursor-pointer items-center space-x-3">
                    <input
                      v-model="profileData.preferences.adoptionUpdates"
                      type="checkbox"
                      class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="text-gray-700">Actualizaciones de mis adopciones</span>
                  </label>
                </div>
              </div>

              <div class="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  @click="cancel"
                  class="px-4 font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <LoadingButton
                  type="submit"
                  variant="primary"
                  :loading="isSaving"
                  loadingLabel="Guardando..."
                  class="px-8"
                >
                  Guardar Cambios
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useS3 } from '~/composables/useS3'
import LoadingButton from '~/components/ui/LoadingButton.vue'

const router = useRouter()
const { user, userProfile, updateProfile, isAuthenticated } = useAuth()
const { uploadFile } = useS3()

// State
const loading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const successMessage = ref(null)
const photoPreview = ref(null)
const photoError = ref(null)
const fileInput = ref(null)
const photoFile = ref(null)

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

// Initialize
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    if (userProfile.value) {
      Object.assign(profileData, {
        displayName: userProfile.value.displayName || '',
        userName: userProfile.value.userName || '',
        email: userProfile.value.email || '',
        phoneNumber: userProfile.value.phoneNumber || '',
        bio: userProfile.value.bio || '',
        photoURL: userProfile.value.photoURL || '',
        preferences: { ...profileData.preferences, ...(userProfile.value.preferences || {}) },
      })
    }
  } catch (e) {
    error.value = 'Error cargando datos del perfil.'
  } finally {
    loading.value = false
  }
})

// Photo Logic
const handlePhotoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    photoError.value = 'Formato no válido (Solo JPG/PNG)'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    photoError.value = 'La imagen excede 2MB'
    return
  }

  photoError.value = null
  photoFile.value = file

  const reader = new FileReader()
  reader.onload = (ev) => (photoPreview.value = ev.target.result)
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoPreview.value = null
  photoFile.value = null
  profileData.photoURL = ''
  if (fileInput.value) fileInput.value.value = ''
}

// Actions
const cancel = () => router.back()

const saveChanges = async () => {
  isSaving.value = true
  error.value = null
  successMessage.value = null

  try {
    let currentPhotoURL = profileData.photoURL

    if (photoFile.value) {
      currentPhotoURL = await uploadFile(
        photoFile.value,
        'profile-photos',
        `profile_${user.value.uid}_${Date.now()}.jpg`
      )
    }

    await updateProfile(
      profileData.displayName,
      currentPhotoURL,
      profileData.bio,
      profileData.phoneNumber,
      profileData.userName
    )

    // Update local state if needed for immediate feedback logic
    profileData.photoURL = currentPhotoURL
    photoFile.value = null
    photoPreview.value = null

    successMessage.value = '¡Perfil actualizado correctamente!'
  } catch (e) {
    console.error(e)
    error.value = 'No se pudieron guardar los cambios.'
  } finally {
    isSaving.value = false
  }
}
</script>
