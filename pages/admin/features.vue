<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 py-12">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-emerald-900 mb-2">Configuración de Características</h1>
        <p class="text-gray-600">Activa o desactiva funcionalidades específicas de la plataforma</p>
      </div>

      <!-- Cargando -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p class="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
        <div class="flex gap-3">
          <Icon name="mdi:alert-circle" class="h-5 w-5 flex-shrink-0 text-red-700 mt-0.5" />
          <div>
            <h3 class="font-semibold text-red-800">Error</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div v-if="!loading" class="max-w-2xl">
        <!-- Tarjeta de configuración -->
        <div class="rounded-lg bg-white shadow-lg overflow-hidden">
          <!-- Favoritos -->
          <div class="border-b border-gray-200 p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <Icon name="heroicons:heart" class="h-8 w-8 text-red-500" />
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Sistema de Favoritos</h3>
                  <p class="text-sm text-gray-600 mt-1">Permite a los usuarios marcar mascotas como favoritas</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="localFeatures.favorites"
                  @change="updateFeature('favorites', localFeatures.favorites)"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <!-- Comentarios -->
          <div class="border-b border-gray-200 p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <Icon name="heroicons:chat-bubble-left" class="h-8 w-8 text-blue-500" />
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Sistema de Comentarios</h3>
                  <p class="text-sm text-gray-600 mt-1">Permite a los usuarios comentar y calificar mascotas</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="localFeatures.comments"
                  @change="updateFeature('comments', localFeatures.comments)"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <!-- Generador de imágenes -->
          <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <Icon name="heroicons:photo" class="h-8 w-8 text-amber-500" />
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Generador de Imágenes IA</h3>
                  <p class="text-sm text-gray-600 mt-1">Permite generar imágenes compartibles con marco y código QR</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="localFeatures.imageGeneration"
                  @change="updateFeature('imageGeneration', localFeatures.imageGeneration)"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Información útil -->
        <div class="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div class="flex gap-3">
            <Icon name="mdi:information" class="h-5 w-5 flex-shrink-0 text-blue-700 mt-0.5" />
            <div class="text-sm text-blue-800">
              <p class="font-semibold mb-2">Información</p>
              <ul class="list-disc list-inside space-y-1">
                <li>Estos cambios se aplican inmediatamente en toda la plataforma</li>
                <li>Las funcionalidades desactivadas estarán ocultas para todos los usuarios</li>
                <li>Los datos existentes no se eliminarán, solo se ocultarán</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Estado de guardado -->
        <div v-if="savingFeature" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div class="flex items-center gap-3">
            <Icon name="mdi:clock-outline" class="h-5 w-5 text-amber-700 animate-spin" />
            <p class="text-sm text-amber-800">Guardando cambios...</p>
          </div>
        </div>

        <div v-if="lastSaved" class="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div class="flex items-center gap-3">
            <Icon name="mdi:check-circle" class="h-5 w-5 text-green-700" />
            <p class="text-sm text-green-800">Cambios guardados correctamente</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useFeatures } from '../../composables/useFeatures'
import { useRouter } from 'vue-router'

const router = useRouter()
const { isAuthenticated, user } = useAuth()
const { features, loading, error, fetchFeatures, updateFeatures, isFeatureEnabled } = useFeatures()

const localFeatures = reactive({
  favorites: false,
  comments: false,
  imageGeneration: false,
})

const savingFeature = ref(false)
const lastSaved = ref(false)

// Cargar features al montar
onMounted(async () => {
  // Verificar que sea admin (esto debería estar en middleware)
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  // Cargar configuración
  await fetchFeatures()
  
  // Actualizar locales
  localFeatures.favorites = features.value.favorites
  localFeatures.comments = features.value.comments
  localFeatures.imageGeneration = features.value.imageGeneration
})

// Actualizar feature individual
const updateFeature = async (featureName: string, value: boolean) => {
  savingFeature.value = true
  lastSaved.value = false

  const updates: any = {}
  updates[featureName] = value

  const success = await updateFeatures(updates)
  
  if (success) {
    lastSaved.value = true
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      lastSaved.value = false
    }, 3000)
  }

  savingFeature.value = false
}
</script>
