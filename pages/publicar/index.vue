<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto max-w-5xl px-4">
      <h1 class="mb-2 text-3xl font-bold text-emerald-800">Publicar mascota</h1>
      <p class="mb-6 text-gray-600">
        Ayuda a una mascota a encontrar un hogar completando el formulario.
      </p>

      <!-- Estado de usuario no autenticado -->
      <div
        v-if="!isAuthenticated"
        class="rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm"
      >
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
        >
          <Icon name="heroicons:user" class="h-8 w-8 text-emerald-600" />
        </div>
        <h2 class="mb-2 text-xl font-bold text-gray-900">Necesitas una cuenta</h2>
        <p class="mx-auto mb-6 max-w-md text-gray-500">
          Debes iniciar sesión o registrarte para poder publicar mascotas en adopción y gestionar
          tus publicaciones.
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center justify-center rounded-lg border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Iniciar sesión
        </NuxtLink>
      </div>

      <!-- Wizard Form -->
      <form
        v-else
        class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        @submit.prevent="submitForm"
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
            ></div>
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
                  placeholder="Nombre de la mascota"
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
                  @change="updateTypeLabel"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                <label class="mb-1 block text-sm font-medium text-gray-700">Raza (Opcional)</label>
                <input
                  v-model="petData.breed"
                  type="text"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Mestizo, Husky..."
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
                      type="radio"
                      v-model="petData.gender"
                      value="macho"
                      class="border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="ml-2 text-gray-700">Macho</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="petData.gender"
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
                  placeholder="Ciudad / Municipio"
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
                  placeholder="Ej: 2 años, 5 meses"
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
                  @change="updateSizeLabel"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                Descripción de la mascota
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="petData.description"
                rows="4"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Describe su personalidad, historia, comportamiento..."
              ></textarea>
              <p class="mt-1 text-right text-xs text-gray-500">
                {{ petData.description.length }} caracteres (mínimo 10)
              </p>
            </div>
          </div>

          <!-- Step 2: Fotos y Salud -->
          <div v-show="currentStep === 2" class="animate-fadeIn space-y-6">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:camera" class="h-6 w-6 text-emerald-500" />
              Fotos y Salud
            </h2>

            <!-- Main Image Upload -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Foto Principal
                <span class="text-red-500">*</span>
              </label>
              <div
                class="group relative flex h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-emerald-500 hover:bg-emerald-50"
                @click="$refs.mainImageInput.click()"
              >
                <img
                  v-if="mainImagePreview"
                  :src="mainImagePreview"
                  class="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex flex-col items-center text-gray-500 group-hover:text-emerald-600"
                >
                  <Icon name="heroicons:camera" class="mb-2 h-10 w-10" />
                  <span class="text-sm font-medium">Click para seleccionar foto principal</span>
                </div>

                <input
                  ref="mainImageInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleMainImageChange"
                />

                <!-- Change Overlay -->
                <div
                  v-if="mainImagePreview"
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
                Fotos Adicionales (Máx 5)
              </label>
              <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                <!-- Add Button -->
                <div
                  v-if="additionalImagePreviews.length < 5"
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

                <!-- Previews -->
                <div
                  v-for="(preview, index) in additionalImagePreviews"
                  :key="index"
                  class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
                >
                  <img :src="preview" class="h-full w-full object-cover" />
                  <button
                    type="button"
                    @click="removeAdditionalImage(index)"
                    class="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <Icon name="heroicons:x-mark" class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <hr class="my-4 border-gray-100" />

            <!-- Health Section -->
            <div>
              <h3 class="mb-4 text-lg font-medium text-gray-900">Información Médica</h3>
              <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label
                  class="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    v-model="petData.vaccinated"
                    class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Vacunado</span>
                </label>
                <label
                  class="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    v-model="petData.neutered"
                    class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Esterilizado</span>
                </label>
                <label
                  class="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    v-model="petData.microchipped"
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
                  placeholder="Condiciones especiales, medicamentos, próxima vacuna..."
                ></textarea>
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
                  Tu Nombre
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="petData.contact.name"
                  type="text"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Tipo de Contacto</label>
                <select
                  v-model="petData.contact.type"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="" disabled>Seleccionar</option>
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
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Preferencia de contacto
              </label>
              <div class="flex gap-4">
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    v-model="petData.contact.preferredMethod"
                    value="email"
                    class="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Email</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    v-model="petData.contact.preferredMethod"
                    value="phone"
                    class="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Llamada</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    v-model="petData.contact.preferredMethod"
                    value="whatsapp"
                    class="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">WhatsApp</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 4: Adopción -->
          <div v-show="currentStep === 4" class="animate-fadeIn space-y-5">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:home-modern" class="h-6 w-6 text-emerald-500" />
              Detalles de Adopción
            </h2>

            <div class="space-y-4">
              <div class="rounded-lg border border-red-100 bg-red-50 p-4">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="petData.urgent"
                    class="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  <span class="ml-3 font-medium text-red-800">¡Es una adopción URGENTE!</span>
                </label>
                <p class="ml-8 mt-1 text-sm text-red-600">
                  Marcar esto destacará la publicación para casos críticos.
                </p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Requisitos para el adoptante
                </label>
                <textarea
                  v-model="petData.adoptionRequirements"
                  rows="3"
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Ej: Casa cerrada, seguimiento obligatorio, familia sin niños pequeños..."
                ></textarea>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label
                  class="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    v-model="petData.requiresContract"
                    class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Requiere Contrato</span>
                </label>
                <label
                  class="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    v-model="petData.requiresFollowUp"
                    class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Requiere Seguimiento</span>
                </label>
              </div>
            </div>

            <!-- Preview Summary -->
            <div class="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5">
              <h3 class="mb-3 font-semibold text-gray-900">Resumen para publicar</h3>
              <div class="flex items-start gap-4">
                <div class="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-200">
                  <img
                    v-if="mainImagePreview"
                    :src="mainImagePreview"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
                    <Icon name="heroicons:photo" class="h-8 w-8" />
                  </div>
                </div>
                <div class="text-sm">
                  <p class="text-lg font-bold text-gray-900">{{ petData.name }}</p>
                  <p class="text-gray-600">
                    {{ petData.type }} • {{ petData.age }} • {{ petData.location }}
                  </p>
                  <p class="mt-1 font-medium text-emerald-600">
                    {{ additionalImagePreviews.length }} fotos adicionales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de Navegación -->
        <div
          class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4"
        >
          <button
            v-if="currentStep > 1"
            type="button"
            @click="prevStep"
            class="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Icon name="heroicons:arrow-left" class="h-4 w-4" />
            Atrás
          </button>
          <button
            v-else
            type="button"
            @click="onCancel"
            class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600"
          >
            Cancelar
          </button>

          <div class="flex items-center gap-3">
            <button
              v-if="currentStep < steps.length"
              type="button"
              @click="nextStep"
              class="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Siguiente
              <Icon name="heroicons:arrow-right" class="h-4 w-4" />
            </button>

            <LoadingButton
              v-else
              type="submit"
              :loading="loading"
              variant="primary"
              class="px-8 py-2.5"
            >
              Publicar Mascota
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>

    <!-- Modal de Alerta -->
    <ModalAlert
      :show="showModal"
      :type="modalType"
      :title="modalTitle"
      :message="modalMessage"
      :confirm-button-text="modalConfirmText"
      @confirm="closeModal"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePets } from '~/composables/usePets'
