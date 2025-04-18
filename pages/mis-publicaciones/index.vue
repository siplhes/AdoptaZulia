<template>
  <div class="min-h-screen bg-amber-50 py-6 md:py-12">
    <div class="container mx-auto px-4">
      <h1 class="mb-6 text-3xl font-bold text-emerald-800">Mis Publicaciones</h1>
      
      <!-- Estado de carga -->
      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Sin publicaciones -->
      <div v-else-if="userPets.length === 0" class="flex flex-col items-center justify-center">
        <div class="mb-4 h-32 w-32 rounded-full bg-gray-200 p-8">
          <Icon name="heroicons:photo" class="h-16 w-16 text-gray-400" />
        </div>
        <h2 class="mb-2 text-xl font-semibold text-gray-800">Aún no tienes mascotas publicadas</h2>
        <p class="mb-6 text-center text-gray-600">
          ¿Tienes una mascota que necesita un nuevo hogar? ¡Publica su perfil para encontrarle una familia!
        </p>
        <NuxtLink
          to="/publicar"
          class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <Icon name="heroicons:plus" class="mr-2 h-5 w-5" />
          Publicar una mascota
        </NuxtLink>
      </div>

      <!-- Lista de publicaciones -->
      <div v-else>
        <!-- Panel de estadísticas -->
        <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div class="rounded-lg bg-white p-4 shadow-md">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-700">Total</h3>
              <div class="rounded-full bg-blue-100 p-2">
                <Icon name="heroicons:photo" class="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ userPets.length }}</p>
            <p class="text-sm text-gray-600">Mascotas publicadas</p>
          </div>
          
          <div class="rounded-lg bg-white p-4 shadow-md">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-700">Disponibles</h3>
              <div class="rounded-full bg-emerald-100 p-2">
                <Icon name="heroicons:heart" class="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ availablePets }}</p>
            <p class="text-sm text-gray-600">Buscando hogar</p>
          </div>
          
          <div class="rounded-lg bg-white p-4 shadow-md">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-700">Adoptadas</h3>
              <div class="rounded-full bg-amber-100 p-2">
                <Icon name="heroicons:check-badge" class="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ adoptedPets }}</p>
            <p class="text-sm text-gray-600">Encontraron hogar</p>
          </div>
          
          <div class="rounded-lg bg-white p-4 shadow-md">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-700">Solicitudes</h3>
              <div class="rounded-full bg-purple-100 p-2">
                <Icon name="heroicons:document-text" class="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ totalAdoptionRequests }}</p>
            <p class="text-sm text-gray-600">Recibidas en total</p>
          </div>
        </div>

        <!-- Filtros y botón de publicar -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-for="(filter, index) in filters"
              :key="index"
              class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="selectedFilter === filter.value ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'"
              @click="selectedFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
          
          <NuxtLink
            to="/publicar"
            class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            <Icon name="heroicons:plus" class="mr-2 h-5 w-5" />
            Nueva publicación
          </NuxtLink>
        </div>

        <!-- Listado de mascotas -->
        <div v-if="filteredPets.length > 0" class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="pet in filteredPets"
            :key="pet.id"
            class="overflow-hidden rounded-lg bg-white shadow-md"
          >
            <div class="relative">
              <NuxtImg
                :src="pet.image"
                :alt="pet.name"
                class="h-48 w-full object-cover"
                sizes="sm:100vw md:50vw lg:33vw"
                placeholder
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
              <div class="absolute bottom-3 left-3">
                <h3 class="font-medium text-white">{{ pet.name }}</h3>
                <p class="text-sm text-gray-200">{{ formatType(pet.type) }}</p>
              </div>
              
              <!-- Etiqueta de estado -->
              <div class="absolute right-3 top-3">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="{
                    'bg-emerald-100 text-emerald-800': !pet.status || pet.status === 'available',
                    'bg-amber-100 text-amber-800': pet.status === 'pending',
                    'bg-blue-100 text-blue-800': pet.status === 'adopted',
                    'bg-red-100 text-red-800': pet.status === 'unavailable'
                  }"
                >
                  {{ getStatusText(pet.status) }}
                </span>
              </div>
            </div>
            
            <div class="p-4">
              <div class="mb-4 flex items-center justify-between">
                <span class="text-sm text-gray-500">Publicado: {{ formatDate(pet.createdAt) }}</span>
                <span class="flex items-center text-sm text-gray-500">
                  <Icon name="heroicons:eye" class="mr-1 h-4 w-4" />
                  {{ pet.views || 0 }}
                </span>
              </div>

              <!-- Solicitudes de adopción -->
              <div class="mb-4 flex items-center justify-between">
                <span class="text-sm text-gray-700">
                  {{ pet.adoptionRequestsCount || 0 }} solicitudes
                </span>
                <NuxtLink
                  :to="`/adopciones/${pet.id}`"
                  class="text-sm text-emerald-600 hover:text-emerald-800"
                >
                  Ver solicitudes
                </NuxtLink>
              </div>

              <!-- Acciones -->
              <div class="grid grid-cols-2 gap-2">
                <NuxtLink
                  :to="`/mascotas/${pet.id}`"
                  class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Icon name="heroicons:eye" class="mr-1 h-4 w-4" />
                  Ver
                </NuxtLink>
                
                <button
                  class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
                  @click="showMenuFor = pet.id === showMenuFor ? null : pet.id"
                >
                  <Icon name="heroicons:ellipsis-horizontal" class="h-5 w-5" />
                  Más opciones
                </button>
              </div>
              
              <!-- Menú desplegable de opciones -->
              <div
                v-if="showMenuFor === pet.id"
                class="mt-2 divide-y divide-gray-100 rounded-md border border-gray-200 bg-white"
              >
                <NuxtLink
                  :to="`/publicar/editar/${pet.id}`"
                  class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Icon name="heroicons:pencil-square" class="mr-2 h-4 w-4" />
                  Editar
                </NuxtLink>
                
                <button
                  v-if="!pet.status || pet.status === 'available'"
                  class="flex w-full items-center px-4 py-2 text-left text-sm text-yellow-700 hover:bg-gray-50"
                  @click="updatePetStatus(pet.id, 'unavailable')"
                >
                  <Icon name="heroicons:pause" class="mr-2 h-4 w-4" />
                  Pausar publicación
                </button>
                
                <button
                  v-if="pet.status === 'unavailable'"
                  class="flex w-full items-center px-4 py-2 text-left text-sm text-emerald-700 hover:bg-gray-50"
                  @click="updatePetStatus(pet.id, 'available')"
                >
                  <Icon name="heroicons:play" class="mr-2 h-4 w-4" />
                  Reactivar publicación
                </button>
                
                <button
                  v-if="!pet.status || pet.status !== 'adopted'"
                  class="flex w-full items-center px-4 py-2 text-left text-sm text-blue-700 hover:bg-gray-50"
                  @click="markAsAdopted(pet)"
                >
                  <Icon name="heroicons:check-badge" class="mr-2 h-4 w-4" />
                  Marcar como adoptada
                </button>
                
                <button
                  class="flex w-full items-center px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-50"
                  @click="confirmDeletePet(pet.id)"
                >
                  <Icon name="heroicons:trash" class="mr-2 h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mensaje cuando no hay resultados con el filtro actual -->
        <div v-else-if="userPets.length > 0" class="flex flex-col items-center justify-center py-8">
          <Icon name="heroicons:face-frown" class="mb-2 h-16 w-16 text-gray-400" />
          <h3 class="mb-1 text-lg font-medium text-gray-700">No hay mascotas en esta categoría</h3>
          <p class="text-sm text-gray-500">Prueba con otro filtro o publica una nueva mascota</p>
        </div>
      </div>
    </div>
    
    <!-- Modal para marcar como adoptada -->
    <div v-if="showAdoptionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Marcar como adoptada</h3>
          <button 
            class="text-gray-400 hover:text-gray-500"
            @click="closeAdoptionModal"
          >
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
                Vas a marcar a <span class="font-semibold">{{ pendingAdoptionPet?.name }}</span> como adoptada.
              </p>
              <p class="mt-2 text-sm text-blue-700">
                Si la adopción se hizo a través de una solicitud en la plataforma, selecciona 
                al adoptante de la lista para generar su certificado de adopción.
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
                request.id === selectedAdoption ? 'bg-emerald-50 border-emerald-500' : '',
                adoptionRequests.length > 1 ? 'border-b border-gray-200 last:border-b-0' : ''
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
                  >
                  <div v-else class="flex h-full w-full items-center justify-center font-bold text-emerald-700">
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
                >
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
              :class="adoptionType === 'platform' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'"
              @click="adoptionType = 'platform'"
            >
              <input
                type="radio"
                name="adoptionType"
                :checked="adoptionType === 'platform'"
                class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                @click="adoptionType = 'platform'"
              >
              <div class="ml-3">
                <label class="text-sm font-medium text-gray-900">Adopción por la plataforma</label>
                <p class="text-xs text-gray-500">
                  Para adopciones realizadas a través de las solicitudes de la plataforma.
                </p>
              </div>
            </div>
            
            <div
              class="flex items-center rounded-md border p-3 hover:bg-gray-50"
              :class="adoptionType === 'external' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'"
              @click="adoptionType = 'external'"
            >
              <input
                type="radio"
                name="adoptionType"
                :checked="adoptionType === 'external'"
                class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                @click="adoptionType = 'external'"
              >
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
import ModalAlert from '~/components/common/ModalAlert'

