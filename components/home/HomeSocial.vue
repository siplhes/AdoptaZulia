<template>
  <section class="border-t border-emerald-50 bg-[#FEFFFA] py-16 md:py-20">
    <div class="container mx-auto px-4">
      <div
        class="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-emerald-900 p-8 text-center shadow-2xl md:p-12 lg:p-16"
      >
        <!-- Background Pattern -->
        <div class="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-800/30 blur-3xl" />
        <div
          class="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div class="relative z-10">
          <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">Únete a la Manada</h2>
          <p class="mx-auto mb-10 max-w-2xl text-lg text-emerald-100">
            Síguenos para ver historias de éxito, mascotas recién llegadas y eventos de la
            comunidad. ¡Juntos hacemos más ruido!
          </p>

          <div class="flex flex-wrap justify-center gap-4">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.link"
              target="_blank"
              class="group flex items-center gap-3 rounded-full px-6 py-3 font-medium transition-all hover:-translate-y-1 hover:shadow-lg"
              :class="social.colorClasses"
            >
              <Icon :name="social.icon" class="h-6 w-6" />
              <span>{{ social.name }}</span>
            </a>
          </div>
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
    icon: 'mdi:instagram',
    colorClasses: 'bg-white text-pink-600 hover:bg-pink-50',
  },
  {
    name: 'Facebook',
    link: 'https://facebook.com/adopta.zulia',
    icon: 'mdi:facebook',
    colorClasses: 'bg-white text-blue-600 hover:bg-blue-50',
  },
  {
    name: 'Twitter (X)',
    link: 'https://x.com/AdoptaZulia',
    icon: 'mdi:twitter',
    colorClasses: 'bg-white text-gray-900 hover:bg-gray-50',
  },
  {
    name: 'WhatsApp',
    link: 'https://wa.me/584146646526',
    icon: 'mdi:whatsapp',
    colorClasses: 'bg-white text-green-600 hover:bg-green-50',
  },
]
</script>
