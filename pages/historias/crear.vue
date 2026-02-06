<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto max-w-5xl px-4">
      <!-- Navegación de regreso -->
      <div class="mb-6">
        <NuxtLink
          to="/historias"
          class="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="mr-2 h-5 w-5" />
          <span>Volver a historias</span>
        </NuxtLink>
      </div>

      <!-- Título Principal -->
      <div class="mb-8 text-center sm:text-left">
        <h1 class="text-3xl font-bold text-emerald-800">Comparte tu historia</h1>
        <p class="text-gray-600 mt-2">Inspira a otros compartiendo tu experiencia de adopción.</p>
      </div>

      <!-- Loading State -->
      <div v-if="isCheckingAdoptions" class="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-emerald-100">
        <div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500 font-medium">Verificando tus adopciones...</p>
      </div>

      <!-- No Adoptions State -->
      <div v-else-if="!hasAdoptions" class="bg-white rounded-xl shadow-sm border border-amber-200 p-8 text-center max-w-3xl mx-auto">
         <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="heroicons:heart" class="w-8 h-8 text-amber-600" />
         </div>
         <h2 class="text-2xl font-bold text-gray-900 mb-2">¡Primero necesitas adoptar!</h2>
         <p class="text-gray-600 mb-6 max-w-lg mx-auto">
           Para escribir una historia, debes haber completado un proceso de adopción a través de nuestra plataforma. ¡Tu futura mascota te está esperando!
         </p>
         <NuxtLink to="/mascotas" class="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
            Ver mascotas en adopción
         </NuxtLink>
      </div>

      <!-- Formulario -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <!-- Info Banner -->
        <div class="bg-emerald-50 p-6 border-b border-emerald-100 flex gap-4 items-start">
           <Icon name="heroicons:sparkles" class="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
           <div>
              <h3 class="font-semibold text-emerald-900">¿Qué hace una buena historia?</h3>
              <p class="text-sm text-emerald-800 mt-1">Cuenta detalles sobre cómo se conocieron, el proceso de adaptación y los momentos divertidos. ¡Las fotos del "antes y después" son muy populares!</p>
           </div>
        </div>

        <form @submit.prevent="submitStory" class="p-6 md:p-8 space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Título -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Título de tu historia <span class="text-red-500">*</span></label>
              <input
                v-model="storyData.title"
                type="text"
                required
                maxlength="100"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                placeholder="Ej: Un nuevo comienzo para Luna"
              >
            </div>

            <!-- Mascota -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mascota protagonista <span class="text-red-500">*</span></label>
              <select
                v-model="storyData.petId"
                @change="() => checkSelectedPetStory(storyData.petId)"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
              >
                <option value="" disabled>Selecciona una mascota</option>
                <option v-for="pet in adoptedPets" :key="pet.id" :value="pet.id">
                  {{ pet.name }} ({{ formatType(pet.type) }})
                </option>
              </select>

              <!-- Warning if story exists -->
              <div v-if="selectedPetHasStory" class="mt-3 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200 flex items-center gap-2">
                <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-amber-500" />
                <span>Ya existe una historia para esta mascota.</span>
              </div>
            </div>

            <!-- Contenido -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Tu Historia <span class="text-red-500">*</span></label>
              <textarea
                v-model="storyData.content"
                rows="12"
                required
                maxlength="5000"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Escribe aquí tu experiencia..."
              ></textarea>
              <p class="text-xs text-gray-500 text-right mt-1">{{ storyData.content.length }}/5000 caracteres</p>
            </div>

            <!-- Imágenes -->
            <div class="md:col-span-2">
               <label class="block text-sm font-medium text-gray-700 mb-2">Fotos de la historia (Máx 5)</label>
               
               <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <!-- Upload Button -->
                  <div 
                    v-if="previews.length < 5"
                    class="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors bg-gray-50 bg-opacity-50"
                    @click="$refs.fileInput.click()"
                  >
                     <Icon name="heroicons:camera" class="w-8 h-8 text-gray-400 mb-1" />
                     <span class="text-xs text-gray-500 font-medium">Añadir foto</span>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden"
                    @change="handleImageUpload"
                  >

                  <!-- Previews -->
                  <div 
                    v-for="(image, index) in previews"
                    :key="index"
                    class="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm"
                  >
                    <img :src="image" class="w-full h-full object-cover" />
                    <button
                      type="button"
                      class="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                      @click="removeImage(index)"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                    
                     <!-- Upload Progress Overlay (Simulated for this form structure) -->
                    <div v-if="uploadProgress[index] !== undefined && uploadProgress[index] < 100" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                       <span class="text-white text-xs font-bold">{{ uploadProgress[index] }}%</span>
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
              class="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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

// Check if story exists for pet
async function checkSelectedPetStory(petId) {
  selectedPetHasStory.value = false
  if (!petId) return
  try {
    const db = getDatabase(useFirebaseApp())
    const snap = await get(dbRef(db, `petStories/${petId}`))
    if (snap.exists()) selectedPetHasStory.value = true
  } catch (e) {
    console.warn(e)
  }
}

// Fetch User Adoptions
const checkUserAdoptions = async () => {
  if (!user.value) return
  isCheckingAdoptions.value = true

  try {
    const db = getDatabase(useFirebaseApp())
    const adoptionsQuery = query(dbRef(db, 'adoptions'), orderByChild('userId'), equalTo(user.value.uid))
    const snapshot = await get(adoptionsQuery)
    const completedAdoptions = []

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const adoption = child.val()
        if (adoption.status === 'completed') {
          completedAdoptions.push({ id: child.key, ...adoption })
        }
      })
    }

    if (completedAdoptions.length > 0) {
      const pets = []
      for (const adoption of completedAdoptions) {
        const petSnapshot = await get(dbRef(db, `pets/${adoption.petId}`))
        if (petSnapshot.exists()) {
          pets.push({ id: adoption.petId, adoptionId: adoption.id, ...petSnapshot.val() })
        }
      }
      adoptedPets.value = pets
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

  files.forEach(file => {
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
  return storyData.value.title.trim().length > 3 && 
         storyData.value.content.trim().length > 20 &&
         storyData.value.petId
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
       
       const url = await uploadFileWithProgress(file, 'stories', fileName, (p) => {
          uploadProgress.value[i] = p
       }, { optimize: true, quality: 0.8 })
       
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
