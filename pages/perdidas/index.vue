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
            alt="Mascotas perdidas"
            class="h-full w-full object-cover opacity-20"
            loading="lazy"
            sizes="sm:100vw md:100vw lg:100vw"
            placeholder
          />
        </div>
        <div class="relative z-10 max-w-3xl">
          <h1 class="mb-4 text-3xl font-bold md:text-4xl">Mascotas perdidas</h1>
          <p class="mb-6 text-lg text-emerald-100">
            Consulta reportes de mascotas perdidas y ayuda a reunirlas con sus familias.
          </p>

          <!-- Search Bar -->
          <div class="flex flex-col rounded-lg bg-white p-2 md:flex-row">
            <div class="flex flex-grow items-center px-3 py-2">
              <Icon name="heroicons:magnifying-glass" class="mr-2 h-5 w-5 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, ubicación, descripción..."
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
          </button>

          <!-- Report Button (Mobile/Desktop) -->
          <div class="mb-6">
            <button
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-lg shadow-red-200 transition-transform hover:scale-[1.02] hover:bg-red-700 active:scale-95"
              @click="$router.push('/perdidas/crear')"
            >
              <Icon name="heroicons:megaphone" class="h-5 w-5" />
              Reportar mascota
            </button>
          </div>

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
                  class="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                  @click="resetFilters"
                >
                  Limpiar
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

                <!-- Additional Filters -->
                <div>
                  <h3 class="mb-3 flex items-center font-bold text-gray-900">Tipo</h3>
                  <div class="flex flex-wrap gap-2">
                    <label v-for="type in petTypes" :key="type.value" class="cursor-pointer">
                      <input
                        v-model="filters.types"
                        type="checkbox"
                        :value="type.value"
                        class="peer sr-only"
                      />
                      <span
                        class="rounded-lg border px-3 py-1 text-sm transition-colors hover:bg-gray-50 peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white"
                      >
                        {{ type.label }}
                      </span>
                    </label>
                  </div>
                </div>

                <!-- Characteristics -->
                <div>
                  <h3 class="mb-3 font-bold text-gray-900">Características</h3>
                  <div class="space-y-2">
                    <label
                      class="flex cursor-pointer items-center rounded-lg border border-gray-100 p-2 hover:bg-gray-50"
                    >
                      <input
                        v-model="filters.urgent"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span class="ml-2 font-medium text-gray-700">Con recompensa</span>
                      <span
                        class="ml-auto rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800"
                      >
                        $$$
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  class="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition-transform hover:scale-[1.02] active:scale-95 lg:hover:bg-emerald-700"
                  @click="applyFilters"
                >
                  Ver reportes
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
          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="pet in filteredPets"
              :key="pet.id"
              class="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <NuxtImg
                  :src="
                    pet.images && pet.images.length
                      ? pet.images[0]
                      : pet.image || '/img/placeholder.png'
                  "
                  :alt="pet.name"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  sizes="sm:100vw md:50vw lg:33vw"
                  placeholder
                />

                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40"
                />

                <!-- Reward Badge -->
                <div v-if="pet.reward" class="absolute right-3 top-3 z-10">
                  <div
                    class="animate-bounce-slow flex flex-col items-center justify-center rounded-lg bg-yellow-400 px-3 py-1.5 shadow-lg"
                  >
                    <span class="text-[10px] font-bold uppercase leading-tight text-yellow-900">
                      Recompensa
                    </span>
                    <span class="text-xs font-black text-yellow-950">$$$</span>
                  </div>
                </div>

                <!-- Badges Container -->
                <div class="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between">
                  <div class="flex flex-wrap gap-2">
                    <span
                      class="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-800 shadow-sm backdrop-blur-md"
                    >
                      <Icon
                        :name="
                          pet.type === 'perro'
                            ? 'ph:dog-bold'
                            : pet.type === 'gato'
                              ? 'ph:cat-bold'
                              : 'ph:paw-print-bold'
                        "
                        class="h-3.5 w-3.5 text-emerald-600"
                      />
                      {{ pet.type }}
                    </span>
                    <span
                      v-if="pet.age"
                      class="rounded-lg bg-emerald-100/90 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-md"
                    >
                      {{ pet.age }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex flex-1 flex-col p-5">
                <div class="mb-2 flex items-start justify-between">
                  <h3
                    class="line-clamp-1 text-xl font-bold text-red-700 transition-colors group-hover:text-red-600"
                  >
                    {{ pet.name }}
                  </h3>
                  <div class="rounded-full bg-red-50 p-1.5 text-red-500">
                    <Icon name="heroicons:exclamation-triangle" class="h-5 w-5" />
                  </div>
                </div>

                <div class="mb-4 space-y-1">
                  <div class="flex items-start text-sm font-medium text-gray-700">
                    <Icon
                      name="heroicons:map-pin"
                      class="mr-1.5 mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
                    />
                    <span class="line-clamp-1">{{ pet.location }}</span>
                  </div>
                  <div v-if="pet.lastSeenAt" class="flex items-center text-xs text-gray-500">
                    <Icon name="heroicons:clock" class="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                    <span>Visto: {{ new Date(pet.lastSeenAt).toLocaleDateString() }}</span>
                  </div>
                </div>

                <div class="mb-5 flex-1">
                  <p
                    class="line-clamp-2 border-l-2 border-red-100 pl-3 text-sm italic leading-relaxed text-gray-600"
                  >
                    "{{ pet.description }}"
                  </p>
                </div>

                <NuxtLink
                  :to="`/perdidas/${pet.id}`"
                  class="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 focus:ring-4 focus:ring-red-100 active:scale-[0.98]"
                >
                  <span class="relative z-10 flex items-center gap-2">
                    Ayudar a buscar
                    <Icon
                      name="heroicons:arrow-right"
                      class="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                    />
                  </span>
                  <div
                    class="group-hover/btn:animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500"
                  />
                </NuxtLink>
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
import { useLostPets } from '~/composables/useLostPets'

const route = useRoute()
const { fetchLostPets } = useLostPets()

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
  { label: '📅 Recientes', sortBy: 'recent' },
  { label: '💰 Recompensa', urgent: true },
  { label: '🐶 Perros', type: 'perro' },
  { label: '🐱 Gatos', type: 'gato' },
]

