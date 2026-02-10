<template>
  <section class="bg-emerald-600 pt-10 md:pt-12">
    <div class="container mx-auto px-4 py-4">
      <div class="mb-8 pt-4 text-center">
        <h2 class="mb-2 text-2xl font-bold text-[#FEFFFA] md:text-3xl">Historias de adopción</h2>
        <p class="mx-auto max-w-2xl text-base text-emerald-50">
          Conoce las inspiradoras historias de mascotas que encontraron un hogar gracias a nuestra
          comunidad.
        </p>
      </div>

      <!-- Cargando -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-8 text-center text-red-600">
        {{ error }}
      </div>

      <!-- Sin historias -->
      <div v-else-if="!featuredStories.length" class="py-8 text-center">
        <p class="text-gray-100">Próximamente compartiremos historias de adopción exitosas.</p>
      </div>

      <!-- Lista de historias -->
      <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AdoptionStoryCard v-for="story in featuredStories" :key="story.id" :story="story" />
      </div>

      <!-- Enlace para ver todas las historias -->
      <div class="mt-10 text-center">
        <NuxtLink
          to="/historias"
          class="inline-flex items-center rounded-md border border-transparent bg-amber-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-amber-700"
        >
          Ver todas las historias
          <Icon name="heroicons:arrow-long-right" class="ml-2" size="20px" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdoptionStories } from '~/composables/useAdoptionStories'

const { featuredStories, loading, error, fetchFeaturedStories } = useAdoptionStories()

onMounted(async () => {
  await fetchFeaturedStories(3) // Cargar 3 historias destacadas
})
</script>
