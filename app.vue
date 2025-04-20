<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage class="min-h-100 bg-amber-50" />
  </NuxtLayout>
</template>

<script setup>
useSeoMeta({
  title: 'Adopta Zulia | Adopta, no compres',
  description: 'Salvemos a las mascotas',
  image: 'og.jpg',
  ogTitle: 'Adopta Zulia | Adopta, no compres',
  ogDescription: 'Salvemos a las mascotas',
  ogImage: 'og.jpg',
  ogUrl: 'https://adopta-zulia.vercel.app',
  twitterTitle: 'Adopta Zulia | Adopta, no compres',
  twitterDescription: 'Salvemos a las mascotas',
  twitterImage: 'og.jpg',
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

/*
onMounted(() => {
  const loadKofiWidget = () => {
    if (typeof window !== 'undefined' && window.kofiWidgetOverlay) {
      window.kofiWidgetOverlay.draw('adoptazulia', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Ayudanos',
        'floating-chat.donateButton.background-color': '#fefffa',
        'floating-chat.donateButton.text-color': '#121212'
      });
    } else {
      setTimeout(loadKofiWidget, 500);
    }
  };
  
  setTimeout(loadKofiWidget, 1000);
})
*/
</script>