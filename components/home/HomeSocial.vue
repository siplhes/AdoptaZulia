<template>
  <section class="bg-amber-50 py-12 md:py-16">
    <div class="container mx-auto px-4">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="mb-4 text-3xl font-bold text-emerald-800 md:text-4xl">Mantente informado</h2>
        <p class="mb-8 text-gray-600">
          Siguenos en nuestras redes sociales para recibir actualizaciones sobre nuevas mascotas
          disponibles, consejos de cuidado y eventos de adopción.
        </p>
        <div class="mx-auto inline-flex items-center justify-center gap-2 space-x-3">
          <NuxtLink
            v-for="(social, index) in socialLinks"
            :key="index"
            :to="social.link"
            target="_blank"
            class="mx-3 text-lg rounded-lg bg-amber-600 p-4 text-[#fefffa] inline-flex items-center justify-center gap-3"
          >
              <Icon :name="social.iconName" class="text-2xl" size="28px" />  {{ social.name }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const socialLinks = [
  {
    name: 'Instagram',
    link: 'https://instagram.com/adopta.zulia',
    iconName: 'mdi:instagram',
  },
  {
    name: 'Facebook',
    link: 'https://www.facebook.com/profile.php?id=61574778734797',
    iconName: 'ic:baseline-facebook',
  },
  {
    name: 'Twitter',
    link: 'https://x.com/AdoptaZulia',
    iconName: 'mdi:alpha-x-circle',
  },
    {
    name: 'WhatsApp',
    link: 'https://wa.me/584146646526',
    iconName: 'mdi:whatsapp',
  },

]
</script>
