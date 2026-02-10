<template>
  <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
    <div class="border-b border-gray-100 px-6 py-4">
      <h3 class="text-lg font-bold text-gray-800">Actividad Reciente</h3>
      <p class="text-sm text-gray-500">Últimas acciones en el sistema</p>
    </div>

    <div class="max-h-96 overflow-y-auto p-6">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <div v-else-if="activities.length === 0" class="py-8 text-center text-gray-400">
        <Icon name="mdi:timeline-clock-outline" class="mx-auto mb-2 h-12 w-12" />
        <p>No hay actividad reciente</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(activity, index) in activities"
          :key="index"
          class="flex gap-4"
        >
          <!-- Icon -->
          <div :class="['flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full', getIconBg(activity.type)]">
            <Icon :name="getIcon(activity.type)" class="h-5 w-5" :class="getIconColor(activity.type)" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">{{ activity.title }}</p>
            <p class="text-xs text-gray-500">{{ activity.description }}</p>
            <p class="mt-1 text-xs text-gray-400">{{ formatTime(activity.timestamp) }}</p>
          </div>

          <!-- Badge -->
          <div v-if="activity.badge" :class="['flex-shrink-0 rounded-full px-2 py-1 text-xs font-semibold', getBadgeClass(activity.type)]">
            {{ activity.badge }}
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-100 px-6 py-3">
      <button class="text-sm font-medium text-emerald-600 hover:text-emerald-700">
        Ver toda la actividad →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const getIcon = (type) => {
  const icons = {
    adoption: 'mdi:handshake',
    pet: 'mdi:paw',
    user: 'mdi:account',
    lost: 'mdi:map-marker-alert',
    story: 'mdi:heart',
    report: 'mdi:flag',
    system: 'mdi:cog',
  }
  return icons[type] || 'mdi:information'
}

const getIconBg = (type) => {
  const colors = {
    adoption: 'bg-amber-100',
    pet: 'bg-emerald-100',
    user: 'bg-blue-100',
    lost: 'bg-red-100',
    story: 'bg-pink-100',
    report: 'bg-orange-100',
    system: 'bg-gray-100',
  }
  return colors[type] || 'bg-gray-100'
}

const getIconColor = (type) => {
  const colors = {
    adoption: 'text-amber-600',
    pet: 'text-emerald-600',
    user: 'text-blue-600',
    lost: 'text-red-600',
    story: 'text-pink-600',
    report: 'text-orange-600',
    system: 'text-gray-600',
  }
  return colors[type] || 'text-gray-600'
}

const getBadgeClass = (type) => {
  const colors = {
    adoption: 'bg-amber-100 text-amber-700',
    pet: 'bg-emerald-100 text-emerald-700',
    user: 'bg-blue-100 text-blue-700',
    lost: 'bg-red-100 text-red-700',
    story: 'bg-pink-100 text-pink-700',
    report: 'bg-orange-100 text-orange-700',
    system: 'bg-gray-100 text-gray-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  try {
    const date = new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true, locale: es })
  } catch (error) {
    return ''
  }
}
</script>
