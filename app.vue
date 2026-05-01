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
const baseUrl = (config.public.baseUrl || 'https://www.adoptazulia.org.ve').replace(/\/$/, '')
const route = useRoute()

const canonicalUrl = computed(() => `${baseUrl}${route.path === '/' ? '' : route.path}`)

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
  title: 'Adopta Zulia | Encuentra tu Compañero Perfecto en el Zulia',
  description:
    'La plataforma líder de adopción de mascotas en el Zulia, Venezuela. Publica mascotas en adopción, reporta extravíos, comparte historias de felicidad y encuentra un hogar para cada peludo.',
  ogTitle: 'Adopta Zulia | Encuentra tu Compañero Perfecto en el Zulia',
  ogDescription:
    'Publica mascotas en adopción, reporta extravíos y comparte historias de adopción en la plataforma líder del Zulia, Venezuela.',
  ogSiteName: 'Adopta Zulia',
  ogImage: `${baseUrl}/og-improved.png`,
  ogImageAlt: 'Adopta Zulia - Plataforma de adopción de mascotas en el Zulia',
  ogUrl: canonicalUrl,
  ogType: 'website',
  ogLocale: 'es_VE',
  twitterTitle: 'Adopta Zulia | Encuentra tu Compañero Perfecto en el Zulia',
  twitterDescription:
    'Publica mascotas en adopción, reporta extravíos y comparte historias de adopción en la plataforma líder del Zulia, Venezuela.',
  twitterImage: `${baseUrl}/og-improved.png`,
  twitterCard: 'summary_large_image',
  twitterSite: '@AdoptaZulia',
})

</script>
