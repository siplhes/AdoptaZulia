<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto max-w-5xl px-4">
      <!-- Header -->
      <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Editar Mascota</h1>
          <p class="text-gray-600">Actualiza la información de tu publicación.</p>
        </div>
        <button
          class="flex items-center gap-2 self-start font-medium text-emerald-600 hover:text-emerald-700 md:self-auto"
          @click="router.push(`/mascotas/${route.params.id}`)"
        >
          <Icon name="heroicons:arrow-left" class="h-5 w-5" />
          Volver a la mascota
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="initialLoading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="loadError || !isAuthorized"
        class="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
      >
        <div
          class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
        >
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="mb-2 text-lg font-bold text-red-800">No se pudo cargar la edición</h3>
        <p class="mb-4 text-gray-600">
          {{ loadError || 'No tienes permiso para editar esta mascota.' }}
        </p>
        <button
          class="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
          @click="router.push('/mascotas')"
        >
          Volver al listado
        </button>
      </div>

      <!-- Wizard Form -->
      <form
        v-else
        class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        @submit.prevent="submitUpdate"
      >
        <!-- Progress Bar -->
        <div class="border-b border-emerald-100 bg-emerald-50 px-6 py-4">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="font-medium text-emerald-800">
              Paso {{ currentStep }} de {{ steps.length }}
            </span>
            <span class="font-bold text-emerald-600">{{ steps[currentStep - 1].title }}</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-emerald-200">
            <div
              class="h-full bg-emerald-500 transition-all duration-300 ease-out"
              :style="{ width: `${(currentStep / steps.length) * 100}%` }"
            />
          </div>
        </div>

        <div class="p-6 md:p-8">
          <!-- Step 1: Datos Básicos -->
          <div v-show="currentStep === 1" class="animate-fadeIn space-y-5">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:information-circle" class="h-6 w-6 text-emerald-500" />
              Información general
            </h2>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <!-- Nombre -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Nombre
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="petData.name"
                  type="text"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <!-- Tipo -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Tipo de animal
                  <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="petData.typeValue"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  @change="updateTypeLabel"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="conejo">Conejo</option>
                  <option value="ave">Ave</option>
                  <option value="tortuga">Tortuga</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
              <!-- Raza -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Raza</label>
                <input
                  v-model="petData.breed"
                  type="text"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <!-- Género -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Género
                  <span class="text-red-500">*</span>
                </label>
                <div class="flex h-[42px] items-center space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      v-model="petData.gender"
                      type="radio"
                      value="macho"
                      class="border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="ml-2 text-gray-700">Macho</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      v-model="petData.gender"
                      type="radio"
                      value="hembra"
                      class="border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="ml-2 text-gray-700">Hembra</span>
                  </label>
                </div>
              </div>
              <!-- Ubicación -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Ubicación
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="petData.location"
                  type="text"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
              <!-- Edad -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Edad exacta
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="petData.age"
                  type="text"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <!-- Rango Edad -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Etapa de vida
                  <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="petData.ageValue"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option value="cachorro">Cachorro</option>
                  <option value="joven">Joven</option>
                  <option value="adulto">Adulto</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
              <!-- Tamaño -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Tamaño
                  <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="petData.sizeValue"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  @change="updateSizeLabel"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option value="pequeño">Pequeño</option>
                  <option value="mediano">Mediano</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Descripción
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="petData.description"
                rows="4"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
              <p class="mt-1 text-right text-xs text-gray-500">
                {{ petData.description.length }} caracteres
              </p>
            </div>
          </div>

          <!-- Step 2: Fotos y Salud -->
          <div v-show="currentStep === 2" class="animate-fadeIn space-y-6">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:camera" class="h-6 w-6 text-emerald-500" />
              Fotos y Salud
            </h2>

            <!-- Main Image -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Foto Principal</label>
              <div
                class="group relative flex h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-emerald-500 hover:bg-emerald-50"
                @click="$refs.mainImageInput.click()"
              >
                <img
                  v-if="mainImagePreview || petData.image"
                  :src="mainImagePreview || petData.image"
                  class="absolute inset-0 h-full w-full object-cover"
                />
                <div v-else class="flex flex-col items-center text-gray-500">
                  <Icon name="heroicons:camera" class="mb-2 h-10 w-10" />
                  <span class="text-sm font-medium">Click para subir foto</span>
                </div>

                <input
                  ref="mainImageInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleMainImageChange"
                />

                <!-- Overlay -->
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <span class="flex items-center gap-2 font-medium text-white">
                    <Icon name="heroicons:arrow-path" class="h-5 w-5" />
                    Cambiar foto
                  </span>
                </div>
              </div>
            </div>

            <!-- Additional Images -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Fotos Adicionales (Total máx 5)
              </label>
              <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                <!-- Add Button -->
                <div
                  v-if="getAllAdditionalImages().length < 5"
                  class="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-emerald-500 hover:bg-emerald-50"
                  @click="$refs.additionalImagesInput.click()"
                >
                  <Icon name="heroicons:plus" class="h-8 w-8 text-gray-400" />
                </div>
                <input
                  ref="additionalImagesInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleAdditionalImagesChange"
                />

                <!-- Existing Additional Images -->
                <div
                  v-for="(img, index) in petData.photos?.slice(1)"
                  :key="'existing-' + index"
                  class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
                >
                  <img :src="img" class="h-full w-full object-cover" />
                  <button
                    type="button"
                    class="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    @click="removeExistingAdditionalImage(index + 1)"
                  >
                    <Icon name="heroicons:x-mark" class="h-3 w-3" />
                  </button>
                </div>

                <!-- New Previews -->
                <div
                  v-for="(preview, index) in additionalImagePreviews"
                  :key="'new-' + index"
                  class="group relative aspect-square overflow-hidden rounded-lg border border-2 border-emerald-500"
                >
                  <img :src="preview" class="h-full w-full object-cover" />
                  <button
                    type="button"
                    class="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    @click="removeNewAdditionalImage(index)"
                  >
                    <Icon name="heroicons:x-mark" class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <hr class="my-4 border-gray-100" />

            <!-- Health -->
            <div>
              <h3 class="mb-4 text-lg font-medium text-gray-900">Información Médica</h3>
              <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label
                  class="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    v-model="petData.vaccinated"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Vacunado</span>
                </label>
                <label
                  class="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    v-model="petData.neutered"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Esterilizado</span>
                </label>
                <label
                  class="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    v-model="petData.microchipped"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Microchip</span>
                </label>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Detalles de Salud
                </label>
                <textarea
                  v-model="petData.healthDescription"
                  rows="2"
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <!-- Step 3: Contacto -->
          <div v-show="currentStep === 3" class="animate-fadeIn space-y-5">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:user-circle" class="h-6 w-6 text-emerald-500" />
              Contacto
            </h2>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Nombre
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="petData.contact.name"
                  type="text"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  v-model="petData.contact.type"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="particular">Particular</option>
                  <option value="protectora">Protectora / Refugio</option>
                  <option value="veterinario">Veterinaria</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Email
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="petData.contact.email"
                  type="email"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Teléfono
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="petData.contact.phone"
                  type="tel"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Preferencia</label>
              <div class="flex gap-4">
                <label class="inline-flex items-center">
                  <input
                    v-model="petData.contact.preferredMethod"
                    type="radio"
                    value="email"
                    class="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Email</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="petData.contact.preferredMethod"
                    type="radio"
                    value="phone"
                    class="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Llamada</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="petData.contact.preferredMethod"
                    type="radio"
                    value="whatsapp"
                    class="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">WhatsApp</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 4: Adopción & Estado -->
          <div v-show="currentStep === 4" class="animate-fadeIn space-y-5">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:clipboard-document-check" class="h-6 w-6 text-emerald-500" />
              Estado y Adopción
            </h2>

            <!-- Status Management -->
            <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <label class="mb-2 block text-sm font-medium text-amber-900">Estado Actual</label>
              <select
                v-model="petData.status"
                class="w-full rounded-lg border-amber-300 py-2.5 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="available">Disponible</option>
                <option value="pending">En Proceso / Pendiente</option>
                <option value="adopted">¡Adoptado!</option>
                <option value="temp_unavailable">No disponible temporalmente</option>
              </select>
            </div>

            <div class="space-y-4">
              <div class="rounded-lg border border-red-100 bg-red-50 p-4">
                <label class="flex items-center">
                  <input
                    v-model="petData.urgent"
                    type="checkbox"
                    class="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  <span class="ml-3 font-medium text-red-800">Marca de Urgencia</span>
                </label>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Requisitos para el adoptante
                </label>
                <textarea
                  v-model="petData.adoptionRequirements"
                  rows="3"
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <!-- Adopted Info (Conditional) -->
              <div
                v-if="petData.status === 'adopted'"
                class="animate-fadeIn space-y-3 rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <h4 class="font-bold text-green-800">Información de la Adopción</h4>
                <div>
                  <label class="block text-xs text-green-700">Adoptado por</label>
                  <input
                    v-model="petData.adopterName"
                    type="text"
                    class="w-full rounded border-green-300 text-sm"
                    placeholder="Nombre del adoptante"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navegación Footer -->
        <div
          class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4"
        >
          <button
            v-if="currentStep > 1"
            type="button"
            class="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            @click="prevStep"
          >
            <Icon name="heroicons:arrow-left" class="h-4 w-4" />
            Atrás
          </button>
          <button
            v-else
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600"
            @click="router.back()"
          >
            Cancelar
          </button>

          <div class="flex items-center gap-3">
            <button
              v-if="currentStep < steps.length"
              type="button"
              class="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              @click="nextStep"
            >
              Siguiente
              <Icon name="heroicons:arrow-right" class="h-4 w-4" />
            </button>

            <LoadingButton
              v-else
              type="submit"
              :loading="saving"
              variant="primary"
              class="px-8 py-2.5"
            >
              Guardar Cambios
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>

    <ModalAlert
      :show="showModal"
      :type="modalType"
      :title="modalTitle"
      :message="modalMessage"
      @confirm="closeModal"
    />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePets } from '~/composables/usePets'
