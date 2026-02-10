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
            sizes="sm:100vw md:100vw lg:100vw"
            placeholder
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
              <Icon name="heroicons:magnifying-glass" class="mr-2 h-5 w-5 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, raza, ubicación..."
                class="w-full text-gray-800 focus:outline-none"
              />
            </div>
            <button
              class="mt-2 rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700 md:mt-0"
              @click="applyFilters"
            >
              Buscar
            </button>
          </div>

          <!-- Quick Filters (Mobile/Desktop) -->
          <div class="mt-6 flex flex-wrap gap-2">
            <button
              v-for="(filter, idx) in quickFilters"
              :key="idx"
              class="rounded-full border border-emerald-500/30 bg-emerald-800/30 px-4 py-1.5 text-sm font-medium text-emerald-50 backdrop-blur-sm transition-colors hover:bg-emerald-100 hover:text-emerald-800"
              @click="applyQuickFilter(filter)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-8 lg:flex-row">
        <!-- Filters Sidebar (Desktop) / Drawer (Mobile) -->
        <div class="w-full lg:w-1/4">
          <!-- Mobile Filter Toggle -->
          <button
            class="mb-6 flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-4 text-emerald-800 shadow-sm transition-colors hover:bg-gray-50 lg:hidden"
            @click="showFilters = true"
          >
            <div class="flex items-center font-bold">
              <Icon name="heroicons:adjustments-horizontal" class="mr-3 h-5 w-5 text-emerald-600" />
              Filtros y Orden
            </div>
            <div
              v-if="activeFiltersCount > 0"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
            >
              {{ activeFiltersCount }}
            </div>
          </button>

          <!-- Filters Container -->
          <div
            class="lg:sticky lg:top-24 lg:block"
            :class="[
              isMobile
                ? 'fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out'
                : '',
              showFilters ? 'translate-x-0' : isMobile ? 'translate-x-[100%]' : '',
            ]"
          >
            <!-- Mobile Overlay/Backdrop -->
            <div
              v-if="isMobile && showFilters"
              class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              @click="showFilters = false"
            />

            <!-- Filter Content -->
            <div
              class="relative h-full overflow-y-auto bg-white p-6 shadow-xl lg:h-auto lg:rounded-2xl lg:border lg:border-gray-100 lg:p-6 lg:shadow-sm"
            >
              <!-- Mobile Header -->
              <div class="mb-6 flex items-center justify-between lg:hidden">
                <h2 class="text-xl font-bold text-gray-900">Filtros</h2>
                <button
                  class="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  @click="showFilters = false"
                >
                  <Icon name="heroicons:x-mark" class="h-6 w-6" />
                </button>
              </div>

              <!-- Desktop Header -->
              <div class="mb-6 hidden items-center justify-between lg:flex">
                <h2 class="text-xl font-bold text-emerald-800">Filtros</h2>
                <button
                  v-if="hasActiveFilters"
                  class="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                  @click="resetFilters"
                >
                  Limpiar todo
                </button>
              </div>

              <div class="space-y-8">
                <!-- Location Filter -->
                <div>
                  <h3 class="mb-3 flex items-center font-bold text-gray-900">
                    <Icon name="heroicons:map-pin" class="mr-2 h-4 w-4 text-emerald-500" />
                    Ubicación
                  </h3>
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
                      />
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
                      />
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
                      />
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
                      />
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
                      />
                      <span class="ml-2 text-gray-700">Vacunado</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="filters.neutered"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span class="ml-2 text-gray-700">Esterilizado</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="filters.urgent"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span class="ml-2 text-gray-700">Casos urgentes</span>
                    </label>
                  </div>
                </div>

                <button
                  class="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition-transform hover:scale-[1.02] active:scale-95 lg:hover:bg-emerald-700"
                  @click="applyFilters"
                >
                  Ver {{ filteredPets.length }} mascotas
                </button>
              </div>
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
              <Icon name="heroicons:magnifying-glass" class="h-12 w-12 text-amber-500" />
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
            <div v-for="pet in filteredPets" :key="pet.id">
              <PetCard :pet="pet" :is-favorite="false" @toggle-favorite="toggleFavorite" />
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
                <Icon name="heroicons:chevron-left" class="h-5 w-5" />
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
                <Icon name="heroicons:chevron-right" class="h-5 w-5" />
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
import { usePets } from '~/composables/usePets'
import PetCard from '~/components/common/PetCard.vue'

const route = useRoute()
const { fetchAllPets } = usePets()

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

