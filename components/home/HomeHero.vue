<template>
  <section class="relative overflow-hidden bg-amber-800 text-white">
    <div class="absolute inset-0 z-0">
      <NuxtImg
        :src="imgSrc"
        :sizes="imgSizes"
        alt="Perros y gatos felices"
        class="h-full w-full object-cover opacity-20 hidden md:block"
        loading="lazy"
        :quality="imgQuality"
        format="webp"
        :placeholder="true"
        :width="imgWidth"
        :height="imgHeight"
      />
    </div>
    <div class="container relative z-10 mx-auto px-4 py-8 md:py-12">
      <div class="max-w-3xl">
        <h1 class="mb-3 text-2xl font-bold md:text-3xl lg:text-3xl">
          Encuentra tu compañero perfecto
        </h1>
        <p class="mb-4 text-xl text-amber-100 md:text-2xl">
          En el estado Zulia, hay miles de mascotas están esperando un hogar.
          <strong>¡Adopta!</strong>
          no compres y cambia una vida para siempre.
        </p>
        <div class="flex flex-col mb-6 gap-4 sm:flex-row">
          <a
            href="/mascotas"
            class="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-lg font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            <Icon name="mdi:magnify" class="mr-2 h-5 w-5" />
            Buscar mascotas
          </a>
          <a
            href="/publicar"
            class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            <Icon name="mdi:plus" class="mr-2 h-5 w-5" />
            Dar en adopción
          </a>
        </div>
      </div>
    </div>

    <!-- Wave divider -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="fill-amber-50">
        <path
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
        />
      </svg>
    </div>
  </section>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const { width } = useWindowSize()

const imgSrc = '/img2.webp'
const imgSizes = computed(() =>
  width.value < 640
    ? '100vw'
    : width.value < 1024
      ? '50vw'
      : '33vw'
)
const imgQuality = computed(() => (width.value < 640 ? 40 : 70))
const imgWidth = computed(() => (width.value < 640 ? 600 : 1440))
const imgHeight = computed(() => (width.value < 640 ? 400 : 600))
</script>
