<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl sm:p-10">
      <!-- Steps Indicator -->
      <div class="mx-auto flex w-full max-w-xs items-center justify-between">
        <div class="flex flex-col items-center">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-100 font-bold text-emerald-600"
          >
            <Icon name="heroicons:check" class="h-6 w-6" />
          </div>
          <span class="mt-2 text-xs font-medium text-emerald-600">Registro</span>
        </div>

        <div class="mx-2 h-1 flex-1 bg-emerald-100">
          <div class="h-full w-full rounded-full bg-emerald-500" />
        </div>

        <div class="flex flex-col items-center">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white shadow-lg ring-4 ring-emerald-50"
          >
            2
          </div>
          <span class="mt-2 text-xs font-bold text-gray-900">Perfil</span>
        </div>
      </div>

      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">¡Casi listo!</h2>
        <p class="mt-2 text-sm text-gray-600">
          Personaliza tu perfil para que la comunidad te conozca.
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleCompleteProfile">
        <!-- Avatar Upload -->
        <div class="flex flex-col items-center gap-6">
          <div class="group relative">
            <div
              class="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ring-gray-100"
            >
              <NuxtImg
                v-if="photoPreview"
                :src="photoPreview"
                class="h-full w-full object-cover"
                alt="Avatar preview"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300"
              >
                <Icon name="heroicons:user-solid" class="h-16 w-16" />
              </div>

              <!-- Hover Overlay -->
              <div
                class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                @click="triggerFileInput"
              >
                <Icon name="heroicons:camera" class="h-8 w-8 text-white" />
              </div>
            </div>

            <button
              type="button"
              class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
              @click="triggerFileInput"
              title="Subir foto"
            >
              <Icon name="heroicons:plus-small" class="h-5 w-5" />
            </button>
          </div>

          <div class="text-center">
            <button
              type="button"
              class="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              @click="triggerFileInput"
            >
              Subir una foto
            </button>
            <p v-if="photoError" class="mt-1 text-xs text-red-500">{{ photoError }}</p>
            <p v-else class="mt-1 text-xs text-gray-400">JPG, PNG hasta 5MB</p>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileSelected"
          />
        </div>

        <div class="-space-y-px rounded-md shadow-sm">
          <div>
            <label for="username" class="sr-only">Nombre de usuario</label>
            <div class="relative rounded-md shadow-sm">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span class="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                id="username"
                v-model="userName"
                name="username"
                type="text"
                required
                class="block w-full rounded-xl border-gray-300 py-3 pl-8 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder="nombre_de_usuario"
                :class="{
                  'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500':
                    error,
                }"
              />
            </div>
            <p v-if="suggestedUsername && !userName" class="mt-2 text-xs text-gray-500">
              Sugerencia:
              <button
                type="button"
                class="font-medium text-emerald-600 hover:underline"
                @click="userName = suggestedUsername"
              >
                {{ suggestedUsername }}
              </button>
            </p>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Icon name="heroicons:x-circle-mini" class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Hubo un problema</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative flex w-full justify-center rounded-xl border border-transparent bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70"
          >
            <span v-if="loading" class="absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon name="svg-spinners:ring-resize" class="h-5 w-5 text-emerald-200" />
            </span>
            Completar Registro
            <Icon
              v-if="!loading"
              name="heroicons:arrow-right"
              class="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false, // Standalone page
  middleware: 'auth',
})

const router = useRouter()
const { user, userProfile, updateProfile, needsProfileCompletion } = useAuth()
const { uploadFile } = useS3()

const loading = ref(false)
const error = ref(null)
const userName = ref('')
const suggestedUsername = ref('')
const photoPreview = ref(null)
const photoError = ref(null)
const fileInput = ref(null)
const photoFile = ref(null)

onMounted(() => {
  if (!user.value) {
    router.push('/login')
    return
  }

  // Pre-fill existing photo if any
  if (userProfile.value?.photoURL) {
    photoPreview.value = userProfile.value.photoURL
  } else if (user.value?.photoURL) {
    photoPreview.value = user.value.photoURL
  }

  // Generate suggestion
  const generateSlug = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10)

  if (userProfile.value?.userName) {
    // Already has username, maybe just here to edit?
    userName.value = userProfile.value.userName
  } else if (user.value?.displayName) {
    suggestedUsername.value = generateSlug(user.value.displayName)
  } else if (user.value?.email) {
    suggestedUsername.value = generateSlug(user.value.email.split('@')[0])
  }
})

const triggerFileInput = () => fileInput.value.click()

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  photoError.value = null
  if (!file.type.match('image.*')) {
    photoError.value = 'Formato de imagen no válido'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    photoError.value = 'La imagen es muy grande (Max 5MB)'
    return
  }

  photoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => (photoPreview.value = e.target.result)
  reader.readAsDataURL(file)
}

const handleCompleteProfile = async () => {
  error.value = null
  loading.value = true

  try {
    let photoURL = userProfile.value?.photoURL

    if (photoFile.value) {
      const ext = photoFile.value.name.split('.').pop()
      photoURL = await uploadFile(photoFile.value, `users/${user.value.uid}`, `avatar.${ext}`)
    }

    if (!userName.value.trim()) {
      error.value = 'El nombre de usuario es obligatorio'
      loading.value = false
      return
    }

    const success = await updateProfile(
      userProfile.value?.displayName || user.value.displayName || '',
      photoURL || '',
      userProfile.value?.bio || '',
      userProfile.value?.phoneNumber || '',
      userName.value.trim()
    )

    if (success) {
      router.push('/')
    } else {
      error.value = 'No se pudo guardar el perfil. Intenta con otro nombre de usuario.'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Error de conexión. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>
