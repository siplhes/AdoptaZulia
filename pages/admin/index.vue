<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Hola, <span class="text-emerald-600">{{ user?.displayName || 'Admin' }}</span> 👋
        </h1>
        <p class="mt-1 text-gray-600">
          Tienes
          <span class="font-semibold text-amber-600">{{ stats.pendingRequests }} solicitudes pendientes</span>
          hoy
        </p>
      </div>
      <div class="text-sm text-gray-500">
        {{ currentDate }}
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <AdminDashboardCard
        icon="mdi:paw"
        :value="stats.totalPets"
        label="Total Mascotas"
        description="Publicaciones activas"
        :badge="stats.urgentPets ? `${stats.urgentPets} urgentes` : null"
        badge-class="bg-amber-100 text-amber-700"
        icon-bg-class="bg-emerald-100"
        icon-color-class="text-emerald-600"
        bg-color-class="bg-emerald-50"
        :trend="12"
      />

      <AdminDashboardCard
        icon="mdi:handshake"
        :value="stats.totalAdoptions"
        label="Adopciones"
        description="Total completadas"
        icon-bg-class="bg-amber-100"
        icon-color-class="text-amber-600"
        bg-color-class="bg-amber-50"
        :trend="8"
      />

      <AdminDashboardCard
        icon="mdi:account-group"
        :value="stats.totalUsers"
        label="Usuarios"
        description="Registrados en plataforma"
        icon-bg-class="bg-blue-100"
        icon-color-class="text-blue-600"
        bg-color-class="bg-blue-50"
        :trend="15"
      />

      <AdminDashboardCard
        icon="mdi:map-marker-alert"
        :value="stats.totalLostPets || 0"
        label="Mascotas Perdidas"
        description="Reportes activos"
        :badge="lostFoundRate"
        badge-class="bg-green-100 text-green-700"
        icon-bg-class="bg-red-100"
        icon-color-class="text-red-600"
        bg-color-class="bg-red-50"
      />
    </div>

    <!-- Quick Actions -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        to="/admin/mascotas"
        class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <Icon name="mdi:plus" class="h-5 w-5" />
        </div>
        <div>
          <p class="font-semibold text-gray-800">Nueva Mascota</p>
          <p class="text-xs text-gray-500">Publicar para adopción</p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/admin/adopciones"
        class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <Icon name="mdi:clipboard-check" class="h-5 w-5" />
        </div>
        <div>
          <p class="font-semibold text-gray-800">Revisar Solicitudes</p>
          <p class="text-xs text-gray-500">{{ stats.pendingRequests }} pendientes</p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/admin/usuarios"
        class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <Icon name="mdi:account-plus" class="h-5 w-5" />
        </div>
        <div>
          <p class="font-semibold text-gray-800">Gestionar Usuarios</p>
          <p class="text-xs text-gray-500">Roles y permisos</p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/admin/estadisticas"
        class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
          <Icon name="mdi:chart-line" class="h-5 w-5" />
        </div>
        <div>
          <p class="font-semibold text-gray-800">Ver Analíticas</p>
          <p class="text-xs text-gray-500">Reportes detallados</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Charts Section -->
    <div class="grid gap-6 lg:grid-cols-2">
      <AdminStatChart
        title="Tendencias de Adopción"
        type="line"
        :data="adoptionTrendsData"
        :options="lineChartOptions"
        show-period-selector
        @period-change="handlePeriodChange"
      />

      <AdminStatChart
        title="Distribución de Mascotas"
        type="doughnut"
        :data="petDistributionData"
        :options="doughnutOptions"
        height="300px"
      />
    </div>

    <!-- Activity Timeline -->
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <AdminActivityTimeline
          :activities="recentActivities"
          :loading="loadingActivities"
        />
      </div>

      <!-- Stats Summary -->
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-lg font-bold text-gray-800">Resumen del Sistema</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Tasa de Éxito</span>
            <span class="font-bold text-emerald-600">{{ stats.adoptionSuccess }}%</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              class="h-full bg-emerald-500 transition-all duration-500"
              :style="{ width: `${stats.adoptionSuccess}%` }"
            />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Solicitudes Aprobadas</span>
            <span class="font-bold text-blue-600">{{ requestApprovedPercentage }}%</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              class="h-full bg-blue-500 transition-all duration-500"
              :style="{ width: `${requestApprovedPercentage}%` }"
            />
          </div>

          <div class="mt-6 space-y-2">
            <div class="flex items-center justify-between rounded-lg bg-amber-50 p-3">
              <div class="flex items-center gap-2">
                <Icon name="mdi:clock-outline" class="h-5 w-5 text-amber-600" />
                <span class="text-sm font-medium text-amber-900">Pendientes</span>
              </div>
              <span class="font-bold text-amber-600">
                {{ stats.requestDistribution?.pending || 0 }}
              </span>
            </div>

            <div class="flex items-center justify-between rounded-lg bg-green-50 p-3">
              <div class="flex items-center gap-2">
                <Icon name="mdi:check-circle" class="h-5 w-5 text-green-600" />
                <span class="text-sm font-medium text-green-900">Aprobadas</span>
              </div>
              <span class="font-bold text-green-600">
                {{ stats.requestDistribution?.approved || 0 }}
              </span>
            </div>

            <div class="flex items-center justify-between rounded-lg bg-red-50 p-3">
              <div class="flex items-center gap-2">
                <Icon name="mdi:close-circle" class="h-5 w-5 text-red-600" />
                <span class="text-sm font-medium text-red-900">Rechazadas</span>
              </div>
              <span class="font-bold text-red-600">
                {{ stats.requestDistribution?.rejected || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '~/composables/useAuth'
import { useStats } from '~/composables/useStats'

// Set layout and middleware
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

const { user } = useAuth()
const { stats, loading, fetchStats, adoptionTrends, petDistribution } = useStats()

const loadingActivities = ref(false)
const selectedPeriod = ref('month')

// Computed
const currentDate = computed(() => {
  return format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
})

const lostFoundRate = computed(() => {
  if (!stats.value.lostFoundRate) return null
  return `${stats.value.lostFoundRate}% encontradas`
})

const requestApprovedPercentage = computed(() => {
  const total =
    (stats.value.requestDistribution?.pending || 0) +
    (stats.value.requestDistribution?.approved || 0) +
    (stats.value.requestDistribution?.rejected || 0)
  
  if (total === 0) return 0
  return Math.round(((stats.value.requestDistribution?.approved || 0) / total) * 100)
})

// Chart Data
const adoptionTrendsData = computed(() => ({
  labels: adoptionTrends.value.map((t) => t.label),
  datasets: [
    {
      label: 'Adopciones',
      data: adoptionTrends.value.map((t) => t.value),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
}))

const petDistributionData = computed(() => ({
  labels: petDistribution.value.map((p) => p.type),
  datasets: [
    {
      data: petDistribution.value.map((p) => p.count),
      backgroundColor: petDistribution.value.map((p) => p.color),
      borderWidth: 2,
      borderColor: '#fff',
    },
  ],
}))

// Chart Options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}

// Recent Activities (mock data - replace with real data)
const recentActivities = ref([
  {
    type: 'adoption',
    title: 'Nueva adopción completada',
    description: 'Usuario adoptó a Max',
    timestamp: Date.now() - 3600000,
    badge: 'Completada',
  },
  {
    type: 'pet',
    title: 'Nueva mascota publicada',
    description: 'Perro Luna disponible para adopción',
    timestamp: Date.now() - 7200000,
  },
  {
    type: 'lost',
    title: 'Mascota perdida reportada',
    description: 'Gato en zona centro',
    timestamp: Date.now() - 10800000,
    badge: 'Urgente',
  },
  {
    type: 'user',
    title: 'Nuevo usuario registrado',
    description: 'María González se unió a la plataforma',
    timestamp: Date.now() - 14400000,
  },
  {
    type: 'story',
    title: 'Nueva historia publicada',
    description: 'Historia de adopción de Rocky',
    timestamp: Date.now() - 18000000,
  },
])

// Methods
const handlePeriodChange = async (period) => {
  selectedPeriod.value = period
  await fetchStats(period)
}

// Load data on mount
onMounted(async () => {
  await fetchStats(selectedPeriod.value)
})
</script>
