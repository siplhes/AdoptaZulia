<template>
  <section class="pt-1 md:pt-2">
    <div class="container mx-auto px-4">
      <h2 class="mb-6 text-center text-3xl font-bold text-emerald-800 md:text-4xl">
        ¿Qué tipo de mascota buscas?
      </h2>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        />
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="py-8 text-center">
        <p class="text-red-500">{{ error }}</p>
        <button
          class="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          @click="loadCategories"
        >
          Intentar de nuevo
        </button>
      </div>

      <!-- Grid de categorías -->
      <div v-else class="grid grid-cols-2 gap-6 md:grid-cols-4">
        <a
          v-for="(category, index) in petCategories"
          :key="index"
          :href="category.link"
          class="group flex flex-inline-block rounded-xl bg-emerald-600 p-3 transition-transform hover:scale-105 hover:transform hover:bg-emerald-700"
        >
          <div
            class="group-hover:bg-amber-60 mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 shadow-md transition-colors"
          >
            <Icon :name="category.icon" class="h-12 w-12 text-emerald-600" />
          </div>
          <div class="flex flex-col mx-auto items-center justify-center">
            <h3 class="mb-2 text-xl font-semibold text-[#FEFFFA]">
              {{ category.name }}
            </h3>
            <p class="text-gray-200">{{ category.count }} disponibles</p>
          </div>
        </a>
      </div>
    </div>

    <!-- Wave divider -->
    <div class="">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 120"
        class="fill-emerald-600"
      >
        <path
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
        />
      </svg>
    </div>
  </section>
</template>

<script setup>
const { fetchTotalPetsByCategory } = usePets();
const loading = ref(true);
const error = ref(null);

// Define las categorías de mascotas con conteo inicial de 0
const petCategories = ref([
  {
    name: "Perros",
    type: "perro",
    icon: "mdi:dog",
    count: 0,
    link: "/mascotas?tipo=perro",
  },
  {
    name: "Gatos",
    type: "gato",
    icon: "mdi:cat",
    count: 0,
    link: "/mascotas?tipo=gato",
  },
  {
    name: "Conejos",
    type: "conejo",
    icon: "mdi:rabbit",
    count: 0,
    link: "/mascotas?tipo=conejo",
  },
  {
    name: "Aves",
    type: "ave",
    icon: "mdi:bird",
    count: 0,
    link: "/mascotas?tipo=ave",
  },
]);

// Función para cargar las categorías
const loadCategories = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Usar Promise.all para cargar todas las categorías en paralelo
    const requests = petCategories.value.map(async (category) => {
      try {
        const pets = await fetchTotalPetsByCategory(category.type);
        return {
          type: category.type,
          count: pets ? pets.length : 0,
        };
      } catch (e) {
        console.error(`Error al cargar la categoría ${category.type}:`, e);
        return {
          type: category.type,
          count: 0,
        };
      }
    });

    const results = await Promise.all(requests);

    // Actualizar los contadores de cada categoría
    results.forEach((result) => {
      const category = petCategories.value.find((c) => c.type === result.type);
      if (category) {
        category.count = result.count;
      }
    });
  } catch (err) {
    console.error("Error al cargar categorías de mascotas:", err);
    error.value = "Error al cargar las categorías. Por favor, recarga la página.";
  } finally {
    loading.value = false;
  }
};

// Cargar categorías al montar el componente
onMounted(async () => {
  await loadCategories();
});
</script>
