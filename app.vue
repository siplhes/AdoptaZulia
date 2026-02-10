<template>
  <div>
    <NuxtLoadingIndicator />
    <UiToastContainer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl || 'https://adopta-zulia.vercel.app'
const route = useRoute()

const canonicalUrl = computed(() => `${baseUrl}${route.path}`)

useSeoMeta({
  title: 'Adopta Zulia | Adopta, no compres',
  description:
    'Plataforma de adopción de mascotas en el estado Zulia, Venezuela. Encuentra tu compañero perfecto, comparte historias de adopción y ayuda a mascotas que necesitan un hogar.',
  ogTitle: 'Adopta Zulia | Adopta, no compres',
  ogDescription:
    'Plataforma de adopción de mascotas en el estado Zulia, Venezuela. Encuentra tu compañero perfecto, comparte historias de adopción y ayuda a mascotas que necesitan un hogar.',
  ogImage: `${baseUrl}/og.jpg`,
  ogImageAlt: 'Adopta Zulia - Plataforma de adopción de mascotas',
  ogUrl: canonicalUrl,
  ogType: 'website',
  ogLocale: 'es_VE',
  twitterTitle: 'Adopta Zulia | Adopta, no compres',
  twitterDescription:
    'Plataforma de adopción de mascotas en el estado Zulia, Venezuela. Encuentra tu compañero perfecto y ayuda a mascotas que necesitan un hogar.',
  twitterImage: `${baseUrl}/og.jpg`,
  twitterCard: 'summary_large_image',
  twitterSite: '@AdoptaZulia',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/balloon-css/balloon.min.css',
    },
  ],
  script: [
    {
      src: 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js',
      body: true,
      defer: true,
    },
    useStructuredData(createOrganizationSchema()),
  ],
})
</script>
