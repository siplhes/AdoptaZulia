<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Gestión de Mascotas</h1>
          <p class="text-gray-600">Administra todas las mascotas en la plataforma</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin"
            class="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Volver al panel
          </NuxtLink>
          <NuxtLink
            to="/publicar"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
          >
            Añadir mascota
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
              placeholder="Buscar por nombre, ubicación..."
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
              <option value="available">Disponible</option>
              <option value="adopted">Adoptado</option>
              <option value="pending">En proceso</option>
              <option value="lost">Perdido</option>
              <option value="found">Encontrado</option>
            </select>
          </div>

          <div class="w-40">
            <label class="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
            <select
              v-model="filters.type"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              @change="applyFilters"
            >
              <option value="">Todos</option>
              <option value="perro">Perros</option>
              <option value="gato">Gatos</option>
              <option value="ave">Aves</option>
              <option value="conejo">Conejos</option>
              <option value="otro">Otros</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
            @click="resetFilters"
          >
            <RefreshCwIcon class="mr-1 h-4 w-4" />
            Restablecer
          </button>
          <button
            class="flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-emerald-700"
            @click="applyFilters"
          >
            <FilterIcon class="mr-1 h-4 w-4" />
            Filtrar
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex h-40 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-700" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <AlertCircleIcon class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- No results -->
      <div
        v-else-if="filteredPets.length === 0"
        class="rounded-lg bg-white p-8 text-center shadow-md"
      >
        <div
          class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100"
        >
          <SearchIcon class="h-12 w-12 text-amber-500" />
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-800">No se encontraron resultados</h3>
        <p class="mb-6 text-gray-600">
          No hay mascotas que coincidan con tus filtros. Intenta con otros criterios de búsqueda.
        </p>
        <button
          class="rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
          @click="resetFilters"
        >
          Restablecer filtros
        </button>
      </div>

      <!-- Pets table -->
      <div v-else class="overflow-hidden rounded-lg bg-white shadow-md">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Mascota
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Información
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Estado
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Contacto
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="pet in paginatedPets"
              :key="pet.id"
              class="transition-colors hover:bg-gray-50"
            >
              <!-- Pet info column -->
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center">
                  <div class="h-14 w-14 flex-shrink-0">
                    <NuxtImg
                      :src="pet.image"
                      :alt="pet.name"
                      class="h-14 w-14 rounded-full object-cover"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900">{{ pet.name }}</div>
                      <span
                        v-if="pet.urgent"
                        class="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
                      >
                        Urgente
                      </span>
                    </div>
                    <div class="text-sm text-gray-500">{{ pet.type }}</div>
                  </div>
                </div>
              </td>

              <!-- Information column -->
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm text-gray-900">{{ pet.breed || 'No especificada' }}</div>
                <div class="text-sm text-gray-500">{{ pet.location }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(pet.createdAt) }}</div>
              </td>

              <!-- Status column -->
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="getStatusClass(pet.status)"
                >
                  {{ formatStatus(pet.status) }}
                </span>
                <div class="mt-1 flex items-center">
                  <select
                    v-model="pet.status"
                    class="mt-1 w-full rounded-md border-gray-300 py-1 text-xs shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    @change="updatePetStatus(pet)"
                  >
                    <option value="available">Disponible</option>
                    <option value="adopted">Adoptado</option>
                    <option value="pending">En proceso</option>
                    <option value="lost">Perdido</option>
                    <option value="found">Encontrado</option>
                  </select>
                </div>
              </td>

              <!-- Contact column -->
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                <div class="text-sm font-medium text-gray-900">
                  {{ pet.contact?.name || 'N/A' }}
                </div>
                <div class="text-sm text-gray-500">{{ pet.contact?.email || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ pet.contact?.phone || 'N/A' }}</div>
              </td>

              <!-- Actions column -->
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    title="Ver mascota"
                    class="text-blue-600 hover:text-blue-900"
                    @click="viewPet(pet.id)"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </button>
                  <button
                    title="Editar mascota"
                    class="text-indigo-600 hover:text-indigo-900"
                    @click="editPet(pet.id)"
                  >
                    <EditIcon class="h-5 w-5" />
                  </button>
                  <button
                    title="Eliminar mascota"
                    class="text-red-600 hover:text-red-900"
                    @click="confirmDelete(pet)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredPets.length > 0" class="mt-4 flex justify-between">
        <div class="text-sm text-gray-700">
          Mostrando
          <span class="font-medium">{{ paginationStart + 1 }}</span>
          a
          <span class="font-medium">{{ Math.min(paginationEnd, filteredPets.length) }}</span>
          de
          <span class="font-medium">{{ filteredPets.length }}</span>
          resultados
        </div>
        <div class="flex space-x-2">
          <button
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="currentPage === 1"
            :class="{ 'cursor-not-allowed opacity-50': currentPage === 1 }"
            @click="prevPage"
          >
            <ChevronLeftIcon class="mr-1 h-5 w-5" />
            Anterior
          </button>
          <button
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="currentPage === totalPages"
            :class="{ 'cursor-not-allowed opacity-50': currentPage === totalPages }"
            @click="nextPage"
          >
            Siguiente
            <ChevronRightIcon class="ml-1 h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-start justify-between">
            <h3 class="text-xl font-semibold text-gray-900">Confirmar eliminación</h3>
            <button
              type="button"
              class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
              @click="showDeleteModal = false"
            >
              <XIcon class="h-5 w-5" />
            </button>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <NuxtImg
                :src="petToDelete?.image"
                :alt="petToDelete?.name"
                class="h-14 w-14 rounded-full object-cover"
                @error="handleImageError"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500">
                ¿Estás seguro de que deseas eliminar a
                <span class="font-semibold">{{ petToDelete?.name }}</span>
                ?
              </p>
              <p class="text-sm text-red-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              @click="showDeleteModal = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              @click="deletePet"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertCircleIcon,
  RefreshCwIcon,
  FilterIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from 'lucide-vue-next'
