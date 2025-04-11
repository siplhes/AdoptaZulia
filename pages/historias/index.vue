<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 text-center">
        <h1 class="mb-3 text-3xl font-bold text-emerald-800 md:text-4xl">Historias de Adopción</h1>
        <p class="mx-auto max-w-3xl text-lg text-gray-600">
          Descubre las emotivas historias de mascotas que han encontrado un hogar amoroso gracias a
          nuestra comunidad.
        </p>
      </div>

      <!-- Botón para crear historia -->
      <div v-if="isAuthenticated" class="mb-8 text-center">
        <NuxtLink
          to="/historias/crear"
          class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          <Icon name="heroicons:plus" class="mr-2" size="20px" />
          Compartir tu historia
        </NuxtLink>
      </div>

      <!-- Filtros -->
      <div class="mb-8 flex flex-wrap justify-center gap-4">
        <button
          @click="activeFilter = 'all'"
          class="rounded-full px-4 py-2 text-sm font-medium"
          :class="
            activeFilter === 'all'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          "
        >
          Todas las historias
        </button>
        <button
          @click="activeFilter = 'featured'"
          class="rounded-full px-4 py-2 text-sm font-medium"
          :class="
            activeFilter === 'featured'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          "
        >
          Destacadas
        </button>
        <button
          v-if="isAuthenticated"
          @click="activeFilter = 'mine'"
          class="rounded-full px-4 py-2 text-sm font-medium"
          :class="
            activeFilter === 'mine'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          "
        >
          Mis historias
        </button>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        ></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-8 text-center text-red-600">
        {{ error }}
      </div>

      <!-- Sin historias -->
      <div v-else-if="displayedStories.length === 0" class="py-12 text-center">
        <div class="mb-4">
          <Icon name="heroicons:document-text" class="mx-auto h-16 w-16 text-gray-400" />
        </div>
        <h3 class="mb-2 text-lg font-medium text-gray-900">No hay historias disponibles</h3>
        <p class="mb-6 text-gray-500">
          {{
            activeFilter === 'mine'
              ? '¡Comparte tu experiencia de adopción y sé el primero en contar tu historia!'
              : 'Próximamente compartiremos historias inspiradoras de adopciones.'
          }}
        </p>
        <NuxtLink
          v-if="isAuthenticated && activeFilter === 'mine'"
          to="/historias/crear"
          class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          <Icon name="heroicons:plus" class="mr-2" size="20px" />
          Compartir tu historia
        </NuxtLink>
      </div>

      <!-- Lista de historias -->
      <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AdoptionStoryCard v-for="story in displayedStories" :key="story.id" :story="story" />
      </div>

      <!-- Paginación -->
      <div v-if="displayedStories.length > 0" class="mt-12 flex justify-center">
        <div class="flex space-x-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="heroicons:chevron-left" size="20px" />
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            class="rounded-md border px-4 py-2"
            :class="
              currentPage === page
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 bg-white text-gray-700'
            "
          >
            {{ page }}
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="heroicons:chevron-right" size="20px" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdoptionStories } from '~/composables/useAdoptionStories'
import { useAuth } from '~/composables/useAuth'

// Composables
const {
  stories,
  featuredStories,
  loading,
  error,
  fetchAllStories,
  fetchFeaturedStories,
  fetchUserStories,
} = useAdoptionStories()
const { user, isAuthenticated } = useAuth()

// Estado local
const activeFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 9

// Función para cargar historias según el filtro activo
const loadStories = async () => {
  currentPage.value = 1

  if (activeFilter.value === 'all') {
    await fetchAllStories()
  } else if (activeFilter.value === 'featured') {
    await fetchFeaturedStories(100) // Cargar un número alto para tener todas
  } else if (activeFilter.value === 'mine' && user.value) {
    await fetchUserStories(user.value.uid)
  }
}

// Historias a mostrar según filtro y paginación
const filteredStories = computed(() => {
  if (activeFilter.value === 'all') {
    return stories.value
  } else if (activeFilter.value === 'featured') {
    return featuredStories.value
  } else if (activeFilter.value === 'mine' && user.value) {
    return stories.value.filter((story) => story.userId === user.value.uid)
  }
  return []
})

// Historias paginadas
const displayedStories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredStories.value.slice(start, end)
})

// Total de páginas
const totalPages = computed(() => {
  return Math.ceil(filteredStories.value.length / itemsPerPage)
})

// Observar cambios en el filtro activo
watch(activeFilter, () => {
  loadStories()
})

// Cargar historias al montar el componente
onMounted(() => {
  loadStories()
})
</script>
