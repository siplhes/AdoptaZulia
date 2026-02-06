<template>
  <div class="min-h-screen bg-[#FEFFFA] py-16 md:py-24">
    <div class="container mx-auto max-w-4xl px-4">
      <!-- Header -->
      <div class="mb-16 text-center">
        <h1 class="font-serif text-4xl font-bold text-emerald-900 md:text-5xl lg:text-6xl">
          Política de Privacidad
        </h1>
        <p class="mt-4 text-lg text-emerald-800/60">
          Tu confianza es nuestra prioridad
        </p>
      </div>

      <!-- Content -->
      <div class="prose prose-emerald prose-lg mx-auto text-gray-600 md:prose-xl">
        <p class="lead text-2xl text-emerald-900">
          En Adopta Zulia, protegemos lo que más importa. Esta política explica de forma clara y sencilla cómo manejamos tus datos.
        </p>

        <div class="my-12 h-px w-full bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

        <div class="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div class="rounded-2xl bg-emerald-50/50 p-8 border border-emerald-100">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Icon name="heroicons:eye" class="h-6 w-6" />
            </div>
            <h3 class="mt-0 mb-4 text-xl font-bold text-emerald-900">¿Qué recopilamos?</h3>
            <ul class="text-sm space-y-2">
              <li>Datos básicos (Nombre, Email) al registrarte.</li>
              <li>Fotos y detalles de las mascotas que publicas.</li>
              <li>Información técnica de navegación (Cookies).</li>
            </ul>
          </div>

          <div class="rounded-2xl bg-amber-50/50 p-8 border border-amber-100">
             <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Icon name="heroicons:shield-check" class="h-6 w-6" />
            </div>
            <h3 class="mt-0 mb-4 text-xl font-bold text-emerald-900">¿Para qué lo usamos?</h3>
            <ul class="text-sm space-y-2">
              <li>Conectar adoptantes con mascotas.</li>
              <li>Mejorar tu experiencia en la plataforma.</li>
              <li>Enviarte alertas importantes (nunca Spam).</li>
            </ul>
          </div>
        </div>

        <section class="mt-16 space-y-12">
          <article>
            <h2 class="text-2xl font-bold text-emerald-800">Compartir Datos</h2>
            <p>
              Nunca vendemos tus datos. Solo compartimos información necesaria para facilitar adopciones (ej. contactar con un refugio) o si la ley lo requiere.
            </p>
          </article>

          <article>
            <h2 class="text-2xl font-bold text-emerald-800">Tus Derechos</h2>
            <p>
              Tú tienes el control. Puedes acceder, corregir o eliminar tus datos en cualquier momento escribiéndonos a <a href="mailto:adoptazulia@gmail.com" class="text-emerald-600 font-medium hover:underline">adoptazulia@gmail.com</a>.
            </p>
          </article>
          
           <article>
            <h2 class="text-2xl font-bold text-emerald-800">Cookies</h2>
            <p>
              Usamos cookies para recordar tu sesión y preferencias. Puedes desactivarlas en tu navegador, aunque algunas funciones podrían limitarse.
            </p>
          </article>
        </section>

        <div class="mt-16 rounded-2xl bg-emerald-900 p-8 text-center text-white">
          <h3 class="text-xl font-bold text-white mb-2">¿Dudas?</h3>
          <p class="text-emerald-100 mb-6">Estamos aquí para resolver cualquier inquietud sobre tu privacidad.</p>
          <a href="mailto:adoptazulia@gmail.com" class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-emerald-900 hover:bg-emerald-50 transition-colors">
            <Icon name="heroicons:envelope" class="h-5 w-5" />
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'Política de Privacidad | Adopta Zulia' })
</script>

<style scoped>
.prose h2 { margin-top: 0; margin-bottom: 1rem; }
.prose p { margin-bottom: 1.5rem; line-height: 1.8; }
</style>