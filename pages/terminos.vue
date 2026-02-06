<template>
  <div class="min-h-screen bg-[#FEFFFA] py-16 md:py-24">
    <div class="container mx-auto max-w-4xl px-4">
      <!-- Header -->
      <div class="mb-16 text-center">
        <h1 class="font-serif text-4xl font-bold text-emerald-900 md:text-5xl lg:text-6xl">
          Términos y Condiciones
        </h1>
        <p class="mt-4 text-lg text-emerald-800/60">
          Última actualización: 12 de abril de 2025
        </p>
      </div>

      <!-- Content -->
      <div class="prose prose-emerald prose-lg mx-auto text-gray-600 md:prose-xl">
        <p class="lead text-2xl text-emerald-900">
          Bienvenido a Adopta Zulia. Al utilizar nuestra plataforma, te unes a una comunidad dedicada a dar segundas oportunidades.
        </p>

        <div class="my-12 h-px w-full bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

        <section class="space-y-12">
          <article>
            <h2 class="flex items-center gap-3 text-2xl font-bold text-emerald-800">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">1</span>
              Acuerdo de Uso
            </h2>
            <p>
              Al acceder a Adopta Zulia, aceptas estos términos. Nuestra misión es conectar, y para ello necesitamos un entorno seguro y respetuoso. Si no estás de acuerdo con alguna parte, por favor abstente de usar el servicio.
            </p>
          </article>

          <article>
            <h2 class="flex items-center gap-3 text-2xl font-bold text-emerald-800">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">2</span>
              Reglas de la Casa
            </h2>
            <ul class="list-none space-y-3 pl-0">
              <li class="flex items-start gap-3">
                <Icon name="heroicons:check-circle" class="mt-1 h-6 w-6 shrink-0 text-emerald-500" />
                <span><strong>Sé honesto:</strong> Toda información sobre mascotas debe ser veraz.</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="heroicons:check-circle" class="mt-1 h-6 w-6 shrink-0 text-emerald-500" />
                <span><strong>Sin fines de lucro:</strong> Prohibida estrictamente la venta de animales.</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="heroicons:check-circle" class="mt-1 h-6 w-6 shrink-0 text-emerald-500" />
                <span><strong>Respeto mutuo:</strong> Cero tolerancia al acoso o contenido ofensivo.</span>
              </li>
            </ul>
          </article>

          <article>
            <h2 class="flex items-center gap-3 text-2xl font-bold text-emerald-800">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">3</span>
              Responsabilidad
            </h2>
            <p>
              Adopta Zulia es un facilitador. No somos dueños de las mascotas ni garantizamos el éxito de las adopciones. Recomendamos siempre:
            </p>
            <div class="rounded-xl bg-amber-50 p-6 text-amber-900 border border-amber-100">
              <p class="m-0 font-medium">Verificar identidad • Hacer preguntas • Seguir tu instinto</p>
            </div>
          </article>

          <article>
            <h2 class="flex items-center gap-3 text-2xl font-bold text-emerald-800">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">4</span>
              Tus Datos
            </h2>
            <p>
              Cuidamos tu información según nuestra <NuxtLink to="/privacidad" class="text-emerald-600 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800">Política de Privacidad</NuxtLink>. Al registrarte, eres responsable de proteger tu contraseña.
            </p>
          </article>
        </section>

        <div class="my-16 flex justify-center">
          <NuxtLink to="/" class="group flex items-center gap-2 rounded-full border border-emerald-200 px-6 py-3 transition-colors hover:bg-emerald-50 text-emerald-700 font-medium">
            <Icon name="heroicons:arrow-left" class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'Términos y Condiciones | Adopta Zulia' })
</script>

<style scoped>
/* Typography improvements */
.prose h2 { margin-top: 0; margin-bottom: 1rem; }
.prose p { margin-bottom: 1.5rem; line-height: 1.8; }
</style>