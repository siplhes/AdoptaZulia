<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto max-w-5xl px-4">
      <!-- Navegación de regreso -->
      <div class="mb-6">
        <NuxtLink
          to="/historias"
          class="inline-flex items-center font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          <Icon name="heroicons:arrow-left" class="mr-2 h-5 w-5" />
          <span>Volver a historias</span>
        </NuxtLink>
      </div>

      <!-- Título Principal -->
      <div class="mb-8 text-center sm:text-left">
        <h1 class="text-3xl font-bold text-emerald-800">Comparte tu historia</h1>
        <p class="mt-2 text-gray-600">Inspira a otros compartiendo tu experiencia de adopción.</p>
      </div>

      <!-- Loading State -->
      <div
        v-if="isCheckingAdoptions"
        class="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-white py-20 shadow-sm"
      >
        <div
          class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
        />
        <p class="font-medium text-gray-500">Verificando tus adopciones...</p>
      </div>

      <!-- No Adoptions State -->
      <div
        v-else-if="!hasAdoptions"
        class="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm"
      >
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100"
        >
          <Icon name="heroicons:heart" class="h-8 w-8 text-amber-600" />
        </div>
        <h2 class="mb-2 text-2xl font-bold text-gray-900">¡Cuéntanos tu historia!</h2>
        <p class="mx-auto mb-6 max-w-lg text-gray-600">
          Para escribir una historia, debes haber adoptado una mascota o haber dado una en adopción.
        </p>
        <NuxtLink
          to="/mascotas"
          class="inline-flex items-center rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Ver mascotas en adopción
        </NuxtLink>
      </div>

      <!-- Formulario -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <!-- Info Banner -->
        <div class="flex items-start gap-4 border-b border-emerald-100 bg-emerald-50 p-6">
          <Icon name="heroicons:sparkles" class="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h3 class="font-semibold text-emerald-900">¿Qué hace una buena historia?</h3>
            <p class="mt-1 text-sm text-emerald-800">
              Cuenta detalles sobre cómo se conocieron, el proceso de adaptación y los momentos
              divertidos. ¡Las fotos del "antes y después" son muy populares!
            </p>
          </div>
        </div>

        <form class="space-y-6 p-6 md:p-8" @submit.prevent="submitStory">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Título -->
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Título de tu historia
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="storyData.title"
                type="text"
                required
                maxlength="100"
                class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Ej: Un nuevo comienzo para Luna"
              />
            </div>

            <!-- Mascota -->
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Mascota protagonista
                <span class="text-red-500">*</span>
              </label>
              <select
                v-model="storyData.petId"
                class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                @change="() => checkSelectedPetStory(storyData.petId)"
              >
                <option value="" disabled>Selecciona una mascota</option>
                <option v-for="pet in adoptedPets" :key="pet.id" :value="pet.id">
                  {{ pet.name }} ({{ formatType(pet.type) }})
                </option>
              </select>

              <!-- Warning if story exists -->
              <div
                v-if="selectedPetHasStory"
                class="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
              >
                <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-amber-500" />
                <span>Ya existe una historia para esta mascota.</span>
              </div>
            </div>

            <!-- Contenido -->
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Tu Historia
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="storyData.content"
                rows="12"
                required
                maxlength="5000"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Escribe aquí tu experiencia..."
              />
              <p class="mt-1 text-right text-xs text-gray-500">
                {{ storyData.content.length }}/5000 caracteres
              </p>
            </div>

            <!-- Imágenes -->
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Fotos de la historia (Máx 5)
              </label>

              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                <!-- Upload Button -->
                <div
                  v-if="previews.length < 5"
                  class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 bg-opacity-50 transition-colors hover:border-emerald-500 hover:bg-emerald-50"
                  @click="$refs.fileInput.click()"
                >
                  <Icon name="heroicons:camera" class="mb-1 h-8 w-8 text-gray-400" />
                  <span class="text-xs font-medium text-gray-500">Añadir foto</span>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleImageUpload"
                />

                <!-- Previews -->
                <div
                  v-for="(image, index) in previews"
                  :key="index"
                  class="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                >
                  <img :src="image" class="h-full w-full object-cover" />
                  <button
                    type="button"
                    class="absolute right-1 top-1 rounded-full bg-white/90 p-1.5 text-red-500 opacity-0 shadow-sm transition-opacity hover:scale-110 group-hover:opacity-100"
                    @click="removeImage(index)"
                  >
                    <Icon name="heroicons:trash" class="h-4 w-4" />
                  </button>

                  <!-- Upload Progress Overlay (Simulated for this form structure) -->
                  <div
                    v-if="uploadProgress[index] !== undefined && uploadProgress[index] < 100"
                    class="absolute inset-0 flex items-center justify-center bg-black/50"
                  >
                    <span class="text-xs font-bold text-white">{{ uploadProgress[index] }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr class="border-gray-100" />

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <NuxtLink
              to="/historias"
              class="px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Cancelar
            </NuxtLink>
            <LoadingButton
              type="submit"
              :loading="loading"
              :disabled="!isFormValid || selectedPetHasStory"
              variant="primary"
              class="px-8 py-2.5"
            >
              Publicar Historia
            </LoadingButton>
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
import LoadingButton from '~/components/ui/LoadingButton.vue'
import { useToast } from '~/composables/useToast'
import { useFirebaseApp } from 'vuefire'
import { getDatabase, ref as dbRef, query, orderByChild, equalTo, get } from 'firebase/database'

// Router & Composables
const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { createStory } = useAdoptionStories()
const { fetchUserPets } = usePets()
const { uploadFileWithProgress } = useS3() // Updated to use progress capable uploader
const { success: toastSuccess, error: toastError } = useToast()

// State
const loading = ref(false)
const isCheckingAdoptions = ref(true)
const hasAdoptions = ref(false)
const adoptedPets = ref([])
const error = ref(null)
const selectedPetHasStory = ref(false)

// Form Data
const storyData = ref({
  title: '',
  content: '',
  petId: '',
})

// Images
const images = ref([])
const previews = ref([])
const uploadProgress = ref([]) // Track progress per image

// Auth Check
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  } else {
    checkUserAdoptions()
  }
})

