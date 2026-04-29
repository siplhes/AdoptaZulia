<template>
  <NuxtLink :to="`/comunidad/eventos/${evento.id}`" class="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-amber-200">
    <div class="relative h-48 sm:h-auto sm:w-2/5 overflow-hidden bg-gray-100 shrink-0">
      <NuxtImg
        v-if="evento.imageUrl"
        :src="evento.imageUrl"
        :alt="evento.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        width="400"
        height="300"
      />
      <div v-else class="flex h-full items-center justify-center bg-amber-50 text-amber-300">
        <Icon name="ph:calendar-star-duotone" class="h-16 w-16" />
      </div>
      
      <!-- Date Badge overlay -->
      <div class="absolute top-4 left-4 flex flex-col items-center justify-center rounded-xl bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
        <span class="text-xs font-bold uppercase tracking-wider text-amber-600">{{ monthString }}</span>
        <span class="text-xl font-black text-gray-900 leading-none">{{ dayString }}</span>
      </div>
    </div>
    
    <div class="flex flex-1 flex-col p-6">
      <div class="mb-2 flex items-center justify-between">
        <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', statusBadge.class]">
          {{ statusBadge.text }}
        </span>
        <span class="flex items-center text-xs font-medium text-gray-500">
          <Icon name="ph:users-duotone" class="mr-1 h-4 w-4" />
          {{ attendeesCount }} asistirán
        </span>
      </div>
      
      <h3 class="mb-2 text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
        {{ evento.title }}
      </h3>
      
      <p class="mb-4 flex-1 text-sm text-gray-600 line-clamp-2">
        {{ evento.description }}
      </p>
      
      <div class="mt-auto space-y-2">
        <div class="flex items-center text-sm text-gray-600">
          <Icon name="ph:clock-duotone" class="mr-2 h-5 w-5 text-amber-500 shrink-0" />
          <span class="truncate">{{ timeString }}</span>
        </div>
        <div class="flex items-center text-sm text-gray-600">
          <Icon name="ph:map-pin-duotone" class="mr-2 h-5 w-5 text-amber-500 shrink-0" />
          <span class="truncate">{{ evento.location }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, isFuture, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  evento: {
    type: Object,
    required: true,
  },
})

const eventDate = computed(() => {
  if (!props.evento.date) return null
  const d = new Date(props.evento.date)
  return isNaN(d.getTime()) ? null : d
})

const monthString = computed(() => {
  if (!eventDate.value) return ''
  return format(eventDate.value, 'MMM', { locale: es })
})

const dayString = computed(() => {
  if (!eventDate.value) return ''
  return format(eventDate.value, 'dd')
})

const timeString = computed(() => {
  if (!eventDate.value) return ''
  return format(eventDate.value, "EEEE d 'de' MMMM, h:mm a", { locale: es })
})

const statusBadge = computed(() => {
  if (!eventDate.value) {
    return { text: 'Próximamente', class: 'bg-amber-100 text-amber-800' }
  }
  if (isToday(eventDate.value)) {
    return { text: 'Hoy', class: 'bg-emerald-100 text-emerald-800' }
  } else if (isFuture(eventDate.value)) {
    return { text: 'Próximamente', class: 'bg-amber-100 text-amber-800' }
  } else {
    return { text: 'Finalizado', class: 'bg-gray-100 text-gray-600' }
  }
})

const attendeesCount = computed(() => {
  if (!props.evento.attendees) return 0
  return Object.keys(props.evento.attendees).length
})
</script>
