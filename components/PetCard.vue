<template>
  <div
    class="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
  >
    <div
      v-if="pet.urgent"
      class="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white"
    >
      URGENTE
    </div>
    <div class="relative h-48">
      <NuxtImg
        :src="pet.image || '/placeholder.png'"
        :alt="pet.name"
        class="h-full w-full object-cover"
        @error="onImageError"
        loading="lazy"
      />

      <button
        type="button"
        class="absolute left-2 top-2 rounded-full bg-white p-1 shadow-md transition-colors hover:bg-amber-50"
        :class="{ 'text-red-500': isFavorite, 'text-gray-400': !isFavorite }"
        @click.stop="toggleFavorite"
      >
        <HeartIcon class="h-5 w-5" />
      </button>
    </div>
    <div class="p-4">
      <div class="flex items-start justify-between">
        <h3 class="mb-1 text-lg font-semibold text-emerald-800">
          {{ pet.name }}
        </h3>
        <span
          :class="[
            'rounded-full px-2 py-1 text-xs font-medium',
            pet.gender === 'macho' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800',
          ]"
        >
          {{ pet.gender === 'macho' ? 'Macho' : 'Hembra' }}
        </span>
      </div>

      <p class="mb-3 text-sm text-gray-600">{{ pet.breed }}</p>

      <div class="mb-2 flex items-center gap-2 text-sm text-gray-500">
        <MapPinIcon class="h-4 w-4" />
        <span>{{ pet.location }}</span>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-500">
        <ClockIcon class="h-4 w-4" />
        <span>{{ formatAge(pet.age) }}</span>
      </div>

      <hr class="my-3 border-gray-100" >

      <div class="mb-3 flex flex-wrap gap-2">
        <span
          v-if="pet.vaccinated"
          class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
        >
          <CheckCircleIcon class="mr-1 h-3 w-3" />
          Vacunado
        </span>

        <span
          v-if="pet.neutered"
          class="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800"
        >
          <ScissorsIcon class="mr-1 h-3 w-3" />
          Esterilizado
        </span>

        <span
          class="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800"
        >
          <RulerIcon class="mr-1 h-3 w-3" />
          {{ formatSize(pet.size) }}
        </span>
      </div>

      <NuxtLink
        :to="`/pet/${pet.id}`"
        class="block w-full rounded-md bg-emerald-600 py-2 text-center text-white transition-colors hover:bg-emerald-700"
      >
        Ver más
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ScissorsIcon,
  RulerIcon,
} from 'lucide-vue-next'

// Props
const props = defineProps({
  pet: {
    type: Object(),
    required: true,
  },
})

// Estado para favoritos
const isFavorite = ref(false)

// Comprobar si la mascota está en favoritos al montar el componente
onMounted(() => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
  isFavorite.value = favorites.includes(props.pet.id)
})

// Alternar estado de favorito
const toggleFavorite = (event) => {
  event.stopPropagation() // Evitar navegación cuando se hace clic en el corazón
  isFavorite.value = !isFavorite.value

  // Guardar estado en localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
  if (isFavorite.value) {
    if (!favorites.includes(props.pet.id)) {
      favorites.push(props.pet.id)
    }
  } else {
    const index = favorites.indexOf(props.pet.id)
    if (index !== -1) {
      favorites.splice(index, 1)
    }
  }
  localStorage.setItem('favorites', JSON.stringify(favorites))
}

const onImageError = (event) => {
  event.target.src = '/placeholder.webp'
}

const formatAge = (age) => {
  return age || 'Edad desconocida'
}

const formatSize = (size) => {
  switch (size) {
    case 'pequeño':
      return 'Pequeño'
    case 'mediano':
      return 'Mediano'
    case 'grande':
      return 'Grande'
    default:
      return 'Desconocido'
  }
}
</script>
