<template>
  <NuxtLink :to="`/comunidad/noticias/${noticia.id}`" class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200">
    <div class="relative h-48 w-full overflow-hidden bg-gray-100">
      <NuxtImg
        v-if="noticia.imageUrl"
        :src="noticia.imageUrl"
        :alt="noticia.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        width="400"
        height="300"
      />
      <div v-else class="flex h-full items-center justify-center bg-emerald-50 text-emerald-300">
        <Icon name="ph:newspaper-clipping-duotone" class="h-16 w-16" />
      </div>
      <div class="absolute top-4 left-4">
        <span class="inline-flex items-center rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
          Noticia
        </span>
      </div>
    </div>
    <div class="flex flex-1 flex-col p-6">
      <div class="mb-3 flex items-center text-xs text-gray-500">
        <Icon name="ph:calendar-blank" class="mr-1.5 h-4 w-4 text-emerald-600" />
        {{ formattedDate }}
      </div>
      <h3 class="mb-3 text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
        {{ noticia.title }}
      </h3>
      <p class="mb-4 flex-1 text-sm text-gray-600 line-clamp-3">
        {{ previewText }}
      </p>
      <div class="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
        <div class="flex items-center text-sm font-medium text-emerald-600">
          Leer más
          <Icon name="ph:arrow-right-bold" class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
        <div class="text-xs text-gray-400">
          Por {{ noticia.authorName || 'Admin' }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  noticia: {
    type: Object,
    required: true,
  },
})

const formattedDate = computed(() => {
  if (!props.noticia.createdAt) return ''
  return format(new Date(props.noticia.createdAt), "d 'de' MMMM, yyyy", { locale: es })
})

const previewText = computed(() => {
  if (!props.noticia.content) return ''
  return props.noticia.content.replace(/<[^>]*>/g, '').substring(0, 200)
})
</script>
