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

      <!-- Filters & Search -->
      <div
        class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-md lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div class="flex-1">
            <label class="mb-1 block text-sm font-medium text-gray-700">Buscar</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por mascota o usuario..."
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              @input="applyFilters"
            >
          </div>

          <div class="w-40">
            <label class="mb-1 block text-sm font-medium text-gray-700">Estado</label>
            <select
              v-model="filters.status"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              @change="applyFilters"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
              <option value="completed">Completada</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="resetFilters"
          >
            <RefreshCwIcon class="mr-2 h-4 w-4" />
            Restablecer
          </button>
        </div>
      </div>

      <!-- Adoptions List -->
      <div class="overflow-hidden rounded-lg bg-white shadow-md">
        <div v-if="loading" class="flex justify-center py-8">
          <div
            class="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600"
          />
        </div>

        <div v-else-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al cargar las adopciones</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="filteredAdoptions.length === 0" class="p-8 text-center">
          <p class="text-gray-500">
            No se encontraron solicitudes de adopción con los filtros actuales.
          </p>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Mascota
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Solicitante
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Fecha de solicitud
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="adoption in paginatedAdoptions" :key="adoption.id">
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <img
                        v-if="adoption.pet?.imageUrl"
                        :src="adoption.pet.imageUrl"
                        alt="Imagen de mascota"
                        class="h-full w-full object-cover"
                      >
                      <div v-else class="flex h-full w-full items-center justify-center">
                        <PawPrintIcon class="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ adoption.pet?.name || 'Mascota no disponible' }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ adoption.pet?.species || 'N/A' }} - {{ adoption.pet?.breed || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ adoption.user?.name || adoption.user?.email || 'Usuario desconocido' }}
                  </div>
                  <div class="text-xs text-gray-500">{{ adoption.user?.email || 'N/A' }}</div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="text-sm text-gray-900">{{ formatDate(adoption.createdAt) }}</div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span
                    :class="[
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                      adoption.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : adoption.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : adoption.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800',
                    ]"
                  >
                    {{
                      adoption.status === 'pending'
                        ? 'Pendiente'
                        : adoption.status === 'approved'
                          ? 'Aprobada'
                          : adoption.status === 'rejected'
                            ? 'Rechazada'
                            : 'Completada'
                    }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    v-if="adoption.status === 'pending'"
                    class="mr-2 text-blue-600 hover:text-blue-900"
                    @click="approveAdoption(adoption)"
                  >
                    Aprobar
                  </button>
                  <button
                    v-if="adoption.status === 'pending'"
                    class="mr-2 text-red-600 hover:text-red-900"
                    @click="rejectAdoption(adoption)"
                  >
                    Rechazar
                  </button>
                  <button
                    v-if="adoption.status === 'approved'"
                    class="mr-2 text-green-600 hover:text-green-900"
                    @click="completeAdoption(adoption)"
                  >
                    Completar
                  </button>
                  <button
                    class="text-emerald-600 hover:text-emerald-900"
                    @click="viewDetails(adoption)"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div
            class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
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
                    <ChevronLeftIcon class="h-5 w-5" />
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
                    <ChevronRightIcon class="h-5 w-5" />
                  </button>
                </nav>
              </div>
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
              <XIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Pet Details -->
            <div class="space-y-4 rounded-lg bg-gray-50 p-4">
              <h4 class="text-md font-medium text-gray-900">Información de la mascota</h4>
              <div class="flex items-center">
                <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <img
                    v-if="selectedAdoption.pet?.imageUrl"
                    :src="selectedAdoption.pet.imageUrl"
                    alt="Imagen de mascota"
                    class="h-full w-full object-cover"
                  >
                  <div v-else class="flex h-full w-full items-center justify-center">
                    <PawPrintIcon class="h-8 w-8 text-gray-400" />
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  AlertCircleIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PawPrintIcon,
  XIcon,
} from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useAdoptions } from '~/composables/useAdoptions'

// Verificar si el usuario es administrador
definePageMeta({
  middleware: ['admin'],
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

// Estado para búsqueda y filtros
const searchQuery = ref('')
const filters = ref({
  status: '',
})

// Estado para paginación
const currentPage = ref(1)
const pageSize = 10

// Estado para modal de detalles
const selectedAdoption = ref(null)
const adminNotes = ref('')

// Métodos para cargar datos
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
    const searchMatch = searchQuery.value
      ? adoption.pet?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        adoption.user?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        adoption.user?.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true

    // Filtrar por estado
    const statusMatch = filters.value.status ? adoption.status === filters.value.status : true

    return searchMatch && statusMatch
  })
})

// Paginación
const totalPages = computed(() => {
  return Math.ceil(filteredAdoptions.value.length / pageSize)
})

const paginationStart = computed(() => {
  return (currentPage.value - 1) * pageSize
})

const paginationEnd = computed(() => {
  return Math.min(paginationStart.value + pageSize, filteredAdoptions.value.length)
})

const paginatedAdoptions = computed(() => {
  return filteredAdoptions.value.slice(paginationStart.value, paginationEnd.value)
})

// Métodos
const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  filters.value = {
    status: '',
  }
  currentPage.value = 1
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Acciones sobre las adopciones
const approveAdoption = async (adoption) => {
  try {
    await updateAdoptionStatus(adoption.id, 'approved')
  } catch (err) {
    console.error('Error approving adoption:', err)
  }
}

const rejectAdoption = async (adoption) => {
  try {
    await updateAdoptionStatus(adoption.id, 'rejected')
  } catch (err) {
    console.error('Error rejecting adoption:', err)
  }
}

const completeAdoption = async (adoption) => {
  try {
    await updateAdoptionStatus(adoption.id, 'completed')
  } catch (err) {
    console.error('Error completing adoption:', err)
  }
}

const viewDetails = (adoption) => {
  selectedAdoption.value = adoption
  adminNotes.value = adoption.notes || ''
}

const saveNotes = async () => {
  if (!selectedAdoption.value) return

  try {
    await updateAdoptionNotes(selectedAdoption.value.id, adminNotes.value)
    // La función updateAdoptionNotes ya actualiza el estado local
  } catch (err) {
    console.error('Error saving notes:', err)
  }
}

// Formato de fecha
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const d = new Date(timestamp)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Cargar adopciones al montar el componente
onMounted(loadAdoptions)
</script>
