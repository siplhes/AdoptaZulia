<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <NuxtPicture class="mx-auto h-16 w-auto" src="/logo.svg" alt="Adopta Zulia" sizes="64px" placeholder />
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-emerald-800">
          Completa tu perfil
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Solo un paso más para completar tu registro
        </p>
      </div>

      <div class="mt-8 space-y-6 rounded-lg bg-white p-8 shadow">
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <XCircleIcon class="h-5 w-5 text-red-500" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <form class="space-y-6" @submit.prevent="handleCompleteProfile">
          <!-- Avatar upload section -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Foto de perfil</label>
            <div class="flex flex-col items-center space-y-4">
              <div
                class="relative h-32 w-32 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100"
              >
                <NuxtImg
                  v-if="photoPreview"
                  :src="photoPreview"
                  alt="Avatar preview"
                  class="h-full w-full object-cover"
                  sizes="128px"
                  placeholder
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-gray-400"
                >
                  <UserIcon class="h-16 w-16" />
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <button
                  type="button"
                  class="inline-flex items-center rounded-md border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-600 shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  @click="triggerFileInput"
                >
                  <UploadIcon class="-ml-1 mr-2 h-5 w-5" />
                  Subir foto
                </button>
                <button
                  v-if="photoPreview"
                  type="button"
                  class="inline-flex items-center rounded-md border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  @click="removePhoto"
                >
                  <Trash2Icon class="-ml-1 mr-2 h-5 w-5" />
                  Eliminar
                </button>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileSelected"
              >

              <p v-if="photoError" class="text-sm text-red-600">{{ photoError }}</p>
            </div>
          </div>

          <!-- Username input -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <div class="mt-1">
              <input
                id="username"
                v-model="userName"
                name="username"
                type="text"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                placeholder="username"
              >
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Este nombre será visible para otros usuarios.
            </p>
          </div>

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <span v-if="loading" class="absolute inset-y-0 left-0 flex items-center pl-3">
                <LoaderIcon class="h-5 w-5 animate-spin text-emerald-400" />
              </span>
              Completar perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useS3 } from '~/composables/useS3'
import {
  UserIcon,
  XCircleIcon,
  UploadIcon,
  Trash2Icon,
  LoaderIcon,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
})

// Composables
const router = useRouter()
const route = useRoute()
const { user, userProfile, updateProfile, loading: authLoading, error: authError } = useAuth()
const { uploadFile } = useS3()

// Estado local
const loading = ref(false)
const error = ref(null)
const userName = ref('')
const photoPreview = ref(null)
const photoError = ref(null)
const fileInput = ref(null)
const photoFile = ref(null)

// Verificar si el usuario está autenticado pero sin nombre de usuario
onMounted(() => {
  // Si no hay usuario autenticado, redirigir a login
  if (!user.value) {
    router.push('/login')
    return
  }

  // Si el usuario ya tiene un nombre de usuario, redirigir a inicio
  if (userProfile.value?.userName) {
    router.push('/')
  }
})

// Métodos para manipular la foto de perfil
const triggerFileInput = () => {
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  photoError.value = null

  // Validar tipo de archivo
  if (!file.type.match('image.*')) {
    photoError.value = 'Por favor selecciona una imagen válida'
    return
  }

  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    photoError.value = 'La imagen no debe superar los 5MB'
    return
  }

  // Guardar el archivo y mostrar vista previa
  photoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  // Resetear el input file
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Completar perfil
const handleCompleteProfile = async () => {
  error.value = null
  loading.value = true

  try {
    let photoURL = null

    // Subir foto si existe
    if (photoFile.value) {
      const userId = user.value.uid
      const fileExtension = photoFile.value.name.split('.').pop()
      const fileName = `avatar.${fileExtension}`

      photoURL = await uploadFile(photoFile.value, `users/${userId}`, fileName)
    }

    // Asegurarnos de que userName no esté vacío, ya que es un campo requerido
    if (!userName.value.trim()) {
      error.value = 'El nombre de usuario es obligatorio'
      loading.value = false
      return
    }

    // Actualizar perfil con valores seguros
    const success = await updateProfile(
      userProfile.value?.displayName || '',
      photoURL || userProfile.value?.photoURL || '',
      userProfile.value?.bio || '', // Enviamos string vacío en lugar de undefined
      userProfile.value?.phoneNumber || '',
      userName.value.trim()
    )

    if (success) {
      // Redirigir a la página de inicio
      router.push('/')
    } else {
      error.value = 'Error al actualizar tu perfil. Por favor intenta nuevamente.'
    }
  } catch (err) {
    console.error('Error al completar perfil:', err)
    error.value = 'Error al procesar tu solicitud. Por favor intenta nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style></style>
