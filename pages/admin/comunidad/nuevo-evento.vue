<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/comunidad" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="ph:arrow-left-bold" class="h-6 w-6" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h1>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <!-- Título -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Nombre del Evento</label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            placeholder="Ej: Jornada de Vacunación Gratuita"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Fecha y Hora -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Fecha y Hora</label>
            <input
              v-model="form.datetime"
              type="datetime-local"
              required
              class="w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <!-- Ubicación -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Ubicación</label>
            <input
              v-model="form.location"
              type="text"
              required
              class="w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="Ej: Plaza de la República"
            />
          </div>
        </div>

        <!-- Imagen de Portada -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Imagen Promocional</label>
          <div class="mt-1 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 hover:border-amber-500 transition-colors">
            <div class="space-y-1 text-center">
              <NuxtImg v-if="previewUrl" :src="previewUrl" class="mx-auto h-48 rounded-lg object-cover mb-4" />
              <Icon v-else name="ph:image-duotone" class="mx-auto h-12 w-12 text-gray-300" />
              
              <div class="flex text-sm text-gray-600 justify-center">
                <label class="relative cursor-pointer rounded-md bg-white font-semibold text-amber-600 focus-within:outline-none hover:text-amber-500">
                  <span>{{ previewUrl ? 'Cambiar imagen' : 'Subir un archivo' }}</span>
                  <input type="file" class="sr-only" accept="image/*" @change="handleFileChange" />
                </label>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, WEBP hasta 5MB</p>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Descripción del Evento</label>
          <textarea
            v-model="form.description"
            rows="5"
            required
            class="w-full rounded-xl border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            placeholder="Detalla de qué tratará el evento, qué deben llevar los asistentes, etc."
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="pt-4 flex justify-end">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex justify-center items-center rounded-xl bg-amber-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50"
          >
            <Icon v-if="loading" name="ph:spinner-gap-bold" class="animate-spin h-5 w-5 mr-2" />
            Publicar Evento
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTablon } from '~/composables/useTablon'
import { useS3 } from '~/composables/useS3'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const { createEvento, error } = useTablon()
const { uploadFile } = useS3()

const loading = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const form = ref({
  title: '',
  datetime: '',
  location: '',
  description: '',
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    previewUrl.value = URL.createObjectURL(selectedFile.value)
  }
}

const handleSubmit = async () => {
  loading.value = true
  
  let imageUrl = ''
  if (selectedFile.value) {
    try {
      // Usar uploadFile que es el método correcto en useS3
      imageUrl = await uploadFile(selectedFile.value, 'eventos', selectedFile.value.name)
    } catch (e) {
      console.error('[Admin] Error al subir imagen de evento:', e)
      alert('Error subiendo imagen: ' + (e instanceof Error ? e.message : 'Error desconocido'))
      loading.value = false
      return
    }
  }

  // Convert datetime-local string to timestamp
  const dateTimestamp = new Date(form.value.datetime).getTime()

  const id = await createEvento({
    title: form.value.title,
    description: form.value.description,
    location: form.value.location,
    date: dateTimestamp,
    imageUrl
  })

  loading.value = false
  
  if (id) {
    router.push('/admin/comunidad')
  } else {
    alert('No se pudo crear el evento' + (error.value ? ': ' + error.value : ''))
  }
}
</script>
