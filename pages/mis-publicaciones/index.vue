<template>
  <div class="min-h-screen bg-amber-50 py-6 md:py-12">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Mis Publicaciones</h1>
          <p class="mt-1 text-emerald-600">Gestiona las mascotas que has puesto en adopción</p>
        </div>

        <NuxtLink
          to="/publicar"
          class="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl active:scale-95 md:w-auto"
        >
          <Icon name="heroicons:plus-circle" class="mr-2 h-5 w-5" />
          Nueva Publicación
        </NuxtLink>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex h-64 flex-col items-center justify-center">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
        />
        <p class="mt-4 animate-pulse font-medium text-emerald-600">Cargando tus mascotas...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
          >
            <Icon name="heroicons:exclamation-triangle" class="h-6 w-6" />
          </div>
          <div>
            <h3 class="font-semibold text-red-800">Ha ocurrido un error</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Vista principal -->
      <div v-else>
        <!-- Empty State (Si no tiene mascotas) -->
        <div v-if="userPets.length === 0" class="mx-auto max-w-lg py-12 text-center">
          <div class="relative mx-auto mb-6 h-48 w-48">
            <div
              class="absolute inset-0 animate-pulse rounded-full bg-emerald-100 opacity-50"
            ></div>
            <div
              class="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-inner"
            >
              <Icon name="fluent-emoji:dog-face" class="h-24 w-24" />
            </div>
          </div>
          <h2 class="mb-3 text-2xl font-bold text-gray-800">¡Tu primera publicación te espera!</h2>
          <p class="mb-8 text-lg text-gray-600">
            Ayuda a una mascota a encontrar su hogar ideal. Publicar es gratis y solo toma unos
            minutos.
          </p>
          <NuxtLink
            to="/publicar"
            class="inline-flex items-center rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-emerald-200"
          >
            Publicar Mascota Ahora
            <Icon name="heroicons:arrow-right" class="ml-2 h-5 w-5" />
          </NuxtLink>
        </div>

        <!-- Dashboard Content -->
        <div v-else class="space-y-8">
          <!-- Stats Cards (Grid Responsive) -->
          <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <!-- Total -->
            <div
              class="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div class="absolute right-0 top-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-blue-50" />
              <p class="relative text-sm font-medium text-slate-500">Publicadas</p>
              <div class="relative mt-1 flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-800">{{ userPets.length }}</span>
                <span
                  class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600"
                >
                  Total
                </span>
              </div>
            </div>

            <!-- Disponibles -->
            <div
              class="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                class="absolute right-0 top-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-emerald-50"
              />
              <p class="relative text-sm font-medium text-slate-500">En Adopción</p>
              <div class="relative mt-1 flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-800">{{ availablePets }}</span>
                <span v-if="availablePets > 0" class="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <!-- Adoptadas -->
            <div
              class="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div class="absolute right-0 top-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-amber-50" />
              <p class="relative text-sm font-medium text-slate-500">Adoptadas</p>
              <div class="relative mt-1 flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-800">{{ adoptedPets }}</span>
                <Icon name="heroicons:trophy" class="h-4 w-4 text-amber-500" />
              </div>
            </div>

            <!-- Solicitudes -->
            <div
              class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-md"
            >
              <p class="relative text-sm font-medium text-purple-100">Solicitudes</p>
              <div class="relative mt-1 flex items-baseline gap-2">
                <span class="text-3xl font-bold">{{ totalAdoptionRequests }}</span>
                <span
                  v-if="totalAdoptionRequests > 0"
                  class="animate-pulse rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold"
                >
                  Nuevas
                </span>
              </div>
            </div>
          </div>

          <!-- Filters & Search Bar -->
          <div
            class="sticky top-0 z-30 -mx-4 bg-amber-50/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:bg-transparent sm:p-0"
          >
            <div class="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:pb-0">
              <button
                v-for="filter in filters"
                :key="filter.value"
                class="whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all"
                :class="
                  selectedFilter === filter.value
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'border border-gray-100 bg-white text-gray-600 shadow-sm hover:bg-gray-50'
                "
                @click="selectedFilter = filter.value"
              >
                {{ filter.label }}
                <span v-if="getFilterCount(filter.value) > 0" class="ml-1 opacity-80">
                  ({{ getFilterCount(filter.value) }})
                </span>
              </button>
            </div>
          </div>

          <!-- Pet Grid -->
          <div
            v-if="filteredPets.length > 0"
            class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <transition-group name="list" appear>
              <UserPetCard
                v-for="pet in filteredPets"
                :key="pet.id"
                :pet="pet"
                class="h-full"
                @delete="confirmDeletePet"
                @update-status="handleStatusUpdate"
                @mark-adopted="markAsAdopted"
              />
            </transition-group>
          </div>

          <!-- Empty Filter State -->
          <div v-else class="flex flex-col items-center justify-center py-16 text-center">
            <div class="mb-4 rounded-full bg-gray-100 p-6">
              <Icon name="heroicons:funnel" class="h-10 w-10 text-gray-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Sin resultados</h3>
            <p class="text-gray-500">
              No tienes mascotas en la categoría "{{ getFilterLabel(selectedFilter) }}"
            </p>
            <button
              @click="selectedFilter = 'all'"
              class="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Ver todas mis publicaciones
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para marcar como adoptada -->
    <div
      v-if="showAdoptionModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Marcar como adoptada</h3>
          <button class="text-gray-400 hover:text-gray-500" @click="closeAdoptionModal">
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>

        <div class="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <Icon name="heroicons:information-circle" class="h-5 w-5 text-blue-500" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700">
                Vas a marcar a
                <span class="font-semibold">{{ pendingAdoptionPet?.name }}</span>
                como adoptada.
              </p>
              <p class="mt-2 text-sm text-blue-700">
                Si la adopción se hizo a través de una solicitud en la plataforma, selecciona al
                adoptante de la lista para generar su certificado de adopción.
              </p>
            </div>
          </div>
        </div>

        <div v-if="adoptionRequests.length > 0" class="mb-6">
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Selecciona al adoptante:
          </label>
          <div class="rounded-md border border-gray-300 bg-white">
            <div
              v-for="request in adoptionRequests"
              :key="request.id"
              :class="[
                'flex items-center p-3 hover:bg-gray-50',
                request.id === selectedAdoption ? 'border-emerald-500 bg-emerald-50' : '',
                adoptionRequests.length > 1 ? 'border-b border-gray-200 last:border-b-0' : '',
              ]"
              @click="selectedAdoption = request.id"
            >
              <div class="flex-shrink-0">
                <div class="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                  <img
                    v-if="request.user?.photoURL"
                    :src="request.user.photoURL"
                    :alt="request.user?.name || 'Usuario'"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center font-bold text-emerald-700"
                  >
                    {{ getInitials(request.user?.name || request.user?.email || 'U') }}
                  </div>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ request.user?.name || request.user?.email || 'Usuario' }}
                </p>
                <p class="text-xs text-gray-500">
                  Solicitud enviada {{ formatShortDate(request.createdAt) }}
                </p>
              </div>
              <div class="flex-shrink-0">
                <input
                  type="radio"
                  name="adoptionRequest"
                  :checked="request.id === selectedAdoption"
                  class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  @click="selectedAdoption = request.id"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Selecciona el tipo de adopción:
          </label>
          <div class="space-y-2">
            <div
              class="flex items-center rounded-md border p-3 hover:bg-gray-50"
              :class="
                adoptionType === 'platform' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
              "
              @click="adoptionType = 'platform'"
            >
              <input
                type="radio"
                name="adoptionType"
                :checked="adoptionType === 'platform'"
                class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                @click="adoptionType = 'platform'"
              />
              <div class="ml-3">
                <label class="text-sm font-medium text-gray-900">Adopción por la plataforma</label>
                <p class="text-xs text-gray-500">
                  Para adopciones realizadas a través de las solicitudes de la plataforma.
                </p>
              </div>
            </div>

            <div
              class="flex items-center rounded-md border p-3 hover:bg-gray-50"
              :class="
                adoptionType === 'external' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
              "
              @click="adoptionType = 'external'"
            >
              <input
                type="radio"
                name="adoptionType"
                :checked="adoptionType === 'external'"
                class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                @click="adoptionType = 'external'"
              />
              <div class="ml-3">
                <label class="text-sm font-medium text-gray-900">Adopción externa</label>
                <p class="text-xs text-gray-500">
                  La adopción se realizó fuera de la plataforma, no hay un adoptante registrado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
            @click="closeAdoptionModal"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700"
            :disabled="adoptionType === 'platform' && !selectedAdoption"
            @click="confirmAdoption"
          >
            Confirmar adopción
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para confirmación/alertas -->
    <ModalAlert
      :show="showModal"
      :type="modalType"
      :title="modalTitle"
      :message="modalMessage"
      :confirm-button-text="modalConfirmText"
      @confirm="confirmAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePets } from '~/composables/usePets'
