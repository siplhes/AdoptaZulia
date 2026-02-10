<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Navegación de regreso -->
      <div class="mb-8">
        <NuxtLink
          to="/historias"
          class="inline-flex items-center text-emerald-600 hover:text-emerald-700"
        >
          <Icon name="heroicons:arrow-left" class="mr-1 h-5 w-5" />
          <span>Volver a historias</span>
        </NuxtLink>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Historia no encontrada -->
      <div v-else-if="!story" class="mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-yellow-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">Historia no encontrada</p>
          </div>
        </div>
      </div>

      <!-- Historia -->
      <div v-else>
        <div class="overflow-hidden rounded-lg bg-white shadow-lg">
          <!-- Imagen principal -->
          <div
            v-if="story.images && story.images.length > 0"
            class="h-60 w-full overflow-hidden sm:h-80 md:h-96"
          >
            <NuxtImg
              :src="story.images[0]"
              :alt="story.title"
              class="h-full w-full object-cover"
              sizes="sm:100vw md:100vw lg:100vw"
              placeholder
            />
          </div>

          <!-- Badge de destacado -->
          <div
            v-if="story.featured"
            class="bg-amber-500 px-4 py-1 text-center text-sm font-medium text-white"
          >
            Historia destacada
          </div>

          <!-- Contenido de la historia -->
          <div class="p-6 md:p-8">
            <!-- Encabezado -->
            <div class="mb-6">
              <h1 class="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">{{ story.title }}</h1>

              <!-- Info de autor y mascota -->
              <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
                <!-- Autor -->
                <div class="flex items-center">
                  <div class="mr-3 h-10 w-10 overflow-hidden rounded-full">
                    <NuxtImg
                      v-if="story.user?.photoURL"
                      :src="story.user.photoURL"
                      :alt="story.user.displayName"
                      class="h-full w-full object-cover"
                      sizes="40px"
                      placeholder
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center bg-emerald-100"
                    >
                      <span class="font-semibold text-emerald-600">
                        {{ story.user?.displayName?.charAt(0).toUpperCase() || 'U' }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ story.user?.displayName || 'Usuario' }}
                    </p>
                    <p class="text-sm text-gray-500">{{ formatDate(story.createdAt) }}</p>
                  </div>
                </div>

                <!-- Mascota -->
                <div v-if="story.pet" class="flex items-center">
                  <div class="mr-3 h-10 w-10 overflow-hidden rounded-full">
                    <NuxtImg
                      v-if="story.pet.image"
                      :src="story.pet.image"
                      :alt="story.pet.name"
                      class="h-full w-full object-cover"
                      sizes="40px"
                      placeholder
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center bg-emerald-100"
                    >
                      <Icon name="ph:paw-print" class="text-emerald-500" size="20px" />
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ story.pet.name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ story.pet.type }} • {{ story.pet.breed }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Separador -->
            <div class="my-6 border-t border-gray-200" />

            <!-- Contenido principal -->
            <div class="prose prose-emerald lg:prose-lg max-w-none">
              <p class="whitespace-pre-line">{{ story.content }}</p>
            </div>

            <!-- Galería adicional -->
            <div v-if="story.images && story.images.length > 1" class="mt-8">
              <h3 class="mb-4 text-lg font-medium text-gray-900">Galería de imágenes</h3>
              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <div
                  v-for="(image, index) in story.images.slice(1)"
                  :key="index"
                  class="aspect-square cursor-pointer overflow-hidden rounded-lg"
                  @click="openGallery(index + 1)"
                >
                  <NuxtImg
                    :src="image"
                    :alt="`Imagen ${index + 1}`"
                    class="h-full w-full object-cover"
                    sizes="sm:50vw md:33vw lg:25vw"
                    placeholder
                  />
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="mt-8 flex items-center justify-between">
              <button
                class="flex items-center gap-2 rounded-md border px-4 py-2"
                :class="
                  hasLiked
                    ? 'border-pink-300 bg-pink-50 text-pink-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                "
                @click="handleLike"
              >
                <Icon
                  :name="hasLiked ? 'mdi:heart' : 'mdi:heart-outline'"
                  size="20px"
                  :class="hasLiked ? 'text-pink-600' : ''"
                />
                <span>{{ story.likes || 0 }} Me gusta</span>
              </button>

              <div class="flex gap-2">
                <button
                  class="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  @click="shareStory"
                >
                  <Icon name="heroicons:share" size="20px" />
                  <span>Compartir</span>
                </button>

                <button
                  v-if="isOwner"
                  class="flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
                  @click="deleteStoryHandler"
                >
                  <Icon name="heroicons:trash" size="20px" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdoptionStories } from '~/composables/useAdoptionStories'
