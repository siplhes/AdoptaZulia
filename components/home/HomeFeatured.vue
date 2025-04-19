<template>
  <section class="bg-emerald-600 py-12 md:py-16">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 class="mb-4 text-3xl font-bold text-[#FEFFFA] md:mb-0 md:text-4xl">
          Mascotas en Adopción destacadas
        </h2>
        <NuxtLink
          to="/mascotas"
          class="flex items-center font-medium text-amber-200 transition-colors hover:text-amber-300"
        >
          Ver todas las mascotas
          <Icon name="mdi:arrow-right" class="ml-1 h-5 w-5" />
        </NuxtLink>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center py-16">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-100 border-r-transparent align-[-0.125em]"
        />
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="py-12 text-center">
        <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
          <Icon name="mdi:alert-circle" class="h-12 w-12 text-amber-500" />
        </div>
        <h3 class="mb-2 text-xl font-semibold text-amber-100">{{ error }}</h3>
        <button 
          class="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          @click="loadFeaturedPets"
        >
          Intentar de nuevo
        </button>
      </div>

      <!-- Sin mascotas destacadas -->
      <div v-else-if="featuredPets.length === 0" class="py-12 text-center">
        <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
          <Icon name="mdi:alert-circle" class="h-12 w-12 text-amber-500" />
        </div>
        <h3 class="mb-2 text-xl font-semibold text-amber-100">No hay mascotas destacadas disponibles</h3>
        <p class="text-amber-100">Intenta más tarde o explora todas nuestras mascotas en adopción</p>
      </div>

      <!-- Grid de mascotas usando PetCard -->
      <div v-else class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        <PetCard
          v-for="pet in featuredPets"
          :key="pet.id"
          :pet="pet"
          :is-favorite="isFavorite(pet.id)"
          @toggle-favorite="toggleFavorite"
        />
      </div>
      <NuxtLink
        to="/mascotas"
        class="mt-8 flex items-center w-1/4 mx-auto justify-center rounded-lg bg-[#fefffa] px-4 py-2 text-emerald-600 transition-all hover:text-emerald-700 hover:scale-110"
      >
        Ver todas las mascotas
        <Icon name="mdi:arrow-right" class="ml-1 h-5 w-5" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePets } from '~/composables/usePets'

const { fetchFeaturedPets } = usePets()
const featuredPets = ref([])
const loading = ref(true)
const error = ref(null)
const favorites = ref([])

// Verificar si una mascota está en favoritos
const isFavorite = (petId) => {
  return favorites.value.includes(petId)
}

// Toggle favorite
const toggleFavorite = (petId) => {
  // Obtener favoritos actuales del localStorage
  try {
    const index = favorites.value.indexOf(petId)
    
    // Toggle favorito
    if (index === -1) {
      favorites.value.push(petId)
    } else {
      favorites.value.splice(index, 1)
    }
    
    // Guardar de vuelta en localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  } catch (err) {
    console.error('Error al manejar favoritos:', err)
  }
}

// Función para cargar mascotas destacadas
const loadFeaturedPets = async () => {
  loading.value = true
  error.value = null
  
  try {
    const featured = await fetchFeaturedPets(4)
    
    if (featured && featured.length > 0) {
      featuredPets.value = featured
    } else {
      console.warn('No se encontraron mascotas destacadas')
    }
  } catch (err) {
    console.error('Error al cargar mascotas destacadas:', err)
    error.value = 'Error al cargar mascotas destacadas'
  } finally {
    loading.value = false
  }
}

// Cargar mascotas destacadas al montar el componente
onMounted(async () => {
  // Cargar favoritos desde localStorage
  try {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    favorites.value = savedFavorites
  } catch (err) {
    console.error('Error al cargar favoritos:', err)
  }
  
  await loadFeaturedPets()
})
</script>