import { useAdoptions } from '~/composables/useAdoptions'
import { useAuth } from '~/composables/useAuth'
import { useFirebaseApp } from 'vuefire'
import { getDatabase, ref as dbRef, update } from 'firebase/database'
import UserPetCard from '~/components/user/UserPetCard.vue'

// Rutas y autenticación
const router = useRouter()
const { isAuthenticated, user } = useAuth()

// Composables
const {
  fetchUserPets,
  deletePet: deletePetAction,
  updatePetStatus: updatePetStatusAction,
} = usePets()
const { findAdoptionsByPetId, updateAdoptionStatus, confirmAdoptionAndVerify } = useAdoptions()

// Estados
const loading = ref(true)
const error = ref(null)
const userPets = ref([])
const selectedFilter = ref('all')
const showMenuFor = ref(null)
const showRequestsFor = ref(null)
const requestsCache = ref({})

// Estados para el modal de adopción completada
const showAdoptionModal = ref(false)
const pendingAdoptionPet = ref(null)
const adoptionRequests = ref([])
const selectedAdoption = ref(null)
const adoptionType = ref('platform')

// Estados para el modal de confirmación/alerta
const showModal = ref(false)
const modalType = ref('')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('')
let confirmAction = () => {}

// Filtros disponibles
const filters = [
  { label: 'Todas', value: 'all' },
  { label: 'Disponibles', value: 'available' },
  { label: 'Adoptadas', value: 'adopted' },
  { label: 'Pausadas', value: 'unavailable' },
]

