<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Gestión de Mascotas</h1>
          <p class="text-slate-600">Administra el inventario de adopciones</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin"
            class="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition-colors hover:bg-white hover:text-emerald-600"
          >
            Volver al panel
          </NuxtLink>
          <NuxtLink
            to="/publicar"
            class="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white transition-colors hover:bg-emerald-700 shadow-sm"
          >
            <Icon name="heroicons:plus" class="h-5 w-5" />
            Nueva Mascota
          </NuxtLink>
        </div>
      </div>

      <!-- Stats / Tabs Header -->
       <div class="mb-6 flex space-x-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm border border-slate-100">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          :class="[
            'flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all sm:flex-none',
            filters.status === filter.value
              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
          ]"
          @click="filters.status = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Search & Type Filter -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="md:col-span-2">
            <div class="relative">
            <Icon
                name="heroicons:magnifying-glass"
                class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, raza o ubicación..."
                class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            >
            </div>
        </div>
        <div>
             <select
              v-model="filters.type"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            >
              <option value="">Todas las especies</option>
              <option value="perro">🐶 Perros</option>
              <option value="gato">🐱 Gatos</option>
              <option value="ave">🐦 Aves</option>
              <option value="conejo">🐰 Conejos</option>
              <option value="otro">🐾 Otros</option>
            </select>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
             <Icon name="heroicons:exclamation-circle" class="mx-auto h-12 w-12 text-red-400 mb-2" />
             <h3 class="text-lg font-bold text-red-900">Error al cargar</h3>
             <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- No results -->
      <div
        v-else-if="filteredPets.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm border border-slate-100"
      >
        <div class="mb-4 rounded-full bg-amber-50 p-4">
            <Icon name="mdi:paw-off" class="h-10 w-10 text-amber-400" />
        </div>
        <h3 class="text-lg font-medium text-slate-800">No hay mascotas</h3>
        <p class="mt-1 text-slate-500">No hay coincidencias con los filtros actuales.</p>
        <button
            class="mt-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200"
            @click="resetFilters"
        >
            Limpiar filtros
        </button>
      </div>

      <!-- Pets Grid -->
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div 
            v-for="pet in paginatedPets" 
            :key="pet.id"
            class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100"
        >
             <!-- Image Header -->
             <div class="relative h-56 bg-slate-100">
                <NuxtImg
                    :src="pet.image"
                    class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    @error="handleImageError"
                />
                 <!-- Status Badge (Top Right) -->
                 <div class="absolute right-3 top-3 z-10">
                    <span 
                        :class="[
                            'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md',
                            getStatusClass(pet.status)
                        ]"
                    >
                        {{ formatStatus(pet.status) }}
                    </span>
                 </div>
                 
                <!-- Actions Overlay (Bottom) -->
                <div class="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                     <div class="text-white">
                        <h3 class="text-lg font-bold leading-tight">{{ pet.name }}</h3>
                        <p class="text-xs opacity-90 capitalize">{{ pet.breed || 'Raza desconocida' }} • {{ pet.gender === 'male' ? 'Macho' : 'Hembra' }}</p>
                     </div>
                </div>
             </div>

             <!-- Control Body -->
             <div class="flex-1 p-4">
                <!-- Status Control -->
                <div class="mb-4">
                    <label class="mb-1 block text-xs font-bold uppercase text-slate-400">Estado Actual</label>
                    <div class="relative">
                        <select
                            v-model="pet.status"
                            class="w-full appearance-none rounded-lg border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                            @change="updatePetStatus(pet)"
                        >
                            <option value="available">🟢 Disponible</option>
                            <option value="pending">🟡 En proceso</option>
                            <option value="adopted">🏠 ¡Adoptado!</option>
                            <option value="lost">🆘 Perdido</option>
                            <option value="found">🔍 Encontrado</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                             <Icon name="heroicons:chevron-down" class="h-4 w-4" />
                        </div>
                    </div>
                </div>
                
                 <div class="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-white">
                    <div class="flex items-center gap-2">
                         <Icon name="mdi:alert-decagram" :class="pet.urgent ? 'text-amber-500' : 'text-slate-300'" class="h-5 w-5" />
                         <span class="text-sm font-medium text-slate-700">Caso Urgente</span>
                    </div>
                    <!-- Urgent Toggle -->
                    <button 
                        @click="toggleUrgent(pet)"
                        :class="[
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                            pet.urgent ? 'bg-amber-500' : 'bg-slate-200'
                        ]"
                    >
                        <span 
                            aria-hidden="true" 
                            :class="[
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                pet.urgent ? 'translate-x-5' : 'translate-x-0'
                            ]" 
                        />
                    </button>
                </div>
             </div>

             <!-- Footer Actions -->
             <div class="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50">
                <button 
                    @click="viewPet(pet.id)"
                    class="flex items-center justify-center py-3 text-slate-500 hover:bg-white hover:text-emerald-600 transition-colors"
                    title="Ver ficha"
                >
                    <Icon name="heroicons:eye" class="h-5 w-5" />
                </button>
                <button 
                    @click="editPet(pet.id)"
                    class="flex items-center justify-center py-3 text-slate-500 hover:bg-white hover:text-blue-600 transition-colors"
                    title="Editar"
                >
                    <Icon name="heroicons:pencil-square" class="h-5 w-5" />
                </button>
                <button 
                    @click="confirmDelete(pet)"
                    class="flex items-center justify-center py-3 text-slate-500 hover:bg-white hover:text-red-600 transition-colors"
                    title="Eliminar"
                >
                    <Icon name="heroicons:trash" class="h-5 w-5" />
                </button>
             </div>
        </div>
      </div>
       <!-- Pagination -->
       <div v-if="filteredPets.length > 0" class="mt-8 flex justify-center">
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                 <button
                    :disabled="currentPage === 1"
                    :class="[
                      'relative inline-flex items-center rounded-l-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50',
                      currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                    ]"
                    @click="prevPage"
                  >
                    <Icon name="heroicons:chevron-left" class="h-5 w-5" />
                    <span class="sr-only">Anterior</span>
                  </button>
                  <span class="relative inline-flex items-center border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    {{ currentPage }} / {{ totalPages }}
                  </span>
                   <button
                    :disabled="currentPage === totalPages"
                    :class="[
                      'relative inline-flex items-center rounded-r-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50',
                      currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
                    ]"
                    @click="nextPage"
                  >
                    <Icon name="heroicons:chevron-right" class="h-5 w-5" />
                    <span class="sr-only">Siguiente</span>
                  </button>
            </nav>
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
import { useRouter } from 'vue-router'
import { usePets } from '~/composables/usePets'
import ModalAlert from '~/components/common/ModalAlert.vue'

