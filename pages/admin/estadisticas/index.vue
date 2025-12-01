<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Estadísticas</h1>
          <p class="text-gray-600">Visualiza métricas y analíticas de la plataforma</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin"
            class="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Volver al panel
          </NuxtLink>
        </div>
      </div>

      <!-- Error de carga -->
      <div v-if="error" class="mb-8 rounded-lg border border-red-200 bg-red-50 p-6 shadow-md">
        <div class="flex items-center">
          <Icon name="mdi:alert-circle" class="mr-3 h-5 w-5 text-red-500" />
          <h3 class="text-lg font-medium text-red-800">{{ error }}</h3>
        </div>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="mb-8 flex h-64 w-full items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <template v-else>
        <!-- Filter by period -->
        <div
          class="mb-6 flex flex-col rounded-lg bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="mb-4 sm:mb-0">
            <h2 class="text-lg font-medium text-gray-900">Período de análisis</h2>
            <p class="text-sm text-gray-500">Selecciona el período para ver las estadísticas</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="period in periods"
              :key="period.value"
              :class="[
                'rounded-md px-4 py-2 text-sm font-medium',
                currentPeriod === period.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
              @click="selectPeriod(period.value)"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <!-- Summary stats -->
        <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div class="rounded-lg bg-white p-6 shadow-md">
            <div class="mb-2 flex items-center">
              <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <Icon name="mdi:paw" class="h-4 w-4 text-emerald-600" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Mascotas</h3>
            </div>
            <div class="flex items-baseline justify-between">
              <p class="text-3xl font-bold text-emerald-600">{{ stats.totalPets }}</p>
              <p class="text-sm text-gray-500">Total</p>
            </div>
            <div class="mt-4 h-1 w-full bg-gray-200">
              <div
                class="h-1 bg-emerald-600"
                :style="{ width: `${(stats.totalPets / 100) * 100}%` }"
              />
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-500">
              <span>Meta: 100</span>
              <span>{{ Math.round((stats.totalPets / 100) * 100) }}%</span>
            </div>
          </div>

          <div class="rounded-lg bg-white p-6 shadow-md">
            <div class="mb-2 flex items-center">
              <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                <Icon name="heroicons:heart" class="h-4 w-4 text-amber-600" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Adopciones</h3>
            </div>
            <div class="flex items-baseline justify-between">
              <p class="text-3xl font-bold text-amber-600">{{ stats.totalAdoptions }}</p>
              <p class="text-sm text-gray-500">Completadas</p>
            </div>
            <div class="mt-4 h-1 w-full bg-gray-200">
              <div
                class="h-1 bg-amber-600"
                :style="{ width: `${(stats.totalAdoptions / 50) * 100}%` }"
              />
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-500">
              <span>Meta: 50</span>
              <span>{{ Math.round((stats.totalAdoptions / 50) * 100) }}%</span>
            </div>
          </div>

          <div class="rounded-lg bg-white p-6 shadow-md">
            <div class="mb-2 flex items-center">
              <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Icon name="heroicons:users" class="h-4 w-4 text-blue-600" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Usuarios</h3>
            </div>
            <div class="flex items-baseline justify-between">
              <p class="text-3xl font-bold text-blue-600">{{ stats.totalUsers }}</p>
              <p class="text-sm text-gray-500">Registrados</p>
            </div>
            <div class="mt-4 h-1 w-full bg-gray-200">
              <div
                class="h-1 bg-blue-600"
                :style="{ width: `${(stats.totalUsers / 200) * 100}%` }"
              />
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-500">
              <span>Meta: 200</span>
              <span>{{ Math.round((stats.totalUsers / 200) * 100) }}%</span>
            </div>
          </div>

          <div class="rounded-lg bg-white p-6 shadow-md">
            <div class="mb-2 flex items-center">
              <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Icon name="heroicons:bell-alert" class="h-4 w-4 text-purple-600" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Solicitudes</h3>
            </div>
            <div class="flex items-baseline justify-between">
              <p class="text-3xl font-bold text-purple-600">{{ stats.pendingRequests }}</p>
              <p class="text-sm text-gray-500">Pendientes</p>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-1">
              <div
                class="h-1 bg-yellow-500"
                :style="{ width: `${stats.requestDistribution.pending}%` }"
              />
              <div
                class="h-1 bg-green-500"
                :style="{ width: `${stats.requestDistribution.approved}%` }"
              />
              <div
                class="h-1 bg-red-500"
                :style="{ width: `${stats.requestDistribution.rejected}%` }"
              />
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-500">
              <span>{{ stats.requestDistribution.pending }}% pendientes</span>
              <span>{{ stats.requestDistribution.approved }}% aprobadas</span>
              <span>{{ stats.requestDistribution.rejected }}% rechazadas</span>
            </div>
          </div>

          <div class="rounded-lg bg-white p-6 shadow-md">
            <div class="mb-2 flex items-center">
              <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <Icon name="heroicons:exclamation-triangle" class="h-4 w-4 text-red-600" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Perdidos</h3>
            </div>
            <div class="flex items-baseline justify-between">
              <p class="text-3xl font-bold text-red-600">{{ stats.totalLostPets }}</p>
              <p class="text-sm text-gray-500">Reportes</p>
            </div>
            <div class="mt-4 h-1 w-full bg-gray-200">
              <div class="h-1 bg-red-600" :style="{ width: `${Math.min(100, stats.lostFoundRate)}%` }" />
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-500">
              <span>Encontrados: {{ stats.lostFoundRate }}%</span>
              <span>Altas recomp.: {{ stats.highRewardCount }}</span>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Adoption Trends Chart -->
          <div class="rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 text-lg font-medium text-gray-900">Tendencia de adopciones</h3>
            <div class="h-64 w-full">
              <!-- Chart placeholder - in a real app, you'd use a charting library like Chart.js -->
              <div class="flex h-full w-full flex-col justify-between">
                <div class="flex h-full flex-col justify-end">
                  <div class="grid h-full grid-cols-6 items-end gap-4">
                    <div
                      v-for="(item, index) in adoptionTrends"
                      :key="index"
                      class="relative flex flex-col items-center"
                    >
                      <div
                        class="w-full rounded-t-sm bg-emerald-500"
                        :style="{ height: `${(item.value / maxAdoptionTrend) * 100}%` }"
                      />
                      <span class="mt-2 text-xs text-gray-500">{{ item.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pet Distribution Chart -->
          <div class="rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 text-lg font-medium text-gray-900">Distribución por tipo de mascota</h3>
            <div class="grid h-64 grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Pie chart placeholder -->
              <div class="relative flex items-center justify-center">
                <svg class="h-40 w-40" viewBox="0 0 100 100">
                  <!-- Crear segmentos dinámicos basados en los datos -->
                  <template v-for="(item, index) in pieChartSegments" :key="index">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      :stroke="item.color"
                      stroke-width="20"
                      :stroke-dasharray="`${item.dashArray} 251.2`"
                      :stroke-dashoffset="item.dashOffset"
                      transform="rotate(-90) translate(-100, 0)"
                    />
                  </template>
                </svg>
              </div>

              <!-- Legend -->
              <div class="flex flex-col justify-center space-y-4">
                <div v-for="item in petDistribution" :key="item.type" class="flex items-center">
                  <div class="mr-2 h-4 w-4 rounded-full" :style="{ backgroundColor: item.color }" />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ item.type }}</p>
                    <p class="text-xs text-gray-500">
                      {{ item.count }} mascotas ({{ item.percentage }}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- User Activity Chart -->
          <div class="rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 text-lg font-medium text-gray-900">Actividad de usuarios</h3>
            <div class="h-64 w-full">
              <!-- Line chart placeholder -->
              <div class="flex h-full flex-col justify-between">
                <div class="relative h-full">
                  <!-- Grid lines -->
                  <div class="absolute inset-0 grid grid-rows-4 gap-4">
                    <div class="border-t border-gray-200" />
                    <div class="border-t border-gray-200" />
                    <div class="border-t border-gray-200" />
                    <div class="border-t border-gray-200" />
                  </div>

                  <!-- Line graph -->
                  <svg class="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      stroke-width="2"
                      points="0,80 50,60 100,65 150,40 200,30 250,45 300,20"
                      vector-effect="non-scaling-stroke"
                    />
                  </svg>

                  <!-- Data points -->
                  <div class="absolute inset-0 flex justify-between">
                    <div class="flex h-full flex-col items-center justify-end" style="height: 20%">
                      <div class="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div class="flex h-full flex-col items-center justify-end" style="height: 40%">
                      <div class="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div class="flex h-full flex-col items-center justify-end" style="height: 35%">
                      <div class="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div class="flex h-full flex-col items-center justify-end" style="height: 60%">
                      <div class="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div class="flex h-full flex-col items-center justify-end" style="height: 70%">
                      <div class="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div class="flex h-full flex-col items-center justify-end" style="height: 55%">
                      <div class="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div class="flex h-full flex-col items-center justify-end" style="height: 80%">
                      <div class="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                  </div>
                </div>

                <!-- X-axis labels -->
                <div class="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Success Rate Chart -->
          <div class="rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 text-lg font-medium text-gray-900">Tasa de éxito de adopciones</h3>

            <div class="flex items-center justify-center">
              <div class="relative h-40 w-40">
                <!-- Progress circle -->
                <svg class="h-40 w-40" viewBox="0 0 100 100">
                  <!-- Background circle -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#e5e7eb"
                    stroke-width="10"
                  />
                  <!-- Progress circle -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    stroke-width="10"
                    :stroke-dasharray="251.2"
                    :stroke-dashoffset="251.2 - (251.2 * stats.adoptionSuccess) / 100"
                    transform="rotate(-90) translate(-100, 0)"
                  />
                </svg>

                <!-- Percentage text -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl font-bold text-gray-900">{{ stats.adoptionSuccess }}%</span>
                  <span class="text-sm text-gray-500">Tasa de éxito</span>
                </div>
              </div>
            </div>

            <!-- Success rate details -->
            <div class="mt-6 grid grid-cols-3 gap-4">
              <div class="rounded-md bg-gray-50 p-3 text-center">
                <p class="text-xs text-gray-500">Solicitudes</p>
                <p class="text-lg font-semibold text-gray-900">120</p>
              </div>
              <div class="rounded-md bg-gray-50 p-3 text-center">
                <p class="text-xs text-gray-500">Aprobadas</p>
                <p class="text-lg font-semibold text-green-600">90</p>
              </div>
              <div class="rounded-md bg-gray-50 p-3 text-center">
                <p class="text-xs text-gray-500">Rechazadas</p>
                <p class="text-lg font-semibold text-red-600">30</p>
              </div>
            </div>
          </div>
        </div>

        <!-- More detailed stats table -->
        <div class="mt-6 rounded-lg bg-white p-6 shadow-md">
          <h3 class="mb-4 text-lg font-medium text-gray-900">Estadísticas detalladas</h3>

          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Métrica
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Actual
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Meta
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="(item, index) in detailedStats" :key="index">
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                  >
                    {{ item.metric }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ item.actual }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ item.target }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="flex items-center">
                      <div class="mr-2 h-2 w-20 rounded-full bg-gray-200">
                        <div
                          class="h-2 rounded-full bg-emerald-600"
                          :style="{ width: `${Math.min(100, (item.actual / item.target) * 100)}%` }"
                        />
                      </div>
                      <span>{{ Math.round((item.actual / item.target) * 100) }}%</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useStats } from '~/composables/useStats'

