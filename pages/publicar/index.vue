<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="mb-2 text-3xl font-bold text-emerald-800">Publicar mascota</h1>
      <p class="mb-6 text-gray-600">
        Ayuda a una mascota a encontrar un hogar completando el formulario.
      </p>

      <!-- Estado de usuario no autenticado -->
      <div
        v-if="!isLoggedIn"
        class="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-md"
      >
        <div class="flex flex-col items-center justify-between sm:flex-row">
          <div class="mb-4 sm:mb-0">
            <h2 class="mb-1 text-xl font-semibold text-emerald-800">
              Necesitas una cuenta para publicar
            </h2>
            <p class="text-gray-600">
              Inicia sesión o regístrate para publicar una mascota en adopción.
            </p>
          </div>
          <div class="flex space-x-4">
            <NuxtLink
              to="/login"
              class="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
            >
              Iniciar sesión
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="rounded-lg border border-emerald-600 px-6 py-2 text-emerald-600 hover:bg-emerald-50"
            >
              Registrarse
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Formulario de publicación -->
      <form v-else class="rounded-lg bg-white p-6 shadow-md" @submit.prevent="submitForm">
        <!-- Error general -->
        <div
          v-if="error"
          class="relative mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {{ error }}
        </div>

        <div class="mb-8">
          <h2 class="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-emerald-800">
            Información básica
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Nombre -->
            <div>
              <label for="name" class="mb-1 block text-sm font-medium text-gray-700">
                Nombre de la mascota *
              </label>
              <input
                id="name"
                v-model="petData.name"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </div>

            <!-- Tipo de mascota -->
            <div>
              <label for="type" class="mb-1 block text-sm font-medium text-gray-700">
                Tipo de mascota *
              </label>
              <select
                id="type"
                v-model="petData.typeValue"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                @change="updateTypeLabel"
              >
                <option value="" disabled>Seleccionar tipo</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="ave">Ave</option>
                <option value="conejo">Conejo</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <!-- Raza -->
            <div>
              <label for="breed" class="mb-1 block text-sm font-medium text-gray-700">Raza</label>
              <input
                id="breed"
                v-model="petData.breed"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </div>

            <!-- Género -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Género *</label>
              <div class="flex space-x-4">
                <label class="inline-flex items-center">
                  <input
                    v-model="petData.gender"
                    type="radio"
                    value="macho"
                    class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    required
                  />
                  <span class="ml-2 text-gray-700">Macho</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="petData.gender"
                    type="radio"
                    value="hembra"
                    class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-gray-700">Hembra</span>
                </label>
              </div>
            </div>

            <!-- Edad -->
            <div>
              <label for="age" class="mb-1 block text-sm font-medium text-gray-700">
                Edad aproximada *
              </label>
              <input
                id="age"
                v-model="petData.age"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Por ejemplo: 2 años, 6 meses..."
              />
            </div>

            <!-- Rango de edad -->
            <div>
              <label for="age-range" class="mb-1 block text-sm font-medium text-gray-700">
                Rango de edad *
              </label>
              <select
                id="age-range"
                v-model="petData.ageValue"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="" disabled>Seleccionar rango</option>
                <option value="cachorro">Cachorro</option>
                <option value="joven">Joven</option>
                <option value="adulto">Adulto</option>
                <option value="senior">Senior</option>
              </select>
            </div>

            <!-- Tamaño -->
            <div>
              <label for="size" class="mb-1 block text-sm font-medium text-gray-700">
                Tamaño *
              </label>
              <select
                id="size"
                v-model="petData.sizeValue"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                @change="updateSizeLabel"
              >
                <option value="" disabled>Seleccionar tamaño</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            <!-- Ubicación -->
            <div>
              <label for="location" class="mb-1 block text-sm font-medium text-gray-700">
                Ubicación *
              </label>
              <input
                id="location"
                v-model="petData.location"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Ciudad o municipio"
              />
            </div>
          </div>

          <!-- Descripción -->
          <div class="mt-6">
            <label for="description" class="mb-1 block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <textarea
              id="description"
              v-model="petData.description"
              rows="4"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Describe la personalidad, hábitos, por qué está en adopción y cualquier otra información relevante..."
            />
            <p class="mt-1 text-sm text-gray-500">
              {{ petData.description.length }}/500 caracteres
            </p>
          </div>

          <!-- Características de salud -->
          <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label class="flex items-center">
                <input
                  v-model="petData.vaccinated"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="ml-2 text-gray-700">Vacunado</span>
              </label>
              
              <div v-if="petData.vaccinated" class="mt-2">
                <label for="vaccine-info" class="text-xs text-gray-500">Detalles de vacunación</label>
                <input
                  id="vaccine-info"
                  v-model="petData.vaccineInfo"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="Tipo de vacunas recibidas"
                />
              </div>
            </div>

            <div>
              <label class="flex items-center">
                <input
                  v-model="petData.neutered"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="ml-2 text-gray-700">Esterilizado</span>
              </label>
              
              <div v-if="petData.neutered" class="mt-2">
                <label for="neuter-date" class="text-xs text-gray-500">Fecha aproximada</label>
                <input
                  id="neuter-date"
                  v-model="petData.neuterDate"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="¿Cuándo fue esterilizado?"
                />
              </div>
            </div>

            <div>
              <label class="flex items-center">
                <input
                  v-model="petData.microchipped"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="ml-2 text-gray-700">Microchip</span>
              </label>
              
              <div v-if="petData.microchipped" class="mt-2">
                <label for="chip-number" class="text-xs text-gray-500">Número de chip</label>
                <input
                  id="chip-number"
                  v-model="petData.chipNumber"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="Número de identificación"
                />
              </div>
            </div>
          </div>

          <!-- Estado de salud -->
          <div class="mt-6">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Estado de salud general
            </label>
            <input
              v-model.number="petData.healthStatus"
              type="range"
              min="0"
              max="100"
              step="10"
              class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
            <div class="mt-1 flex justify-between text-xs text-gray-500">
              <span>Necesita cuidados</span>
              <span>Excelente</span>
            </div>
          </div>

          <!-- Descripción de salud -->
          <div class="mt-4">
            <label for="health-description" class="mb-1 block text-sm font-medium text-gray-700">
              Detalles sobre la salud
            </label>
            <textarea
              id="health-description"
              v-model="petData.healthDescription"
              rows="2"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Detalles sobre el estado de salud, condiciones especiales, medicación, etc."
            />
          </div>
        </div>

        <!-- Sección de fotos -->
        <div class="mb-8">
          <h2 class="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-emerald-800">
            Fotos
          </h2>

          <!-- Imagen principal -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700">Foto principal *</label>
            <div class="flex items-center">
              <div
                class="mr-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
                :class="{ 'border-solid border-emerald-500': mainImagePreview }"
              >
                <img
                  v-if="mainImagePreview"
                  :src="mainImagePreview"
                  alt="Vista previa"
                  class="h-full w-full object-cover"
                />
                <PlusIcon v-else class="h-8 w-8 text-gray-300" />
              </div>
              <div>
                <input
                  ref="mainImageInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleMainImageChange"
                />
                <button
                  type="button"
                  class="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                  @click="$refs.mainImageInput.click()"
                >
                  Seleccionar imagen
                </button>
                <p class="mt-1 text-xs text-gray-500">Formato: JPG, PNG. Max: 5MB</p>
              </div>
            </div>
          </div>

          <!-- Fotos adicionales -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Fotos adicionales (opcional)
            </label>
            <div class="flex flex-wrap gap-4">
              <div
                v-for="(preview, index) in additionalImagePreviews"
                :key="index"
                class="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-solid border-emerald-500"
              >
                <img :src="preview" alt="Vista previa" class="h-full w-full object-cover" />
                <button
                  type="button"
                  class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                  @click="removeAdditionalImage(index)"
                />
              </div>

              <div
                v-if="additionalImagePreviews.length < 5"
                class="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
                @click="$refs.additionalImagesInput.click()"
              >
                <PlusIcon class="h-8 w-8 text-gray-300" />
              </div>

              <input
                ref="additionalImagesInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleAdditionalImagesChange"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">Puedes añadir hasta 5 fotos adicionales</p>
          </div>
        </div>

        <!-- Sección de contacto -->
        <div class="mb-8">
          <h2 class="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-emerald-800">
            Información de contacto
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Nombre de contacto -->
            <div>
              <label for="contact-name" class="mb-1 block text-sm font-medium text-gray-700">
                Nombre de contacto *
              </label>
              <input
                id="contact-name"
                v-model="petData.contact.name"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </div>

            <!-- Tipo de contacto -->
            <div>
              <label for="contact-type" class="mb-1 block text-sm font-medium text-gray-700">
                Tipo de contacto *
              </label>
              <select
                id="contact-type"
                v-model="petData.contact.type"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="" disabled>Seleccionar tipo</option>
                <option value="particular">Particular</option>
                <option value="protectora">Protectora/Refugio</option>
                <option value="veterinario">Clínica Veterinaria</option>
              </select>
            </div>

            <!-- Email de contacto -->
            <div>
              <label for="contact-email" class="mb-1 block text-sm font-medium text-gray-700">
                Email de contacto *
              </label>
              <input
                id="contact-email"
                v-model="petData.contact.email"
                type="email"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </div>

            <!-- Teléfono de contacto -->
            <div>
              <label for="contact-phone" class="mb-1 block text-sm font-medium text-gray-700">
                Teléfono de contacto *
              </label>
              <input
                id="contact-phone"
                v-model="petData.contact.phone"
                type="tel"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </div>
          </div>
          
          <!-- Información adicional de contacto -->
          <div>
            <label for="contact-notes" class="mb-1 block text-sm font-medium text-gray-700">
              Información adicional de contacto
            </label>
            <textarea
              id="contact-notes"
              v-model="petData.contact.notes"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Horarios de contacto, formas de contacto preferidas, etc."
            />
          </div>
          
          <!-- Preferencia de contacto -->
          <div class="mt-4">
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Método de contacto preferido
            </label>
            <div class="flex flex-wrap gap-4">
              <label class="inline-flex items-center">
                <input
                  v-model="petData.contact.preferredMethod"
                  type="radio"
                  value="email"
                  class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="ml-2 text-gray-700">Email</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  v-model="petData.contact.preferredMethod"
                  type="radio"
                  value="phone"
                  class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="ml-2 text-gray-700">Teléfono</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  v-model="petData.contact.preferredMethod"
                  type="radio"
                  value="whatsapp"
                  class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="ml-2 text-gray-700">WhatsApp</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Sección de adopción -->
        <div class="mb-8">
          <h2 class="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-emerald-800">
            Información de adopción
          </h2>

          <!-- Urgencia -->
          <div class="mb-4">
            <label class="flex items-center">
              <input
                v-model="petData.urgent"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span class="ml-2 font-medium text-gray-700">Adopción urgente</span>
            </label>
            <p v-if="petData.urgent" class="ml-6 mt-1 text-xs text-gray-500">
              Marcar como urgente hará que la mascota aparezca destacada en los listados.
            </p>
          </div>

          <!-- Requisitos para la adopción -->
          <div class="mb-4">
            <label for="adoption-requirements" class="mb-1 block text-sm font-medium text-gray-700">
              Requisitos para la adopción
            </label>
            <textarea
              id="adoption-requirements"
              v-model="petData.adoptionRequirements"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Requisitos que debe cumplir el adoptante (opcional)"
            />
          </div>
          
          <!-- Cuota de adopción -->
          <div class="mb-4">
            <label for="adoption-fee" class="mb-1 block text-sm font-medium text-gray-700">
              Cuota de adopción (opcional)
            </label>
            <div class="flex items-center">
              <span
                class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500"
              >
                $
              </span>
              <input
                id="adoption-fee"
                v-model.number="petData.adoptionFee"
                type="number"
                min="0"
                step="0.01"
                class="w-full rounded-r-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Si solicitas una cuota de adopción, especifica qué incluye (vacunas, castración, etc.).
            </p>
          </div>

          <!-- Detalles de cuota de adopción -->
          <div v-if="petData.adoptionFee > 0" class="mb-4">
            <label for="fee-details" class="mb-1 block text-sm font-medium text-gray-700">
              ¿Qué incluye la cuota de adopción?
            </label>
            <textarea
              id="fee-details"
              v-model="petData.feeDetails"
              rows="2"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Ej: Vacunas, esterilización, microchip, etc."
            />
          </div>
          
          <!-- Contrato de adopción -->
          <div class="mb-4">
            <label class="flex items-center">
              <input
                v-model="petData.requiresContract"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span class="ml-2 text-gray-700">Requiere contrato de adopción</span>
            </label>
          </div>

          <!-- Seguimiento post-adopción -->
          <div class="mb-4">
            <label class="flex items-center">
              <input
                v-model="petData.requiresFollowUp"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span class="ml-2 text-gray-700">Requiere seguimiento post-adopción</span>
            </label>

            <div v-if="petData.requiresFollowUp" class="ml-6 mt-2">
              <label for="follow-up-details" class="text-xs text-gray-500">
                Detalles del seguimiento
              </label>
              <textarea
                id="follow-up-details"
                v-model="petData.followUpDetails"
                rows="2"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Frecuencia y tipo de seguimiento requerido"
              />
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-between">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            @click="router.back()"
          >
            Cancelar
          </button>

          <div class="flex space-x-4">
            <button
              type="button"
              class="rounded-lg border border-emerald-600 px-6 py-2 text-emerald-600 hover:bg-emerald-50"
              :disabled="loading"
              @click="saveAsDraft"
            >
              Guardar borrador
            </button>

            <button
              type="submit"
              class="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center">
                <svg
                  class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
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
                Publicando...
              </span>
              <span v-else>Publicar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { PlusIcon } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { usePets } from '~/composables/usePets'
