<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Historias de Adopción</h1>
        <p class="mt-1 text-gray-600">Gestión de historias y testimonios de adopción</p>
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
            <p class="text-sm font-medium text-gray-600">Total Historias</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
          <div class="rounded-lg bg-pink-100 p-3">
            <Icon name="mdi:heart-multiple" class="h-6 w-6 text-pink-600" />
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
            <p class="text-sm font-medium text-gray-600">Aprobadas</p>
            <p class="mt-1 text-2xl font-bold text-green-600">{{ stats.approved }}</p>
          </div>
          <div class="rounded-lg bg-green-100 p-3">
            <Icon name="mdi:check-circle" class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Rechazadas</p>
            <p class="mt-1 text-2xl font-bold text-red-600">{{ stats.rejected }}</p>
          </div>
          <div class="rounded-lg bg-red-100 p-3">
            <Icon name="mdi:close-circle" class="h-6 w-6 text-red-600" />
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
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>
      </div>

      <div class="flex flex-1 items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Buscar:</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Título, nombre..."
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

    <!-- Stories Grid -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-600">
      <Icon name="mdi:alert-circle" class="mx-auto mb-2 h-12 w-12" />
      <p>{{ error }}</p>
    </div>

    <div v-else-if="filteredStories.length === 0" class="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
      <Icon name="mdi:heart-off" class="mx-auto mb-2 h-12 w-12" />
      <p>No se encontraron historias</p>
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="story in paginatedStories"
        :key="story.id"
        class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
      >
        <!-- Image -->
        <div class="relative aspect-video">
          <img
            v-if="story.imageUrl"
            :src="story.imageUrl"
            :alt="story.title"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center bg-gray-100">
            <Icon name="mdi:heart" class="h-16 w-16 text-gray-300" />
          </div>

          <!-- Status Badge -->
          <div class="absolute right-2 top-2">
            <span
              :class="[
                'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                story.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : story.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800',
              ]"
            >
              {{
                story.status === 'approved'
                  ? 'Aprobada'
                  : story.status === 'rejected'
                    ? 'Rechazada'
                    : 'Pendiente'
              }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <h3 class="text-lg font-bold text-gray-900 line-clamp-1">{{ story.title }}</h3>
          <p class="mt-1 text-sm text-gray-500">Por {{ story.ownerName || 'Anónimo' }}</p>
          <p class="mt-2 text-sm text-gray-600 line-clamp-3">{{ story.story }}</p>

          <div class="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Icon name="mdi:calendar" class="h-4 w-4" />
            {{ formatDate(story.createdAt) }}
          </div>
        </div>

        <!-- Actions -->
        <div class="border-t border-gray-100 bg-gray-50 p-4">
          <div class="flex items-center gap-2">
            <button
              @click="viewStory(story)"
              class="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Ver Detalles
            </button>
            <button
              v-if="story.status === 'pending'"
              @click="approveStory(story.id)"
              class="rounded-lg bg-green-600 p-2 text-white transition-colors hover:bg-green-700"
              title="Aprobar"
            >
              <Icon name="mdi:check" class="h-5 w-5" />
            </button>
            <button
              v-if="story.status === 'pending'"
              @click="rejectStory(story.id)"
              class="rounded-lg bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
              title="Rechazar"
            >
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-3 shadow-sm"
    >
      <p class="text-sm text-gray-600">
        Mostrando {{ (currentPage - 1) * perPage + 1 }} a
        {{ Math.min(currentPage * perPage, filteredStories.length) }} de
        {{ filteredStories.length }} resultados
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

    <!-- Story Details Modal -->
    <Teleport to="body">
      <div
        v-if="selectedStory"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click.self="selectedStory = null"
      >
        <div class="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-gray-200 p-6">
            <h3 class="text-xl font-bold text-gray-900">{{ selectedStory.title }}</h3>
            <button
              @click="selectedStory = null"
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="max-h-[70vh] overflow-y-auto p-6">
            <img
              v-if="selectedStory.imageUrl"
              :src="selectedStory.imageUrl"
              :alt="selectedStory.title"
              class="mb-4 w-full rounded-lg"
            />

            <div class="mb-4">
              <p class="text-sm font-medium text-gray-600">Por</p>
              <p class="text-gray-900">{{ selectedStory.ownerName || 'Anónimo' }}</p>
            </div>

            <div class="mb-4">
              <p class="text-sm font-medium text-gray-600">Fecha</p>
              <p class="text-gray-900">{{ formatDate(selectedStory.createdAt) }}</p>
            </div>

            <div class="mb-4">
              <p class="text-sm font-medium text-gray-600">Estado</p>
              <span
                :class="[
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                  selectedStory.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : selectedStory.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800',
                ]"
              >
                {{
                  selectedStory.status === 'approved'
                    ? 'Aprobada'
                    : selectedStory.status === 'rejected'
                      ? 'Rechazada'
                      : 'Pendiente'
                }}
              </span>
            </div>

            <div>
              <p class="mb-2 text-sm font-medium text-gray-600">Historia</p>
              <p class="whitespace-pre-line text-gray-900">{{ selectedStory.story }}</p>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
            <button
              @click="selectedStory = null"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              v-if="selectedStory.status === 'pending'"
              @click="approveStory(selectedStory.id)"
              class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Aprobar Historia
            </button>
            <button
              v-if="selectedStory.status === 'pending'"
              @click="rejectStory(selectedStory.id)"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Rechazar Historia
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
import { useAdoptionStories } from '~/composables/useAdoptionStories'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

