<template>
  <section class="bg-red-50 py-12">
    <div class="container mx-auto px-4">
      <div class="rounded-lg bg-white p-6 shadow-lg md:flex md:items-center md:justify-between">
        <div class="md:flex-1">
          <h2 class="text-2xl font-bold text-emerald-800">Mascotas Perdidas</h2>
          <p class="mt-2 text-gray-600">¿Has visto a alguna de estas mascotas? Revisa los reportes y ayuda a reunir familias.</p>
          <div class="mt-4">
            <NuxtLink to="/perdidas" class="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700">
              Ver reportes perdidos
            </NuxtLink>
          </div>
        </div>

        <div class="mt-4 md:mt-0 md:ml-6 md:w-48">
          <img src="/lost-pets-hero.jpg" alt="Mascotas perdidas" class="w-full h-36 object-cover rounded" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Simple hero for lost pets
</script>

<style scoped>
/* Small styling to match site */
</style>
