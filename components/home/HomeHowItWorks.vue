<template>
  <section class="bg-white py-16 md:py-24">
    <div class="container mx-auto px-4">
      <div class="mb-16 text-center">
        <h2 class="mb-4 text-3xl font-bold text-emerald-900 md:text-4xl">¿Cómo funciona?</h2>
        <p class="mx-auto max-w-2xl text-lg text-gray-600">
          Encontrar a tu nuevo mejor amigo es más fácil de lo que crees. Te acompañamos en cada paso
          del camino.
        </p>
      </div>

      <div class="relative grid grid-cols-1 gap-12 md:grid-cols-3">
        <!-- Connecting Line (Desktop only) -->
        <div
          class="absolute left-0 top-12 hidden h-1 w-full -translate-y-1/2 bg-emerald-100 md:block"
        />

        <div
          v-for="(step, index) in howItWorks"
          :key="index"
          class="group relative flex flex-col items-center text-center"
        >
          <!-- Step Number Badge -->
          <div
            class="absolute -top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-sm font-bold text-white shadow-sm"
          >
            {{ index + 1 }}
          </div>

          <!-- Icon Circle -->
          <div
            class="relative z-0 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 shadow-inner transition-transform duration-300 group-hover:scale-110"
          >
            <div
              class="animate-pulse-slow absolute inset-0 rounded-full bg-amber-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <Icon :name="step.icon" class="relative z-10 h-10 w-10 text-amber-600" />
          </div>

          <h3
            class="mb-3 text-xl font-bold text-emerald-900 transition-colors group-hover:text-amber-600"
          >
            {{ step.title }}
          </h3>

          <p class="max-w-xs leading-relaxed text-gray-600">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const howItWorks = [
  {
    icon: 'heroicons:magnifying-glass',
    title: 'Explora',
    description:
      'Navega entre cientos de mascotas que esperan una segunda oportunidad cerca de ti.',
  },
  {
    icon: 'heroicons:heart',
    title: 'Conecta',
    description: 'Contacta directamente con el refugio o dueño actual para conocer los detalles.',
  },
  {
    icon: 'heroicons:home',
    title: 'Adopta',
    description: 'Formaliza la adopción y lleva a casa amor incondicional para toda la vida.',
  },
]
</script>

<style scoped>
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