const quickFilters = [
  { label: '🐶 Perros', type: 'perro' },
  { label: '🐱 Gatos', type: 'gato' },
  { label: '🐾 Cachorros', age: 'cachorro' },
  { label: '🚑 Urgentes', urgent: true },
]

const applyQuickFilter = (filter) => {
  resetFilters()
  if (filter.type) filters.value.types = [filter.type]
  if (filter.age) filters.value.ages = [filter.age]
  if (filter.urgent) filters.value.urgent = true
  currentPage.value = 1
}

const showFilters = ref(false)
const isMobile = ref(false)

const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  if (import.meta.client) {
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
  }
})

watch(
  () => route.fullPath,
  () => {
    showFilters.value = false
  }
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', checkIfMobile)
    document.body.style.overflow = ''
  }
})

// Watch showFilters to prevent body scroll when drawer is open
watch(showFilters, (val) => {
  if (import.meta.client) {
    document.body.style.overflow = val && isMobile.value ? 'hidden' : ''
  }
})

const sortBy = ref('recent')
const currentPage = ref(1)
const itemsPerPage = 9

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

const allPets = ref([])
const isLoading = ref(false)

const filteredPets = computed(() => {
  let result = [...allPets.value]

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

  if (filters.value.types.length > 0) {
    result = result.filter((pet) => filters.value.types.includes(pet.typeValue))
  }

  if (filters.value.ages.length > 0) {
    result = result.filter((pet) => filters.value.ages.includes(pet.ageValue))
  }

  if (filters.value.sizes.length > 0) {
    result = result.filter((pet) => filters.value.sizes.includes(pet.sizeValue))
  }

  if (filters.value.gender) {
    result = result.filter((pet) => pet.gender === filters.value.gender)
  }

  if (filters.value.vaccinated) {
    result = result.filter((pet) => pet.vaccinated)
  }

  if (filters.value.neutered) {
    result = result.filter((pet) => pet.neutered)
  }

  if (filters.value.urgent) {
    result = result.filter((pet) => pet.urgent)
  }

  if (filters.value.location) {
    result = result.filter((pet) => pet.location === filters.value.location)
  }

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

  // Pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return result.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  let result = [...allPets.value]

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

  if (filters.value.types.length > 0) {
    result = result.filter((pet) => filters.value.types.includes(pet.typeValue))
  }

  if (filters.value.ages.length > 0) {
    result = result.filter((pet) => filters.value.ages.includes(pet.ageValue))
  }

  if (filters.value.sizes.length > 0) {
    result = result.filter((pet) => filters.value.sizes.includes(pet.sizeValue))
  }

  if (filters.value.gender) {
    result = result.filter((pet) => pet.gender === filters.value.gender)
  }

  if (filters.value.vaccinated) {
    result = result.filter((pet) => pet.vaccinated)
  }

  if (filters.value.neutered) {
    result = result.filter((pet) => pet.neutered)
  }

  if (filters.value.urgent) {
    result = result.filter((pet) => pet.urgent)
  }

  if (filters.value.location) {
    result = result.filter((pet) => pet.location === filters.value.location)
  }

  return Math.ceil(result.length / itemsPerPage)
})

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

const loadPets = async () => {
  isLoading.value = true
  try {
    const petsData = await fetchAllPets()
    allPets.value = petsData
  } catch (err) {
    console.error('Error al cargar mascotas:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadPets()

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
})

const canonicalUrl = useCanonicalUrl('/mascotas')
const ogImage = useOgImage('/og.jpg')

// SEO Meta Tags - must be at top level for SSR
useSeoMeta({
  title: 'Mascotas en adopción | Adopta Zulia',
  description:
    'Encuentra tu compañero perfecto entre perros, gatos y otras mascotas en adopción en el estado Zulia. Filtra por tamaño, edad, ubicación y más características.',
  ogTitle: 'Mascotas en adopción - Adopta Zulia',
  ogDescription:
    'Explora nuestra lista de mascotas disponibles para adopción. Encuentra tu compañero ideal filtrando por tipo, tamaño, edad y ubicación.',
  ogImage,
  ogImageAlt: 'Mascotas disponibles para adopción en Zulia',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterTitle: 'Mascotas en adopción - Adopta Zulia',
  twitterDescription:
    'Encuentra perros, gatos y otras mascotas disponibles para adopción en el estado Zulia.',
  twitterImage: ogImage,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  script: [
    useStructuredData(
      createBreadcrumbSchema([
        { name: 'Inicio', url: useCanonicalUrl('/') },
        { name: 'Mascotas en Adopción', url: canonicalUrl },
      ])
    ),
  ],
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