import { useS3 } from '~/composables/useS3'
import ModalAlert from '~/components/common/ModalAlert.vue'
import LoadingButton from '~/components/ui/LoadingButton.vue'

// Router
const router = useRouter()

// Composables
const { user, isAuthenticated } = useAuth()
const { createPet, loading: petsLoading } = usePets()
const { uploadFileWithProgress } = useS3()
const loading = ref(false)

// Estados para previews de imágenes
const mainImageInput = ref(null)
const additionalImagesInput = ref(null)

const mainImagePreview = ref('')
const mainImageFile = ref(null)
const additionalImagePreviews = ref([])
const additionalImageFiles = ref([])

// Wizard: pasos
const steps = [
  { title: 'Datos básicos' },
  { title: 'Fotos & Salud' },
  { title: 'Contacto' },
  { title: 'Adopción' },
]
const currentStep = ref(1)

// Datos de la mascota
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
    notes: '',
    preferredMethod: 'email',
  },
  userId: '',
  status: 'available',
})

// === Logica de Inicialización ===
onMounted(() => {
  if (user.value) {
    petData.contact.name = user.value.displayName || ''
    petData.contact.email = user.value.email || ''
    petData.userId = user.value.uid
  }
})

// === Helpers visuales ===
const updateTypeLabel = () => {
  // Mapeo simple para guardar label textual si es necesario
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

// === Imágenes ===
const handleMainImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showModalAlert('error', 'Imagen muy grande', 'Máximo 5MB por imagen.')
    return
  }
  if (!file.type.startsWith('image/')) return

  mainImageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    mainImagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const handleAdditionalImagesChange = (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return
  const remainingSlots = 5 - additionalImagePreviews.value.length
  const filesToProcess = files.slice(0, remainingSlots)

  filesToProcess.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) return
    if (!file.type.startsWith('image/')) return

    additionalImageFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      additionalImagePreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removeAdditionalImage = (index) => {
  additionalImagePreviews.value.splice(index, 1)
  additionalImageFiles.value.splice(index, 1)
}

