<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4">
      <div class="mx-auto max-w-3xl">
        <!-- Header -->
        <div class="mb-10 text-center">
          <h1 class="text-3xl font-extrabold text-gray-800">Control de Funcionalidades</h1>
          <p class="mt-2 text-gray-600">
            Activa o desactiva módulos de la plataforma en tiempo real.
          </p>
          <NuxtLink
            to="/admin"
            class="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-emerald-600"
          >
            <Icon name="heroicons:arrow-left" class="h-4 w-4" />
            Volver al Panel
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <div
            class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600"
          />
          <p class="mt-4 font-medium text-gray-500">Sincronizando configuración...</p>
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="heroicons:exclamation-triangle" class="mt-0.5 h-6 w-6 text-red-500" />
            <div>
              <h3 class="font-bold text-red-900">Error de Sincronización</h3>
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div v-else class="space-y-6">
          <!-- Feature Card: Favorites -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="rounded-xl bg-red-100 p-3 text-red-600">
                  <Icon name="heroicons:heart" class="h-8 w-8" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">Sistema de Favoritos</h3>
                  <p class="text-sm text-gray-500">Permite a los usuarios guardar mascotas.</p>
                </div>
              </div>
              <!-- Toggle -->
              <button
                class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                :class="localFeatures.favorites ? 'bg-emerald-500' : 'bg-gray-200'"
                @click="toggleFeature('favorites')"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                  :class="localFeatures.favorites ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>

          <!-- Feature Card: Comments -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Icon name="heroicons:chat-bubble-left-right" class="h-8 w-8" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">Comentarios y Reseñas</h3>
                  <p class="text-sm text-gray-500">
                    Habilita la sección de comentarios en las fichas.
                  </p>
                </div>
              </div>
              <!-- Toggle -->
              <button
                class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                :class="localFeatures.comments ? 'bg-emerald-500' : 'bg-gray-200'"
                @click="toggleFeature('comments')"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                  :class="localFeatures.comments ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>

          <!-- Feature Card: AI Images -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <Icon name="heroicons:sparkles" class="h-8 w-8" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">Generador con IA</h3>
                  <p class="text-sm text-gray-500">
                    Creación de posters automáticos para compartir.
                  </p>
                </div>
              </div>
              <!-- Toggle -->
              <button
                class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                :class="localFeatures.imageGeneration ? 'bg-emerald-500' : 'bg-gray-200'"
                @click="toggleFeature('imageGeneration')"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                  :class="localFeatures.imageGeneration ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>

          <!-- Info Box -->
          <div class="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div class="flex gap-4">
              <Icon
                name="heroicons:information-circle"
                class="h-6 w-6 flex-shrink-0 text-blue-600"
              />
              <div class="text-sm text-blue-800">
                <p class="font-bold">Información Importante</p>
                <p class="mt-1">
                  Los cambios se aplican globalmente en tiempo real. Desactivar una función la
                  ocultará para todos los usuarios, pero no eliminará los datos asociados.
                </p>
              </div>
            </div>
          </div>

          <!-- Status Toast (Fixed Bottom) -->
          <Transition
            enter-active-class="transform ease-out duration-300 transition"
            enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="savingFeature || lastSaved" class="fixed bottom-6 right-6 z-50">
              <div
                class="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-white shadow-xl"
              >
                <Icon
                  v-if="savingFeature"
                  name="heroicons:arrow-path"
                  class="h-5 w-5 animate-spin text-emerald-400"
                />
                <Icon v-else name="heroicons:check-circle" class="h-5 w-5 text-emerald-400" />
                <span class="text-sm font-medium">
                  {{ savingFeature ? 'Guardando cambios...' : '¡Configuración actualizada!' }}
                </span>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useFeatures } from '~/composables/useFeatures'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

const router = useRouter()
const { isAuthenticated } = useAuth()
// Removed user destructuring if not used directly
const { features, loading, error, fetchFeatures, updateFeatures } = useFeatures()

const localFeatures = reactive({
  favorites: false,
  comments: false,
  imageGeneration: false,
})

const savingFeature = ref(false)
const lastSaved = ref(false)

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  await fetchFeatures()
  syncLocalFeatures()
})

const syncLocalFeatures = () => {
  if (features.value) {
    localFeatures.favorites = features.value.favorites === true
    localFeatures.comments = features.value.comments === true
    localFeatures.imageGeneration = features.value.imageGeneration === true
  }
}

const toggleFeature = async (featureName) => {
  // Optimistic UI update
  const newValue = !localFeatures[featureName]
  localFeatures[featureName] = newValue

  savingFeature.value = true
  lastSaved.value = false

  const updates = {}
  updates[featureName] = newValue

  try {
    const success = await updateFeatures(updates)
    if (success) {
      lastSaved.value = true
      setTimeout(() => {
        lastSaved.value = false
      }, 3000)
    } else {
      // Revert on failure (optional, but good UX)
      localFeatures[featureName] = !newValue
    }
  } catch (e) {
    localFeatures[featureName] = !newValue
    console.error(e)
  } finally {
    savingFeature.value = false
  }
}
</script>
