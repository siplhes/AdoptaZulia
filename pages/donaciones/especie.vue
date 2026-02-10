<template>
  <div class="min-h-screen bg-amber-50 py-12">
    <div class="container mx-auto px-4">
      <!-- Encabezado -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-3xl font-bold text-emerald-800 md:text-4xl">Donaciones en Especie</h1>
        <p class="mx-auto max-w-3xl text-gray-600">
          Conoce cómo puedes ayudar a las mascotas sin hogar a través de donaciones de alimentos,
          medicinas, accesorios y otros suministros esenciales.
        </p>
      </div>

      <!-- Introducción -->
      <div class="mx-auto mb-8 max-w-4xl rounded-lg bg-white p-6 shadow-lg md:p-8">
        <div class="flex flex-col-reverse items-center gap-6 md:flex-row md:items-center md:gap-8">
          <div class="w-full md:w-1/2">
            <h2 class="mb-4 text-2xl font-semibold text-emerald-700">¿Por qué donar en especie?</h2>
            <p class="mb-4 text-gray-700">
              Las donaciones en especie son fundamentales para proporcionar cuidados diarios a las
              mascotas rescatadas mientras esperan encontrar un hogar permanente.
            </p>
            <p class="text-gray-700">
              Cada bolsa de alimento, manta, medicamento o accesorio que donas ayuda directamente a
              mejorar la calidad de vida de estos animales y nos permite destinar más recursos a
              rescates, tratamientos médicos y programas de adopción.
            </p>
          </div>
          <div class="flex w-full items-center justify-center md:w-1/2">
            <!-- Hero illustration: improved responsive sizing and accessible -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-40 w-40 text-emerald-600 md:h-64 md:w-64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              role="img"
              aria-label="Ilustración mascotas"
            >
              <title>Ilustración de mascotas</title>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              <path d="M9 17v-2" />
              <path d="M9 11v-2" />
              <path d="M15 11h2" />
              <path d="M11 15h2" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Qué puedes donar -->
      <div class="mx-auto mb-12 max-w-4xl">
        <h2 class="mb-8 text-center text-2xl font-semibold text-emerald-800">¿Qué puedes donar?</h2>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Alimentación -->
          <div
            class="rounded-lg bg-white p-6 shadow-md transition-transform focus-within:scale-105 hover:scale-105"
          >
            <div
              class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-illustration text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-medium text-emerald-700">Alimentación</h3>
            <ul class="list-inside list-disc space-y-1 text-gray-600">
              <li>Alimento seco para perros y gatos</li>
              <li>Alimento húmedo/enlatado</li>
              <li>Leche en polvo para cachorros</li>
              <li>Comida especializada (dietas médicas)</li>
              <li>Golosinas y premios</li>
            </ul>
          </div>

          <!-- Medicamentos y salud -->
          <div class="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105">
            <div
              class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-illustration text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-medium text-emerald-700">Medicamentos y Salud</h3>
            <ul class="list-inside list-disc space-y-1 text-gray-600">
              <li>Antiparasitarios</li>
              <li>Vitaminas y suplementos</li>
              <li>Antibióticos (con receta)</li>
              <li>Productos de primeros auxilios</li>
              <li>Jeringas, guantes, gasas</li>
              <li>Jabones y champús especiales</li>
            </ul>
          </div>

          <!-- Accesorios e higiene -->
          <div class="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105">
            <div
              class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-illustration text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M12 9v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-medium text-emerald-700">Accesorios e Higiene</h3>
            <ul class="list-inside list-disc space-y-1 text-gray-600">
              <li>Mantas y camas</li>
              <li>Collares, correas y arneses</li>
              <li>Juguetes y entretenimiento</li>
              <li>Transportadoras</li>
              <li>Areneros y arena para gatos</li>
              <li>Toallas y productos de limpieza</li>
            </ul>
          </div>

          <!-- Materiales de oficina -->
          <div class="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105">
            <div
              class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-illustration text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-medium text-emerald-700">Materiales de Oficina</h3>
            <ul class="list-inside list-disc space-y-1 text-gray-600">
              <li>Papel para impresiones</li>
              <li>Cartulinas para señalética</li>
              <li>Bolígrafos y marcadores</li>
              <li>Carpetas y archivadores</li>
              <li>Cintas adhesivas</li>
              <li>Material para eventos de adopción</li>
            </ul>
          </div>

          <!-- Equipamiento -->
          <div class="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105">
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 22V12c0-5.5 4.5-10 10-10s10 4.5 10 10v10" />
                <rect x="4" y="22" width="20" height="0" />
                <path d="M8 22v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
                <circle cx="12" cy="9" r="2" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-medium text-emerald-700">Equipamiento</h3>
            <ul class="list-inside list-disc space-y-1 text-gray-600">
              <li>Cortadoras de pelo</li>
              <li>Cajas trampa humanitarias</li>
              <li>Balanzas</li>
              <li>Neveras portátiles</li>
              <li>Lámparas y focos</li>
              <li>Equipos de limpieza profesional</li>
            </ul>
          </div>

          <!-- Servicios -->
          <div class="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105">
            <div
              class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-illustration text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M17 18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2" />
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M8 2v2" />
                <path d="M16 2v2" />
                <path d="M7 10h10" />
                <path d="M7 14h10" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-medium text-emerald-700">Servicios Profesionales</h3>
            <ul class="list-inside list-disc space-y-1 text-gray-600">
              <li>Atención veterinaria</li>
              <li>Transporte y movilización</li>
              <li>Servicios de fotografía</li>
              <li>Adiestramiento básico</li>
              <li>Servicios de diseño gráfico</li>
              <li>Asistencia legal</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Proceso de donación -->
      <div class="mx-auto mb-12 max-w-4xl">
        <h2 class="mb-8 text-center text-2xl font-semibold text-emerald-800">
          ¿Cómo funciona el proceso?
        </h2>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <!-- Paso 1 -->
          <div class="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md">
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white"
            >
              <span class="text-xl font-bold">1</span>
            </div>
            <h3 class="mb-3 text-xl font-medium text-emerald-700">Contacta con nosotros</h3>
            <p class="text-gray-600">
              Envíanos un mensaje a través del formulario de contacto o escríbenos directamente por
              WhatsApp para informarnos sobre tu intención de donar.
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mt-4 h-16 w-16 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              />
            </svg>
          </div>

          <!-- Paso 2 -->
          <div class="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md">
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white"
            >
              <span class="text-xl font-bold">2</span>
            </div>
            <h3 class="mb-3 text-xl font-medium text-emerald-700">Coordina la entrega</h3>
            <p class="text-gray-600">
              Acordaremos contigo el mejor momento y lugar para recibir tu donación, ya sea en
              nuestras instalaciones o mediante recogida a domicilio.
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mt-4 h-16 w-16 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
            </svg>
          </div>

          <!-- Paso 3 -->
          <div class="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md">
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white"
            >
              <span class="text-xl font-bold">3</span>
            </div>
            <h3 class="mb-3 text-xl font-medium text-emerald-700">Seguimiento y agradecimiento</h3>
            <p class="text-gray-600">
              Te informaremos sobre cómo tu donación está ayudando a nuestras mascotas. Si lo
              deseas, podemos compartir fotos del impacto de tu contribución.
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mt-4 h-16 w-16 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Puntos de recogida -->
      <div class="mx-auto mb-12 max-w-4xl rounded-lg bg-white p-6 shadow-lg md:p-8">
        <h2 class="mb-6 text-center text-2xl font-semibold text-emerald-800">Puntos de Recogida</h2>

        <div class="flex flex-col gap-8 md:flex-row">
          <div class="md:w-1/2">
            <h3 class="mb-4 text-xl font-medium text-emerald-700">Sedes principales</h3>
            <ul class="space-y-4">
              <li class="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <strong class="block text-gray-800">Sede Maracaibo Norte</strong>
                  <p class="text-gray-600">Urb San Jacinto Sector 2, Maracaibo</p>
                  <p class="text-gray-600">Horario: Lunes a Viernes, 9:00 AM - 5:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Preguntas frecuentes -->
      <div class="mx-auto mb-12 max-w-4xl rounded-lg bg-white p-6 shadow-lg md:p-8">
        <h2 class="mb-6 text-center text-2xl font-semibold text-emerald-800">
          Preguntas Frecuentes
        </h2>

        <div class="space-y-4">
          <div v-for="(faq, idx) in faqs" :key="idx" class="rounded-lg border border-gray-200">
            <button
              :aria-expanded="openFaq === idx"
              :aria-controls="`faq-${idx}-content`"
              class="flex w-full items-center justify-between p-4 text-left"
              @click="toggleFaq(idx)"
            >
              <span class="text-lg font-medium text-gray-800">{{ faq.question }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :class="[
                  'h-5 w-5 transform transition-transform',
                  openFaq === idx ? 'rotate-180' : 'rotate-0',
                ]"
                class="h-5 w-5 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              v-show="openFaq === idx"
              :id="`faq-${idx}-content`"
              class="border-t border-gray-200 p-4"
            >
              <p class="text-gray-700">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contacto para donaciones -->
      <div class="mx-auto mb-12 max-w-4xl rounded-lg bg-emerald-50 p-6 shadow-md">
        <h2 class="mb-6 text-center text-2xl font-semibold text-emerald-800">¿Listo para donar?</h2>
        <p class="mb-8 text-center text-gray-700">
          Si tienes preguntas adicionales o quieres coordinar tu donación, no dudes en contactarnos:
        </p>

        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="tel:+584146646526"
            aria-label="Llamar al número +58 414 664 6526"
            class="flex w-full items-center justify-center gap-3 rounded-lg bg-emerald-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-emerald-700 sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              />
            </svg>
            +58 414 664 6526
          </a>
          <a
            href="mailto:adoptazulia@gmail.com"
            aria-label="Enviar correo a adoptazulia@gmail.com"
            class="flex w-full items-center justify-center gap-3 rounded-lg border border-emerald-600 px-6 py-3 text-center font-medium text-emerald-600 transition-colors hover:bg-emerald-50 sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            adoptazulia@gmail.com
          </a>
          <a
            href="https://wa.me/584146646526"
            aria-label="Abrir chat de WhatsApp"
            class="flex w-full items-center justify-center gap-3 rounded-lg bg-green-500 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-green-600 sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>

      <!-- Agradecimiento y evidencia de impacto -->
      <div class="mx-auto max-w-4xl text-center">
        <h2 class="mb-4 text-2xl font-semibold text-emerald-800">Gracias por tu apoyo</h2>
        <p class="mx-auto mb-8 max-w-3xl text-gray-700">
          Cada donación, sin importar su tamaño, tiene un impacto directo en la vida de las mascotas
          que rescatamos y cuidamos. Tu generosidad nos permite continuar nuestra misión de
          encontrar hogares amorosos para animales que lo necesitan.
        </p>
        <p class="text-sm text-gray-500">Última actualización: 12 de abril de 2025</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