// === Navegación y Validación ===
const validateStep = () => {
  const errors = []

  if (currentStep.value === 1) {
    if (!petData.name) errors.push('Nombre')
    if (!petData.typeValue) errors.push('Tipo')
    if (!petData.gender) errors.push('Género')
    if (!petData.age) errors.push('Edad')
    if (!petData.ageValue) errors.push('Etapa de vida')
    if (!petData.sizeValue) errors.push('Tamaño')
    if (!petData.location) errors.push('Ubicación')
    if (petData.description.length < 10) errors.push('Descripción (min 10 car.)')
  }
  if (currentStep.value === 2) {
    if (!mainImageFile.value && !mainImagePreview.value) errors.push('Foto Principal')
  }
  if (currentStep.value === 3) {
    if (!petData.contact.name) errors.push('Nombre contacto')
    if (!petData.contact.email) errors.push('Email contacto')
    if (!petData.contact.phone) errors.push('Teléfono')
  }

  if (errors.length > 0) {
    showModalAlert(
      'warning',
      'Campos incompletos',
      `Faltan campos requeridos: ${errors.join(', ')}`
    )
    return false
  }
  return true
}

const nextStep = () => {
  if (validateStep()) currentStep.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const prevStep = () => {
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onCancel = () => {
  if (confirm('¿Cancelar publicación?')) router.push('/')
}

// === Envío ===
const submitForm = async () => {
  if (!validateStep()) return
  loading.value = true

  try {
    const userId = user.value?.uid || 'anonymous'

    // Upload Main
    let mainImageUrl = ''
    if (mainImageFile.value) {
      const ext = mainImageFile.value.name.split('.').pop()
      const fileName = `${userId}-main-${Date.now()}.${ext}`
      mainImageUrl = await uploadFileWithProgress(
        mainImageFile.value,
        `pets/${userId}`,
        fileName,
        null,
        { optimize: true, quality: 0.85 }
      )
    }

    // Upload Additionals
    const additionalUrls = []
    for (let i = 0; i < additionalImageFiles.value.length; i++) {
      const file = additionalImageFiles.value[i]
      const ext = file.name.split('.').pop()
      const fileName = `${userId}-add-${i}-${Date.now()}.${ext}`
      const url = await uploadFileWithProgress(file, `pets/${userId}`, fileName, null, {
        optimize: true,
        quality: 0.8,
      })
      additionalUrls.push(url)
    }

    // Payload
    const petToSave = {
      ...petData,
      image: mainImageUrl,
      photos: [mainImageUrl, ...additionalUrls],
      createdAt: new Date().toISOString(),
      userId,
    }

    const petId = await createPet(petToSave)

    showModalAlert('success', '¡Publicado!', 'La mascota está lista para encontrar hogar.')
    modalCallback.value = () => router.push(`/mascotas/${petId}`)
  } catch (e) {
    console.error(e)
    showModalAlert('error', 'Error', 'No se pudo publicar la mascota.')
  } finally {
    loading.value = false
  }
}

// === Modal Logic ===
const showModal = ref(false)
const modalType = ref('info')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('Entendido')
const modalCallback = ref(null)

const showModalAlert = (type, title, message, btnText = 'Aceptar') => {
  modalType.value = type
  modalTitle.value = title
  modalMessage.value = message
  modalConfirmText.value = btnText
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  if (modalCallback.value) {
    modalCallback.value()
    modalCallback.value = null
  }
}
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