// Mascotaas filtradas según el filtro seleccionado
const filteredPets = computed(() => {
  if (selectedFilter.value === 'all') {
    return userPets.value
  }

  if (selectedFilter.value === 'available') {
    return userPets.value.filter((pet) => !pet.status || pet.status === 'available')
  }

  return userPets.value.filter((pet) => pet.status === selectedFilter.value)
})

// Contadores para el panel de estadísticas
const availablePets = computed(
  () => userPets.value.filter((pet) => !pet.status || pet.status === 'available').length
)

const adoptedPets = computed(() => userPets.value.filter((pet) => pet.status === 'adopted').length)

const totalAdoptionRequests = computed(() =>
  userPets.value.reduce((sum, pet) => sum + (pet.adoptionRequestsCount || 0), 0)
)

// Cargar datos al montar el componente
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    loading.value = true

    // Obtener las mascotas del usuario
    const pets = await fetchUserPets(user.value.uid)

    // Para cada mascota, obtener el conteo de solicitudes
    for (const pet of pets) {
      try {
        const requests = await findAdoptionsByPetId(pet.id)
        pet.adoptionRequestsCount = requests.length
        // Guardar una vista previa (hasta 2) para mostrar inline rápidamente
        requestsCache.value[pet.id] = requests
        pet.adoptionRequestsPreview = requests.slice(0, 2)
      } catch (err) {
        console.error(`Error al obtener solicitudes para mascota ${pet.id}:`, err)
        pet.adoptionRequestsCount = 0
      }
    }

    userPets.value = pets
  } catch (err) {
    console.error('Error al cargar mascotas:', err)
    error.value = 'Error al cargar tus publicaciones. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getFilterCount = (filterValue) => {
  if (filterValue === 'all') return userPets.value.length
  if (filterValue === 'available')
    return userPets.value.filter((pet) => !pet.status || pet.status === 'available').length
  return userPets.value.filter((pet) => pet.status === filterValue).length
}

const getFilterLabel = (filterValue) => {
  return filters.find((f) => f.value === filterValue)?.label || 'Filtro'
}

