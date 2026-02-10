<template>
  <section class="bg-gray-50 py-10 md:py-12">
    <div class="container mx-auto px-4">
      <div class="mb-8 text-center">
        <h2 class="mb-2 text-3xl font-bold text-emerald-900">Explora por categoría</h2>
        <p class="mx-auto max-w-2xl text-sm text-gray-600 md:text-base">
          Encuentra tu compañero ideal navegando por nuestras categorías principales
        </p>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"
        />
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="rounded-xl bg-red-50 py-8 text-center">
        <div
          class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500"
        >
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6" />
        </div>
        <p class="mb-3 font-medium text-red-700">{{ error }}</p>
        <button
          class="rounded-lg border border-red-200 bg-white px-4 py-2 text-red-700 shadow-sm transition-colors hover:bg-red-50"
          @click="loadCategories"
        >
          Intentar de nuevo
        </button>
      </div>

      <!-- Grid de categorías -->
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        <NuxtLink
          v-for="(category, index) in petCategories"
          :key="index"
          :to="category.link"
          class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="absolute right-0 top-0 transform p-4 opacity-10 transition-opacity duration-500 group-hover:scale-110 group-hover:opacity-20"
          >
            <Icon :name="category.icon" class="h-24 w-24 text-emerald-600" />
          </div>

          <div class="relative z-10 flex flex-col items-center text-center">
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white"
            >
              <Icon :name="category.icon" class="h-8 w-8" />
            </div>

            <h3
              class="mb-1 text-xl font-bold text-gray-900 transition-colors group-hover:text-emerald-700"
            >
              {{ category.name }}
            </h3>
            <div
              class="mt-2 inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-sm font-medium text-gray-500 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-700"
            >
              {{ category.count }} disponibles
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePets } from '~/composables/usePets'

const { fetchTotalPetsByCategory } = usePets()
const loading = ref(true)
const error = ref(null)

// Define las categorías de mascotas con conteo inicial de 0
const petCategories = ref([
  {
    name: 'Perros',
    type: 'perro',
    icon: 'mdi:dog',
    count: 0,
    link: '/mascotas?tipo=perro',
  },
  {
    name: 'Gatos',
    type: 'gato',
    icon: 'mdi:cat',
    count: 0,
    link: '/mascotas?tipo=gato',
  },
  {
    name: 'Conejos',
    type: 'conejo',
    icon: 'mdi:rabbit',
    count: 0,
    link: '/mascotas?tipo=conejo',
  },
  {
    name: 'Aves',
    type: 'ave',
    icon: 'mdi:bird',
    count: 0,
    link: '/mascotas?tipo=ave',
  },
])

// Función para cargar las categorías
const loadCategories = async () => {
  loading.value = true
  error.value = null

  try {
    // Usar Promise.all para cargar todas las categorías en paralelo
    const requests = petCategories.value.map(async (category) => {
      try {
        const pets = await fetchTotalPetsByCategory(category.type)
        return {
          type: category.type,
          count: pets ? pets.length : 0,
        }
      } catch (e) {
        console.error(`Error al cargar la categoría ${category.type}:`, e)
        return {
          type: category.type,
          count: 0,
        }
      }
    })

    const results = await Promise.all(requests)

    // Actualizar los contadores de cada categoría
    results.forEach((result) => {
      const category = petCategories.value.find((c) => c.type === result.type)
      if (category) {
        category.count = result.count
      }
    })
  } catch (err) {
    console.error('Error al cargar categorías de mascotas:', err)
    error.value = 'Error al cargar las categorías. Por favor, recarga la página.'
  } finally {
    loading.value = false
  }
}

// Cargar categorías al montar el componente
onMounted(async () => {
  await loadCategories()
})
</script>
