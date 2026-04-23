<template>
  <section class="relative overflow-hidden bg-emerald-700 py-12 md:py-16">
    <!-- Decorative background blobs -->
    <div class="pointer-events-none absolute -left-20 -top-20 h-64 w-64 animate-float rounded-full bg-emerald-50/50 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 animate-float-delayed rounded-full bg-amber-50/50 blur-3xl"></div>

    <div class="container relative z-10 mx-auto px-4 max-w-5xl">
      <!-- Section Header -->
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-black tracking-tight text-white md:text-4xl">
          ¿Cómo <span class="relative inline-block">
            <span class="relative z-10 text-white">funciona</span>
          </span>?
        </h2>
      </div>

      <!-- Steps Grid -->
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div
          v-for="(step, index) in howItWorks"
          :key="index"
          class="group relative flex flex-col items-center text-center p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 bg-white border border-emerald-50 hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)]"
        >
          <!-- Step Indicator -->
          <span 
            class="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
            :class="index % 2 === 0 ? 'text-emerald-200 group-hover:text-emerald-600' : 'text-amber-200 group-hover:text-amber-600'"
          >
            Paso 0{{ index + 1 }}
          </span>

          <!-- Icon Container -->
          <div 
            class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 bg-emerald-600 text-white shadow-emerald-100"
          >
            <Icon :name="step.icon" class="h-8 w-8" />
          </div>

          <!-- Content -->
          <h3 
            class="mb-3 text-xl font-extrabold tracking-tight transition-colors duration-300"
            :class="index % 2 === 0 ? 'text-slate-900 group-hover:text-emerald-600' : 'text-slate-900 group-hover:text-amber-600'"
          >
            {{ step.title }}
          </h3>
          <p class="text-sm text-slate-500 font-medium leading-relaxed">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const howItWorks = [
  {
    icon: 'lucide:search',
    title: 'Explora y Filtra',
    description: 'Usa nuestros filtros para encontrar la mascota ideal para tu estilo de vida.',
  },
  {
    icon: 'lucide:heart-handshake',
    title: 'Conecta',
    description: 'Haz contacto para comenzar el proceso de adopción.',
  },
  {
    icon: 'lucide:party-popper',
    title: 'Adopta',
    description: '¡Felicidades! Ya tienes tu nueva mascota y empieza una nueva vida llena de amor.',
  },
]
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(15px, -15px) scale(1.05); }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 10s ease-in-out infinite;
  animation-delay: -2s;
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.grid > div {
  opacity: 0;
  animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.grid > div:nth-child(1) { animation-delay: 0.1s; }
.grid > div:nth-child(2) { animation-delay: 0.2s; }
.grid > div:nth-child(3) { animation-delay: 0.3s; }
</style>

