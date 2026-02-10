<template>
  <div
    :class="[
      'group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md',
      cardClass,
    ]"
  >
    <!-- Background decoration -->
    <div
      :class="[
        'absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full opacity-50 transition-transform group-hover:scale-110',
        bgColorClass,
      ]"
    />

    <div class="relative z-10">
      <!-- Header with icon and badge -->
      <div class="flex items-start justify-between">
        <div :class="['flex h-12 w-12 items-center justify-center rounded-xl', iconBgClass]">
          <Icon :name="icon" class="h-6 w-6" :class="iconColorClass" />
        </div>

        <!-- Badge/Notification -->
        <span
          v-if="badge"
          :class="[
            'rounded-full px-3 py-1 text-xs font-bold',
            badgeClass || 'bg-gray-100 text-gray-700',
          ]"
        >
          {{ badge }}
        </span>
      </div>

      <!-- Content -->
      <div class="mt-4">
        <h3 class="text-2xl font-bold text-gray-800">{{ value }}</h3>
        <p class="mt-1 text-sm font-medium text-gray-600">{{ label }}</p>
        <p v-if="description" class="mt-1 text-xs text-gray-400">{{ description }}</p>
      </div>

      <!-- Trend indicator -->
      <div v-if="trend" class="mt-3 flex items-center gap-2">
        <Icon
          :name="trend > 0 ? 'mdi:trending-up' : 'mdi:trending-down'"
          :class="[
            'h-4 w-4',
            trend > 0 ? 'text-green-500' : 'text-red-500',
          ]"
        />
        <span
          :class="[
            'text-sm font-semibold',
            trend > 0 ? 'text-green-600' : 'text-red-600',
          ]"
        >
          {{ Math.abs(trend) }}%
        </span>
        <span class="text-xs text-gray-400">vs mes anterior</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  badge: {
    type: [String, Number],
    default: null,
  },
  trend: {
    type: Number,
    default: null,
  },
  iconBgClass: {
    type: String,
    default: 'bg-emerald-100',
  },
  iconColorClass: {
    type: String,
    default: 'text-emerald-600',
  },
  bgColorClass: {
    type: String,
    default: 'bg-emerald-50',
  },
  badgeClass: {
    type: String,
    default: '',
  },
  cardClass: {
    type: String,
    default: '',
  },
})
</script>
