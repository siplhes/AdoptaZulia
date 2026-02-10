<template>
  <section
    class="relative overflow-hidden bg-gradient-to-b from-emerald-600 to-emerald-700 py-12 lg:py-16"
  >
    <!-- Decorative Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
      </svg>
    </div>

    <div class="container relative mx-auto px-4">
      <!-- Header Section -->
      <div class="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div class="max-w-xl">
          <span
            class="mb-2 inline-block rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100 backdrop-blur-sm"
          >
            Destacados de la semana
          </span>
          <h2 class="text-3xl font-black leading-tight text-white md:text-4xl lg:text-5xl">
            Amigos buscando hogar
          </h2>
          <p class="mt-4 text-lg text-emerald-100">
            Estas mascotas han esperado mucho tiempo por una familia.
            <br class="hidden md:block" />
            ¡Podrías ser tú quien cambie su vida hoy!
          </p>
        </div>

        <NuxtLink
          to="/mascotas"
          class="group hidden items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white hover:text-emerald-700 md:flex"
        >
          Ver todos los peluditos
          <Icon
            name="heroicons:arrow-right"
            class="h-5 w-5 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex h-64 items-center justify-center rounded-3xl bg-white/5 backdrop-blur-sm"
      >
        <div class="flex flex-col items-center gap-4">
          <div
            class="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"
          />
          <p class="text-emerald-100">Buscando compañeros...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-3xl bg-white/5 p-8 text-center backdrop-blur-sm">
        <Icon name="heroicons:face-frown" class="mx-auto mb-4 h-16 w-16 text-emerald-200" />
        <h3 class="text-xl font-bold text-white">Oops, hubo un problema</h3>
        <p class="mt-2 text-emerald-100">{{ error }}</p>
        <button
          class="mt-6 rounded-xl bg-white px-6 py-2 font-bold text-emerald-700 shadow-lg transition-transform hover:scale-105"
          @click="loadFeaturedPets"
        >
          Intentar de nuevo
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="featuredPets.length === 0"
        class="rounded-3xl bg-white/5 p-8 text-center backdrop-blur-sm"
      >
        <Icon name="heroicons:home" class="mx-auto mb-4 h-16 w-16 text-emerald-200" />
        <h3 class="text-xl font-bold text-white">No hay destacados por ahora</h3>
        <p class="mt-2 text-emerald-100">Explora nuestra lista completa para ver a todos.</p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Mobile: Horizontal Scroll (Snaps) -->
        <!-- Desktop: Grid -->
        <div
          class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-8 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-4"
        >
          <div
            v-for="pet in featuredPets"
            :key="pet.id"
            class="min-w-[85vw] snap-center sm:min-w-[300px] md:min-w-0"
          >
            <PetCard
              :pet="pet"
              :is-favorite="isFavorite(pet.id)"
              @toggle-favorite="toggleFavorite"
              class="h-full transform transition-all duration-300 hover:md:-translate-y-2"
            />
          </div>
        </div>

        <!-- Mobile CTA (Visible only on small screens) -->
        <div class="mt-4 text-center md:hidden">
          <NuxtLink
            to="/mascotas"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-emerald-700 shadow-lg active:scale-95"
          >
            Ver todos los peluditos
            <Icon name="heroicons:arrow-right" class="h-5 w-5" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePets } from '~/composables/usePets'
import PetCard from '~/components/common/PetCard.vue'

const { fetchFeaturedPets } = usePets()
const featuredPets = ref([])
const loading = ref(true)
const error = ref(null)
const favorites = ref([])

const isFavorite = (petId) => favorites.value.includes(petId)

const toggleFavorite = (petId) => {
  try {
    const index = favorites.value.indexOf(petId)
    if (index === -1) {
      favorites.value.push(petId)
    } else {
      favorites.value.splice(index, 1)
    }
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  } catch (err) {
    console.error('Error managing favorites:', err)
  }
}

const loadFeaturedPets = async () => {
  loading.value = true
  error.value = null
  try {
    const featured = await fetchFeaturedPets(4)
    if (featured?.length > 0) {
      featuredPets.value = featured
    }
  } catch (err) {
    console.error('Error loading featured pets:', err)
    error.value = 'No pudimos cargar los destacados.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    favorites.value = savedFavorites
  } catch (err) {
    console.error('Error loading favorites:', err)
  }
  await loadFeaturedPets()
})
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
