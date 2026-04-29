<template>
  <div>
    <NuxtLoadingIndicator />
    <UiToastContainer />
    <SpeedInsights />
    <Analytics />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { Analytics } from '@vercel/analytics/vue'

const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl || 'https://www.adoptazulia.org.ve/'
const route = useRoute()

const canonicalUrl = computed(() => `${baseUrl}${route.path}`)

useHead({
  script: [
    {
      type: 'speculationrules',
      innerHTML: JSON.stringify({
        prerender: [
          {
            where: {
              and: [
                { href_matches: '/*' },
                { not: { href_matches: '/logout' } },
                { not: { selector_matches: '[rel=nofollow]' } },
                { not: { selector_matches: '[data-no-prerender]' } },
              ],
            },
            eagerness: 'moderate',
          },
        ],
      }),
    },
  ],
})

useSeoMeta({
  title: 'Adopta Zulia | Adopta, no compres',
  description:
    'Plataforma de adopción de mascotas en el estado Zulia, Venezuela. Encuentra tu compañero perfecto, comparte historias de adopción y ayuda a mascotas que necesitan un hogar.',
  ogTitle: 'Adopta Zulia | Adopta, no compres',
  ogDescription:
    'Plataforma de adopción de mascotas en el estado Zulia, Venezuela. Encuentra tu compañero perfecto, comparte historias de adopción y ayuda a mascotas que necesitan un hogar.',
  ogSiteName: 'Adopta Zulia',
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

</script>
