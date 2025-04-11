<template>
  <section class="gradient from-bg-[#111] to-bg-amber-50 py-12 md:py-16">
    <div class="container mx-auto px-4">
      <div class="overflow-hidden rounded-2xl bg-emerald-700">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-8 md:p-12">
            <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">
              Tu donación puede salvar vidas
            </h2>
            <p class="mb-6 text-emerald-100">
              Ayúdanos a continuar nuestra misión de rescatar y encontrar hogares para mascotas
              abandonadas. Cada donación, por pequeña que sea, marca la diferencia.
            </p>
            <div class="mb-8 space-y-4">
              <div class="flex items-center">
                <div class="mr-4 rounded-full bg-emerald-600 p-2">
                  <HeartIcon class="h-6 w-6 text-white" />
                </div>
                <p class="text-white">Financiamos tratamientos veterinarios</p>
              </div>
              <div class="flex items-center">
                <div class="mr-4 rounded-full bg-emerald-600 p-2">
                  <HomeIcon class="h-6 w-6 text-white" />
                </div>
                <p class="text-white">Mantenemos refugios temporales</p>
              </div>
              <div class="flex items-center">
                <div class="mr-4 rounded-full bg-emerald-600 p-2">
                  <TruckIcon class="h-6 w-6 text-white" />
                </div>
                <p class="text-white">Transportamos animales rescatados</p>
              </div>
            </div>
            <a
              href="/donaciones"
              class="inline-block rounded-lg bg-white px-6 py-3 text-lg font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Hacer una donación
            </a>
          </div>
          <div class="relative hidden lg:block">
            <img src="/img1.webp" alt="Perro rescatado" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { HeartIcon, HomeIcon, TruckIcon } from 'lucide-vue-next'
</script>
