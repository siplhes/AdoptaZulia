<template>
  <div class="min-h-screen bg-page py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Back Button -->
      <NuxtLink to="/comunidad" class="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 mb-8 transition-colors">
        <Icon name="ph:arrow-left-bold" class="mr-2 h-4 w-4" />
        Volver a la comunidad
      </NuxtLink>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
      
      <div v-else-if="!noticia" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
        <Icon name="ph:file-search-duotone" class="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Noticia no encontrada</h2>
        <p class="text-gray-500 mb-6">Parece que el artículo que buscas no existe o ha sido eliminado.</p>
        <NuxtLink to="/comunidad" class="inline-flex justify-center rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 transition-colors">
          Explorar otras noticias
        </NuxtLink>
      </div>

      <article v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Hero Image -->
        <div v-if="noticia.imageUrl" class="relative w-full h-[400px]">
          <NuxtImg
            :src="noticia.imageUrl"
            :alt="noticia.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div class="absolute bottom-0 left-0 w-full p-8 text-white">
            <div class="flex items-center text-sm font-medium mb-3 text-emerald-200">
              <Icon name="ph:calendar-blank" class="mr-2 h-5 w-5" />
              {{ formattedDate }}
            </div>
            <h1 class="text-3xl md:text-4xl font-extrabold leading-tight">{{ noticia.title }}</h1>
          </div>
        </div>

        <!-- Header without image -->
        <div v-else class="p-8 pb-0">
          <div class="flex items-center text-sm font-medium mb-3 text-emerald-600">
            <Icon name="ph:calendar-blank" class="mr-2 h-5 w-5" />
            {{ formattedDate }}
          </div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{{ noticia.title }}</h1>
          <hr class="border-gray-100 mt-6" />
        </div>

        <!-- Content -->
        <div class="p-8">
          <div class="flex items-center mb-8 bg-gray-50 p-4 rounded-2xl w-max">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mr-4">
              <Icon name="ph:user-duotone" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900">Escrito por</p>
              <p class="text-xs text-gray-500">{{ noticia.authorName || 'Administrador' }}</p>
            </div>
          </div>

          <!-- HTML Content Render (Assuming HTML was saved) -->
          <div class="prose prose-emerald lg:prose-lg max-w-none text-gray-700" v-html="noticia.content">
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTablon, type TablonNoticia } from '~/composables/useTablon'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const { getNoticiaById, loading } = useTablon()
const noticia = ref<TablonNoticia | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    noticia.value = await getNoticiaById(id)
  }
})

const formattedDate = computed(() => {
  if (!noticia.value?.createdAt) return ''
  return format(new Date(noticia.value.createdAt), "d 'de' MMMM, yyyy", { locale: es })
})

useHead({
  title: computed(() => noticia.value ? `${noticia.value.title} | Adopta Zulia` : 'Noticia | Adopta Zulia'),
})
</script>