const applyQuickFilter = (filter) => {
  resetFilters()
  if (filter.type) filters.value.types = [filter.type]
  if (filter.urgent) filters.value.urgent = true
  if (filter.sortBy) sortBy.value = filter.sortBy
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

// Watch showFilters to prevent body scroll
watch(showFilters, (val) => {
  if (import.meta.client) {
    document.body.style.overflow = val && isMobile.value ? 'hidden' : ''
  }
})

const sortBy = ref('recent')
const currentPage = ref(1)
const itemsPerPage = 9

// For lost pets we keep only location options; other filters are not relevant to lost reports
const petTypes = [
  { label: 'Perro', value: 'perro' },
  { label: 'Gato', value: 'gato' },
  { label: 'Otro', value: 'otro' },
]
const ageRanges = []
const sizes = []
const genders = []
const locations = ['Maracaibo', 'San Francisco', 'Cabimas', 'Machiques', 'Lara', 'Falcon']

const allPets = ref([])
const isLoading = ref(false)

const filteredPets = computed(() => {
  let result = [...allPets.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (pet) =>
        (pet.name && pet.name.toLowerCase().includes(query)) ||
        (pet.description && pet.description.toLowerCase().includes(query)) ||
        (pet.location && pet.location.toLowerCase().includes(query)) ||
        (pet.contact && pet.contact.toLowerCase().includes(query))
    )
  }

  // Location filter
  if (filters.value.location) {
    result = result.filter((pet) => pet.location === filters.value.location)
  }

  // Type filter
  if (filters.value.types.length) {
    result = result.filter((pet) => filters.value.types.includes(pet.type))
  }

  // 'Urgente' checkbox maps to presence of reward in lost reports
  if (filters.value.urgent) {
    result = result.filter((pet) => pet.reward)
  }

  switch (sortBy.value) {
    case 'recent':
      result.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      break
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date))
      break
    case 'name_asc':
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      break
    case 'name_desc':
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
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
        (pet.name && pet.name.toLowerCase().includes(query)) ||
        (pet.description && pet.description.toLowerCase().includes(query)) ||
        (pet.location && pet.location.toLowerCase().includes(query))
    )
  }

  if (filters.value.location) {
    result = result.filter((pet) => pet.location === filters.value.location)
  }

  if (filters.value.urgent) {
    result = result.filter((pet) => pet.reward)
  }

  if (filters.value.types.length) {
    result = result.filter((pet) => filters.value.types.includes(pet.type))
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
    const petsData = await fetchLostPets()
    allPets.value = petsData
  } catch (err) {
    console.error('Error al cargar mascotas:', err)
  } finally {
    isLoading.value = false
  }
}

// SEO Meta Tags
const canonicalUrl = useCanonicalUrl('/perdidas')
const ogImage = useOgImage('/og.jpg')

useSeoMeta({
  title: 'Mascotas Perdidas | Adopta Zulia',
  description:
    'Ayuda a reunir mascotas perdidas con sus dueños en el estado Zulia. Reporta mascotas encontradas o busca a tu compañero perdido.',
  ogTitle: 'Mascotas Perdidas y Encontradas - Adopta Zulia',
  ogDescription:
    'Comunidad de apoyo para encontrar mascotas perdidas en Zulia. Publica reportes y ayuda a difundir.',
  ogImage,
  ogImageAlt: 'Mascotas perdidas en Zulia',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterTitle: 'Mascotas Perdidas - Adopta Zulia',
  twitterDescription: 'Ayuda a encontrar mascotas perdidas en el estado Zulia.',
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
        { name: 'Mascotas Perdidas', url: canonicalUrl },
      ])
    ),
  ],
})

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