import { usePets } from '~/composables/usePets'

// Verificar si el usuario es administrador
definePageMeta({
  middleware: ['admin'],
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

// Estado para paginación
const currentPage = ref(1)
const pageSize = 10

// Estado para modal de eliminación
const showDeleteModal = ref(false)
const petToDelete = ref(null)

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
        pet.description?.toLowerCase().includes(query) ||
        pet.contact?.name?.toLowerCase().includes(query) ||
        pet.contact?.email?.toLowerCase().includes(query)
    )
  }

  // Filtrar por estado
  if (filters.value.status) {
    result = result.filter((pet) => pet.status === filters.value.status)
  }

  // Filtrar por tipo
  if (filters.value.type) {
    result = result.filter((pet) => pet.typeValue === filters.value.type)
  }

  // Ordenar por fecha de creación (más recientes primero)
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

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

// Cargar mascotas al montar el componente
onMounted(async () => {
  await loadPets()
})

// Métodos
async function loadPets() {
  try {
    allPets.value = await fetchAllPets()
  } catch (err) {
    console.error('Error al cargar mascotas:', err)
  }
}

function applyFilters() {
  currentPage.value = 1
}

function resetFilters() {
  searchQuery.value = ''
  filters.value = {
    status: '',
    type: '',
  }
  currentPage.value = 1
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function viewPet(petId) {
  router.push(`/mascotas/${petId}`)
}

function editPet(petId) {
  router.push(`/publicar/editar/${petId}`)
}

function confirmDelete(pet) {
  petToDelete.value = pet
  showDeleteModal.value = true
}

async function deletePet() {
  if (!petToDelete.value) return

  try {
    await deletePetById(petToDelete.value.id)
    showDeleteModal.value = false
    petToDelete.value = null

    // Recargar la lista después de eliminar
    await loadPets()
  } catch (err) {
    console.error('Error al eliminar mascota:', err)
  }
}

async function updatePetStatus(pet) {
  try {
    await updatePet(pet.id, { status: pet.status })
  } catch (err) {
    console.error('Error al actualizar estado:', err)
  }
}

// Formato y utilidades
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatStatus(status) {
  switch (status) {
    case 'available':
      return 'Disponible'
    case 'adopted':
      return 'Adoptado'
    case 'pending':
      return 'En proceso'
    case 'lost':
      return 'Perdido'
    case 'found':
      return 'Encontrado'
    default:
      return 'Desconocido'
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'adopted':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'lost':
      return 'bg-red-100 text-red-800'
    case 'found':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function handleImageError(event) {
  event.target.src = '/placeholder.webp?height=100&width=100'
}
</script>
