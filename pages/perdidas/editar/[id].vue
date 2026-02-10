<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-red-50 py-6 md:py-12">
    <div class="container mx-auto max-w-4xl px-4">
      <!-- Header -->
      <div class="mb-8">
        <button
          class="mb-4 inline-flex items-center gap-2 font-medium text-emerald-700 hover:text-emerald-800"
          @click="$router.back()"
        >
          <Icon name="heroicons:arrow-left" class="h-5 w-5" />
          Volver
        </button>

        <h1 class="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
          Editar Reporte de Mascota Perdida
        </h1>
        <p class="text-gray-600">Actualiza la información para ayudar a encontrar a tu mascota</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card flex items-center justify-center py-20">
        <div class="text-center">
          <div
            class="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-emerald-600"
          />
          <p class="text-gray-600">Cargando reporte...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card border-l-4 border-red-500 bg-red-50">
        <div class="flex gap-3">
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 flex-shrink-0 text-red-500" />
          <div>
            <h3 class="mb-1 font-semibold text-red-900">Error</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="card">
          <h2 class="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Icon name="heroicons:information-circle" class="h-6 w-6 text-emerald-600" />
            Información Básica
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Name -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Nombre de la mascota *
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej: Max"
              />
            </div>

            <!-- Species -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Especie</label>
              <select
                v-model="formData.species"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="dog">Perro</option>
                <option value="cat">Gato</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <!-- Breed -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Raza</label>
              <input
                v-model="formData.breed"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej: Labrador"
              />
            </div>

            <!-- Color -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Color</label>
              <input
                v-model="formData.color"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej: Marrón"
              />
            </div>
          </div>

          <!-- Description -->
          <div class="mt-6">
            <label class="mb-2 block text-sm font-medium text-gray-700">Descripción *</label>
            <textarea
              v-model="formData.description"
              required
              rows="4"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              placeholder="Describe a tu mascota: características físicas, comportamiento, cualquier detalle que ayude a identificarla..."
            />
          </div>
        </div>

        <!-- Location & Date -->
        <div class="card">
          <h2 class="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Icon name="heroicons:map-pin" class="h-6 w-6 text-amber-600" />
            Ubicación y Fecha
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Last Seen Location -->
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Última ubicación vista *
              </label>
              <input
                v-model="formData.lastSeenLocation"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                placeholder="Ej: Cerca del parque San Francisco, Maracaibo"
              />
            </div>

            <!-- Last Seen Date -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Fecha última vez visto *
              </label>
              <input
                v-model="lastSeenDateInput"
                type="date"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <!-- Urgency Level -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Nivel de urgencia</label>
              <select
                v-model="formData.urgencyLevel"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contact & Reward -->
        <div class="card">
          <h2 class="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Icon name="heroicons:phone" class="h-6 w-6 text-blue-600" />
            Contacto y Recompensa
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Contact -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Información de contacto *
              </label>
              <input
                v-model="formData.contact"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Teléfono, email, o ambos"
              />
            </div>

            <!-- Contact Preference -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Preferencia de contacto
              </label>
              <select
                v-model="formData.contactPreference"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="phone">Teléfono</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>

            <!-- Reward -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Recompensa (opcional)
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Bs.</span>
                <input
                  v-model.number="formData.reward"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Status Management (if pet is the owner) -->
        <div
          v-if="canEditStatus"
          class="card border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50"
        >
          <h2 class="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Icon name="heroicons:cog-6-tooth" class="h-6 w-6 text-purple-600" />
            Gestión del Reporte
          </h2>

          <div class="space-y-4">
            <!-- Status -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Estado del reporte</label>
              <select
                v-model="formData.status"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Activo (Aún perdido)</option>
                <option value="found">Encontrado 🎉</option>
                <option value="archived">Archivar</option>
              </select>
            </div>

            <!-- Found Details (if found) -->
            <div
              v-if="formData.status === 'found'"
              class="rounded-lg border border-emerald-200 bg-emerald-50 p-4"
            >
              <label class="mb-2 block text-sm font-medium text-emerald-800">
                ✨ ¡Cuéntanos cómo lo encontraste!
              </label>
              <textarea
                v-model="formData.foundDetails"
                rows="3"
                class="w-full rounded-lg border border-emerald-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                placeholder="Comparte cómo se reencontraron para dar esperanza a otros dueños..."
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col justify-end gap-3 sm:flex-row">
          <button type="button" @click="$router.back()" class="btn-outline">Cancelar</button>

          <button
            type="submit"
            :disabled="saving"
            class="btn-primary flex items-center justify-center gap-2"
          >
            <Icon v-if="!saving" name="heroicons:check" class="h-5 w-5" />
            <div
              v-else
              class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLostPets } from '~/composables/useLostPets'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { user, waitForAuth, isAdmin } = useAuth()
