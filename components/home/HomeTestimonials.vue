<template>
  <section class="bg-gradient-to-br from-emerald-500 to-emerald-700 py-16 md:py-24">
    <div class="container mx-auto px-4">
      <div class="mb-12 text-center text-white">
        <h2 class="mb-4 text-3xl font-bold md:text-4xl">Historias que inspiran</h2>
        <p class="mx-auto max-w-2xl text-lg text-emerald-100">
          Nada nos hace más felices que ver finales felices. Estas son algunas de las familias que
          crecieron gracias a la adopción.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="group relative rounded-2xl bg-white p-8 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
        >
          <!-- Quote Icon -->
          <div
            class="absolute -top-4 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-white shadow-lg"
          >
            <Icon name="mdi:format-quote-close" class="h-6 w-6" />
          </div>

          <!-- User Info -->
          <div class="mb-6 flex items-center gap-4">
            <div class="relative">
              <NuxtImg
                :src="testimonial.image"
                :alt="testimonial.name"
                class="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-100"
                placeholder
              />
              <div class="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white">
                <Icon name="heroicons:check-badge-solid" class="h-3 w-3" />
              </div>
            </div>
            <div>
              <h4 class="font-bold text-gray-900">{{ testimonial.name }}</h4>
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
                {{ testimonial.location }}
              </p>
            </div>
          </div>

          <!-- Stars -->
          <div class="mb-4 flex text-amber-400">
            <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="h-5 w-5" />
          </div>

          <!-- Quote -->
          <blockquote class="mb-6 leading-relaxed text-gray-600">
            "{{ testimonial.quote }}"
          </blockquote>

          <!-- Pet Info Footer -->
          <div class="mt-auto border-t border-gray-100 pt-4">
            <div class="flex items-center gap-3">
              <NuxtImg
                :src="testimonial.petImage"
                :alt="testimonial.petName"
                class="h-10 w-10 rounded-full object-cover grayscale transition-all group-hover:grayscale-0"
              />
              <div>
                <p class="text-xs text-gray-500">Adoptó a</p>
                <p class="font-bold text-emerald-600">{{ testimonial.petName }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePets } from '~/composables/usePets'

const { fetchAdoptionStories } = usePets()
const testimonials = ref([])

onMounted(async () => {
  try {
    const stories = await fetchAdoptionStories(3)
    if (stories && stories.length > 0) {
      testimonials.value = stories
    } else {
      // Fallback mocks if no stories exist yet
      testimonials.value = [
        {
          name: 'María González',
          location: 'Maracaibo',
          image: 'https://ui-avatars.com/api/?name=Maria+G&background=random',
          quote:
            'Luna cambió nuestra vida. El proceso de adopción fue súper sencillo y transparente. ¡Gracias por unirnos!',
          petName: 'Luna',
          petImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
        },
        {
          name: 'Carlos Pérez',
          location: 'San Francisco',
          image: 'https://ui-avatars.com/api/?name=Carlos+P&background=random',
          quote:
            'Nunca pensé que adoptaría, pero ver a Rocky buscando hogar me rompió el corazón. Es el mejor compañero.',
          petName: 'Rocky',
          petImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e',
        },
        {
          name: 'Ana Rodríguez',
          location: 'Cabimas',
          image: 'https://ui-avatars.com/api/?name=Ana+R&background=random',
          quote:
            'Adoptar a Mishi fue la mejor decisión. El equipo de Adopta Zulia me ayudó en todo momento.',
          petName: 'Mishi',
          petImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006',
        },
      ]
    }
  } catch (err) {
    console.error(err)
  }
})
</script>
