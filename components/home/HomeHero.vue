<template>
  <section class="relative min-h-[450px] lg:min-h-[500px] flex items-center overflow-hidden bg-emerald-900 text-white">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0 select-none">
      <NuxtImg
        src="/img2.webp"
        class="h-full w-full object-cover object-center scale-105 animate-slow-zoom"
        alt="Mascotas felices"
        loading="eager"
        placeholder
      />
      <!-- Gradient Overlays -->
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-transparent" />
      <div class="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent" />
    </div>

    <!-- Content -->
    <div class="container relative z-10 mx-auto px-4 py-12 md:py-16">
      <div class="max-w-2xl animate-fade-in-up">
        <div class="inline-flex items-center rounded-full bg-emerald-800/50 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur-md border border-emerald-500/30 mb-4">
          <span class="mr-2 flex h-2 w-2 relative">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
             <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Adopta, no compres
        </div>

        <h1 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          Encuentra tu <br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-400">
            compañero ideal
          </span>
        </h1>
        
        <p class="mb-6 text-base text-emerald-100/90 md:text-lg leading-relaxed max-w-lg">
          Más de <span class="font-bold text-white">1,200 mascotas</span> en el estado Zulia esperan por una segunda oportunidad. 
          Cambia una vida hoy y gana un amigo para siempre.
        </p>

        <div class="flex flex-col gap-3 sm:flex-row">
          <NuxtLink
            to="/mascotas"
            class="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-emerald-500 px-6 py-3 text-base font-bold text-white transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 ring-offset-2 focus:ring-2 ring-emerald-400"
          >
            <span class="mr-2">Ver mascotas</span>
            <Icon name="heroicons:arrow-right" class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:animate-shimmer" />
          </NuxtLink>
          
          <NuxtLink
            to="/publicar"
            class="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 border border-white/10"
          >
            Dar en adopción
          </NuxtLink>
        </div>
        
        <!-- Trust Indicators -->
        <div class="mt-8 flex items-center gap-6 text-emerald-100/60 text-xs font-medium">
             <div class="flex items-center gap-2">
                 <Icon name="heroicons:check-badge" class="h-4 w-4" />
                 <span>Verificados</span>
             </div>
             <div class="flex items-center gap-2">
                 <Icon name="heroicons:users" class="h-4 w-4" />
                 <span>Comunidad Segura</span>
             </div>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute bottom-0 right-0 hidden lg:block translate-y-20 translate-x-20 opacity-20 pointer-events-none">
        <Icon name="ph:paw-print-fill" class="h-80 w-80 text-emerald-200 rotate-[-15deg]" />
    </div>
  </section>
</template>

<script setup>
// No specific logic needed for now, handled by CSS
</script>

<style scoped>
@keyframes slow-zoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.animate-slow-zoom {
  animation: slow-zoom 20s linear infinite alternate;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1s infinite;
}
</style>