import { useS3 } from '~/composables/useS3'
import ModalAlert from '~/components/common/ModalAlert.vue'
import LoadingButton from '~/components/ui/LoadingButton.vue'

// Utils
const router = useRouter()
const route = useRoute()
const { user, isAuthenticated, isAdmin } = useAuth()
const { fetchPetById, updatePet } = usePets()
const { uploadFileWithProgress } = useS3()

// State
const petId = route.params.id
const initialLoading = ref(true)
const loadError = ref(null)
const isAuthorized = ref(false)
const saving = ref(false)
const currentStep = ref(1)

// Images
const mainImageInput = ref(null)
const additionalImagesInput = ref(null)
const mainImagePreview = ref('')
const mainImageFile = ref(null)
const additionalImagePreviews = ref([]) // For NEW images
const additionalImageFiles = ref([]) // For NEW images
const deletedPhotos = ref([]) // To track URL removals

// Wizard
const steps = [
  { title: 'Datos Básicos' },
  { title: 'Fotos & Salud' },
  { title: 'Contacto' },
  { title: 'Estado' },
]

// Data
const petData = reactive({
  name: '',
  type: '',
  typeValue: '',
  breed: '',
  age: '',
  ageValue: '',
  gender: '',
  size: '',
  sizeValue: '',
  location: '',
  description: '',
  image: '', // URL
  photos: [], // Array of URLs
  urgent: false,
  vaccinated: false,
  neutered: false,
  microchipped: false,
  healthDescription: '',
  adoptionRequirements: '',
  requiresContract: false,
  requiresFollowUp: false,
  contact: {
    name: '',
    email: '',
    phone: '',
    type: '',
    preferredMethod: 'email',
  },
  userId: '',
  status: 'available',
  adopterName: '',
})

