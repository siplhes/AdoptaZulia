<template>
  <div class="mt-8">
    <h2 class="mb-4 flex items-center text-xl font-bold text-gray-900">
      <Icon name="heroicons:heart" class="mr-2 h-6 w-6 text-rose-500" />
      Salud
    </h2>

    <div v-if="healthStatus" class="mb-4">
      <div class="mb-1 flex justify-between text-sm font-medium">
        <span>Estado General</span>
        <span :class="getHealthColorText(healthStatus)">
          {{ getHealthLabel(healthStatus) }}
        </span>
      </div>
      <div class="h-2.5 w-full rounded-full bg-gray-100">
        <div
          class="h-2.5 rounded-full transition-all duration-1000"
          :class="getHealthColor(healthStatus)"
          :style="{ width: `${healthStatus}%` }"
        />
      </div>
    </div>

    <p v-if="healthDescription" class="rounded-xl border border-rose-100 bg-rose-50 p-4 text-gray-700">
      {{ healthDescription }}
    </p>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="flex items-center rounded-lg bg-gray-50 p-3">
        <Icon
          :name="vaccinated ? 'heroicons:check-circle' : 'heroicons:x-circle'"
          class="mr-3 h-5 w-5"
          :class="vaccinated ? 'text-green-500' : 'text-gray-400'"
        />
        <div>
          <span class="block text-sm font-medium text-gray-900">Vacunado</span>
          <span v-if="vaccineInfo" class="text-xs text-gray-500">
            {{ vaccineInfo }}
          </span>
        </div>
      </div>
      <div class="flex items-center rounded-lg bg-gray-50 p-3">
        <Icon
          :name="neutered ? 'heroicons:check-circle' : 'heroicons:x-circle'"
          class="mr-3 h-5 w-5"
          :class="neutered ? 'text-green-500' : 'text-gray-400'"
        />
        <div>
          <span class="block text-sm font-medium text-gray-900">Esterilizado</span>
          <span v-if="neuterDate" class="text-xs text-gray-500">
            {{ neuterDate }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  healthStatus: Number,
  healthDescription: String,
  vaccinated: Boolean,
  vaccineInfo: String,
  neutered: Boolean,
  neuterDate: String,
})

const getHealthLabel = (val) => {
  if (val > 80) return 'Excelente'
  if (val > 50) return 'Bueno'
  return 'Requiere Atención'
}

const getHealthColor = (val) => {
  if (val > 80) return 'bg-green-500'
  if (val > 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getHealthColorText = (val) => {
  if (val > 80) return 'text-green-600'
  if (val > 50) return 'text-yellow-600'
  return 'text-red-600'
}
</script>