// Check if story exists for pet (User Specific)
async function checkSelectedPetStory(petId) {
  selectedPetHasStory.value = false
  if (!petId || !user.value) return
  try {
    const db = getDatabase(useFirebaseApp())
    const storiesQuery = query(dbRef(db, 'adoption_stories'), orderByChild('petId'), equalTo(petId))
    const snap = await get(storiesQuery)

    if (snap.exists()) {
      const stories = snap.val()
      // Check if THIS user has written a story
      const hasUserStory = Object.values(stories).some((s) => s.userId === user.value.uid)
      if (hasUserStory) selectedPetHasStory.value = true
    }
  } catch (e) {
    console.warn(e)
  }
}

// Fetch User Adoptions (Adopter & Owner)
const checkUserAdoptions = async () => {
  if (!user.value) return
  isCheckingAdoptions.value = true

  try {
    const db = getDatabase(useFirebaseApp())
    const userId = user.value.uid
    const petsMap = new Map()
    console.log('Checking user adoptions for user:', userId)

    // 1. As Adopter: Fetch completed adoptions
    const adoptionsQuery = query(dbRef(db, 'adoptions'), orderByChild('userId'), equalTo(userId))
    const adoptionsSnap = await get(adoptionsQuery)

    if (adoptionsSnap.exists()) {
      adoptionsSnap.forEach((child) => {
        const adoption = child.val()
        if (adoption.status === 'completed' && adoption.petId) {
          petsMap.set(adoption.petId, { role: 'adopter', adoptionId: child.key })
        }
      })
    }

    // 2. As Owner: Fetch my pets that are now adopted
    const petsQuery = query(dbRef(db, 'pets'), orderByChild('userId'), equalTo(userId))
    const petsSnap = await get(petsQuery)

    if (petsSnap.exists()) {
      petsSnap.forEach((child) => {
        const pet = child.val()
        // If pet is adopted, I can write a story (Farewell/Happy Ending)
        if (pet.status === 'adopted') {
          // If already added as adopter, keep adopter role (rare case of self-adoption?)
          if (!petsMap.has(child.key)) {
            petsMap.set(child.key, { role: 'owner', adoptionId: pet.adoptionId })
          }
        }
      })
    }

    console.log('Pets map size:', petsMap.size)
    console.log('Pets found:', Array.from(petsMap.keys()))

    if (petsMap.size > 0) {
      const petsList = []
      // Fetch details for all pets
      for (const [petId, info] of petsMap.entries()) {
        const petSnapshot = await get(dbRef(db, `pets/${petId}`))
        if (petSnapshot.exists()) {
          const petData = petSnapshot.val()
          petsList.push({
            id: petId,
            adoptionId: info.adoptionId,
            ...petData,
          })
        }
      }
      adoptedPets.value = petsList
    } else {
      adoptedPets.value = []
    }

    hasAdoptions.value = adoptedPets.value.length > 0
  } catch (err) {
    console.error(err)
    error.value = 'Error verificando adopciones'
  } finally {
    isCheckingAdoptions.value = false
  }
}

// Image Handling
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  if (images.value.length + files.length > 5) {
    toastError('Límite excedido', 'Máximo 5 imágenes permitidas')
    return
  }

  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      toastError('Archivo muy grande', `${file.name} excede 5MB`)
      return
    }
    images.value.push(file)
    const reader = new FileReader()
    reader.onload = (e) => previews.value.push(e.target.result)
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  images.value.splice(index, 1)
  previews.value.splice(index, 1)
}

const formatType = (type) => {
  const types = { dog: 'Perro', cat: 'Gato', bird: 'Ave', rabbit: 'Conejo' }
  return types[type] || 'Mascota'
}

const isFormValid = computed(() => {
  return (
    storyData.value.title.trim().length > 3 &&
    storyData.value.content.trim().length > 20 &&
    storyData.value.petId
  )
})

// Submission
const submitStory = async () => {
  if (!isFormValid.value) return
  loading.value = true
  uploadProgress.value = new Array(images.value.length).fill(0)

  try {
    const imageUrls = []

    // Upload images with progress
    for (let i = 0; i < images.value.length; i++) {
      const file = images.value[i]
      const ext = file.name.split('.').pop()
      const fileName = `story-${user.value.uid}-${Date.now()}-${i}.${ext}`

      const url = await uploadFileWithProgress(
        file,
        'stories',
        fileName,
        (p) => {
          uploadProgress.value[i] = p
        },
        { optimize: true, quality: 0.8 }
      )

      imageUrls.push(url)
    }

    const storyId = await createStory({
      title: storyData.value.title,
      content: storyData.value.content,
      userId: user.value.uid,
      petId: storyData.value.petId,
      images: imageUrls,
      createdAt: Date.now(),
    })

    toastSuccess('¡Historia Publicada!', 'Gracias por compartir tu experiencia.')
    router.push(`/historias/${storyId}`)
  } catch (err) {
    console.error(err)
    toastError('Error', 'No se pudo publicar la historia')
  } finally {
    loading.value = false
  }
}
</script>