// Verificar si el usuario es administrador
definePageMeta({
  middleware: ['admin'],
})

// Períodos disponibles para filtrar
const periods = [
  { label: 'Últimos 7 días', value: '7days' },
  { label: 'Último mes', value: 'month' },
  { label: 'Último trimestre', value: 'quarter' },
  { label: 'Este año', value: 'year' },
]

// Período seleccionado
const currentPeriod = ref('month')

// Obtener estadísticas usando el composable
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

// Calcular segmentos para el gráfico circular
const pieChartSegments = computed(() => {
  // Calcular total del círculo (circunferencia)
  const totalCircumference = 251.2 // 2 * PI * r, donde r=40
  let dashOffset = 0

  return petDistribution.value.map((pet) => {
    // Calcular el arco para este segmento
    const dashArray = (pet.percentage / 100) * totalCircumference

    // Crear segmento
    const segment = {
      color: pet.color,
      dashArray,
      dashOffset: -dashOffset,
    }

    // Actualizar offset para el siguiente segmento
    dashOffset += dashArray

    return segment
  })
})

// Cargar estadísticas cuando cambia el período
async function selectPeriod(period) {
  currentPeriod.value = period
  await fetchStats(period)
}

// Cargar estadísticas al montar el componente
onMounted(async () => {
  await fetchStats(currentPeriod.value)
})
</script>