// Rutas y autenticación
const router = useRouter()
const { isAuthenticated, user } = useAuth()

// Composables
const { fetchUserPets, deletePet: deletePetAction, updatePetStatus: updatePetStatusAction } = usePets()
const { findAdoptionsByPetId, updateAdoptionStatus } = useAdoptions()

// Estados
const loading = ref(true)
const error = ref(null)
const userPets = ref([])
const selectedFilter = ref('all')
const showMenuFor = ref(null)

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
  { label: 'Pausadas', value: 'unavailable' }
]

// Mascotaas filtradas según el filtro seleccionado
const filteredPets = computed(() => {
  if (selectedFilter.value === 'all') {
    return userPets.value
  }
  
  if (selectedFilter.value === 'available') {
    return userPets.value.filter(pet => !pet.status || pet.status === 'available')
  }
  
  return userPets.value.filter(pet => pet.status === selectedFilter.value)
})

// Contadores para el panel de estadísticas
const availablePets = computed(() => 
  userPets.value.filter(pet => !pet.status || pet.status === 'available').length
)

const adoptedPets = computed(() => 
  userPets.value.filter(pet => pet.status === 'adopted').length
)

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

// Funciones auxiliares
const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha desconocida'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'hoy'
  } else if (diffDays === 1) {
    return 'ayer'
  } else if (diffDays < 7) {
    return `hace ${diffDays} días`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `hace ${years} ${years === 1 ? 'año' : 'años'}`
  }
}

