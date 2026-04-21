<template>
  <section class="relative overflow-hidden bg-white py-24 md:py-32">
    <!-- Decorative background elements -->
    <div
      class="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-50/50 blur-3xl"
    ></div>
    <div
      class="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-amber-50/50 blur-3xl"
    ></div>

    <div class="container relative mx-auto px-4">
      <!-- Section Header -->
      <div class="mb-20 text-center">
        <span
          class="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold tracking-wide text-emerald-700"
        >
          PROCESO DE ADOPCIÓN
        </span>
        <h2 class="mb-6 text-4xl font-bold tracking-tight text-emerald-950 md:text-5xl">
          ¿Cómo funciona?
        </h2>
        <p class="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
          Encontrar a tu nuevo mejor amigo es un viaje emocionante. Te acompañamos en cada paso con
          un proceso simple y transparente.
        </p>
      </div>

      <!-- Steps Grid -->
      <div class="relative mx-auto max-w-6xl">
        <!-- Connecting SVG Path (Desktop) -->
        <svg
          class="absolute left-0 top-24 hidden w-full md:block"
          height="120"
          viewBox="0 0 1000 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M150 60 C 300 60, 400 10, 500 10 C 600 10, 700 110, 850 110"
            stroke="url(#gradient-path)"
            stroke-width="3"
            stroke-dasharray="8 8"
            class="path-animation"
          />
          <defs>
            <linearGradient id="gradient-path" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="50%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        <div class="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          <div
            v-for="(step, index) in howItWorks"
            :key="index"
            class="group relative flex flex-col items-center"
            :class="{
              'md:mt-0': index === 0,
              'md:-mt-12': index === 1,
              'md:mt-12': index === 2,
            }"
          >
            <!-- Step Number Indicator -->
            <div
              class="absolute -top-4 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white text-lg font-black text-emerald-600 shadow-lg ring-4 ring-emerald-50 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white"
            >
              {{ index + 1 }}
            </div>

            <!-- Icon Container -->
            <div class="relative mb-8">
              <div
                class="flex h-32 w-32 items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-gray-100 transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:shadow-2xl"
              >
                <!-- Decorative background for icon -->
                <div
                  class="absolute inset-4 rounded-2xl opacity-10 transition-colors duration-300"
                  :class="step.bgColor"
                ></div>

                <Icon
                  :name="step.icon"
                  class="relative z-10 h-14 w-14 transition-transform duration-500 group-hover:scale-110"
                  :class="step.iconColor"
                />
              </div>

              <!-- Floating particles (animated with CSS) -->
              <div
                class="absolute -right-2 -top-2 h-4 w-4 animate-bounce rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                :class="step.dotColor"
                style="animation-delay: 0.1s"
              ></div>
              <div
                class="absolute -bottom-2 -left-2 h-3 w-3 animate-ping rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                :class="step.dotColor"
                style="animation-delay: 0.3s"
              ></div>
            </div>

            <!-- Content -->
            <div class="text-center">
              <h3
                class="mb-4 text-2xl font-bold text-emerald-950 transition-colors group-hover:text-emerald-600"
              >
                {{ step.title }}
              </h3>
              <p class="max-w-xs text-lg leading-relaxed text-gray-600">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA or extra info -->
      <div class="mt-20 flex justify-center">
        <NuxtLink
          to="/mascotas"
          class="group flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:bg-emerald-700 hover:shadow-emerald-200"
        >
          Comienza tu búsqueda
          <Icon
            name="heroicons:arrow-right"
            class="h-5 w-5 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const howItWorks = [
  {
    icon: 'lucide:search',
    title: 'Explora y Filtra',
    description:
      'Usa nuestros filtros inteligentes para encontrar la mascota que mejor se adapte a tu estilo de vida.',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-400',
  },
  {
    icon: 'lucide:heart-handshake',
    title: 'Conoce y Conecta',
    description:
      'Agenda una cita para conocer a tu prospecto y asegúrate de que haya una conexión real.',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-500',
    dotColor: 'bg-amber-400',
  },
  {
    icon: 'lucide:party-popper',
    title: '¡Bienvenido a Casa!',
    description:
      'Completa el proceso de adopción y empieza una nueva vida llena de amor incondicional.',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-400',
  },
]
</script>

<style scoped>
.path-animation {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 3s ease-in-out forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Custom staggered animation for steps */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

.grid > div:nth-child(1) {
  animation-delay: 0.2s;
}
.grid > div:nth-child(2) {
  animation-delay: 0.4s;
}
.grid > div:nth-child(3) {
  animation-delay: 0.6s;
}
</style>