// === Initialization ===
onMounted(async () => {
  try {
    const pet = await fetchPetById(petId)
    if (!pet) {
      loadError.value = 'Mascota no encontrada'
      initialLoading.value = false
      return
    }

    // Authorization check - allow owners and admins
    if (!user.value || (user.value.uid !== pet.userId && !isAdmin.value)) {
      isAuthorized.value = false
      // Check if it's just not logged in or wrong user
      if (!user.value) {
        // Ideally redirect to login
        // But for now show unauthorized
      }
      initialLoading.value = false
      return
    }
    isAuthorized.value = true

    // Populate Form safely
    // Reactive reassignment needs care

    // Fields that map 1:1
    petData.name = pet.name || ''
    petData.type = pet.type || ''
    petData.typeValue = pet.typeValue || '' // Ensure this matches select values
    petData.breed = pet.breed || ''
    petData.age = pet.age || ''
    petData.ageValue = pet.ageValue || ''
    petData.gender = pet.gender || ''
    petData.size = pet.size || ''
    petData.sizeValue = pet.sizeValue || ''
    petData.location = pet.location || ''
    petData.description = pet.description || ''
    petData.image = pet.image || ''
    petData.photos = Array.isArray(pet.photos) ? pet.photos : []
    petData.urgent = !!pet.urgent
    petData.vaccinated = !!pet.vaccinated
    petData.neutered = !!pet.neutered
    petData.microchipped = !!pet.microchipped
    petData.healthDescription = pet.healthDescription || ''
    petData.adoptionRequirements = pet.adoptionRequirements || ''
    petData.requiresContract = !!pet.requiresContract
    petData.requiresFollowUp = !!pet.requiresFollowUp
    petData.userId = pet.userId
    petData.status = pet.status || 'available'
    petData.adopterName = pet.adopterName || ''

    // Nested objects
    if (pet.contact) {
      petData.contact.name = pet.contact.name || ''
      petData.contact.email = pet.contact.email || ''
      petData.contact.phone = pet.contact.phone || ''
      petData.contact.type = pet.contact.type || ''
      petData.contact.preferredMethod = pet.contact.preferredMethod || 'email'
    }

    // If typeValue is missing but type exists (legacy data), try to map it
    if (!petData.typeValue && petData.type) {
      const lower = petData.type.toLowerCase()
      const validTypes = ['perro', 'gato', 'conejo', 'ave', 'tortuga']
      if (validTypes.includes(lower)) petData.typeValue = lower
      else petData.typeValue = 'otro'
    }
  } catch (e) {
    console.error('Error loading pet for edit:', e)
    loadError.value = 'Error de conexión: ' + (e.message || e)
  } finally {
    initialLoading.value = false
  }
})

