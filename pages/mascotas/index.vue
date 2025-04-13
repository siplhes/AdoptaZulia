<template>
  <div class="min-h-screen bg-amber-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <div class="relative mb-8 overflow-hidden rounded-xl bg-emerald-700 p-6 text-white md:p-10">
        <div class="absolute inset-0 z-0">
          <NuxtImg
            src="/img3.webp"
            height="400"
            width="1200"
            alt="Mascotas en adopción"
            class="h-full w-full object-cover opacity-20"
            loading="lazy"
          />
        </div>
        <div class="relative z-10 max-w-3xl">
          <h1 class="mb-4 text-3xl font-bold md:text-4xl">Encuentra tu compañero perfecto</h1>
          <p class="mb-6 text-lg text-emerald-100">
            Explora nuestra lista de mascotas disponibles para adopción y filtra según tus
            preferencias para encontrar tu compañero ideal.
          </p>

          <!-- Search Bar -->
          <div class="flex flex-col rounded-lg bg-white p-2 md:flex-row">
            <div class="flex flex-grow items-center px-3 py-2">
              <SearchIcon class="mr-2 h-5 w-5 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, raza, ubicación..."
                class="w-full text-gray-800 focus:outline-none"
              >
            </div>
            <button
              class="mt-2 rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700 md:mt-0"
              @click="applyFilters"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-8 lg:flex-row">
        <!-- Filters Sidebar -->
        <div class="w-full lg:w-1/4">
          <div class="sticky top-24 rounded-lg bg-white p-6 shadow-sm">
            <div class="mb-6 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-emerald-800">Filtros</h2>
              <button
                class="text-sm text-emerald-600 transition-colors hover:text-emerald-700"
                @click="resetFilters"
              >
                Restablecer
              </button>
            </div>

            <!-- Botón desplegable para filtros en móviles -->
            <button
              class="mb-6 flex items-center justify-between w-full rounded-md bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 lg:hidden"
              @click="showFilters = !showFilters"
            >
              <span class="flex items-center">
                <FilterIcon class="mr-2 h-5 w-5" />
                {{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
              </span>
              <ChevronDownIcon 
                class="h-5 w-5 transition-transform duration-200" 
                :class="{'transform rotate-180': showFilters}"
              />
            </button>

            <div v-show="showFilters || !isMobile" class="space-y-6">
              <!-- Location Filter -->
              <div class="mb-6">
                <h3 class="mb-3 font-medium text-gray-900">Ubicación</h3>
                <select
                  v-model="filters.location"
                  class="w-full rounded-md border-gray-300 bg-amber-50 p-2 text-amber-950 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                >
                  <option value="">Todas las ubicaciones</option>
                  <option v-for="location in locations" :key="location" :value="location">
                    {{ location }}
                  </option>
                </select>
              </div>
              <!-- Type Filter -->
              <div class="mb-6">
                <h3 class="mb-3 font-medium text-gray-900">Tipo de mascota</h3>
                <div class="space-y-2">
                  <label v-for="type in petTypes" :key="type.value" class="flex items-center">
                    <input
                      v-model="filters.types"
                      type="checkbox"
                      :value="type.value"
                      class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    >
                    <span class="ml-2 text-gray-700">{{ type.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Age Filter -->
              <div class="mb-6">
                <h3 class="mb-3 font-medium text-gray-900">Edad</h3>
                <div class="space-y-2">
                  <label v-for="age in ageRanges" :key="age.value" class="flex items-center">
                    <input
                      v-model="filters.ages"
                      type="checkbox"
                      :value="age.value"
                      class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    >
                    <span class="ml-2 text-gray-700">{{ age.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Size Filter -->
              <div class="mb-6">
                <h3 class="mb-3 font-medium text-gray-900">Tamaño</h3>
                <div class="space-y-2">
                  <label v-for="size in sizes" :key="size.value" class="flex items-center">
                    <input
                      v-model="filters.sizes"
                      type="checkbox"
                      :value="size.value"
                      class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    >
                    <span class="ml-2 text-gray-700">{{ size.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Gender Filter -->
              <div class="mb-6">
                <h3 class="mb-3 font-medium text-gray-900">Género</h3>
                <div class="space-y-2">
                  <label v-for="gender in genders" :key="gender.value" class="flex items-center">
                    <input
                      v-model="filters.gender"
                      type="radio"
                      :value="gender.value"
                      class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    >
                    <span class="ml-2 text-gray-700">{{ gender.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Additional Filters -->
              <div class="mb-6">
                <h3 class="mb-3 font-medium text-gray-900">Características</h3>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="filters.vaccinated"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    >
                    <span class="ml-2 text-gray-700">Vacunado</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="filters.neutered"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    >
                    <span class="ml-2 text-gray-700">Esterilizado</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="filters.urgent"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    >
                    <span class="ml-2 text-gray-700">Casos urgentes</span>
                  </label>
                </div>
              </div>

              <button
                class="w-full rounded-md bg-emerald-600 py-2 text-white transition-colors hover:bg-emerald-700"
                @click="applyFilters"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>

        <!-- Pets Grid -->
        <div class="w-full lg:w-3/4">
          <!-- Results Header -->
          <div class="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <div>
              <h2 class="text-2xl font-bold text-emerald-800">
                {{ filteredPets.length }} mascotas encontradas
              </h2>
              <p class="text-gray-600">Mostrando resultados para tus filtros</p>
            </div>
            <div class="mt-3 sm:mt-0">
              <select
                v-model="sortBy"
                class="rounded-md border-gray-300 bg-emerald-600 p-2 text-[#fefffa] shadow-sm focus:border-emerald-800 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
              >
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="name_asc">Nombre (A-Z)</option>
                <option value="name_desc">Nombre (Z-A)</option>
              </select>
            </div>
          </div>

          <!-- No Results -->
          <div v-if="filteredPets.length === 0" class="rounded-lg bg-white p-8 text-center">
            <div
              class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100"
            >
              <SearchIcon class="h-12 w-12 text-amber-500" />
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-800">No se encontraron resultados</h3>
            <p class="mb-6 text-gray-600">
              No hay mascotas que coincidan con tus filtros. Intenta con otros criterios de
              búsqueda.
            </p>
            <button
              class="rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
              @click="resetFilters"
            >
              Restablecer filtros
            </button>
          </div>

          <!-- Pets Grid -->
          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="pet in filteredPets"
              :key="pet.id"
              class="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div class="relative">
                <NuxtImg :src="pet.image" :alt="pet.name" class="h-64 w-full object-cover"  loading="lazy"/>
                <div class="absolute right-4 top-4 flex space-x-2">
                  <span class="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">
                    {{ pet.type }}
                  </span>
                  <span
                    v-if="pet.urgent"
                    class="flex items-center rounded-full bg-red-100 px-3 py-1 text-xs text-red-800"
                  >
                    <AlertCircleIcon class="mr-1 h-3 w-3" />
                    Urgente
                  </span>
                </div>
              </div>

              <div class="p-6">
                <div class="mb-2 flex items-start justify-between">
                  <h3 class="text-xl font-semibold text-emerald-800">
                    {{ pet.name }}
                  </h3>
                  <HeartIcon
                    class="h-6 w-6 cursor-pointer text-gray-400 transition-colors hover:text-red-500"
                    @click="toggleFavorite(pet.id)"
                  />
                </div>

                <p class="mb-4 text-gray-600">
                  {{ pet.breed }} • {{ pet.age }} • {{ pet.location }}
                </p>

                <div class="mb-4 flex flex-wrap gap-2">
                  <span
                    v-if="pet.vaccinated"
                    class="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                  >
                    <CheckCircleIcon class="mr-1 h-3 w-3" />
                    Vacunado
                  </span>
                  <span
                    v-if="pet.neutered"
                    class="flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                  >
                    <CheckCircleIcon class="mr-1 h-3 w-3" />
                    Esterilizado
                  </span>
                  <span
                    class="flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800"
                  >
                    <RulerIcon class="mr-1 h-3 w-3" />
                    {{ pet.size }}
                  </span>
                </div>

                <a
                  :href="`/mascotas/${pet.id}`"
                  class="block w-full rounded-lg bg-emerald-600 py-2 text-center font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  Ver detalles
                </a>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="filteredPets.length > 0" class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
              <button
                :disabled="currentPage === 1"
                :class="[
                  'rounded-md px-3 py-1',
                  currentPage === 1
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                    : 'bg-white text-emerald-600 hover:bg-emerald-50',
                ]"
                @click="prevPage"
              >
                <ChevronLeftIcon class="h-5 w-5" />
              </button>

              <button
                v-for="page in totalPages"
                :key="page"
                :class="[
                  'rounded-md px-3 py-1',
                  currentPage === page
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-600 hover:bg-emerald-50',
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>

              <button
                :disabled="currentPage === totalPages"
                :class="[
                  'rounded-md px-3 py-1',
                  currentPage === totalPages
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                    : 'bg-white text-emerald-600 hover:bg-emerald-50',
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
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import {
  SearchIcon,
  AlertCircleIcon,
  HeartIcon,
  CheckCircleIcon,
  RulerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon, // Agregar icono de filtro
  ChevronDownIcon, // Agregar icono de despliegue
} from 'lucide-vue-next'
import { usePets } from '~/composables/usePets'

// Composables
const route = useRoute()
const { fetchAllPets, filterPets, searchPets, loading, error, pets } = usePets()

// Search and filters
const searchQuery = ref('')
const filters = ref({
  types: [],
  ages: [],
  sizes: [],
  gender: '',
  vaccinated: false,
  neutered: false,
  urgent: false,
  location: '',
})

// Estado para controlar la visibilidad de los filtros
const showFilters = ref(false)

// Detectar si es dispositivo móvil
const isMobile = ref(false)

// Comprobar el tamaño de la ventana para determinar si es móvil
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 1024 // 1024px es el breakpoint de lg en Tailwind
}

// Actualizar la variable isMobile cuando cambia el tamaño de la ventana
onMounted(() => {
  if (process.client) {
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
  }
})

// Eliminamos el listener cuando se desmonta el componente
watch(() => route.fullPath, () => {
  showFilters.value = false
})

// Limpiar el evento al desmontar el componente
onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('resize', checkIfMobile)
  }
})

// Sorting
const sortBy = ref('recent')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 9

// Filter options
const petTypes = [
  { value: 'perro', label: 'Perros' },
  { value: 'gato', label: 'Gatos' },
  { value: 'conejo', label: 'Conejos' },
  { value: 'ave', label: 'Aves' },
  { value: 'otro', label: 'Otros' },
]

const ageRanges = [
  { value: 'cachorro', label: 'Cachorro (< 1 año)' },
  { value: 'joven', label: 'Joven (1-3 años)' },
  { value: 'adulto', label: 'Adulto (4-8 años)' },
  { value: 'senior', label: 'Senior (> 8 años)' },
]

const sizes = [
  { value: 'pequeño', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
  { value: 'grande', label: 'Grande' },
]

const genders = [
  { value: '', label: 'Todos' },
  { value: 'macho', label: 'Macho' },
  { value: 'hembra', label: 'Hembra' },
]

const locations = ['Maracaibo', 'San Francisco', 'Cabimas', 'Machiques', 'Lara', 'Falcon']

// Estado para datos filtrados
const allPets = ref([])
const isLoading = ref(false)

// Filtered pets
const filteredPets = computed(() => {
  let result = [...allPets.value]

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (pet) =>
        pet.name.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query) ||
        pet.location.toLowerCase().includes(query) ||
        (pet.description && pet.description.toLowerCase().includes(query))
    )
  }

  // Apply type filter
  if (filters.value.types.length > 0) {
    result = result.filter((pet) => filters.value.types.includes(pet.typeValue))
  }

  // Apply age filter
  if (filters.value.ages.length > 0) {
    result = result.filter((pet) => filters.value.ages.includes(pet.ageValue))
  }

  // Apply size filter
  if (filters.value.sizes.length > 0) {
    result = result.filter((pet) => filters.value.sizes.includes(pet.sizeValue))
  }

  // Apply gender filter
  if (filters.value.gender) {
    result = result.filter((pet) => pet.gender === filters.value.gender)
  }

  // Apply vaccinated filter
  if (filters.value.vaccinated) {
    result = result.filter((pet) => pet.vaccinated)
  }

  // Apply neutered filter
  if (filters.value.neutered) {
    result = result.filter((pet) => pet.neutered)
  }

  // Apply urgent filter
  if (filters.value.urgent) {
    result = result.filter((pet) => pet.urgent)
  }

  // Apply location filter
  if (filters.value.location) {
    result = result.filter((pet) => pet.location === filters.value.location)
  }

  // Apply sorting
  switch (sortBy.value) {
    case 'recent':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      result.sort((a, b) => b.name.localeCompare(a.name))
      break
  }

  return result
})

// Pagination
/*
const paginatedPets = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredPets.value.slice(startIndex, endIndex);
});
*/
const totalPages = computed(() => {
  return Math.ceil(filteredPets.value.length / itemsPerPage)
})

// Methods
const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  filters.value = {
    types: [],
    ages: [],
    sizes: [],
    gender: '',
    vaccinated: false,
    neutered: false,
    urgent: false,
    location: '',
  }
  sortBy.value = 'recent'
  currentPage.value = 1
}

const toggleFavorite = (petId) => {
  // Implementación real requeriría estado y posiblemente una API
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToPage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Cargar mascotas al montar el componente y aplicar filtros
const loadPets = async () => {
  isLoading.value = true
  try {
    // Obtener todas las mascotas de Firebase
    const petsData = await fetchAllPets()
    allPets.value = petsData
  } catch (err) {
    console.error('Error al cargar mascotas:', err)
  } finally {
    isLoading.value = false
  }
}

// Initialize from URL params if any
onMounted(async () => {
  // Cargar todas las mascotas
  await loadPets()

  // Procesar parámetros de URL si existen
  const queryParams = route.query

  if (queryParams.tipo) {
    filters.value.types = [queryParams.tipo]
  }

  if (queryParams.edad) {
    filters.value.ages = [queryParams.edad]
  }

  if (queryParams.tamaño) {
    filters.value.sizes = [queryParams.tamaño]
  }

  if (queryParams.genero) {
    filters.value.gender = queryParams.genero
  }

  if (queryParams.ubicacion) {
    filters.value.location = queryParams.ubicacion
  }

  if (queryParams.buscar) {
    searchQuery.value = queryParams.buscar
  }

  useHead({
    title: 'Mascotas en adopción | Adopta Zulia',
    meta: [
      {
        name: 'description',
        content: 'Encuentra tu compañero perfecto entre nuestras mascotas en adopción.',
      },
    ],
  })
})
</script>

<style scoped>
/* Estilos específicos para la página de mascotas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
