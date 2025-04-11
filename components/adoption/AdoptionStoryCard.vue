<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-sm">
    <!-- Imagen de la historia si existe -->
    <div v-if="story.images && story.images.length > 0" class="h-48 w-full overflow-hidden">
      <img
        :src="story.images[0]"
        :alt="story.title"
        class="h-full w-full transform object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>

    <!-- Información de la mascota adoptada -->
    <div v-if="story.pet" class="flex items-center bg-emerald-50 p-3">
      <div class="mr-3 h-12 w-12 overflow-hidden rounded-full">
        <img
          v-if="story.pet.image"
          :src="story.pet.image"
          :alt="story.pet.name"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center bg-emerald-100">
          <Icon name="ph:paw-print" class="text-emerald-500" size="20px" />
        </div>
      </div>
      <div>
        <h3 class="font-medium text-emerald-800">{{ story.pet.name }}</h3>
        <p class="text-xs text-emerald-600">{{ story.pet.type }} • {{ story.pet.breed }}</p>
      </div>
    </div>

    <!-- Contenido de la historia -->
    <div class="p-5">
      <h2 class="mb-3 text-xl font-semibold text-gray-800">{{ story.title }}</h2>

      <p class="mb-4 line-clamp-3 text-gray-600">
        {{ story.content }}
      </p>

      <!-- Autor de la historia -->
      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center">
          <div class="mr-2 h-8 w-8 overflow-hidden rounded-full">
            <img
              v-if="story.user?.photoURL"
              :src="story.user.photoURL"
              :alt="story.user.displayName"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-emerald-100">
              <span class="text-xs font-semibold text-emerald-600">
                {{ story.user?.displayName?.charAt(0).toUpperCase() || 'U' }}
              </span>
            </div>
          </div>
          <span class="text-sm text-gray-600">
            {{ story.user?.displayName || 'Usuario' }}
          </span>
        </div>

        <!-- Contador de likes -->
        <div class="flex items-center text-gray-500">
          <button
            @click="handleLike"
            class="flex items-center space-x-1 text-gray-500 hover:text-emerald-600"
            :class="{ 'text-emerald-600': hasLiked }"
          >
            <Icon name="mdi:heart" size="20px" />
            <span>{{ story.likes || 0 }}</span>
          </button>
        </div>
      </div>

      <!-- Link para leer más -->
      <div class="mt-5 text-right">
        <NuxtLink
          :to="`/historias/${story.id}`"
          class="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800"
        >
          Leer historia completa
          <Icon name="heroicons:arrow-right" class="ml-1" size="16px" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAdoptionStories } from '~/composables/useAdoptionStories'
import { useAuth } from '~/composables/useAuth'

const props = defineProps({
  story: {
    type: Object,
    required: true,
  },
})

const { likeStory } = useAdoptionStories()
const { isAuthenticated } = useAuth()
const hasLiked = ref(false)

const handleLike = async () => {
  if (!isAuthenticated.value) {
    // Podríamos redirigir al login o mostrar un mensaje
    return
  }

  if (hasLiked.value) return // Evita múltiples likes

  try {
    await likeStory(props.story.id)
    hasLiked.value = true
    props.story.likes++ // Actualiza la UI inmediatamente
  } catch (error) {
    console.error('Error al dar like:', error)
  }
}
</script>
