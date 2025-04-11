<template>
  <section class="pt-12 md:pt-16">
    <div class="py container mx-auto px-4">
      <h2 class="mb-12 text-center text-3xl font-bold text-emerald-800 md:text-4xl">
        ¿Qué tipo de mascota buscas?
      </h2>

      <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
        <a
          v-for="(category, index) in petCategories"
          :key="index"
          :href="category.link"
          class="group rounded-xl bg-emerald-600 p-6 text-center transition-transform hover:scale-105 hover:transform hover:bg-emerald-700"
        >
          <div
            class="group-hover:bg-amber-60 mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 shadow-md transition-colors"
          >
            <component :is="category.icon" class="h-12 w-12 text-emerald-600" />
          </div>
          <h3 class="mb-2 text-xl font-semibold text-[#FEFFFA]">
            {{ category.name }}
          </h3>
          <p class="text-gray-200">{{ category.count }} disponibles</p>
        </a>
      </div>
    </div>
    <!-- Wave divider -->
    <div class="">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="fill-emerald-600">
        <path
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,64L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
        />
      </svg>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { DogIcon, CatIcon, RabbitIcon, BirdIcon } from 'lucide-vue-next'
import { usePets } from '~/composables/usePets'

const { fetchTotalPetsByCategory } = usePets()

// Define las categorías de mascotas con conteo inicial de 0
const petCategories = ref([
  {
    name: 'Perros',
    type: 'perro',
    icon: DogIcon,
    count: 0,
    link: '/mascotas?tipo=perro',
  },
  {
    name: 'Gatos',
    type: 'gato',
    icon: CatIcon,
    count: 0,
    link: '/mascotas?tipo=gato',
  },
  {
    name: 'Conejos',
    type: 'conejo',
    icon: RabbitIcon,
    count: 0,
    link: '/mascotas?tipo=conejo',
  },
  {
    name: 'Aves',
    type: 'ave',
    icon: BirdIcon,
    count: 0,
    link: '/mascotas?tipo=ave',
  },
])

// Cargar contadores para cada categoría
onMounted(async () => {
  try {
    for (const category of petCategories.value) {
      const pets = await fetchTotalPetsByCategory(category.type)
      category.count = pets ? pets.length : 0
    }
  } catch (err) {
    console.error('Error al cargar categorías de mascotas:', err)
  }
})
</script>