// Verificar si el usuario es administrador
definePageMeta({
  middleware: ['admin'],
  layout: 'default'
})

const router = useRouter()
const { fetchAllPets, updatePet, deletePet: deletePetById, loading, error } = usePets()

// Estado para la lista de mascotas
const allPets = ref([])
const searchQuery = ref('')
const filters = ref({
  status: '',
  type: '',
})

const statusFilters = [
    { label: 'Todos', value: '' },
    { label: 'Disponibles', value: 'available' },
    { label: 'Adoptados', value: 'adopted' },
    { label: 'En Proceso', value: 'pending' },
    { label: 'Casos Perdidos', value: 'lost' },
]

// Estado para paginación
const currentPage = ref(1)
const pageSize = 12 // Cards per page

// Estado para el modal global
const showModal = ref(false)
const modalType = ref('')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('')
let confirmAction = () => {}

// Computar mascotas filtradas
const filteredPets = computed(() => {
  let result = [...allPets.value]

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (pet) =>
        pet.name?.toLowerCase().includes(query) ||
        pet.breed?.toLowerCase().includes(query) ||
        pet.location?.toLowerCase().includes(query) ||
        pet.description?.toLowerCase().includes(query)
    )
  }

  // Filtrar por estado
  if (filters.value.status) {
    result = result.filter((pet) => pet.status === filters.value.status)
  }

  // Filtrar por tipo
  if (filters.value.type) {
    result = result.filter((pet) => pet.typeValue === filters.value.type || pet.type === filters.value.type)
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredPets.value.length / pageSize))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize)
const paginationEnd = computed(() => currentPage.value * pageSize)
const paginatedPets = computed(() => {
  return filteredPets.value.slice(paginationStart.value, paginationEnd.value)
})

// Reset pagination when filters change
watch([searchQuery, filters], () => {
  currentPage.value = 1
})

onMounted(async () => {
  await loadPets()
})

async function loadPets() {
  try {
    allPets.value = await fetchAllPets()
  } catch (err) {
    console.error('Error al cargar mascotas:', err)
  }
}

function resetFilters() {
  searchQuery.value = ''
  filters.value = { status: '', type: '' }
  currentPage.value = 1
}

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

function viewPet(petId) { router.push(`/mascotas/${petId}`) }
function editPet(petId) { router.push(`/publicar/editar/${petId}`) }

function confirmDelete(pet) {
  modalType.value = 'delete'
  modalTitle.value = 'Confirmar eliminación'
  modalMessage.value = `¿Eliminar a ${pet.name}?`
  modalConfirmText.value = 'Eliminar'
  
  confirmAction = async () => {
    showModal.value = false
    try {
      await deletePetById(pet.id)
      await loadPets()
    } catch (err) {
      console.error('Error al eliminar:', err)
    }
  }
  showModal.value = true
}

async function updatePetStatus(pet) {
  try {
    await updatePet(pet.id, { status: pet.status })
  } catch (err) {
    console.error('Error al actualizar estado:', err)
  }
}

async function toggleUrgent(pet) {
    const newVal = !pet.urgent
    // Optimistic update
    pet.urgent = newVal
    try {
        await updatePet(pet.id, { urgent: newVal })
    } catch (err) {
        pet.urgent = !newVal // Revert
        console.error("Error updating urgent status", err)
    }
}

function formatStatus(status) {
  const map = {
    available: 'Disponible', adopted: 'Adoptado', pending: 'En Proceso', lost: 'Perdido', found: 'Encontrado'
  }
  return map[status] || status
}

function getStatusClass(status) {
   const map = {
    available: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    adopted: 'bg-blue-100 text-blue-800 border border-blue-200',
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    lost: 'bg-red-100 text-red-800 border border-red-200',
    found: 'bg-purple-100 text-purple-800 border border-purple-200'
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

function handleImageError(event) {
  event.target.src = '/img/placeholder-paw.webp' // Fallback
}
</script>
