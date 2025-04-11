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
  image: '/og.jpg',
  ogTitle: 'Adopta Zulia | Adopta, no compres',
  ogDescription: 'Salvemos a las mascotas',
  ogImage: '/og.jpg',
  ogUrl: 'https://adoptazulia.com',
  twitterTitle: 'Adopta Zulia | Adopta, no compres',
  twitterDescription: 'Salvemos a las mascotas',
  twitterImage: '/og.jpg',
  twitterCard: 'summary',
})

useHead({
  htmlAttrs: {
    lang: 'es',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.png',
    },
  ],
  script: [
    {
      src: 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js',
      body: true,
    },
    {
      innerHTML: `
        kofiWidgetOverlay.draw('adoptazulia', {
          'type': 'floating-chat',
          'floating-chat.donateButton.text': 'Support Us',
          'floating-chat.donateButton.background-color': '#00b9fe',
          'floating-chat.donateButton.text-color': '#fff'
        });
      `,
      body: true,
    }
  ]
})

onMounted(() => {
  // Alternative implementation if the script approach above doesn't work
  if (typeof window !== 'undefined' && window.kofiWidgetOverlay) {
    window.kofiWidgetOverlay.draw('adoptazulia', {
      'type': 'floating-chat',
      'floating-chat.donateButton.text': 'Support Us',
      'floating-chat.donateButton.background-color': '#00b9fe',
      'floating-chat.donateButton.text-color': '#fff'
    });
  }
})
</script>