const { getLostPetById, updateLostPet } = useLostPets()

const petId = route.params.id
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const originalPet = ref(null)

const formData = ref({
  name: '',
  species: 'dog',
  breed: '',
  color: '',
  description: '',
  lastSeenLocation: '',
  lastSeenDate: Date.now(),
  contact: '',
  contactPreference: 'phone',
  reward: null,
  urgencyLevel: 'medium',
  status: 'active',
  foundDetails: '',
})

const lastSeenDateInput = ref('')

const canEditStatus = computed(() => {
  return originalPet.value && user.value && (user.value.uid === originalPet.value.ownerId || isAdmin.value)
})

onMounted(async () => {
  await waitForAuth()

  if (!user.value) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    const pet = await getLostPetById(petId)

    if (!pet) {
      error.value = 'No se encontró el reporte'
      return
    }

    // Check if user is owner or admin
    if (pet.ownerId !== user.value.uid && !isAdmin.value) {
      error.value = 'No tienes permiso para editar este reporte'
      return
    }

    originalPet.value = pet

    // Fill form
    formData.value = {
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      color: pet.color || '',
      description: pet.description || '',
      lastSeenLocation: pet.lastSeenLocation || pet.location || '',
      lastSeenDate: pet.lastSeenDate || pet.lastSeenAt || Date.now(),
      contact: pet.contact || '',
      contactPreference: pet.contactPreference || 'phone',
      reward: pet.reward || null,
      urgencyLevel: pet.urgencyLevel || 'medium',
      status: pet.status || 'active',
      foundDetails: pet.foundDetails || '',
    }

    // Set date input
    if (formData.value.lastSeenDate) {
      const d = new Date(formData.value.lastSeenDate)
      lastSeenDateInput.value = d.toISOString().split('T')[0]
    }
  } catch (err) {
    console.error('Error loading pet:', err)
    error.value = 'Error al cargar el reporte'
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  if (saving.value) return

  try {
    saving.value = true
    error.value = null

    // Convert date input to timestamp
    if (lastSeenDateInput.value) {
      formData.value.lastSeenDate = new Date(lastSeenDateInput.value).getTime()
    }

    // Prepare update data
    const updateData = {
      name: formData.value.name,
      description: formData.value.description,
      lastSeenLocation: formData.value.lastSeenLocation,
      lastSeenDate: formData.value.lastSeenDate,
      contact: formData.value.contact,
      contactPreference: formData.value.contactPreference,
      reward: formData.value.reward || null,
      urgencyLevel: formData.value.urgencyLevel,
    }

    // Add optional fields if changed
    if (formData.value.species) updateData.species = formData.value.species
    if (formData.value.breed) updateData.breed = formData.value.breed
    if (formData.value.color) updateData.color = formData.value.color

    // Add status if user can edit it
    if (canEditStatus.value) {
      updateData.status = formData.value.status
      if (formData.value.status === 'found' && formData.value.foundDetails) {
        updateData.foundDetails = formData.value.foundDetails
      }
    }

    const success = await updateLostPet(petId, updateData)

    if (success) {
      alert('✅ Reporte actualizado exitosamente')
      router.push(`/perdidas/${petId}`)
    } else {
      error.value = 'Error al actualizar el reporte. Por favor, intenta de nuevo.'
    }
  } catch (err) {
    console.error('Error updating pet:', err)
    error.value = 'Error al actualizar el reporte'
  } finally {
    saving.value = false
  }
}
</script>
