<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto max-w-4xl px-4">
      <!-- Navegación de regreso -->
      <div class="mb-8">
        <NuxtLink
          to="/historias"
          class="inline-flex items-center text-emerald-600 hover:text-emerald-700"
        >
          <Icon name="heroicons:arrow-left" class="mr-1 h-5 w-5" />
          <span>Volver a historias</span>
        </NuxtLink>
      </div>

      <!-- Mensaje de carga -->
      <div v-if="isCheckingAdoptions" class="rounded-lg bg-white p-6 text-center shadow-lg md:p-8">
        <div
          class="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        />
        <p class="text-gray-700">Verificando tus adopciones...</p>
      </div>

      <!-- Mensaje si no hay adopciones -->
      <div v-else-if="!hasAdoptions" class="rounded-lg bg-white p-6 shadow-lg md:p-8">
        <h1 class="mb-4 text-2xl font-bold text-emerald-800">¡Necesitas adoptar primero!</h1>

        <div class="mb-6 border-l-4 border-amber-500 bg-amber-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Icon name="heroicons:information-circle" class="h-5 w-5 text-amber-500" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-amber-700">
                Para compartir una historia de adopción, primero debes haber adoptado una mascota a
                través de nuestra plataforma.
              </p>
            </div>
          </div>
        </div>

        <p class="mb-6 text-gray-600">
          Las historias de adopción son experiencias compartidas por usuarios que han adoptado
          mascotas. Estas historias inspiran a otros a considerar la adopción y muestran el impacto
          positivo que las mascotas tienen en nuestras vidas.
        </p>

        <div class="flex justify-center">
          <NuxtLink
            to="/mascotas"
            class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            <Icon name="heroicons:heart" class="mr-2" size="20px" />
            Explora mascotas en adopción
          </NuxtLink>
        </div>
      </div>

      <!-- Formulario de creación -->
      <div v-else class="rounded-lg bg-white p-6 shadow-lg md:p-8">
        <h1 class="mb-6 text-2xl font-bold text-emerald-800">Comparte tu historia de adopción</h1>

        <!-- Instrucciones -->
        <div class="mb-8 border-l-4 border-blue-500 bg-blue-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Icon name="heroicons:information-circle" class="h-5 w-5 text-blue-500" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700">
                Comparte tu experiencia de adopción para inspirar a otros a adoptar mascotas. Cuenta
                cómo conociste a tu mascota, cómo ha sido el proceso de adaptación y qué ha
                significado para ti.
              </p>
            </div>
          </div>
        </div>

        <!-- Formulario de creación -->
        <form @submit.prevent="submitStory">
          <!-- Título de la historia -->
          <div class="mb-6">
            <label for="title" class="mb-1 block text-sm font-medium text-gray-700">
              Título de tu historia *
            </label>
            <input
              id="title"
              v-model="storyData.title"
              type="text"
              required
              maxlength="100"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Ej: 'Cómo Luna cambió nuestras vidas' o 'Mi aventura con Max'"
            >
            <p class="mt-1 text-xs text-gray-500">{{ storyData.title.length }}/100 caracteres</p>
          </div>

          <!-- Selección de mascota -->
          <div class="mb-6">
            <label for="pet" class="mb-1 block text-sm font-medium text-gray-700">
              Mascota adoptada
            </label>
            <select
              id="pet"
              v-model="storyData.petId"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            >
              <option value="" selected>Sin mascota asociada</option>
              <option v-for="pet in adoptedPets" :key="pet.id" :value="pet.id">
                {{ pet.name }} ({{ formatType(pet.type) }})
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Selecciona la mascota sobre la que trata esta historia
            </p>
          </div>

          <!-- Contenido de la historia -->
          <div class="mb-6">
            <label for="content" class="mb-1 block text-sm font-medium text-gray-700">
              Tu historia *
            </label>
            <textarea
              id="content"
              v-model="storyData.content"
              rows="10"
              required
              maxlength="5000"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Comparte tu experiencia de adopción. ¿Cómo conociste a tu mascota? ¿Cómo ha sido la adaptación? ¿Qué ha significado para ti?"
            />
            <p class="mt-1 text-xs text-gray-500">{{ storyData.content.length }}/5000 caracteres</p>
          </div>

          <!-- Imágenes -->
          <div class="mb-8">
            <label class="mb-1 block text-sm font-medium text-gray-700">Imágenes</label>

            <!-- Botón de carga -->
            <div class="mb-2 flex flex-wrap gap-4">
              <label
                class="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleImageUpload"
                >
                <div class="flex flex-col items-center">
                  <Icon name="heroicons:plus" class="h-8 w-8 text-gray-400" />
                  <span class="mt-1 text-xs text-gray-500">Añadir imágenes</span>
                </div>
              </label>

              <!-- Vista previa de imágenes -->
              <div
                v-for="(image, index) in previews"
                :key="index"
                class="relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200"
              >
                <NuxtImg
                  :src="image"
                  class="h-full w-full object-cover"
                  :alt="`Vista previa ${index + 1}`"
                />
                <button
                  type="button"
                  class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white"
                  @click="removeImage(index)"
                >
                  <Icon name="heroicons:x-mark" class="h-4 w-4" />
                </button>
              </div>
            </div>
            <p class="text-xs text-gray-500">
              Puedes añadir hasta 5 imágenes (JPG, PNG). Máximo 5MB por imagen.
            </p>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3">
            <NuxtLink
              to="/historias"
              class="rounded-md border border-gray-300 bg-white px-6 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancelar
            </NuxtLink>
            <button
              type="submit"
              class="rounded-md border border-transparent bg-emerald-600 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
              :disabled="loading || !isFormValid"
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
              <span v-else>Publicar historia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useAdoptionStories } from '~/composables/useAdoptionStories'