import { useAuth } from '~/composables/useAuth'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Composables y router
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { fetchStoryById, likeStory, deleteStory, loading, error } = useAdoptionStories()
const { user, isAuthenticated } = useAuth()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl || 'https://adopta-zulia.vercel.app'

// Estado local
const story = ref(null)
const hasLiked = ref(false)
const storyId = route.params.id

// SEO Meta Tags
useSeoMeta({
  title: computed(() =>
    story.value
      ? `${story.value.title} | Historias Adopta Zulia`
      : 'Historia de Adopción | Adopta Zulia'
  ),
  description: computed(() =>
    story.value
      ? `${story.value.content?.substring(0, 150)}...`
      : 'Lee esta inspiradora historia de adopción.'
  ),
  ogTitle: computed(() => story.value?.title || 'Historia de Adopción'),
  ogDescription: computed(() =>
    story.value
      ? `Historia de adopción de ${story.value.pet?.name || 'una mascota'}. ${story.value.content?.substring(0, 100)}...`
      : 'Historia de adopción'
  ),
  ogImage: computed(() => useOgImage(story.value?.images?.[0] || story.value?.pet?.image, baseUrl)),
  ogUrl: computed(() => useCanonicalUrl(`/historias/${storyId}`, baseUrl)),
  ogType: 'article',
  twitterTitle: computed(() => story.value?.title || 'Historia de Adopción'),
  twitterDescription: computed(() =>
    story.value
      ? `Historia de adopción de ${story.value.pet?.name || 'una mascota'}.`
      : 'Historia de adopción'
  ),
  twitterImage: computed(() =>
    useOgImage(story.value?.images?.[0] || story.value?.pet?.image, baseUrl)
  ),
  twitterCard: 'summary_large_image',
  articlePublishedTime: computed(() => story.value?.createdAt),
  articleAuthor: computed(() => story.value?.user?.displayName || 'Adopta Zulia'),
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: computed(() => useCanonicalUrl(`/historias/${storyId}`)),
    },
  ],
  script: [
    computed(() => {
      if (!story.value) return {}
      return useStructuredData({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: story.value.title,
        image: story.value.images?.length ? [useOgImage(story.value.images[0])] : [],
        datePublished: story.value.createdAt
          ? new Date(story.value.createdAt).toISOString()
          : undefined,
        author: {
          '@type': 'Person',
          name: story.value.user?.displayName || 'Usuario',
        },
      })
    }),
    useStructuredData(
      createBreadcrumbSchema([
        { name: 'Inicio', url: useCanonicalUrl('/') },
        { name: 'Historias', url: useCanonicalUrl('/historias') },
        { name: story.value?.title || 'Historia', url: useCanonicalUrl(`/historias/${storyId}`) },
      ])
    ),
  ],
})

// Verificar si el usuario actual es propietario de la historia
const isOwner = computed(() => {
  if (!isAuthenticated.value || !story.value) return false
  return user.value?.uid === story.value.userId
})

// Formatear fecha
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return format(new Date(timestamp), 'dd MMMM yyyy', { locale: es })
}

// Manejar like
const handleLike = async () => {
  if (!isAuthenticated.value) {
    // Podríamos redirigir al login o mostrar un mensaje
    return
  }

  if (hasLiked.value) return // Evita múltiples likes

  try {
    await likeStory(storyId)
    hasLiked.value = true
    if (story.value) {
      story.value.likes = (story.value.likes || 0) + 1
    }
  } catch (error) {
    console.error('Error al dar like:', error)
  }
}

// Compartir historia
const shareStory = () => {
  showShareModal.value = true
}

// Eliminar historia
const deleteStoryHandler = async () => {
  if (!isOwner.value) return

  if (
    !confirm(
      '¿Estás seguro de que quieres eliminar esta historia? Esta acción no se puede deshacer.'
    )
  ) {
    return
  }

  try {
    console.log('[DELETE] Attempting to delete story', storyId, 'User:', user.value?.uid)
    if (user.value) {
      const success = await deleteStory(storyId, user.value.uid)
      if (success) {
        toast.success('Historia eliminada correctamente')
        router.push('/historias')
      } else {
        toast.error('No se pudo eliminar la historia')
      }
    }
  } catch (err) {
    console.error('Error al eliminar la historia:', err)
    toast.error('Error inesperado al eliminar')
  }
}

// Abrir galería de imágenes
const openGallery = (index) => {
  // Aquí podríamos implementar un visor de imágenes
}

// Cargar la historia al montar el componente
onMounted(async () => {
  try {
    const storyData = await fetchStoryById(storyId)
    if (storyData) {
      story.value = storyData

      // Verificar likes en localStorage
      const likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]')
      hasLiked.value = likedStories.includes(storyId)
    }
  } catch (error) {
    console.error('Error al cargar la historia:', error)
  }
})
</script>
