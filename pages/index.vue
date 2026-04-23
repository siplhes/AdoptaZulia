<template>
  <div>
    <HomeHero />
    <HomeLostPetsHero />
    <HomeFeatured />
        <HomeCategories />
    <HomeHowItWorks />
    <HomeDonation />

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
const ogImage = useOgImage('/og-improved.png')

// SEO Meta Tags - must be at top level for SSR
useSeoMeta({
  title: 'Adopta Zulia | Plataforma de Adopción de Mascotas en el Zulia',
  description:
    'Descubre mascotas en adopción en el estado Zulia, Venezuela. Encuentra perros, gatos y otras mascotas que buscan un hogar. Historias inspiradoras y cómo puedes ayudar.',
  ogTitle: 'Adopta Zulia - Encuentra a tu Compañero Perfecto en el Zulia',
  ogDescription:
    'Descubre mascotas buscando hogar en el estado Zulia. Adopta perros, gatos y más. ¡Dales la oportunidad que se merecen!',
  ogSiteName: 'Adopta Zulia',
  ogImage,
  ogImageAlt: 'Adopta Zulia - Mascotas buscando un hogar amoroso',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterTitle: 'Adopta Zulia - Encuentra a tu Compañero Perfecto en el Zulia',
  twitterDescription:
    'Descubre mascotas buscando hogar en el estado Zulia. Adopta perros, gatos y más. ¡Dales la oportunidad que se merecen!',
  twitterImage: ogImage,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
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
  ],
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