import { usePets } from '~/composables/usePets'
import { useS3 } from '~/composables/useS3'
import { useFirebaseApp } from 'vuefire'
import { getDatabase, ref as dbRef, query, orderByChild, equalTo, get } from 'firebase/database'

// Router y composables
const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { createStory } = useAdoptionStories()
const { fetchUserPets } = usePets()
const { uploadImage } = useS3()

// Redireccionar si no está autenticado
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  } else {
    checkUserAdoptions()
  }
})

// Estados
const loading = ref(false)
const isCheckingAdoptions = ref(true)
const hasAdoptions = ref(false)
const adoptedPets = ref([])
const userPets = ref([])
const error = ref(null)

// Datos del formulario
const storyData = ref({
  title: '',
  content: '',
  petId: '',
  images: [],
})

// Imágenes
const images = ref([])
const previews = ref([])

// Comprobar si el usuario ha adoptado alguna mascota
const checkUserAdoptions = async () => {
  if (!user.value) return

  isCheckingAdoptions.value = true

  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)
    const adoptionsRef = dbRef(db, 'adoptions')

    // Buscar adopciones completadas del usuario
    const adoptionsQuery = query(
      adoptionsRef,
      orderByChild('userId'),
      equalTo(user.value.uid)
    )

    const snapshot = await get(adoptionsQuery)
    const completedAdoptions = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const adoption = childSnapshot.val()
        if (adoption.status === 'completed') {
          completedAdoptions.push({
            id: childSnapshot.key,
            ...adoption
          })
        }
      })
    }

    // Obtener los detalles de las mascotas adoptadas
    if (completedAdoptions.length > 0) {
      const pets = []
      for (const adoption of completedAdoptions) {
        const petRef = dbRef(db, `pets/${adoption.petId}`)
        const petSnapshot = await get(petRef)
        if (petSnapshot.exists()) {
          const petData = petSnapshot.val()
          pets.push({
            id: adoption.petId,
            adoptionId: adoption.id,
            ...petData
          })
        }
      }
      adoptedPets.value = pets
    } else {
      adoptedPets.value = []
    }

    // Actualizar el estado de adopciones
    hasAdoptions.value = adoptedPets.value.length > 0

  } catch (err) {
    console.error('Error al verificar adopciones del usuario:', err)
    error.value = 'Error al verificar tus adopciones'
  } finally {
    isCheckingAdoptions.value = false
  }
}

// Cargar mascotas del usuario
onMounted(async () => {
  if (isAuthenticated.value && user.value) {
    try {
      loading.value = true

      // Obtener mascotas del usuario, pero solo aquellas que han sido adoptadas
      const allUserPets = await fetchUserPets(user.value.uid)
      userPets.value = allUserPets.filter((pet) => pet.status === 'adopted')

      if (userPets.value.length === 0) {
        error.value =
          "Para crear una historia de adopción, debes haber adoptado previamente una mascota. Puedes adoptar mascotas desde la sección 'Mascotas'."
      }
    } catch (err) {
      console.error('Error al cargar mascotas del usuario:', err)
      error.value = 'No se pudieron cargar las mascotas adoptadas'
    } finally {
      loading.value = false
    }
  }
})

// Manejo de imágenes
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)

  // Validar límite de 5 imágenes
  if (images.value.length + files.length > 5) {
    alert('Solo puedes subir hasta 5 imágenes.')
    return
  }

  // Validar tamaño (5MB máximo por imagen)
  const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024)
  if (invalidFiles.length > 0) {
    alert('Algunas imágenes exceden el límite de 5MB.')
    return
  }

  // Agregar archivos y crear vistas previas
  files.forEach((file) => {
    images.value.push(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      previews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

// Remover imagen
const removeImage = (index) => {
  images.value.splice(index, 1)
  previews.value.splice(index, 1)
}

// Formatear tipo de mascota
const formatType = (type) => {
  const types = {
    dog: 'Perro',
    cat: 'Gato',
    bird: 'Ave',
    rabbit: 'Conejo',
    hamster: 'Hámster',
    fish: 'Pez',
    reptile: 'Reptil',
    other: 'Otro',
  }

  return types[type] || type
}

// Validar formulario
const isFormValid = computed(() => {
  return storyData.value.title.trim() !== '' && storyData.value.content.trim() !== ''
})

// Enviar formulario
const submitStory = async () => {
  if (!isFormValid.value) return

  loading.value = true

  try {
    // Subir imágenes si hay
    const imageUrls = []

    if (images.value.length > 0) {
      for (const image of images.value) {
        const url = await uploadImage(image, 'stories')
        imageUrls.push(url)
      }
    }

    // Crear historia
    const storyId = await createStory({
      title: storyData.value.title,
      content: storyData.value.content,
      userId: user.value.uid,
      petId: storyData.value.petId || null,
      images: imageUrls,
      createdAt: Date.now(),
    })

    // Redirigir a la historia creada
    router.push(`/historias/${storyId}`)
  } catch (error) {
    console.error('Error al crear historia:', error)
    alert('Ocurrió un error al crear la historia. Por favor, intenta de nuevo.')
  } finally {
    loading.value = false
  }
}
</script>