const { stories, loading, error, fetchAllStories: fetchStories, updateStoryStatus } = useAdoptionStories()

// Filters
const filters = ref({
  status: '',
  search: '',
})

// Pagination
const currentPage = ref(1)
const perPage = ref(9)

// Selected story for modal
const selectedStory = ref(null)

// Stats
const stats = computed(() => {
  const all = stories.value.filter(s => !s.isTest)
  return {
    total: all.length,
    pending: all.filter(s => s.status === 'pending').length,
    approved: all.filter(s => s.status === 'approved').length,
    rejected: all.filter(s => s.status === 'rejected').length,
  }
})

// Filtered stories
const filteredStories = computed(() => {
  let filtered = stories.value.filter(s => !s.isTest)

  if (filters.value.status) {
    filtered = filtered.filter(s => s.status === filters.value.status)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      s =>
        s.title?.toLowerCase().includes(search) ||
        s.story?.toLowerCase().includes(search) ||
        s.ownerName?.toLowerCase().includes(search)
    )
  }

  return filtered.sort((a, b) => b.createdAt - a.createdAt)
})

// Paginated stories
const paginatedStories = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredStories.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredStories.value.length / perPage.value)
})

// Methods
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  return format(new Date(timestamp), "d 'de' MMM yyyy", { locale: es })
}

const clearFilters = () => {
  filters.value = {
    status: '',
    search: '',
  }
  currentPage.value = 1
}

const refreshData = async () => {
  await fetchStories()
}

const viewStory = (story) => {
  selectedStory.value = story
}

// ...
import { useAdminLogs } from '~/composables/useAdminLogs'

// ...
const { logAction } = useAdminLogs()

// ...

const approveStory = async (id) => {
  try {
    await updateStoryStatus(id, 'approved')
    
    // Log action
    const story = stories.value.find(s => s.id === id)
    await logAction(
      'update',
      'stories',
      `Aprobó historia: ${story?.title || id}`,
      { storyId: id }
    )

    selectedStory.value = null
    await refreshData()
  } catch (err) {
    console.error('Error al aprobar:', err)
  }
}

const rejectStory = async (id) => {
  try {
    await updateStoryStatus(id, 'rejected')
    
    // Log action
    const story = stories.value.find(s => s.id === id)
    await logAction(
      'update',
      'stories',
      `Rechazó historia: ${story?.title || id}`,
      { storyId: id }
    )

    selectedStory.value = null
    await refreshData()
  } catch (err) {
    console.error('Error al rechazar:', err)
  }
}

// Load data
onMounted(async () => {
  await fetchStories()
})
</script>
