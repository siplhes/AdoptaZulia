<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Gestión de Adopciones</h1>
          <p class="text-gray-600">Seguimiento de procesos de adopción y solicitudes</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin"
            class="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Volver al panel
          </NuxtLink>
        </div>
      </div>

      <!-- New Tabbed Interface for KanBan-like flow -->
      <div class="mb-6 flex space-x-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all sm:flex-none',
            activeTab === tab.id
              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
          <span
            v-if="tab.count > 0"
            :class="[
              'ml-2 rounded-full py-0.5 px-2 text-xs',
              activeTab === tab.id ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Search Bar (Simplified) -->
      <div class="mb-6">
        <div class="relative">
          <Icon
            name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre de mascota, solicitante o email..."
            class="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
          >
        </div>
      </div>

      <!-- Adoptions List (Responsive Grid) -->
      <div>
        <div v-if="loading" class="flex justify-center py-12">
          <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
        </div>

        <div v-else-if="filteredAdoptions.length === 0" class="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <div class="mb-4 rounded-full bg-gray-50 p-4">
            <Icon name="mdi:clipboard-text-off-outline" class="h-8 w-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900">No hay solicitudes</h3>
          <p class="mt-1 text-gray-500">{{ emptyMessage }}</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="adoption in paginatedAdoptions"
            :key="adoption.id"
            class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-gray-100"
          >
            <!-- Badge de estado -->
             <div class="absolute right-3 top-3 z-10">
               <span 
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md',
                  statusColors[adoption.status]
                ]"
               >
                 {{ statusLabels[adoption.status] }}
               </span>
             </div>

            <!-- Pet Image Header -->
            <div class="relative h-48 bg-gray-100">
               <NuxtImg
                  v-if="adoption.pet?.imageUrl"
                  :src="adoption.pet.imageUrl"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
               />
               <div v-else class="flex h-full w-full items-center justify-center text-gray-300">
                 <Icon name="mdi:image-off" class="h-12 w-12" />
               </div>
               
               <!-- Gradient Overlay -->
               <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
               
               <!-- Pet Name on Image -->
               <div class="absolute bottom-3 left-4 text-white">
                 <h3 class="text-xl font-bold leading-tight">{{ adoption.pet?.name || 'Mascota' }}</h3>
                 <p class="text-xs opacity-90">{{ adoption.pet?.breed || 'Raza desconocida' }}</p>
               </div>
            </div>

            <!-- Applicant Info -->
            <div class="flex-1 p-5">
              <div class="mb-4 flex items-center gap-3">
                 <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {{ (adoption.user?.name || '?').charAt(0).toUpperCase() }}
                 </div>
                 <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-bold text-gray-900">{{ adoption.user?.name || 'Usuario' }}</p>
                    <p class="truncate text-xs text-gray-500">{{ adoption.user?.email }}</p>
                 </div>
              </div>
              
              <div class="space-y-2 text-sm text-gray-600">
                 <div class="flex items-center gap-2">
                    <Icon name="heroicons:calendar" class="h-4 w-4 text-gray-400" />
                    <span>{{ formatDate(adoption.createdAt) }}</span>
                 </div>
                 <div class="flex items-center gap-2">
                    <Icon name="heroicons:chat-bubble-left-ellipsis" class="h-4 w-4 text-gray-400" />
                    <span class="truncate italic">"{{ adoption.message || 'Sin mensaje' }}"</span>
                 </div>
              </div>
            </div>

            <!-- Actions Footer -->
            <div class="border-t border-gray-100 bg-gray-50 p-4">
              <div v-if="adoption.status === 'pending'" class="grid grid-cols-2 gap-3">
                 <button
                    class="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
                    @click="rejectAdoption(adoption)"
                 >
                    <Icon name="heroicons:x-mark" class="h-4 w-4" />
                    Rechazar
                 </button>
                 <button
                    class="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 shadow-sm"
                    @click="approveAdoption(adoption)"
                 >
                    <Icon name="heroicons:check" class="h-4 w-4" />
                    Aprobar
                 </button>
              </div>
              
               <div v-else-if="adoption.status === 'approved'" class="grid grid-cols-1">
                 <button
                    class="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 shadow-sm"
                    @click="completeAdoption(adoption)"
                 >
                    <Icon name="mdi:home-heart" class="h-4 w-4" />
                    Finalizar Adopción
                 </button>
              </div>

              <div v-else class="grid grid-cols-1">
                 <button
                    class="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    @click="viewDetails(adoption)"
                 >
                    <Icon name="heroicons:eye" class="h-4 w-4" />
                    Ver Detalles Completos
                 </button>
              </div>
              
              <!-- Secondary Action for Pending/Approved (View Details) -->
              <div v-if="['pending', 'approved'].includes(adoption.status)" class="mt-3 text-center">
                 <button 
                  class="text-xs font-semibold text-gray-500 hover:text-emerald-600 hover:underline"
                  @click="viewDetails(adoption)"
                 >
                    Ver detalles completos
                 </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination (Preserved but styled) -->
        <div
            v-if="filteredAdoptions.length > 0"
            class="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
          >
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Mostrando
                  <span class="font-medium">{{ paginationStart + 1 }}</span>
                  a
                  <span class="font-medium">{{ paginationEnd }}</span>
                  de
                  <span class="font-medium">{{ filteredAdoptions.length }}</span>
                  resultados
                </p>
              </div>
              <div>
                <nav
                  class="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    :disabled="currentPage === 1"
                    :class="[
                      'relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700',
                      currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50',
                    ]"
                    @click="prevPage"
                  >
                    <Icon name="heroicons:chevron-left" class="h-5 w-5" />
                  </button>
                  <button
                    :disabled="currentPage === totalPages"
                    :class="[
                      'relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700',
                      currentPage === totalPages
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-gray-50',
                    ]"
                    @click="nextPage"
                  >
                    <Icon name="heroicons:chevron-right" class="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
      </div>

      <!-- Adoption Details Modal -->
      <div
        v-if="selectedAdoption"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Detalles de la solicitud</h3>
            <button class="text-gray-400 hover:text-gray-500" @click="selectedAdoption = null">
              <Icon name="heroicons:x-mark" class="h-5 w-5" />
            </button>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Pet Details -->
            <div class="space-y-4 rounded-lg bg-gray-50 p-4">
              <h4 class="text-md font-medium text-gray-900">Información de la mascota</h4>
              <div class="flex items-center">
                <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <NuxtImg
                    v-if="selectedAdoption.pet?.imageUrl"
                    :src="selectedAdoption.pet.imageUrl"
                    alt="Imagen de mascota"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center">
                    <Icon name="mdi:paw" class="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="font-medium">
                    {{ selectedAdoption.pet?.name || 'Mascota no disponible' }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ selectedAdoption.pet?.species || 'N/A' }} -
                    {{ selectedAdoption.pet?.breed || 'N/A' }}
                  </p>
                </div>
              </div>
              <div class="space-y-2">
                <p>
                  <span class="font-medium">Edad:</span>
                  {{ selectedAdoption.pet?.age || 'N/A' }}
                </p>
                <p>
                  <span class="font-medium">Género:</span>
                  {{ selectedAdoption.pet?.gender || 'N/A' }}
                </p>
                <p>
                  <span class="font-medium">Tamaño:</span>
                  {{ selectedAdoption.pet?.size || 'N/A' }}
                </p>
                <p>
                  <span class="font-medium">Descripción:</span>
                  {{ selectedAdoption.pet?.description || 'Sin descripción' }}
                </p>
              </div>
            </div>

            <!-- Applicant Details -->
            <div class="space-y-4 rounded-lg bg-gray-50 p-4">
              <h4 class="text-md font-medium text-gray-900">Información del solicitante</h4>
              <div class="space-y-2">
                <p>
                  <span class="font-medium">Nombre:</span>
                  {{ selectedAdoption.user?.name || 'No disponible' }}
                </p>
                <p>
                  <span class="font-medium">Email:</span>
                  {{ selectedAdoption.user?.email || 'No disponible' }}
                </p>
                <p>
                  <span class="font-medium">Teléfono:</span>
                  {{ selectedAdoption.user?.phone || 'No disponible' }}
                </p>
                <p>
                  <span class="font-medium">Dirección:</span>
                  {{ selectedAdoption.user?.address || 'No disponible' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Application Details -->
          <div class="mt-6 space-y-4 rounded-lg bg-gray-50 p-4">
            <h4 class="text-md font-medium text-gray-900">Detalles de la solicitud</h4>
            <div class="space-y-2">
              <p>
                <span class="font-medium">Fecha de solicitud:</span>
                {{ formatDate(selectedAdoption.createdAt) }}
              </p>
              <p>
                <span class="font-medium">Estado:</span>
                <span
                  :class="[
                    'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                    selectedAdoption.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedAdoption.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedAdoption.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{
                    selectedAdoption.status === 'pending'
                      ? 'Pendiente'
                      : selectedAdoption.status === 'approved'
                        ? 'Aprobada'
                        : selectedAdoption.status === 'rejected'
                          ? 'Rechazada'
                          : 'Completada'
                  }}
                </span>
              </p>
              <p><span class="font-medium">Mensaje del solicitante:</span></p>
              <p class="whitespace-pre-wrap rounded-md bg-white p-3 text-sm">
                {{ selectedAdoption.message || 'Sin mensaje' }}
              </p>

              <p v-if="selectedAdoption.notes">
                <span class="font-medium">Notas administrativas:</span>
              </p>
              <p
                v-if="selectedAdoption.notes"
                class="whitespace-pre-wrap rounded-md bg-white p-3 text-sm"
              >
                {{ selectedAdoption.notes }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex justify-end space-x-3">
            <input
              v-model="adminNotes"
              class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Añadir notas administrativas..."
            >

            <button
              class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              @click="saveNotes"
            >
              Guardar notas
            </button>

            <button
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="selectedAdoption = null"
            >
              Cerrar
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useAdoptions } from '~/composables/useAdoptions'
import ModalAlert from '~/components/common/ModalAlert.vue'

