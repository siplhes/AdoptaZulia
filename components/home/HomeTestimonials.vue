<template>
  <section class="bg-emerald-600 py-12 md:py-16">
    <div class="container mx-auto px-4">
      <h2 class="mb-12 text-center text-3xl font-bold text-[#FEFFFA] md:text-4xl">
        Historias de adopción
      </h2>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="rounded-lg bg-white p-6 shadow-md"
        >
          <div class="mb-4 flex items-center">
            <NuxtImg
              :src="testimonial.image"
              :alt="testimonial.name"
              class="mr-4 h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h4 class="text-lg font-semibold text-emerald-800">
                {{ testimonial.name }}
              </h4>
              <p class="text-gray-600">{{ testimonial.location }}</p>
            </div>
          </div>
          <div class="mb-4">
            <div class="mb-2 flex text-amber-400">
              <StarIcon v-for="i in 5" :key="i" class="h-5 w-5" />
            </div>
            <p class="italic text-gray-700">{{ testimonial.quote }}</p>
          </div>
          <div class="flex items-center">
            <NuxtImg
              :src="testimonial.petImage"
              :alt="testimonial.petName"
              class="mr-3 h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p class="text-sm text-gray-600">Adoptó a</p>
              <p class="font-medium text-emerald-700">
                {{ testimonial.petName }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { StarIcon } from 'lucide-vue-next'
import { usePets } from '~/composables/usePets'

const { fetchAdoptionStories } = usePets()
const testimonials = ref([])

// Cargar historias de adopción
onMounted(async () => {
  try {
    const stories = await fetchAdoptionStories(3)
    testimonials.value = stories
  } catch (err) {
    console.error('Error al cargar historias de adopción:', err)
  }
})
</script>
