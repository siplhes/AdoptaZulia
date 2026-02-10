<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Estadísticas</h1>
          <p class="text-gray-600">Visión general del rendimiento de la plataforma</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Period Selector (Pill style) -->
          <div
            class="flex overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
          >
            <button
              v-for="period in periods"
              :key="period.value"
              :class="[
                'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                currentPeriod === period.value
                  ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              ]"
              @click="selectPeriod(period.value)"
            >
              {{ period.label }}
            </button>
          </div>

          <NuxtLink
            to="/admin"
            class="hidden items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-gray-600 transition-colors hover:bg-white hover:text-emerald-600 sm:flex"
          >
            Volver
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-red-100 bg-red-50 p-6 text-center shadow-sm"
      >
        <Icon name="heroicons:exclamation-circle" class="mx-auto mb-2 h-12 w-12 text-red-400" />
        <h3 class="text-lg font-bold text-red-900">Error al cargar datos</h3>
        <p class="text-red-700">{{ error }}</p>
      </div>

      <template v-else>
        <!-- KPI Cards -->
        <div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Pets KPI -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div
              class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-50 transition-all group-hover:scale-150"
            />
            <div class="relative flex items-center justify-between">
              <div>
                <p class="text-sm font-bold uppercase text-gray-400">Total Mascotas</p>
                <h3 class="mt-1 text-3xl font-black text-gray-800">{{ stats.totalPets }}</h3>
              </div>
              <div class="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                <Icon name="mdi:paw" class="h-6 w-6" />
              </div>
            </div>
            <div class="mt-4 flex items-center text-xs font-medium text-emerald-600">
              <Icon name="heroicons:arrow-trending-up" class="mr-1 h-3 w-3" />
              <span>{{ Math.round((stats.totalPets / 100) * 100) }}% de la meta</span>
            </div>
            <!-- Progress Bar -->
            <div class="mt-3 h-1.5 w-full rounded-full bg-gray-100">
              <div
                class="h-1.5 rounded-full bg-emerald-500 transition-all duration-1000"
                :style="{ width: `${(stats.totalPets / 100) * 100}%` }"
              />
            </div>
          </div>

          <!-- Adoptions KPI -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div
              class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-50 transition-all group-hover:scale-150"
            />
            <div class="relative flex items-center justify-between">
              <div>
                <p class="text-sm font-bold uppercase text-gray-400">Adopciones</p>
                <h3 class="mt-1 text-3xl font-black text-gray-800">{{ stats.totalAdoptions }}</h3>
              </div>
              <div class="rounded-xl bg-amber-100 p-3 text-amber-600">
                <Icon name="heroicons:home-modern" class="h-6 w-6" />
              </div>
            </div>
            <div class="mt-4 flex items-center text-xs font-medium text-amber-600">
              <Icon name="heroicons:sparkles" class="mr-1 h-3 w-3" />
              <span>{{ stats.totalAdoptions }} hogares felices</span>
            </div>
            <div class="mt-3 h-1.5 w-full rounded-full bg-gray-100">
              <div
                class="h-1.5 rounded-full bg-amber-500 transition-all duration-1000"
                :style="{ width: `${(stats.totalAdoptions / 50) * 100}%` }"
              />
            </div>
          </div>

          <!-- Users KPI -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div
              class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 transition-all group-hover:scale-150"
            />
            <div class="relative flex items-center justify-between">
              <div>
                <p class="text-sm font-bold uppercase text-gray-400">Usuarios</p>
                <h3 class="mt-1 text-3xl font-black text-gray-800">{{ stats.totalUsers }}</h3>
              </div>
              <div class="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Icon name="heroicons:users" class="h-6 w-6" />
              </div>
            </div>
            <div class="mt-4 flex items-center text-xs font-medium text-blue-600">
              <Icon name="heroicons:user-plus" class="mr-1 h-3 w-3" />
              <span>Comunidad creciendo</span>
            </div>
            <div class="mt-3 h-1.5 w-full rounded-full bg-gray-100">
              <div
                class="h-1.5 rounded-full bg-blue-500 transition-all duration-1000"
                :style="{ width: `${(stats.totalUsers / 200) * 100}%` }"
              />
            </div>
          </div>

          <!-- Requests KPI -->
          <div
            class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div
              class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-50 transition-all group-hover:scale-150"
            />
            <div class="relative flex items-center justify-between">
              <div>
                <p class="text-sm font-bold uppercase text-gray-400">Solicitudes</p>
                <h3 class="mt-1 text-3xl font-black text-gray-800">{{ stats.pendingRequests }}</h3>
              </div>
              <div class="rounded-xl bg-purple-100 p-3 text-purple-600">
                <Icon name="heroicons:inbox-arrow-down" class="h-6 w-6" />
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2 text-xs font-medium">
              <span class="rounded bg-yellow-50 px-2 py-0.5 text-yellow-600">
                {{ stats.requestDistribution.pending }}% Pend.
              </span>
              <span class="rounded bg-green-50 px-2 py-0.5 text-green-600">
                {{ stats.requestDistribution.approved }}% Aprob.
              </span>
            </div>
            <div class="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                class="h-full bg-yellow-400"
                :style="{ width: `${stats.requestDistribution.pending}%` }"
              ></div>
              <div
                class="h-full bg-green-400"
                :style="{ width: `${stats.requestDistribution.approved}%` }"
              ></div>
              <div
                class="h-full bg-red-400"
                :style="{ width: `${stats.requestDistribution.rejected}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Adoption Trends (Bar Chart Visualization) -->
          <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 class="mb-6 text-lg font-bold text-gray-800">Tendencia de Adopciones</h3>
            <div class="flex h-64 items-end justify-between gap-2">
              <div
                v-for="(item, index) in adoptionTrends"
                :key="index"
                class="group relative flex w-full flex-col justify-end"
              >
                <!-- Tooltip -->
                <div
                  class="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {{ item.value }}
                </div>

                <div
                  class="w-full rounded-t-lg bg-emerald-100 transition-all duration-500 group-hover:bg-emerald-500"
                  :style="{ height: `${Math.max((item.value / maxAdoptionTrend) * 100, 5)}%` }"
                ></div>
                <span class="mt-2 text-center text-[10px] font-medium text-gray-400 sm:text-xs">
                  {{ item.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Pet Distribution (Donut Chart) -->
          <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 class="mb-6 text-lg font-bold text-gray-800">Distribución por Especie</h3>
            <div class="flex flex-col items-center sm:flex-row sm:justify-around">
              <!-- SVG Donut Chart -->
              <div class="relative h-48 w-48">
                <svg class="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="12" />
                  <!-- Segments -->
                  <circle
                    v-for="(segment, index) in pieChartSegments"
                    :key="index"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    :stroke="segment.color"
                    stroke-width="12"
                    :stroke-dasharray="`${segment.dashArray} 251.2`"
                    :stroke-dashoffset="segment.dashOffset"
                    stroke-linecap="round"
                    class="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-bold text-gray-800">{{ stats.totalPets }}</span>
                  <span class="text-xs text-gray-500">Total</span>
                </div>
              </div>

              <!-- Legend -->
              <div class="mt-6 flex flex-col gap-3 sm:mt-0">
                <div
                  v-for="item in petDistribution"
                  :key="item.type"
                  class="flex items-center gap-3"
                >
                  <span
                    class="h-3 w-3 rounded-full"
                    :style="{ backgroundColor: item.color }"
                  ></span>
                  <div>
                    <p class="text-sm font-bold capitalize text-gray-700">{{ item.type }}</p>
                    <p class="text-xs text-gray-400">{{ item.count }} ({{ item.percentage }}%)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Stats Table (Modernized) -->
        <div class="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div class="border-b border-gray-50 px-6 py-5">
            <h3 class="text-lg font-bold text-gray-800">Métricas Detalladas</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th class="px-6 py-3 font-semibold">Métrica</th>
                  <th class="px-6 py-3 font-semibold">Actual</th>
                  <th class="px-6 py-3 font-semibold">Objetivo</th>
                  <th class="px-6 py-3 font-semibold">Progreso</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(item, index) in detailedStats" :key="index" class="hover:bg-gray-50/50">
                  <td class="px-6 py-4 font-medium text-gray-900">{{ item.metric }}</td>
                  <td class="px-6 py-4">{{ item.actual }}</td>
                  <td class="px-6 py-4 text-gray-400">{{ item.target }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-1.5 w-24 rounded-full bg-gray-100">
                        <div
                          class="h-1.5 rounded-full bg-emerald-500"
                          :style="{ width: `${Math.min(100, (item.actual / item.target) * 100)}%` }"
                        ></div>
                      </div>
                      <span class="text-xs font-bold text-emerald-600">
                        {{ Math.round((item.actual / item.target) * 100) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStats } from '~/composables/useStats'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

const periods = [
  { label: '7 Días', value: '7days' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
]

const currentPeriod = ref('month')

const {
  stats,
  loading,
  error,
  adoptionTrends,
  petDistribution,
  detailedStats,
  maxAdoptionTrend,
  fetchStats,
} = useStats()

const pieChartSegments = computed(() => {
  const totalCircumference = 251.2
  let dashOffset = 0
  return petDistribution.value.map((pet) => {
    const dashArray = (pet.percentage / 100) * totalCircumference
    const segment = {
      color: pet.color,
      dashArray,
      dashOffset: -dashOffset,
    }
    dashOffset += dashArray
    return segment
  })
})

async function selectPeriod(period) {
  currentPeriod.value = period
  await fetchStats(period)
}

onMounted(async () => {
  await fetchStats(currentPeriod.value)
})
</script>
