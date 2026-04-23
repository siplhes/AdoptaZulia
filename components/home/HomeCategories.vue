<template>
  <section class="relative bg-gray-50 py-10 md:py-12 overflow-hidden">
    <!-- SVG Pattern Decoration -->
    <div class="absolute inset-0 z-0 opacity-10 mix-blend-multiply pointer-events-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><defs><pattern id="a" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#fefffa"/><path fill="#a1d9c0" d="M0 0v40h6.304c.321-.385.594-.74.804-1.062.379-.581.602-1.083.737-1.549.136-.466.184-.896.138-1.403a4.3 4.3 0 0 0-.472-1.635 4.1 4.1 0 0 0-1.225-1.398 3.85 3.85 0 0 0-1.646-.646 4.25 4.25 0 0 0-1.824.095 4.3 4.3 0 0 0-1.69.936Q.95 33.5.8 33.675V5.18a54 54 0 0 0 1.832-1.532 48 48 0 0 0 2.775-2.643C5.76.636 6.044.31 6.304 0zm33.696 0c.26.31.545.636.896 1.004a48 48 0 0 0 2.776 2.643A54 54 0 0 0 39.2 5.179v28.496a4 4 0 0 0-.326-.337 4.3 4.3 0 0 0-1.69-.936 4 4 0 0 0-1.15-.151 5 5 0 0 0-.674.056 3.85 3.85 0 0 0-1.646.646 4.1 4.1 0 0 0-1.225 1.398 4.4 4.4 0 0 0-.472 1.635c-.045.507 0 .937.138 1.403.135.466.359.967.737 1.548.21.322.483.678.804 1.063H40V0z"/><path fill="#e0e5e4" d="M19.2 0v13.675a4 4 0 0 0-.326-.337 4.3 4.3 0 0 0-1.69-.935 4 4 0 0 0-1.15-.152 5 5 0 0 0-.674.056 3.85 3.85 0 0 0-1.646.646 4.1 4.1 0 0 0-1.225 1.398 4.4 4.4 0 0 0-.472 1.635c-.045.507 0 .937.138 1.403.135.466.359.967.737 1.548s.912 1.243 1.7 2.067a48 48 0 0 0 2.776 2.643 54 54 0 0 0 1.832 1.532v14.82h1.6V25.18a54 54 0 0 0 1.832-1.532 48 48 0 0 0 2.776-2.643c.788-.824 1.322-1.485 1.7-2.067.379-.58.602-1.082.737-1.548.136-.466.184-.896.138-1.403a4.3 4.3 0 0 0-.472-1.635 4.1 4.1 0 0 0-1.225-1.398 3.85 3.85 0 0 0-1.646-.646 4.25 4.25 0 0 0-1.824.095 4.3 4.3 0 0 0-1.69.936q-.175.161-.326.337V0z"/></pattern></defs><rect width="100%" height="100%" fill="url(#a)"/></svg>
    </div>
    <div class="container relative mx-auto px-4 z-10">
      <div class="mb-8 text-center">
        <h2 class="mb-2 text-3xl font-bold text-emerald-900">Explora por <span class="text-black font-extrabold bg-yellow-400 text-4xl">categoría</span></h2>
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
          class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
        >
          <!-- Background Image on Hover -->
          <div
            class="absolute inset-0 z-0 opacity-0 transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-100"
            :style="{
              backgroundImage: `url(${category.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }"
          >
            <!-- Overlay to ensure readability and maintain brand color -->
            <div class="absolute inset-0 bg-emerald-600/80 mix-blend-multiply"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-600/40 to-transparent"></div>
          </div>
          <div
            class="absolute right-0 top-0 transform p-4 opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:opacity-30 z-10"
          >
            <Icon
              :name="category.icon"
              class="h-24 w-24 text-emerald-600 group-hover:text-white"
            />
          </div>

          <div class="relative z-10 flex flex-col items-center text-center">
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm transition-colors duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-600"
            >
              <Icon
                :name="category.icon"
                class="h-8 w-8 transition-all duration-300 group-hover:scale-130"
              />
            </div>

            <h3
              class="mb-1 text-xl font-bold text-gray-900 transition-colors group-hover:text-white"
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
    image: '/categories/cat1.webp'
  },
  {
    name: 'Gatos',
    type: 'gato',
    icon: 'mdi:cat',
    count: 0,
    link: '/mascotas?tipo=gato',
    image: '/categories/cat2.webp'
  },
  {
    name: 'Conejos',
    type: 'conejo',
    icon: 'mdi:rabbit',
    count: 0,
    link: '/mascotas?tipo=conejo',
    image: '/categories/cat3.webp'
  },
  {
    name: 'Aves',
    type: 'ave',
    icon: 'mdi:bird',
    count: 0,
    link: '/mascotas?tipo=ave',
    image: '/categories/cat4.webp'
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