import { useS3 } from '~/composables/useS3'

// Router
const router = useRouter()

// Composables
const { user, isLoggedIn } = useAuth()
const { createPet, loading, error } = usePets()

// Referencias para el input de archivos
const mainImageInput = ref(null)
const additionalImagesInput = ref(null)

// Estados para previews de imágenes
const mainImagePreview = ref('')
const mainImageFile = ref(null)
const additionalImagePreviews = ref([])
const additionalImageFiles = ref([])

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
  urgentReason: '', // Motivo de urgencia
  urgentReasonDetails: '', // Detalles adicionales sobre la urgencia
  vaccinated: false,
  vaccineInfo: '', // Detalles de vacunación
  neutered: false,
  neuterDate: '', // Fecha de esterilización
  microchipped: false,
  chipNumber: '', // Número de microchip
  healthStatus: 80,
  healthDescription: '',
  medicalHistory: '', // Historial médico
  adoptionRequirements: '',
  adoptionFee: 0,
  feeDetails: '', // Detalles de la cuota de adopción
  requiresContract: false, // Contrato de adopción
  requiresFollowUp: false, // Seguimiento post-adopción
  followUpDetails: '', // Detalles del seguimiento post-adopción
  contact: {
    name: '',
    email: '',
    phone: '',
    type: '',
    notes: '', // Información adicional de contacto
    preferredMethod: 'email', // Método de contacto preferido (email por defecto)
  },
  image: '', // URL de la imagen principal
  photos: [], // URLs de fotos adicionales
  createdAt: '',
  userId: '',
  status: 'available', // Por defecto, estado disponible
})