const formatShortDate = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatType = (type) => {
  switch (type) {
    case 'perro':
      return 'Perro'
    case 'gato':
      return 'Gato'
    case 'ave':
      return 'Ave'
    case 'conejo':
      return 'Conejo'
    default:
      return type?.charAt(0).toUpperCase() + type?.slice(1) || 'No especificado'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'available':
      return 'Disponible'
    case 'pending':
      return 'Reservada'
    case 'adopted':
      return 'Adoptada'
    case 'unavailable':
      return 'Pausada'
    default:
      return 'Disponible'
  }
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const handleImageError = (event) => {
  event.target.src = '/placeholder.webp'
}

// Funciones de gestión de publicaciones
const confirmDeletePet = (petId) => {
  modalType.value = 'confirm'
  modalTitle.value = 'Eliminar publicación'
  modalMessage.value = '¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.'
  modalConfirmText.value = 'Eliminar'
  confirmAction = async () => {
    try {
      loading.value = true
      const success = await deletePetAction(petId)
      
      if (success) {
        userPets.value = userPets.value.filter(pet => pet.id !== petId)
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

const updatePetStatus = async (petId, status) => {
  try {
    loading.value = true
    const success = await updatePetStatusAction(petId, status)
    
    if (success) {
      // Actualizar el estado en la UI
      const index = userPets.value.findIndex(p => p.id === petId)
      if (index !== -1) {
        userPets.value[index].status = status
      }
      showMenuFor.value = null
    } else {
      showAlert('Error', 'No se pudo actualizar el estado de la publicación. Por favor, intenta de nuevo.')
    }
  } catch (err) {
    console.error('Error al actualizar estado:', err)
    showAlert('Error', 'Error al actualizar el estado de la publicación. Por favor, intenta de nuevo.')
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
    adoptionRequests.value = requests.filter(req => req.status === 'approved')
    
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
      
      // 1. Actualizar el estado de la solicitud a 'completed'
      const adoptionSuccess = await updateAdoptionStatus(adoptionId, 'completed')
      
      if (adoptionSuccess) {
        // 2. Actualizar el estado de la mascota a 'adopted'
        await updatePetStatusAction(petId, 'adopted')
        
        // 3. Actualizar información adicional sobre la adopción
        const firebaseApp = useFirebaseApp()
        const db = getDatabase(firebaseApp)
        const petRef = dbRef(db, `pets/${petId}`)
        
        // Encontrar la solicitud seleccionada
        const selectedRequest = adoptionRequests.value.find(req => req.id === adoptionId)
        
        await update(petRef, {
          adoptedBy: selectedRequest.userId,
          adoptionId: adoptionId,
          adoptionDate: Date.now(),
          updatedAt: Date.now()
        })
        
        // 4. Actualizar la UI
        const index = userPets.value.findIndex(p => p.id === petId)
        if (index !== -1) {
          userPets.value[index].status = 'adopted'
        }
        
        // 5. Redirigir al certificado de adopción
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
        const index = userPets.value.findIndex(p => p.id === petId)
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