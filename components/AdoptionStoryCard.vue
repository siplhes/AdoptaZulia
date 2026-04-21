<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-sm">
    <!-- Imagen de la historia si existe -->
    <div v-if="story.images && story.images.length > 0" class="h-48 w-full overflow-hidden">
      <NuxtImg
        :src="story.images[0]"
        :alt="story.title"
        class="h-full w-full transform object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>

    <!-- Información de la mascota adoptada -->
    <div v-if="story.pet" class="flex items-center bg-emerald-50 p-3">
      <div class="mr-3 h-12 w-12 overflow-hidden rounded-full">
        <NuxtImg
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
            <NuxtImg
              v-if="story.user?.photoURL"
              :src="story.user?.photoURL"
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
import { ref, computed } from 'vue'

const props = defineProps({
  story: {
    type: Object,
    required: true,
  },
})

</script>
