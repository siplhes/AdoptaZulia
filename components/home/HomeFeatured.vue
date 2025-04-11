<template>
  <section class="bg-emerald-600 py-12 md:py-16">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 class="mb-4 text-3xl font-bold text-[#FEFFFA] md:mb-0 md:text-4xl">
          Mascotas en Adopción destacadas
        </h2>
        <a
          href="/mascotas"
          class="flex items-center font-medium text-amber-200 transition-colors hover:text-amber-300"
        >
          Ver todas las mascotas
          <ArrowRightIcon class="ml-1 h-5 w-5" />
        </a>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(pet, index) in featuredPets"
          :key="index"
          class="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
        >
          <div class="relative">
            <img :src="pet.image" :alt="pet.name" class="h-64 w-full object-cover" />
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

            <p class="mb-4 text-gray-600">{{ pet.breed }} • {{ pet.age }} • {{ pet.location }}</p>

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
              Conoce más a {{ pet.name }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ArrowRightIcon,
  AlertCircleIcon,
  HeartIcon,
  CheckCircleIcon,
  RulerIcon,
} from 'lucide-vue-next'
import { usePets } from '~/composables/usePets'

const { fetchFeaturedPets } = usePets()
const featuredPets = ref([])

// Toggle favorite
const toggleFavorite = (petId) => {
  // Implementación real requeriría estado y posiblemente una API
  console.log(`Toggled favorite for pet ${petId}`)
}

// Cargar mascotas destacadas
onMounted(async () => {
  try {
    const featured = await fetchFeaturedPets(3)
    featuredPets.value = featured
  } catch (err) {
    console.error('Error al cargar mascotas destacadas:', err)
  }
})
</script>
