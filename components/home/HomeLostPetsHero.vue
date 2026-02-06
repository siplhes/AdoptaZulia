<template>
  <section class="relative overflow-hidden bg-rose-50 py-6 md:py-8">
    <!-- Decorative Elements -->
    <div class="absolute -right-10 top-10 h-32 w-32 rounded-full bg-rose-200/50 blur-3xl" />
    <div class="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-orange-200/50 blur-3xl" />

    <div class="container mx-auto px-4">
      <div class="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-rose-100 md:flex">
        <!-- Text Content -->
        <div class="flex flex-col justify-center p-8 md:w-3/5 md:p-6 lg:p-8">
          <div class="mb-4 inline-flex items-center gap-2 self-start rounded-full bg-rose-100 px-4 py-1.5 text-sm font-bold text-rose-700">
            <Icon name="heroicons:exclamation-triangle-solid" class="h-4 w-4" />
            Acción Urgente
          </div>
          
          <h2 class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            ¿Has visto a estas mascotas?
          </h2>
          
          <p class="mb-8 text-lg text-gray-600">
            Están lejos de casa y sus familias las buscan desesperadamente. 
            Tu ayuda puede ser la clave para un reencuentro feliz.
          </p>
          
          <div class="flex flex-wrap gap-4">
            <NuxtLink 
              to="/perdidas" 
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 px-8 py-3.5 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Icon name="heroicons:eye-solid" class="h-5 w-5" />
              Ver Reportes
            </NuxtLink>
            
            <NuxtLink 
              to="/publicar?type=lost" 
              class="inline-flex items-center gap-2 rounded-xl border-2 border-rose-100 bg-white px-6 py-3.5 font-bold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <Icon name="heroicons:megaphone" class="h-5 w-5" />
              Reportar Mascota
            </NuxtLink>
          </div>
        </div>

        <!-- Visual / Image -->
        <div class="relative bg-rose-100 md:w-2/5">
          <NuxtImg
            src="/lostpet.png"
            alt="Mascota perdida mirando a la cámara"
            class="h-full w-full object-cover mix-blend-multiply"
            placeholder
            format="webp"
            fallback="/img/default-lost.jpg"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-rose-900/40 to-transparent md:bg-gradient-to-l" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// High impact component for lost pets visibility
</script>
