<template>
  <div class="min-h-screen bg-page py-12 relative overflow-hidden">
    <!-- Background SVG Pattern -->
    <div class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
    
    <div class="container mx-auto px-4 relative z-10">
      <!-- Encabezado con Glassmorphism -->
      <div class="mb-12 text-center max-w-4xl mx-auto rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div class="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-6 text-emerald-600">
          <Icon name="ph:gift-duotone" class="w-10 h-10" />
        </div>
        <h1 class="mb-4 text-4xl font-extrabold text-emerald-900 md:text-5xl tracking-tight">Donaciones en Especie</h1>
        <p class="mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
          Cada aporte cuenta. Descubre cómo tus donaciones de alimentos, medicinas y accesorios ayudan directamente a transformar la vida de nuestras mascotas rescatadas.
        </p>
      </div>

      <!-- Introducción -->
      <div class="mx-auto mb-16 max-w-5xl">
        <div class="flex flex-col-reverse items-center gap-10 md:flex-row md:gap-16">
          <div class="w-full md:w-1/2">
            <h2 class="mb-5 text-3xl font-bold text-gray-900">¿Por qué donar en especie?</h2>
            <div class="space-y-4 text-gray-600 text-lg">
              <p>
                Las donaciones en especie son el motor diario que mantiene nuestros refugios operativos. Proveen el sustento esencial mientras los animales esperan su hogar definitivo.
              </p>
              <p>
                Al donar alimento, mantas o medicinas, nos permites destinar nuestros recursos económicos a rescates críticos, cirugías de emergencia y programas educativos.
              </p>
            </div>
            <div class="mt-8">
              <a href="#contacto" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                Coordinar Donación
                <Icon name="ph:arrow-right-bold" class="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
          <div class="w-full md:w-1/2 relative">
            <div class="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-amber-100 rounded-full blur-3xl opacity-50 transform scale-90"></div>
            <div class="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <Icon name="ph:cat-duotone" class="w-full h-48 text-emerald-500 opacity-90" />
            </div>
          </div>
        </div>
      </div>

      <!-- Qué puedes donar -->
      <div class="mx-auto mb-16 max-w-6xl">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900">¿Qué artículos necesitamos?</h2>
          <p class="mt-4 text-gray-600 max-w-2xl mx-auto">Nuestras necesidades varían, pero estos son los suministros que más impacto tienen en el bienestar diario de los animales.</p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Categorías de donación -->
          <div v-for="category in donationCategories" :key="category.title" class="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100">
            <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <Icon :name="category.icon" class="w-8 h-8" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">{{ category.title }}</h3>
            <ul class="space-y-2 text-gray-600">
              <li v-for="item in category.items" :key="item" class="flex items-start">
                <Icon name="ph:check-circle-fill" class="w-5 h-5 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Proceso de donación -->
      <div class="mx-auto mb-16 max-w-5xl">
        <div class="rounded-3xl bg-emerald-900 p-8 md:p-12 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 -mt-10 -mr-10 text-emerald-800 opacity-50">
            <Icon name="ph:heart-straight-fill" class="w-64 h-64" />
          </div>
          
          <div class="relative z-10">
            <h2 class="mb-10 text-3xl font-bold">¿Cómo funciona el proceso?</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="relative">
                <div class="text-emerald-400 font-bold text-lg mb-2">01. Contacta</div>
                <h3 class="text-xl font-semibold mb-2">Escríbenos</h3>
                <p class="text-emerald-100/80">Comunícate por WhatsApp o email para detallar tu aporte.</p>
              </div>
              <div class="relative">
                <div class="text-emerald-400 font-bold text-lg mb-2">02. Coordina</div>
                <h3 class="text-xl font-semibold mb-2">Punto de Entrega</h3>
                <p class="text-emerald-100/80">Acordaremos el mejor horario en nuestra sede o punto aliado.</p>
              </div>
              <div class="relative">
                <div class="text-emerald-400 font-bold text-lg mb-2">03. Impacta</div>
                <h3 class="text-xl font-semibold mb-2">Seguimiento</h3>
                <p class="text-emerald-100/80">Te compartiremos el impacto directo de tu valiosa contribución.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sede & FAQs -->
      <div class="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <!-- Puntos de recogida -->
        <div class="lg:col-span-5 rounded-3xl bg-amber-50 p-8 border border-amber-100">
          <div class="flex items-center text-amber-600 mb-4">
            <Icon name="ph:map-pin-duotone" class="w-8 h-8 mr-3" />
            <h2 class="text-2xl font-bold text-gray-900">Sede Principal</h2>
          </div>
          <div class="space-y-4 text-gray-700 mt-6">
            <div class="bg-white p-5 rounded-2xl shadow-sm">
              <strong class="block text-gray-900 text-lg mb-1">Sede Maracaibo Norte</strong>
              <p class="text-gray-600 mb-3 flex items-center">
                <Icon name="ph:navigation-arrow" class="w-4 h-4 mr-2 text-amber-500" />
                Urb San Jacinto Sector 2
              </p>
              <div class="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg w-fit">
                <Icon name="ph:clock" class="w-4 h-4 mr-2" />
                Lunes a Viernes, 9:00 AM - 5:00 PM
              </div>
            </div>
          </div>
        </div>

        <!-- FAQs -->
        <div class="lg:col-span-7">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Preguntas Frecuentes</h2>
          <div class="space-y-3">
            <details v-for="(faq, idx) in faqs" :key="idx" class="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" :open="idx === 0">
              <summary class="flex cursor-pointer items-center justify-between p-5 font-semibold text-gray-900 list-none outline-none hover:bg-gray-50 transition-colors">
                {{ faq.question }}
                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 transition-transform group-open:rotate-180">
                  <Icon name="heroicons:chevron-down" class="w-5 h-5" />
                </span>
              </summary>
              <div class="px-5 pb-5 pt-0 text-gray-600 leading-relaxed">
                {{ faq.answer }}
              </div>
            </details>
          </div>
        </div>
      </div>

      <!-- Contacto -->
      <div id="contacto" class="mx-auto max-w-4xl text-center">
        <h2 class="mb-4 text-2xl font-bold text-gray-900">¿Listo para hacer la diferencia?</h2>
        <p class="mb-8 text-gray-600">Contáctanos por tu canal preferido para coordinar tu donación.</p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="https://wa.me/584146646526" target="_blank" rel="noopener noreferrer" class="flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-[#25D366] px-8 py-4 font-bold text-white transition-transform hover:scale-105 shadow-lg shadow-green-200">
            <Icon name="ph:whatsapp-logo" class="w-6 h-6" />
            WhatsApp
          </a>
          <a href="mailto:adoptazulia@gmail.com" class="flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-white border border-gray-200 px-8 py-4 font-bold text-gray-700 transition-all hover:border-emerald-500 hover:text-emerald-700 shadow-sm">
            <Icon name="ph:envelope-simple" class="w-6 h-6" />
            adoptazulia@gmail.com
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Donaciones en Especie | Adopta Zulia',
  meta: [
    {
      name: 'description',
      content:
        'Conoce cómo puedes ayudar a las mascotas sin hogar con donaciones de alimentos, medicinas, accesorios y otros suministros esenciales.',
    },
  ],
})