// Funciones de gestión de publicaciones
const confirmDeletePet = (petId) => {
  modalType.value = 'confirm'
  modalTitle.value = 'Eliminar publicación'
  modalMessage.value =
    '¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.'
  modalConfirmText.value = 'Eliminar'
  confirmAction = async () => {
    try {
      loading.value = true
      const success = await deletePetAction(petId)

      if (success) {
        userPets.value = userPets.value.filter((pet) => pet.id !== petId)
        showMenuFor.value = null
      } else {
        showAlert('Error', 'No se pudo eliminar la publicación. Por favor, intenta de nuevo.')
      }
    } catch (err) {
      console.error('Error al eliminar mascota:', err)
      showAlert('Error', 'Error al eliminar la publicación. Por favor, intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }
  showModal.value = true
}

const showAlert = (title, message) => {
  modalType.value = 'alert'
  modalTitle.value = title
  modalMessage.value = message
  modalConfirmText.value = 'Aceptar'
  confirmAction = () => {
    showModal.value = false
  }
  showModal.value = true
}

const handleStatusUpdate = async ({ id, status }) => {
  try {
    loading.value = true
    const success = await updatePetStatusAction(id, status)

    if (success) {
      // Actualizar el estado en la UI
      const index = userPets.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        userPets.value[index].status = status
      }
    } else {
      showAlert(
        'Error',
        'No se pudo actualizar el estado de la publicación. Por favor, intenta de nuevo.'
      )
    }
  } catch (err) {
    console.error('Error al actualizar estado:', err)
    showAlert(
      'Error',
      'Error al actualizar el estado de la publicación. Por favor, intenta de nuevo.'
    )
  } finally {
    loading.value = false
  }
}

// Funciones para marcar como adoptada
const markAsAdopted = async (pet) => {
  pendingAdoptionPet.value = pet
  adoptionRequests.value = []
  selectedAdoption.value = null
  adoptionType.value = 'platform'

  try {
    // Cargar las solicitudes de adopción para esta mascota
    const requests = await findAdoptionsByPetId(pet.id)
    // Filtrar solo las solicitudes aprobadas
    adoptionRequests.value = requests.filter((req) => req.status === 'approved')

    if (adoptionRequests.value.length === 1) {
      // Si solo hay una solicitud aprobada, seleccionarla automáticamente
      selectedAdoption.value = adoptionRequests.value[0].id
    }
  } catch (err) {
    console.error('Error al cargar solicitudes:', err)
    adoptionRequests.value = []
  }

  showAdoptionModal.value = true
}

const closeAdoptionModal = () => {
  showAdoptionModal.value = false
  pendingAdoptionPet.value = null
  adoptionRequests.value = []
  selectedAdoption.value = null
}

const confirmAdoption = async () => {
  if (!pendingAdoptionPet.value) return

  try {
    loading.value = true

    const petId = pendingAdoptionPet.value.id

    if (adoptionType.value === 'platform' && selectedAdoption.value) {
      // Adopción a través de la plataforma con un adoptante seleccionado
      const adoptionId = selectedAdoption.value

      // 1. Completar adopción y crear verificación centralizada
      const verificationId = await confirmAdoptionAndVerify(adoptionId, null, false)

      if (verificationId) {
        // Actualizar la UI
        const index = userPets.value.findIndex((p) => p.id === petId)
        if (index !== -1) {
          userPets.value[index].status = 'adopted'
        }

        closeAdoptionModal()
        router.push(`/certificados/${adoptionId}`)
      } else {
        showAlert('Error', 'Error al completar la adopción. Por favor, intenta de nuevo.')
      }
    } else {
      // Adopción externa (sin adoptante registrado)
      // Simplemente marcar la mascota como adoptada
      const success = await updatePetStatusAction(petId, 'adopted')

      if (success) {
        // Actualizar la UI
        const index = userPets.value.findIndex((p) => p.id === petId)
        if (index !== -1) {
          userPets.value[index].status = 'adopted'
        }

        closeAdoptionModal()
        showAlert('Éxito', 'La mascota ha sido marcada como adoptada exitosamente.')
      } else {
        showAlert('Error', 'Error al marcar la mascota como adoptada. Por favor, intenta de nuevo.')
      }
    }
  } catch (err) {
    console.error('Error al confirmar adopción:', err)
    showAlert('Error', 'Error al confirmar la adopción. Por favor, intenta de nuevo.')
  } finally {
    loading.value = false
  }
}
</script>
