<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
    <div class="relative">
      <NuxtImg
        :src="pet.image"
        :alt="pet.name"
        class="h-44 w-full object-cover sm:h-48 md:h-48 lg:h-56"
        sizes="sm:100vw md:50vw lg:33vw"
        placeholder
        @error="handleImageError"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div class="absolute bottom-3 left-3">
        <h3 class="font-medium text-white">{{ pet.name }}</h3>
        <p class="text-sm text-gray-200">{{ formatType(pet.type) }}</p>
      </div>

      <!-- Etiqueta de estado -->
      <div class="absolute right-3 top-3">
        <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClasses">
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
      <div class="mb-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700">
            {{ pet.adoptionRequestsCount || 0 }} solicitudes
          </span>
          <div class="flex items-center gap-3">
            <button class="text-sm text-emerald-600 hover:text-emerald-800" @click="toggleRequests">
              {{ showRequests ? 'Ocultar solicitudes' : 'Ver solicitudes' }}
            </button>
            <NuxtLink
              :to="`/adopciones/${pet.id}`"
              class="hidden text-sm text-emerald-600 hover:text-emerald-800 sm:inline-block"
            >
              Ver en página
            </NuxtLink>
          </div>
        </div>

        <!-- Collapsible preview -->
        <div v-if="showRequests" class="mt-3 rounded-md border border-gray-100 bg-gray-50 p-3">
          <div v-if="loadingRequests" class="flex justify-center py-2">
            <Icon name="heroicons:arrow-path" class="h-5 w-5 animate-spin text-emerald-600" />
          </div>
          <div v-else-if="requests.length > 0">
            <div
              v-for="req in requests.slice(0, 5)"
              :key="req.id"
              class="flex items-center justify-between py-2"
            >
              <div class="flex items-center">
                <div class="h-8 w-8 overflow-hidden rounded-full bg-emerald-100">
                  <img
                    v-if="req.user?.photoURL"
                    :src="req.user.photoURL"
                    :alt="req.user?.name || 'Usuario'"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center font-bold text-emerald-700"
                  >
                    {{ getInitials(req.user?.name || req.user?.email || 'U') }}
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    {{ req.user?.name || req.user?.email || 'Usuario' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatShortDate(req.createdAt) }} —
                    <span class="capitalize">{{ req.status }}</span>
                  </p>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                <NuxtLink
                  :to="`/mi-solicitud/${req.id}`"
                  class="text-emerald-600 hover:text-emerald-800"
                >
                  Ver solicitud
                </NuxtLink>
              </div>
            </div>
            <div v-if="requests.length > 5" class="mt-2 text-xs text-gray-500">
              Mostrando 5 de {{ requests.length }} solicitudes
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">No hay solicitudes aún.</div>
        </div>
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
          :aria-expanded="showMenu"
          @click="toggleMenu"
        >
          <Icon name="heroicons:ellipsis-horizontal" class="h-5 w-5" aria-hidden="true" />
          <span class="sr-only">Más opciones</span>
        </button>
      </div>

      <!-- Menú desplegable -->
      <div
        v-if="showMenu"
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
          @click="updateStatus('unavailable')"
        >
          <Icon name="heroicons:pause" class="mr-2 h-4 w-4" />
          Pausar publicación
        </button>

        <button
          v-if="pet.status === 'unavailable'"
          class="flex w-full items-center px-4 py-2 text-left text-sm text-emerald-700 hover:bg-gray-50"
          @click="updateStatus('available')"
        >
          <Icon name="heroicons:play" class="mr-2 h-4 w-4" />
          Reactivar publicación
        </button>

        <button
          v-if="!pet.status || pet.status !== 'adopted'"
          class="flex w-full items-center px-4 py-2 text-left text-sm text-blue-700 hover:bg-gray-50"
          @click="$emit('mark-adopted', pet)"
        >
          <Icon name="heroicons:check-badge" class="mr-2 h-4 w-4" />
          Marcar como adoptada
        </button>

        <button
          class="flex w-full items-center px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-50"
          @click="$emit('delete', pet.id)"
        >
          <Icon name="heroicons:trash" class="mr-2 h-4 w-4" />
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdoptions } from '~/composables/useAdoptions'
import { formatRelativeTime, formatShortDate } from '~/utils/dateFormatter'

const props = defineProps({
  pet: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete', 'update-status', 'mark-adopted'])

// State
const showMenu = ref(false)
const showRequests = ref(false)
const loadingRequests = ref(false)
const requests = ref([])

// Composables
const { findAdoptionsByPetId } = useAdoptions()

// Computed
const statusClasses = computed(() => {
  const status = props.pet.status
  return {
    'bg-emerald-100 text-emerald-800': !status || status === 'available',
    'bg-amber-100 text-amber-800': status === 'pending',
    'bg-blue-100 text-blue-800': status === 'adopted',
    'bg-red-100 text-red-800': status === 'unavailable',
  }
})

// Methods
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const toggleRequests = async () => {
  if (showRequests.value) {
    showRequests.value = false
    return
  }

  showRequests.value = true
  if (requests.value.length === 0) {
    try {
      loadingRequests.value = true
      requests.value = await findAdoptionsByPetId(props.pet.id)
    } catch (err) {
      console.error('Error loading requests:', err)
    } finally {
      loadingRequests.value = false
    }
  }
}

const updateStatus = (status) => {
  emit('update-status', { id: props.pet.id, status })
  showMenu.value = false
}

// Utils
const handleImageError = (event) => {
  event.target.src = '/placeholder.webp'
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

// formatDate replaced by formatRelativeTime from utils
const formatDate = (timestamp) => formatRelativeTime(timestamp)

// formatShortDate imported from utils

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
</script>