// Verificar si el usuario es administrador
definePageMeta({
  middleware: ['admin'],
  layout: 'default'
})

// Usar el composable de adopciones
const {
  adoptions: allAdoptions,
  loading,
  error,
  fetchAllAdoptions,
  updateAdoptionStatus,
  updateAdoptionNotes,
} = useAdoptions()

// Estado para búsqueda y tabs
const searchQuery = ref('')
const activeTab = ref('pending')

const tabs = computed(() => {
  const pending = allAdoptions.value.filter(a => a.status === 'pending').length
  const approved = allAdoptions.value.filter(a => a.status === 'approved').length
  const rejected = allAdoptions.value.filter(a => a.status === 'rejected').length
  const completed = allAdoptions.value.filter(a => a.status === 'completed').length
  
  return [
    { id: 'all', name: 'Todas', count: allAdoptions.value.length },
    { id: 'pending', name: 'Pendientes', count: pending },
    { id: 'approved', name: 'Aprobadas', count: approved },
    { id: 'rejected', name: 'Rechazadas', count: rejected },
    { id: 'completed', name: 'Completadas', count: completed },
  ]
})

const statusLabels = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  completed: 'Completada',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  approved: 'bg-blue-100 text-blue-800 border border-blue-200',
  rejected: 'bg-red-100 text-red-800 border border-red-200',
  completed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
}

