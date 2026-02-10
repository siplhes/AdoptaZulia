<template>
  <div
    class="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <NuxtImg
        :src="pet.image || pet.images?.[0] || '/placeholder.webp'"
        :alt="pet.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        sizes="sm:100vw md:50vw lg:33vw"
        placeholder
      />

      <!-- Overlay completo cuando la mascota está adoptada -->
      <div
        v-if="pet.status === 'adopted'"
        class="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
      >
        <div
          class="rotate-12 transform rounded-xl border-4 border-white bg-emerald-600 px-6 py-2 text-center font-bold text-white shadow-2xl"
        >
          <span class="block text-2xl uppercase tracking-widest">Adoptado</span>
          <span class="text-xs font-medium">¡Encontró hogar!</span>
        </div>
      </div>

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40"
      />

      <!-- Badges Container -->
      <div class="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between">
        <div class="flex flex-wrap gap-2">
          <span
            v-if="pet.gender"
            class="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-800 shadow-sm backdrop-blur-md"
          >
            <Icon
              :name="
                pet.gender === 'male' || pet.gender === 'macho'
                  ? 'ph:gender-male-bold'
                  : 'ph:gender-female-bold'
              "
              class="h-3.5 w-3.5"
              :class="
                pet.gender === 'male' || pet.gender === 'macho' ? 'text-blue-600' : 'text-pink-600'
              "
            />
            {{ pet.gender === 'male' || pet.gender === 'macho' ? 'Macho' : 'Hembra' }}
          </span>
          <span
            v-if="pet.age"
            class="rounded-lg bg-emerald-100/90 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-md"
          >
            {{ pet.age }}
          </span>
        </div>
      </div>

      <!-- Urgent Badge -->
      <div v-if="pet.urgent && pet.status !== 'adopted'" class="absolute right-3 top-3 z-10">
        <span
          class="animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-red-400"
        >
          URGENTE
        </span>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div class="mb-1 flex items-start justify-between">
        <h3
          class="line-clamp-1 text-xl font-bold text-gray-900 transition-colors group-hover:text-emerald-700"
        >
          {{ pet.name }}
        </h3>
        <button
          class="rounded-full p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          @click.prevent="$emit('toggle-favorite', pet.id)"
        >
          <Icon
            :name="isFavorite ? 'heroicons:heart-solid' : 'heroicons:heart'"
            class="h-6 w-6"
            :class="{ 'text-red-500': isFavorite }"
          />
        </button>
      </div>

      <div class="mb-4 flex items-center text-sm font-medium text-gray-500">
        <Icon name="heroicons:map-pin" class="mr-1 h-4 w-4 text-emerald-500" />
        <span class="truncate">{{ pet.location }}</span>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <span
          v-if="pet.size"
          class="rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-xs text-gray-600"
        >
          {{ pet.size }}
        </span>
        <span
          v-if="pet.vaccinated"
          class="rounded-md border border-green-100 bg-green-50 px-2 py-1 text-xs text-green-700"
        >
          Vacunado
        </span>
      </div>

      <div class="mb-5 flex-1">
        <p class="line-clamp-2 text-sm leading-relaxed text-gray-600">{{ pet.description }}</p>
      </div>

      <NuxtLink
        :to="linkTo"
        class="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-xl py-3 text-sm font-bold transition-all focus:ring-4 focus:ring-emerald-100 active:scale-[0.98]"
        :class="
          pet.status === 'adopted'
            ? 'cursor-default bg-gray-100 text-gray-400'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200'
        "
      >
        <span class="relative z-10">
          {{ pet.status === 'adopted' ? 'Adoptado' : 'Conocer más' }}
        </span>
        <div
          v-if="pet.status !== 'adopted'"
          class="group-hover/btn:animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  pet: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  basePath: {
    type: String,
    default: '/mascotas',
  },
})

defineEmits(['toggle-favorite'])

const linkTo = computed(() => `${props.basePath}/${props.pet.id}`)
</script>