// === Helpers ===
const updateTypeLabel = () => {
  const map = {
    perro: 'Perro',
    gato: 'Gato',
    ave: 'Ave',
    conejo: 'Conejo',
    tortuga: 'Tortuga',
    otro: 'Otro',
  }
  petData.type = map[petData.typeValue] || 'Otro'
}
const updateSizeLabel = () => {
  const map = { pequeño: 'Pequeño', mediano: 'Mediano', grande: 'Grande' }
  petData.size = map[petData.sizeValue] || ''
}
const getAllAdditionalImages = () => {
  // Current existing additional photos (minus deleted ones) + new previews
  const existing = (petData.photos || []).slice(1) // Assuming index 0 is main, but main is separate field 'image' usually.
  // In create implementation: photos: [main, ...add]
  // So slice(1) are additional.
  return [...existing, ...additionalImagePreviews.value]
}

// === Image Logic ===
const handleMainImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showModalAlert('error', 'Imagen muy grande', 'Máximo 5MB.')
    return
  }
  mainImageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    mainImagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const handleAdditionalImagesChange = (event) => {
  const files = Array.from(event.target.files)
  const currentTotal = (petData.photos?.length || 0) + additionalImageFiles.value.length
  // Logic bit loose here because photos[0] is main.
  // Let's strictly count additional slots.
  // existing additionals = petData.photos.slice(1)
  const existingCount = petData.photos?.length > 0 ? petData.photos.length - 1 : 0
  const remainingSlots = 5 - (existingCount + additionalImageFiles.value.length)

  const filesToProcess = files.slice(0, remainingSlots)

  filesToProcess.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) return
    additionalImageFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      additionalImagePreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removeNewAdditionalImage = (index) => {
  additionalImagePreviews.value.splice(index, 1)
  additionalImageFiles.value.splice(index, 1)
}