// Simple accordion state for FAQs
const openFaq = ref<number | null>(0)
const faqs = [
  {
    question: '¿Puedo donar artículos usados?',
    answer:
      'Sí, aceptamos artículos usados en buen estado como mantas, toallas, transportadoras y camas. Todos los artículos textiles deben estar limpios y sin roturas significativas. Para otros artículos, evaluamos caso por caso según su estado y funcionalidad.',
  },
  {
    question: '¿Qué hago si los productos están cerca de su fecha de caducidad?',
    answer:
      'Para alimentos y medicamentos, preferimos productos con al menos 3 meses antes de su fecha de caducidad. Sin embargo, para productos que vencen pronto pero son seguros de usar, también los aceptamos y les damos prioridad de uso inmediato.',
  },
  {
    question: '¿Puedo obtener un recibo o certificado por mi donación?',
    answer:
      'Sí, emitimos certificados de donación para todas las contribuciones en especie. Este documento especifica los artículos donados y su valor aproximado, que puede ser útil para fines administrativos o fiscales.',
  },
  {
    question: '¿Puedo organizar una colecta en mi comunidad o empresa?',
    answer:
      '¡Absolutamente! Apoyamos y fomentamos las colectas comunitarias. Podemos proporcionarte materiales informativos, afiches digitales e incluso una charla virtual sobre nuestra labor. Contáctanos para coordinar los detalles y la recogida de los artículos.',
  },
]

function toggleFaq(idx: number) {
  openFaq.value = openFaq.value === idx ? null : idx
}
</script>

<style scoped>
/* Icon sizing helpers for consistent look */
.icon-illustration {
  width: 36px;
  height: 36px;
}

@media (min-width: 768px) {
  .icon-illustration {
    width: 40px;
    height: 40px;
  }
}

/* Make cards more touch-friendly */
.rounded-lg:focus-within {
  outline: 2px solid rgba(16, 185, 129, 0.15);
  outline-offset: 2px;
}
</style>
