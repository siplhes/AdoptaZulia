<template>
  <section class="gradient from-bg-[#111] to-bg-amber-50 py-10 md:py-12">
    <div class="container mx-auto px-4">
      <div class="overflow-hidden rounded-2xl bg-emerald-700">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 md:p-10">
            <h2 class="mb-3 text-2xl font-bold text-white md:text-3xl">
              Tu donación puede salvar vidas
            </h2>
            <p class="mb-6 text-emerald-100">
              Ayúdanos a continuar nuestra misión de rescatar y encontrar hogares para mascotas
              abandonadas. Cada donación, por pequeña que sea, marca la diferencia.
            </p>
            <div class="mb-8 space-y-4">
              <div class="flex items-center">
                <div class="mr-4 rounded-full bg-emerald-600 p-2">
                  <Icon name="mdi:heart" class="h-6 w-6 text-white" />
                </div>
                <p class="text-white">Financiamos tratamientos veterinarios</p>
              </div>
              <div class="flex items-center">
                <div class="mr-4 rounded-full bg-emerald-600 p-2">
                  <Icon name="mdi:home" class="h-6 w-6 text-white" />
                </div>
                <p class="text-white">Mantenemos refugios temporales</p>
              </div>
              <div class="flex items-center">
                <div class="mr-4 rounded-full bg-emerald-600 p-2">
                  <Icon name="mdi:truck" class="h-6 w-6 text-white" />
                </div>
                <p class="text-white">Transportamos animales rescatados</p>
              </div>
            </div>
            <NuxtLink
              to="/donaciones"
              class="flex-inline mt-8 flex items-center justify-center rounded-lg bg-white p-4 text-lg font-semibold text-emerald-800 shadow"
            >
              <Icon name="mdi:heart" class="mr-2 h-6 w-6" />
              Dona ahora
            </NuxtLink>
          </div>
          <div class="relative hidden lg:block">
            <NuxtImg
              src="/img1.webp"
              alt="Perro rescatado"
              sizes="100em sm:50vw md:400px"
              :placeholder="[50, 25, 75, 5]"
              class="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No es necesario importar nada para usar el componente Icon de Nuxt
</script>
