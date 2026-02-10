<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mascotas Perdidas</h1>
        <p class="mt-1 text-gray-600">Gestión de reportes de mascotas extraviadas</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="refreshData"
          class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Icon name="mdi:refresh" class="h-4 w-4" />
          Actualizar
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Reportes</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
          <div class="rounded-lg bg-red-100 p-3">
            <Icon name="mdi:map-marker-alert" class="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Activos</p>
            <p class="mt-1 text-2xl font-bold text-amber-600">{{ stats.active }}</p>
          </div>
          <div class="rounded-lg bg-amber-100 p-3">
            <Icon name="mdi:alert-circle" class="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Encontrados</p>
            <p class="mt-1 text-2xl font-bold text-green-600">{{ stats.found }}</p>
          </div>
          <div class="rounded-lg bg-green-100 p-3">
            <Icon name="mdi:check-circle" class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Tasa Recuperación</p>
            <p class="mt-1 text-2xl font-bold text-blue-600">{{ recoveryRate }}%</p>
          </div>
          <div class="rounded-lg bg-blue-100 p-3">
            <Icon name="mdi:chart-line" class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Estado:</label>
        <select
          v-model="filters.status"
          class="rounded-lg border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
        >
          <option value="">Todos</option>
          <option value="lost">Perdidos</option>
          <option value="found">Encontrados</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Tipo:</label>
        <select
          v-model="filters.type"
          class="rounded-lg border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
        >
          <option value="">Todos</option>
          <option value="Perro">Perro</option>
          <option value="Gato">Gato</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div class="flex flex-1 items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Buscar:</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Nombre, ubicación..."
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

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600">
        <Icon name="mdi:alert-circle" class="mx-auto mb-2 h-12 w-12" />
        <p>{{ error }}</p>
      </div>

      <div v-else-if="filteredReports.length === 0" class="p-8 text-center text-gray-500">
        <Icon name="mdi:paw-off" class="mx-auto mb-2 h-12 w-12" />
        <p>No se encontraron reportes</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Mascota
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Ubicación
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
                <div class="flex items-center gap-3">
                  <img
                    v-if="report.photoURL"
                    :src="report.photoURL"
                    :alt="report.name"
                    class="h-12 w-12 rounded-lg object-cover"
                  />
                  <div
                    v-else
                    class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100"
                  >
                    <Icon name="mdi:paw" class="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ report.name }}</p>
                    <p class="text-sm text-gray-500">{{ report.breed || 'Sin raza' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ report.type }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ report.location }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(report.dateLost) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                    report.status === 'found'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800',
                  ]"
                >
                  {{ report.status === 'found' ? 'Encontrado' : 'Perdido' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <NuxtLink
                    :to="`/perdidas/${report.id}`"
                    class="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                    title="Ver detalles"
                  >
                    <Icon name="mdi:eye" class="h-5 w-5" />
                  </NuxtLink>
                  <button
                    v-if="report.status !== 'found'"
                    @click="markAsFound(report.id)"
                    class="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                    title="Marcar como encontrado"
                  >
                    <Icon name="mdi:check" class="h-5 w-5" />
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
            ¿Estás seguro de eliminar el reporte de
            <strong>{{ reportToDelete?.name }}</strong>? Esta acción no se puede deshacer.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="deleteReport"
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
import { useLostPets } from '~/composables/useLostPets'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

const { lostPets, loading, error, fetchLostPets, updateLostPet, deleteLostPet } = useLostPets()

// Filters
const filters = ref({
  status: '',
  type: '',
  search: '',
})

// Pagination
const currentPage = ref(1)
const perPage = ref(10)

// Modal
const showDeleteModal = ref(false)
const reportToDelete = ref(null)

// Stats
const stats = computed(() => {
  const total = lostPets.value.filter(p => !p.isTest).length
  const found = lostPets.value.filter(p => !p.isTest && p.status === 'found').length
  const active = total - found

  return {
    total,
    active,
    found,
  }
})

const recoveryRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.found / stats.value.total) * 100)
})

// Filtered reports
const filteredReports = computed(() => {
  let filtered = lostPets.value.filter(p => !p.isTest)

  if (filters.value.status) {
    filtered = filtered.filter(p => p.status === filters.value.status)
  }

  if (filters.value.type) {
    filtered = filtered.filter(p => p.type === filters.value.type)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      p =>
        p.name?.toLowerCase().includes(search) ||
        p.location?.toLowerCase().includes(search) ||
        p.breed?.toLowerCase().includes(search)
    )
  }

  return filtered.sort((a, b) => b.dateLost - a.dateLost)
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
  return format(new Date(timestamp), "d 'de' MMM yyyy", { locale: es })
}

const clearFilters = () => {
  filters.value = {
    status: '',
    type: '',
    search: '',
  }
  currentPage.value = 1
}

const refreshData = async () => {
  await fetchLostPets()
}

const markAsFound = async (id) => {
  try {
    await updateLostPet(id, { status: 'found' })
    await refreshData()
  } catch (err) {
    console.error('Error al marcar como encontrado:', err)
  }
}

const confirmDelete = (report) => {
  reportToDelete.value = report
  showDeleteModal.value = true
}

const deleteReport = async () => {
  if (!reportToDelete.value) return

  try {
    await deleteLostPet(reportToDelete.value.id)
    showDeleteModal.value = false
    reportToDelete.value = null
    await refreshData()
  } catch (err) {
    console.error('Error al eliminar:', err)
  }
}

// Load data
onMounted(async () => {
  await fetchLostPets()
})
</script>
