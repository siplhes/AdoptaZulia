<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Reportes de Mascotas Perdidas</h1>
          <p class="text-gray-600">Lista y gestión de reportes de mascotas perdidas</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin"
            class="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Volver al panel
          </NuxtLink>
          <NuxtLink
            to="/perdidas/crear"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
          >
            Crear reporte
          </NuxtLink>
        </div>
      </div>

      <div v-if="loading" class="flex h-40 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-700" />
      </div>

      <div v-else-if="error" class="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="mdi:alert-circle-outline" class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="lostList.length === 0" class="rounded-lg bg-white p-8 text-center shadow-md">
        <div
          class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100"
        >
          <Icon name="heroicons:paw" class="h-12 w-12 text-amber-500" />
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-800">No hay reportes</h3>
        <p class="mb-6 text-gray-600">No se han publicado reportes de mascotas perdidas todavía.</p>
        <NuxtLink
          to="/perdidas/crear"
          class="rounded-md bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
        >
          Crear uno
        </NuxtLink>
      </div>

      <div v-else class="">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PetCard v-for="item in mappedLost" :key="item.id" :pet="item" />
        </div>
      </div>

      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-start justify-between">
            <h3 class="text-xl font-semibold text-gray-900">Confirmar eliminación</h3>
            <button
              type="button"
              class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
              @click="showDeleteModal = false"
            >
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>
          <p class="text-sm text-gray-600">
            ¿Deseas eliminar el reporte
            <span class="font-semibold">{{ reportToDelete?.name }}</span>
            ? Esto no se puede deshacer.
          </p>
          <div class="mt-6 flex justify-end space-x-4">
            <button
              class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              @click="showDeleteModal = false"
            >
              Cancelar
            </button>
            <button
              class="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              @click="deleteReport"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PetCard from '~/components/PetCard.vue'
import { useLostPets } from '~/composables/useLostPets'

definePageMeta({ middleware: ['admin'], layout: 'admin' })

const router = useRouter()
const { lostPets, loading, error, fetchLostPets, updateLostPet, deleteLostPet } = useLostPets()

const highlightReward = 50

const allLost = ref([])
const currentPage = ref(1)
const pageSize = 10

const showDeleteModal = ref(false)
const reportToDelete = ref(null)

const lostList = computed(() => allLost.value || [])
const totalPages = computed(() => Math.ceil(lostList.value.length / pageSize))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize)
const paginationEnd = computed(() => currentPage.value * pageSize)
const paginatedLost = computed(() =>
  lostList.value.slice(paginationStart.value, paginationEnd.value)
)

const mappedLost = computed(() => {
  return allLost.value.map((r) => ({
    id: r.id,
    image: r.images?.[0] || r.image || '/placeholder.webp',
    name: r.name || 'Sin nombre',
    status: r.status || 'lost',
    createdAt: r.createdAt || r.lastSeenAt || Date.now(),
    breed: r.breed || null,
    age: r.age || null,
    location: r.location || null,
    urgent: r.urgent || false,
    vaccinated: false,
    neutered: false,
    size: r.size || null,
    gender: r.gender || null,
  }))
})

onMounted(async () => {
  await loadLost()
})

async function loadLost() {
  try {
    const items = await fetchLostPets()
    allLost.value = items
  } catch (e) {
    console.error('Error cargando perdidas', e)
  }
}

function formatDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('es-ES')
}

function formatReward(r) {
  if (!r && r !== 0) return '—'
  return typeof r === 'number' ? `Bs. ${r}` : r
}

function viewReport(id) {
  router.push(`/perdidas/${id}`)
}

function editReport(id) {
  router.push({ path: '/perdidas/crear', query: { edit: id } })
}

async function toggleFound(item) {
  const newStatus = item.status === 'found' ? 'lost' : 'found'
  try {
    await updateLostPet(item.id, { status: newStatus })
    await loadLost()
  } catch (e) {
    console.error('Error toggling status', e)
  }
}

async function archiveReport(item) {
  try {
    await updateLostPet(item.id, { archived: true })
    await loadLost()
  } catch (e) {
    console.error('Error archiving', e)
  }
}

function confirmDelete(item) {
  reportToDelete.value = item
  showDeleteModal.value = true
}

async function deleteReport() {
  if (!reportToDelete.value) return
  try {
    await deleteLostPet(reportToDelete.value.id)
    showDeleteModal.value = false
    reportToDelete.value = null
    await loadLost()
  } catch (e) {
    console.error('Error deleting report', e)
  }
}
</script>

<style scoped></style>