const donationCategories = [
  {
    title: 'Alimentación',
    icon: 'ph:bowl-food-duotone',
    items: ['Alimento seco (perros y gatos)', 'Alimento húmedo/enlatado', 'Leche maternizada', 'Dietas médicas especializadas', 'Golosinas y premios']
  },
  {
    title: 'Salud y Farmacia',
    icon: 'ph:pill-duotone',
    items: ['Antiparasitarios internos/externos', 'Vitaminas y suplementos', 'Antibióticos de uso común', 'Material de primeros auxilios', 'Champús medicados']
  },
  {
    title: 'Confort y Refugio',
    icon: 'ph:house-line-duotone',
    items: ['Camas y mantas (limpias)', 'Collares, correas y arneses', 'Juguetes resistentes', 'Transportadoras', 'Areneros y arena para gatos']
  },
  {
    title: 'Higiene y Limpieza',
    icon: 'ph:sparkle-duotone',
    items: ['Desinfectantes sin amoníaco', 'Bolsas para desechos', 'Toallas absorbentes', 'Guantes de látex', 'Inyectadoras desechables']
  },
  {
    title: 'Equipamiento',
    icon: 'ph:toolbox-duotone',
    items: ['Cortadoras de pelo de mascotas', 'Cajas trampa humanitarias', 'Balanzas y básculas', 'Lámparas de calor', 'Equipos de aseo profundo']
  },
  {
    title: 'Servicios',
    icon: 'ph:hand-heart-duotone',
    items: ['Consultas veterinarias', 'Transporte y traslados', 'Fotografía profesional', 'Servicios de peluquería', 'Impresión de material']
  }
]

const faqs = [
  {
    question: '¿Puedo donar artículos usados?',
    answer: 'Sí, aceptamos artículos usados en buen estado como mantas, toallas, transportadoras y camas. Todos los artículos textiles deben estar limpios y sin roturas. Para otros artículos, evaluamos caso por caso según su estado y seguridad para los animales.',
  },
  {
    question: '¿Aceptan medicamentos abiertos o próximos a vencer?',
    answer: 'Para medicamentos, preferimos productos con al menos 3 meses de vigencia. Aceptamos medicamentos abiertos siempre que el envase asegure la higiene y el producto no esté vencido.',
  },
  {
    question: '¿Puedo obtener un recibo por mi donación?',
    answer: 'Sí, emitimos certificados de agradecimiento y constancias de donación en especie. Este documento especifica los artículos donados y la fecha, útil para tus registros o fines administrativos.',
  },
  {
    question: '¿Puedo organizar una colecta en mi empresa?',
    answer: '¡Absolutamente! Fomentamos las colectas comunitarias y corporativas. Podemos proporcionarte afiches digitales y apoyo informativo. Contáctanos para coordinar la logística de recogida.',
  },
]
</script>