// Precarga datos de contacto del usuario actual
onMounted(() => {
  if (user.value) {
    petData.contact.name = user.value.displayName || ''
    petData.contact.email = user.value.email || ''
    petData.userId = user.value.uid
  }
})

// Manejo de la imagen principal
const handleMainImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validación de tamaño (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es demasiado grande. El tamaño máximo es 5MB.')
    return
  }

  // Validación de tipo (solo imágenes)
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten archivos de imagen.')
    return
  }

  mainImageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    mainImagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Manejo de imágenes adicionales
const handleAdditionalImagesChange = (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return

  // Limita el número total de imágenes a 5
  const remainingSlots = 5 - additionalImagePreviews.value.length
  const filesToProcess = files.slice(0, remainingSlots)

  filesToProcess.forEach((file) => {
    // Validación de tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`La imagen ${file.name} es demasiado grande. El tamaño máximo es 5MB.`)
      return
    }

    // Validación de tipo (solo imágenes)
    if (!file.type.startsWith('image/')) {
      alert(`El archivo ${file.name} no es una imagen.`)
      return
    }

    additionalImageFiles.value.push(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      additionalImagePreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

// Eliminar una imagen adicional
const removeAdditionalImage = (index) => {
  additionalImagePreviews.value.splice(index, 1)
  additionalImageFiles.value.splice(index, 1)
}

// Actualizar las etiquetas basadas en los valores seleccionados
const updateTypeLabel = () => {
  switch (petData.typeValue) {
    case 'perro':
      petData.type = 'Perro'
      break
    case 'gato':
      petData.type = 'Gato'
      break
    case 'ave':
      petData.type = 'Ave'
      break
    case 'conejo':
      petData.type = 'Conejo'
      break
    case 'otro':
      petData.type = 'Otro'
      break
    default:
      petData.type = ''
  }
}

const updateSizeLabel = () => {
  switch (petData.sizeValue) {
    case 'pequeño':
      petData.size = 'Pequeño'
      break
    case 'mediano':
      petData.size = 'Mediano'
      break
    case 'grande':
      petData.size = 'Grande'
      break
    default:
      petData.size = ''
  }
}

// Subir imágenes a AWS S3
const uploadImages = async () => {
  const { uploadFile } = useS3()
  const userId = user.value?.uid || 'anonymous'

  // Subir imagen principal
  if (!mainImageFile.value) {
    throw new Error('Se requiere una imagen principal')
  }

  // Obtener la extensión del archivo
  const fileExtension = mainImageFile.value.name.split('.').pop()
  const mainImageName = `main.${fileExtension}`

  // Subir la imagen principal a S3
  const mainImageUrl = await uploadFile(mainImageFile.value, `pets/${userId}`, mainImageName)

  // Subir imágenes adicionales
  const additionalImageUrls = []
  for (let i = 0; i < additionalImageFiles.value.length; i++) {
    const file = additionalImageFiles.value[i]
    const fileName = `additional_${i}.${file.name.split('.').pop()}`

    const url = await uploadFile(file, `pets/${userId}`, fileName)
    additionalImageUrls.push(url)
  }

  return {
    mainImageUrl,
    additionalImageUrls,
  }
}

// Guardar como borrador (a implementar)
const saveAsDraft = async () => {
  // Esta función se implementará más adelante
  alert('Función no implementada todavía')
}

// Enviar formulario
const submitForm = async () => {
  try {
    // Validar imagen principal
    if (!mainImageFile.value) {
      alert('Debes subir al menos una imagen principal')
      return
    }

    // Subir imágenes
    const { mainImageUrl, additionalImageUrls } = await uploadImages()

    // Preparar datos para guardar
    const petToSave = {
      ...petData,
      image: mainImageUrl,
      photos:
        additionalImageUrls.length > 0 ? [mainImageUrl, ...additionalImageUrls] : [mainImageUrl],
      createdAt: new Date().toISOString(),
      userId: user.value?.uid || null,
      status: 'available', // Estado por defecto: disponible
    }

    // Crear la mascota en la base de datos
    const petId = await createPet(petToSave)

    // Mostrar mensaje de éxito
    alert('Mascota publicada correctamente')

    // Redirigir a la página de detalle de la mascota
    router.push(`/mascotas/${petId}`)
  } catch (err) {
    console.error('Error al publicar mascota:', err)
    error.value = 'Error al publicar la mascota. Por favor, inténtalo de nuevo.'
  }
}
</script>
