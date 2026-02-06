<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl || 'https://adopta-zulia.vercel.app'

useSeoMeta({
  title: 'Adopta Zulia | Adopta, no compres',
  description: 'Salvemos a las mascotas',
  image: `${baseUrl}/og.jpg`,
  ogTitle: 'Adopta Zulia | Adopta, no compres',
  ogDescription: 'Salvemos a las mascotas',
  ogImage: `${baseUrl}/og.jpg`,
  ogUrl: baseUrl,
  twitterTitle: 'Adopta Zulia | Adopta, no compres',
  twitterDescription: 'Salvemos a las mascotas',
  twitterImage: `${baseUrl}/og.jpg`,
  twitterCard: 'summary',
})

useHead({
  htmlAttrs: {
    lang: 'es',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg',
    },
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/balloon-css/balloon.min.css',
    }
  ],
  script: [
    {
      src: 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js',
      body: true,
      defer: true,
    }
  ]
})
</script>