const removeExistingAdditionalImage = (indexInArray) => {
  // indexInArray is index in petData.photos
  // Remember photos[0] is main image usually, but let's verify visual logic matches
  if (indexInArray > 0 && indexInArray < petData.photos.length) {
    petData.photos.splice(indexInArray, 1)
  }
}

// === Navigation ===
const validateStep = () => {
  const errors = []
  if (currentStep.value === 1) {
    if (!petData.name) errors.push('Nombre')
    if (!petData.typeValue) errors.push('Tipo')
    if (!petData.gender) errors.push('Género')
    if (!petData.description || petData.description.length < 10) errors.push('Descripción válida')
  }
  if (currentStep.value === 3) {
    if (!petData.contact.name) errors.push('Nombre contacto')
  }

  if (errors.length > 0) {
    showModalAlert('warning', 'Campos incompletos', errors.join(', '))
    return false
  }
  return true
}

const nextStep = () => {
  if (validateStep()) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
const prevStep = () => {
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// === Submission ===
const submitUpdate = async () => {
  if (!validateStep()) return
  saving.value = true

  try {
    let newMainUrl = petData.image

    // 1. Upload new Main Image if changed
    if (mainImageFile.value) {
      const ext = mainImageFile.value.name.split('.').pop()
      const fileName = `${petData.userId}-main-${Date.now()}.${ext}`
      newMainUrl = await uploadFileWithProgress(
        mainImageFile.value,
        `pets/${petData.userId}`,
        fileName,
        null,
        { optimize: true }
      )
    }

    // 2. Upload new Additional Images
    const newAdditionalUrls = []
    for (let i = 0; i < additionalImageFiles.value.length; i++) {
      const file = additionalImageFiles.value[i]
      const ext = file.name.split('.').pop()
      const fileName = `${petData.userId}-add-${Date.now()}-${i}.${ext}`
      const url = await uploadFileWithProgress(file, `pets/${petData.userId}`, fileName, null, {
        optimize: true,
      })
      newAdditionalUrls.push(url)
    }

    // 3. Construct Final Photos Array
    // Start with [Main Image]
    const finalPhotos = [newMainUrl]

    // Add existing additional images (those that remained in petData.photos)
    // Filter out the old main image if we replaced it?
    // Logic: if we didn't replace main image, petData.image is same.
    // Existing photos[0] should be kept if equal to newMainUrl?
    // Let's simplify:
    // We kept existing additional photos in petData.photos slice(1).
    if (petData.photos && petData.photos.length > 1) {
      finalPhotos.push(...petData.photos.slice(1))
    }

    // Add newly uploaded additionals
    finalPhotos.push(...newAdditionalUrls)

    // 4. Update Object
    const updatePayload = {
      ...petData,
      image: newMainUrl,
      photos: finalPhotos,
      updatedAt: new Date().toISOString(),
    }

    await updatePet(petId, updatePayload)

    showModalAlert('success', 'Actualizado', 'La información se ha guardado correctamente.')
    // Redirect after delay
    setTimeout(() => {
      router.push(`/mascotas/${petId}`)
    }, 1500)
  } catch (e) {
    console.error(e)
    showModalAlert('error', 'Error', 'No se pudieron guardar los cambios.')
  } finally {
    saving.value = false
  }
}

// === Modal Interface ===
const showModal = ref(false)
const modalType = ref('info')
const modalTitle = ref('')
const modalMessage = ref('')
const showModalAlert = (type, title, msg) => {
  modalType.value = type
  modalTitle.value = title
  modalMessage.value = msg
  showModal.value = true
}
const closeModal = () => (showModal.value = false)
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
