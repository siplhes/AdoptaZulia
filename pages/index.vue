<template>
  <div>
    <HomeHero />
    <HomeCategories />
    <HomeFeatured />
    <HomeHowItWorks />
    <HomeAdoptionStories />
    <HomeDonation />
    <HomeSocial />
  </div>
</template>

<script setup>
// Importar componentes modulares siguiendo principios SOLID
import HomeHero from '~/components/home/HomeHero.vue'
import HomeCategories from '~/components/home/HomeCategories.vue'
import HomeFeatured from '~/components/home/HomeFeatured.vue'
import HomeHowItWorks from '~/components/home/HomeHowItWorks.vue'
import HomeAdoptionStories from '~/components/home/HomeAdoptionStories.vue'
import HomeDonation from '~/components/home/HomeDonation.vue'
import HomeSocial from '~/components/home/HomeSocial.vue'
</script>

<style scoped>
/* Animaciones específicas para la página de inicio */
@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
