<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes y Moderación</h1>
        <p class="mt-1 text-gray-600">Sistema de gestión de reportes de contenido</p>
      </div>
      <button
        @click="refreshData"
        class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Icon name="mdi:refresh" class="h-4 w-4" />
        Actualizar
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Reportes</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
          <div class="rounded-lg bg-orange-100 p-3">
            <Icon name="mdi:flag" class="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pendientes</p>
            <p class="mt-1 text-2xl font-bold text-amber-600">{{ stats.pending }}</p>
          </div>
          <div class="rounded-lg bg-amber-100 p-3">
            <Icon name="mdi:clock-outline" class="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Resueltos</p>
            <p class="mt-1 text-2xl font-bold text-green-600">{{ stats.resolved }}</p>
          </div>
          <div class="rounded-lg bg-green-100 p-3">
            <Icon name="mdi:check-circle" class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Descartados</p>
            <p class="mt-1 text-2xl font-bold text-gray-600">{{ stats.dismissed }}</p>
          </div>
          <div class="rounded-lg bg-gray-100 p-3">
            <Icon name="mdi:close-circle" class="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Tipo:</label>
        <select
          v-model="filters.type"
          class="rounded-lg border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
        >
          <option value="">Todos</option>
          <option value="pet">Mascota</option>
          <option value="user">Usuario</option>
          <option value="story">Historia</option>
          <option value="comment">Comentario</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Estado:</label>
        <select
          v-model="filters.status"
          class="rounded-lg border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
        >
          <option value="">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="resolved">Resuelto</option>
          <option value="dismissed">Descartado</option>
        </select>
      </div>

      <div class="flex flex-1 items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Buscar:</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Razón, descripción..."
          class="flex-1 rounded-lg border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <button
        @click="clearFilters"
        class="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Limpiar
      </button>
    </div>

    <!-- Reports Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600">
        <Icon name="mdi:alert-circle" class="mx-auto mb-2 h-12 w-12" />
        <p>{{ error }}</p>
      </div>

      <div v-else-if="filteredReports.length === 0" class="p-8 text-center text-gray-500">
        <Icon name="mdi:flag-off" class="mx-auto mb-2 h-12 w-12" />
        <p>No se encontraron reportes</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Razón
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Reportado Por
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="report in paginatedReports"
              :key="report.id"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                    report.type === 'pet'
                      ? 'bg-emerald-100 text-emerald-800'
                      : report.type === 'user'
                        ? 'bg-blue-100 text-blue-800'
                        : report.type === 'story'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-purple-100 text-purple-800',
                  ]"
                >
                  <Icon
                    :name="
                      report.type === 'pet'
                        ? 'mdi:paw'
                        : report.type === 'user'
                          ? 'mdi:account'
                          : report.type === 'story'
                            ? 'mdi:heart'
                            : 'mdi:comment'
                    "
                    class="h-3 w-3"
                  />
                  {{ typeLabel(report.type) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <p class="font-medium text-gray-900">{{ report.reason }}</p>
                <p class="text-sm text-gray-500 line-clamp-1">{{ report.description }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ report.reporterName || 'Anónimo' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(report.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                    report.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : report.status === 'dismissed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-amber-100 text-amber-800',
                  ]"
                >
                  {{ statusLabel(report.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="viewReport(report)"
                    class="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                    title="Ver detalles"
                  >
                    <Icon name="mdi:eye" class="h-5 w-5" />
                  </button>
                  <button
                    v-if="report.status === 'pending'"
                    @click="resolveReport(report.id)"
                    class="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                    title="Resolver"
                  >
                    <Icon name="mdi:check" class="h-5 w-5" />
                  </button>
                  <button
                    v-if="report.status === 'pending'"
                    @click="dismissReport(report.id)"
                    class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50"
                    title="Descartar"
                  >
                    <Icon name="mdi:close" class="h-5 w-5" />
                  </button>
                  <button
                    @click="confirmDelete(report)"
                    class="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Icon name="mdi:delete" class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3"
      >
        <p class="text-sm text-gray-600">
          Mostrando {{ (currentPage - 1) * perPage + 1 }} a
          {{ Math.min(currentPage * perPage, filteredReports.length) }} de
          {{ filteredReports.length }} resultados
        </p>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Report Details Modal -->
    <Teleport to="body">
      <div
        v-if="selectedReport"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click.self="selectedReport = null"
      >
        <div class="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-gray-200 p-6">
            <h3 class="text-xl font-bold text-gray-900">Detalles del Reporte</h3>
            <button
              @click="selectedReport = null"
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100"
            >
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-600">Tipo de Contenido</p>
                <p class="text-gray-900">{{ typeLabel(selectedReport.type) }}</p>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-600">Razón</p>
                <p class="text-gray-900">{{ selectedReport.reason }}</p>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-600">Descripción</p>
                <p class="whitespace-pre-line text-gray-900">{{ selectedReport.description }}</p>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-600">Reportado por</p>
                <p class="text-gray-900">{{ selectedReport.reporterName || 'Anónimo' }}</p>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-600">Fecha</p>
                <p class="text-gray-900">{{ formatDate(selectedReport.createdAt) }}</p>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-600">Estado</p>
                <span
                  :class="[
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                    selectedReport.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : selectedReport.status === 'dismissed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-amber-100 text-amber-800',
                  ]"
                >
                  {{ statusLabel(selectedReport.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
            <button
              @click="selectedReport = null"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              v-if="selectedReport.status === 'pending'"
              @click="dismissReport(selectedReport.id)"
              class="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              Descartar
            </button>
            <button
              v-if="selectedReport.status === 'pending'"
              @click="resolveReport(selectedReport.id)"
              class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Resolver
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <h3 class="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
          <p class="mt-2 text-gray-600">
            ¿Estás seguro de eliminar este reporte? Esta acción no se puede deshacer.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="deleteReportConfirmed"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReports } from '~/composables/useReports'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

const { reports, loading, error, fetchReports, updateReportStatus, deleteReport } = useReports()
const { user } = useAuth()

// Filters
const filters = ref({
  type: '',
  status: '',
  search: '',
})

// Pagination
const currentPage = ref(1)
const perPage = ref(10)

// Modals
const selectedReport = ref(null)
const showDeleteModal = ref(false)
const reportToDelete = ref(null)

// Stats
const stats = computed(() => {
  return {
    total: reports.value.length,
    pending: reports.value.filter(r => r.status === 'pending').length,
    resolved: reports.value.filter(r => r.status === 'resolved').length,
    dismissed: reports.value.filter(r => r.status === 'dismissed').length,
  }
})

// Filtered reports
const filteredReports = computed(() => {
  let filtered = reports.value

  if (filters.value.type) {
    filtered = filtered.filter(r => r.type === filters.value.type)
  }

  if (filters.value.status) {
    filtered = filtered.filter(r => r.status === filters.value.status)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      r =>
        r.reason?.toLowerCase().includes(search) ||
        r.description?.toLowerCase().includes(search) ||
        r.reporterName?.toLowerCase().includes(search)
    )
  }

  return filtered.sort((a, b) => b.createdAt - a.createdAt)
})

// Paginated reports
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredReports.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredReports.value.length / perPage.value)
})

// Methods
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  return format(new Date(timestamp), "d 'de' MMM yyyy HH:mm", { locale: es })
}

const typeLabel = (type) => {
  const labels = {
    pet: 'Mascota',
    user: 'Usuario',
    story: 'Historia',
    comment: 'Comentario',
  }
  return labels[type] || type
}

const statusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    resolved: 'Resuelto',
    dismissed: 'Descartado',
  }
  return labels[status] || status
}

const clearFilters = () => {
  filters.value = {
    type: '',
    status: '',
    search: '',
  }
  currentPage.value = 1
}

const refreshData = async () => {
  await fetchReports()
}

const viewReport = (report) => {
  selectedReport.value = report
}

const resolveReport = async (id) => {
  try {
    await updateReportStatus(id, 'resolved', 'Resuelto por administrador', user.value?.uid)
    selectedReport.value = null
    await refreshData()
  } catch (err) {
    console.error('Error al resolver:', err)
  }
}

const dismissReport = async (id) => {
  try {
    await updateReportStatus(id, 'dismissed', 'Descartado por administrador', user.value?.uid)
    selectedReport.value = null
    await refreshData()
  } catch (err) {
    console.error('Error al descartar:', err)
  }
}

const confirmDelete = (report) => {
  reportToDelete.value = report
  showDeleteModal.value = true
}

const deleteReportConfirmed = async () => {
  if (!reportToDelete.value) return

  try {
    await deleteReport(reportToDelete.value.id)
    showDeleteModal.value = false
    reportToDelete.value = null
    await refreshData()
  } catch (err) {
    console.error('Error al eliminar:', err)
  }
}

// Load data
onMounted(async () => {
  await fetchReports()
})
</script>