const emptyMessage = computed(() => {
  if (searchQuery.value) return 'Intenta con otros términos de búsqueda.'
  switch (activeTab.value) {
    case 'pending': return 'No tienes solicitudes pendientes por revisar. ¡Buen trabajo!'
    case 'approved': return 'No hay adopciones en curso actualmente.'
    case 'rejected': return 'No hay solicitudes rechazadas.'
    case 'completed': return 'Aún no se ha completado ninguna adopción.'
    default: return 'No hay solicitudes registradas.'
  }
})

// Paginación
const currentPage = ref(1)
const pageSize = 9

// Estado para modal de detalles y acciones
const selectedAdoption = ref(null)
const adminNotes = ref('')
const showModal = ref(false)
const modalType = ref('')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('')
let confirmAction = () => {}

// Resetear página al cambiar tab O búsqueda
watch([activeTab, searchQuery], () => {
  currentPage.value = 1
})

// Obtener adopciones
const loadAdoptions = async () => {
  try {
    await fetchAllAdoptions()
  } catch (err) {
    console.error('Error loading adoptions:', err)
  }
}

// Filtrar adopciones
const filteredAdoptions = computed(() => {
  return allAdoptions.value.filter((adoption) => {
    // Filtrar por búsqueda
    const term = searchQuery.value.toLowerCase()
    const searchMatch = !term || 
        adoption.pet?.name?.toLowerCase().includes(term) ||
        adoption.user?.name?.toLowerCase().includes(term) ||
        adoption.user?.email?.toLowerCase().includes(term)

    // Filtrar por tab
    const statusMatch = activeTab.value === 'all' || adoption.status === activeTab.value

    return searchMatch && statusMatch
  })
})

// Paginación
const totalPages = computed(() => Math.ceil(filteredAdoptions.value.length / pageSize))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize)
const paginationEnd = computed(() => Math.min(paginationStart.value + pageSize, filteredAdoptions.value.length))
const paginatedAdoptions = computed(() => filteredAdoptions.value.slice(paginationStart.value, paginationEnd.value))

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

// Acciones
const approveAdoption = async (adoption) => {
  modalType.value = 'confirm'
  modalTitle.value = 'Aprobar adopción'
  modalMessage.value = `¿Aprobar solicitud de ${adoption.user?.name} para ${adoption.pet?.name}?`
  modalConfirmText.value = 'Sí, Aprobar'
  
  confirmAction = async () => {
    showModal.value = false
    await updateAdoptionStatus(adoption.id, 'approved')
  }
  showModal.value = true
}

const rejectAdoption = async (adoption) => {
  modalType.value = 'delete'
  modalTitle.value = 'Rechazar adopción'
  modalMessage.value = `¿Estás seguro de rechazar esta solicitud? Esta acción no se puede deshacer.`
  modalConfirmText.value = 'Rechazar'
  
  confirmAction = async () => {
    showModal.value = false
    await updateAdoptionStatus(adoption.id, 'rejected')
  }
  showModal.value = true
}

const completeAdoption = async (adoption) => {
  modalType.value = 'confirm'
  modalTitle.value = 'Finalizar Adopción'
  modalMessage.value = `¿Confirmas que ${adoption.pet?.name} ha sido entregado a ${adoption.user?.name}?`
  modalConfirmText.value = '¡Sí, Adoptado!'
  
  confirmAction = async () => {
    showModal.value = false
    await updateAdoptionStatus(adoption.id, 'completed')
  }
  showModal.value = true
}

const viewDetails = (adoption) => {
  selectedAdoption.value = adoption
  adminNotes.value = adoption.notes || ''
}

const saveNotes = async () => {
  if (!selectedAdoption.value) return
  await updateAdoptionNotes(selectedAdoption.value.id, adminNotes.value)
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

onMounted(loadAdoptions)
</script>
