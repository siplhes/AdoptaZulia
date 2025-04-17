<template>
  <section class="bg-white py-12 md:py-16">
    <div class="container mx-auto px-4">
      <h2 class="mb-4 text-center text-3xl font-bold text-emerald-800 md:text-4xl">
        ¿Cómo funciona?
      </h2>
      <p class="mx-auto mb-12 max-w-3xl text-center text-gray-600">
        Adoptar una mascota es un proceso sencillo y gratificante. Sigue estos pasos para encontrar
        tu compañero perfecto.
      </p>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div v-for="(step, index) in howItWorks" :key="index" class="text-center">
          <div class="relative">
            <div
              class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-600"
            >
              <Icon :name="step.icon" class="h-12 w-12 text-amber-50" />
            </div>
            <div
              v-if="index < howItWorks.length - 1"
              class="absolute left-full top-12 -z-10 hidden h-0.5 w-full -translate-x-1/2 transform bg-emerald-200 md:block"
            />
          </div>
          <h3 class="mb-3 text-xl font-semibold text-emerald-800">
            {{ step.title }}
          </h3>
          <p class="text-gray-600">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// How it works steps
const howItWorks = [
  {
    icon: 'mdi:magnify',
    title: 'Busca',
    description:
      'Explora nuestra base de datos de mascotas disponibles para adopción y filtra según tus preferencias.',
  },
  {
    icon: 'mdi:heart',
    title: 'Conecta',
    description:
      'Contacta con el refugio o propietario y programa una visita para conocer a tu posible mascota.',
  },
  {
    icon: 'mdi:home',
    title: 'Adopta',
    description:
      'Completa el proceso de adopción y dale a una mascota un hogar lleno de amor para siempre.',
  },
]
</script>
