<template>
  <div>
    <HomeHero />
    <HomeLostPetsHero />
    <HomeFeatured />
    <HomeCategories />
    <HomeDonation />
    <HomeHowItWorks />    
    <HomeAdoptionStories />
    <HomeSocial />
  </div>
</template>

<script setup>
import HomeHero from '~/components/home/HomeHero.vue'
import HomeCategories from '~/components/home/HomeCategories.vue'
import HomeFeatured from '~/components/home/HomeFeatured.vue'
import HomeHowItWorks from '~/components/home/HomeHowItWorks.vue'
import HomeAdoptionStories from '~/components/home/HomeAdoptionStories.vue'
import HomeDonation from '~/components/home/HomeDonation.vue'
import HomeSocial from '~/components/home/HomeSocial.vue'
import HomeLostPetsHero from '~/components/home/HomeLostPetsHero.vue'

const canonicalUrl = useCanonicalUrl('/')
const ogImage = useOgImage('/og.jpg')

// SEO Meta Tags - must be at top level for SSR
useSeoMeta({
  title: 'Inicio | Adopta Zulia - Adopta, no compres',
  description: 'Descubre mascotas en adopción en el estado Zulia, Venezuela. Encuentra perros, gatos y otras mascotas que buscan un hogar. Historias inspiradoras y cómo puedes ayudar.',
  ogTitle: 'Adopta Zulia - Plataforma de adopción de mascotas',
  ogDescription: 'Descubre mascotas en adopción en el estado Zulia. Encuentra tu compañero perfecto, lee historias inspiradoras y aprende cómo puedes ayudar.',
  ogImage,
  ogImageAlt: 'Adopta Zulia - Mascotas buscando hogar',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterTitle: 'Adopta Zulia - Plataforma de adopción de mascotas',
  twitterDescription: 'Descubre mascotas en adopción en el estado Zulia. Encuentra tu compañero perfecto y ayuda a mascotas que necesitan un hogar.',
  twitterImage: ogImage,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    }
  ],
  script: [
    useStructuredData(createWebsiteSchema()),
    useStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Inicio - Adopta Zulia',
      description: 'Descubre mascotas en adopción en el estado Zulia, Venezuela',
      url: canonicalUrl,
    }),
  ]
})
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
