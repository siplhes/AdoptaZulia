<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 text-center">
        <h1 class="mb-3 text-3xl font-bold text-emerald-800 md:text-4xl">Historias de Adopción</h1>
        <p class="mx-auto max-w-3xl text-lg text-gray-600">
          Descubre las emotivas historias de mascotas que han encontrado un hogar amoroso gracias a
          nuestra comunidad.
        </p>
      </div>

      <!-- Botón para crear historia -->
      <div v-if="isAuthenticated" class="mb-8 text-center">
        <NuxtLink
          to="/historias/crear"
          class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          <Icon name="heroicons:plus" class="mr-2" size="20px" />
          Compartir tu historia
        </NuxtLink>
      </div>

      <!-- Filtros -->
      <div class="mb-8 flex flex-wrap justify-center gap-4">
        <button
          class="rounded-full px-4 py-2 text-sm font-medium"
          :class="
            activeFilter === 'all'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          "
          @click="activeFilter = 'all'"
        >
          Todas las historias
        </button>
        <button
          class="rounded-full px-4 py-2 text-sm font-medium"
          :class="
            activeFilter === 'featured'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          "
          @click="activeFilter = 'featured'"
        >
          Destacadas
        </button>
        <button
          v-if="isAuthenticated"
          class="rounded-full px-4 py-2 text-sm font-medium"
          :class="
            activeFilter === 'mine'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          "
          @click="activeFilter = 'mine'"
        >
          Mis historias
        </button>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-8 text-center text-red-600">
        {{ error }}
      </div>

      <!-- Sin historias -->
      <div v-else-if="displayedStories.length === 0" class="py-12 text-center">
        <div class="mb-4">
          <Icon name="heroicons:document-text" class="mx-auto h-16 w-16 text-gray-400" />
        </div>
        <h3 class="mb-2 text-lg font-medium text-gray-900">No hay historias disponibles</h3>
        <p class="mb-6 text-gray-500">
          {{
            activeFilter === 'mine'
              ? '¡Comparte tu experiencia de adopción y sé el primero en contar tu historia!'
              : 'Próximamente compartiremos historias inspiradoras de adopciones.'
          }}
        </p>
        <NuxtLink
          v-if="isAuthenticated && activeFilter === 'mine'"
          to="/historias/crear"
          class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          <Icon name="heroicons:plus" class="mr-2" size="20px" />
          Compartir tu historia
        </NuxtLink>
      </div>

      <!-- Lista de historias -->
      <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AdoptionStoryCard v-for="story in displayedStories" :key="story.id" :story="story" />
      </div>

      <!-- Paginación -->
      <div v-if="displayedStories.length > 0" class="mt-12 flex justify-center">
        <div class="flex space-x-2">
          <button
            :disabled="currentPage === 1"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="currentPage--"
          >
            <Icon name="heroicons:chevron-left" size="20px" />
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="rounded-md border px-4 py-2"
            :class="
              currentPage === page
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 bg-white text-gray-700'
            "
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button
            :disabled="currentPage === totalPages"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="currentPage++"
          >
            <Icon name="heroicons:chevron-right" size="20px" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAdoptionStories } from '~/composables/useAdoptionStories'
import { useAuth } from '~/composables/useAuth'
import type { AdoptionStory } from '~/models/AdoptionStory'

const { user, isAuthenticated } = useAuth()
const { fetchUserStories, loading: userStoriesLoading, error: userStoriesError } = useAdoptionStories()

const { data: allStoriesResponse, pending: allStoriesPending, error: allStoriesError } = useAsyncData('stories-all', () => $fetch('/api/stories?filter=all'))
const { data: featuredStoriesResponse, pending: featuredStoriesPending, error: featuredStoriesError } = useAsyncData('stories-featured', () => $fetch('/api/stories?filter=featured&limit=100'))

const stories = computed(() => allStoriesResponse.value?.stories ?? [])
const featuredStories = computed(() => featuredStoriesResponse.value?.stories ?? [])
const myStories = ref<AdoptionStory[]>([])

const activeFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 9

const loadMyStories = async () => {
  if (!user.value) return
  myStories.value = await fetchUserStories(user.value.uid)
  currentPage.value = 1
}

const filteredStories = computed(() => {
  if (activeFilter.value === 'all') {
    return stories.value
  } else if (activeFilter.value === 'featured') {
    return featuredStories.value
  } else if (activeFilter.value === 'mine') {
    return myStories.value
  }
  return []
})

const displayedStories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredStories.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredStories.value.length / itemsPerPage))

const loading = computed(() => allStoriesPending.value || featuredStoriesPending.value || userStoriesLoading.value)
const error = computed(
  () =>
    String(userStoriesError.value || allStoriesError.value || featuredStoriesError.value || '') || null
)

watch(activeFilter, async (newFilter) => {
  currentPage.value = 1
  if (newFilter === 'mine' && user.value) {
    await loadMyStories()
  }
})

const canonicalUrl = useCanonicalUrl('/historias')
const ogImage = useOgImage('/og.jpg')

useSeoMeta({
  title: 'Historias de Adopción | Adopta Zulia',
  description:
    'Lee historias inspiradoras de mascotas que encontraron su hogar definitivo en Zulia. Comparte tu propia experiencia de adopción.',
  ogTitle: 'Historias de Adopción - Adopta Zulia',
  ogDescription:
    'Historias reales de amor y segunda oportunidad. Descubre cómo una adopción puede cambiar vidas.',
  ogSiteName: 'Adopta Zulia',
  ogImage,
  ogImageAlt: 'Finales felices en Adopta Zulia',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterTitle: 'Historias de Adopción - Adopta Zulia',
  twitterDescription: 'Historias inspiradoras de adopción de mascotas en el estado Zulia.',
  twitterImage: ogImage,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  script: [
    useStructuredData(
      createBreadcrumbSchema([
        { name: 'Inicio', url: useCanonicalUrl('/') },
        { name: 'Historias', url: canonicalUrl },
      ])
    ),
  ],
})
</script>
