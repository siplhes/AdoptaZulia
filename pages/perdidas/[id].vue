<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
    <!-- Loading State -->
    <div v-if="loading" class="mx-auto max-w-7xl px-4 py-8">
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-64 rounded bg-gray-200"></div>
        <div class="h-96 rounded-lg bg-gray-200"></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="h-32 rounded bg-gray-200"></div>
          <div class="h-32 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div
      v-else-if="!report"
      class="mx-auto max-w-2xl px-4 py-16 text-center"
    >
      <div class="rounded-lg bg-white p-8 shadow-lg">
        <Icon name="heroicons:exclamation-circle" class="mx-auto h-16 w-16 text-gray-400" />
        <h2 class="mt-4 text-2xl font-bold text-gray-900">Reporte no encontrado</h2>
        <p class="mt-2 text-gray-600">El reporte que buscas no existe o fue eliminado.</p>
        <NuxtLink
          to="/perdidas"
          class="mt-6 inline-flex items-center rounded-md bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
        >
          Ver todos los reportes
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="mx-auto max-w-7xl px-4 py-6">
      <!-- Breadcrumb -->
      <nav class="mb-4 flex items-center space-x-2 text-sm">
        <NuxtLink to="/" class="text-gray-500 hover:text-emerald-600">Inicio</NuxtLink>
        <Icon name="heroicons:chevron-right" class="h-4 w-4 text-gray-400" />
        <NuxtLink to="/perdidas" class="text-gray-500 hover:text-emerald-600">
          Mascotas Perdidas
        </NuxtLink>
        <Icon name="heroicons:chevron-right" class="h-4 w-4 text-gray-400" />
        <span class="text-gray-900">{{ report.name }}</span>
      </nav>

      <!-- Hero Section -->
      <div class="overflow-hidden rounded-xl bg-white shadow-xl">
        <!-- Status Bar -->
        <div class="border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700 px-6 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-lg font-bold tracking-wider text-white">🔍 SE BUSCA</span>
              <span
                :class="[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  statusConfig[report.status]?.class || 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ statusConfig[report.status]?.label || report.status }}
              </span>
            </div>
            <div class="flex items-center space-x-2 text-white">
              <Icon name="heroicons:eye" class="h-5 w-5" />
              <span class="text-sm">{{ report.views || 0 }} vistas</span>
            </div>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Image Carousel -->
          <div class="relative bg-black">
            <div
              v-if="report.images && report.images.length > 0"
              class="relative h-96 md:h-full"
            >
              <img
                :src="report.images[currentImageIndex]"
                :alt="report.name"
                class="h-full w-full object-cover"
              />

              <!-- Navigation -->
              <button
                v-if="report.images.length > 1"
                @click="previousImage"
                class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
              >
                <Icon name="heroicons:chevron-left" class="h-6 w-6" />
              </button>
              <button
                v-if="report.images.length > 1"
                @click="nextImage"
                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
              >
                <Icon name="heroicons:chevron-right" class="h-6 w-6" />
              </button>

              <!-- Dots -->
              <div
                v-if="report.images.length > 1"
                class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
              >
                <button
                  v-for="(_, idx) in report.images"
                  :key="idx"
                  @click="currentImageIndex = idx"
                  :class="[
                    'h-2 w-8 rounded-full transition-colors',
                    idx === currentImageIndex ? 'bg-amber-400' : 'bg-white/50',
                  ]"
                ></button>
              </div>
            </div>
            <div v-else class="flex h-96 items-center justify-center bg-gray-100">
              <Icon name="heroicons:photo" class="h-24 w-24 text-gray-300" />
            </div>
          </div>

          <!-- Pet Details -->
          <div class="p-6">
            <div class="space-y-6">
              <!-- Header -->
              <div>
                <h1 class="text-4xl font-extrabold text-gray-900">{{ report.name }}</h1>
                <p class="mt-2 text-sm text-gray-500">
                  Reportada el {{ formatDate(report.createdAt) }} ({{
                    daysAgo(report.createdAt)
                  }}
                  días)
                </p>
              </div>

              <!-- Reward Badge -->
              <div v-if="report.reward && report.reward > 0" class="inline-block">
                <div
                  class="rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 shadow-lg"
                >
                  <p class="text-sm font-medium text-amber-900">💰 Recompensa</p>
                  <p class="text-3xl font-bold text-white">${{ formatReward(report.reward) }}</p>
                </div>
              </div>

              <!-- Pet Info Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="rounded-lg bg-gray-50 p-4">
                  <p class="text-xs font-medium text-gray-500">Especie</p>
                  <p class="mt-1 font-semibold text-gray-900">{{ report.species || 'N/A' }}</p>
                </div>
                <div class="rounded-lg bg-gray-50 p-4">
                  <p class="text-xs font-medium text-gray-500">Raza</p>
                  <p class="mt-1 font-semibold text-gray-900">{{ report.breed || 'N/A' }}</p>
                </div>
                <div class="rounded-lg bg-gray-50 p-4">
                  <p class="text-xs font-medium text-gray-500">Color</p>
                  <p class="mt-1 font-semibold text-gray-900">{{ report.color || 'N/A' }}</p>
                </div>
                <div class="rounded-lg bg-gray-50 p-4">
                  <p class="text-xs font-medium text-gray-500">Tamaño</p>
                  <p class="mt-1 font-semibold text-gray-900">{{ report.size || 'N/A' }}</p>
                </div>
              </div>

              <!-- Description -->
              <div
                v-if="report.description"
                class="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4"
              >
                <p class="text-sm font-medium text-emerald-900">Descripción</p>
                <p class="mt-2 whitespace-pre-line text-gray-700">{{ report.description }}</p>
              </div>

              <!-- Last Seen -->
              <div class="rounded-lg bg-red-50 p-4">
                <p class="text-sm font-medium text-red-900">📍 Última vez vista</p>
                <p class="mt-1 text-lg font-semibold text-gray-900">
                  {{ report.lastSeenLocation || 'No especificado' }}
                </p>
                <p class="text-sm text-gray-600">{{ formatDate(report.lastSeenDate) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <!-- Contact Owner -->
        <button
          @click="showContactModal = true"
          class="flex items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-6 py-4 text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
        >
          <Icon name="heroicons:phone" class="h-6 w-6" />
          <span class="font-semibold">Contactar</span>
        </button>

        <!-- Report Sighting -->
        <button
          @click="showSightingModal = true"
          class="flex items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-4 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        >
          <Icon name="heroicons:eye" class="h-6 w-6" />
          <span class="font-semibold">Reportar Avistamiento</span>
        </button>

        <!-- Share -->
        <button
          @click="showShareModal = true"
          class="flex items-center justify-center space-x-2 rounded-lg bg-purple-600 px-6 py-4 text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl"
        >
          <Icon name="heroicons:share" class="h-6 w-6" />
          <span class="font-semibold">Compartir</span>
        </button>
      </div>

      <!-- Owner/Admin Section -->
      <div v-if="isOwner || isAdmin" class="mt-6 rounded-xl bg-white p-6 shadow-lg">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isAdmin && !isOwner ? '🛡️ Panel de Administrador' : '⚙️ Gestionar Publicación' }}
          </h2>
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            {{ isAdmin ? 'Admin' : 'Propietario' }}
          </span>
        </div>

        <!-- Statistics -->
        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="rounded-lg bg-blue-50 p-4 text-center">
            <Icon name="heroicons:eye" class="mx-auto h-8 w-8 text-blue-600" />
            <p class="mt-2 text-2xl font-bold text-gray-900">{{ report.views || 0 }}</p>
            <p class="text-sm text-gray-600">Vistas</p>
          </div>
          <div class="rounded-lg bg-green-50 p-4 text-center">
            <Icon name="heroicons:share" class="mx-auto h-8 w-8 text-green-600" />
            <p class="mt-2 text-2xl font-bold text-gray-900">{{ report.shares || 0 }}</p>
            <p class="text-sm text-gray-600">Compartidos</p>
          </div>
          <div class="rounded-lg bg-purple-50 p-4 text-center">
            <Icon name="heroicons:map-pin" class="mx-auto h-8 w-8 text-purple-600" />
            <p class="mt-2 text-2xl font-bold text-gray-900">{{ report.sightingCount || 0 }}</p>
            <p class="text-sm text-gray-600">Avistamientos</p>
          </div>
          <div class="rounded-lg bg-amber-50 p-4 text-center">
            <Icon name="heroicons:calendar" class="mx-auto h-8 w-8 text-amber-600" />
            <p class="mt-2 text-2xl font-bold text-gray-900">{{ daysAgo(report.createdAt) }}</p>
            <p class="text-sm text-gray-600">Días activa</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid gap-3 md:grid-cols-4">
          <!-- Edit -->
          <NuxtLink
            :to="`/perdidas/editar/${report.id}`"
            class="flex items-center justify-center space-x-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-3 font-medium text-blue-600 transition-all hover:bg-blue-50"
          >
            <Icon name="heroicons:pencil" class="h-5 w-5" />
            <span>Editar</span>
          </NuxtLink>

          <!-- Mark as Found -->
          <button
            v-if="report.status !== 'found'"
            @click="handleMarkAsFound"
            class="flex items-center justify-center space-x-2 rounded-lg border-2 border-green-600 bg-white px-4 py-3 font-medium text-green-600 transition-all hover:bg-green-50"
          >
            <Icon name="heroicons:check-circle" class="h-5 w-5" />
            <span>Marcar Encontrada</span>
          </button>

          <!-- Reactivate -->
          <button
            v-if="report.status !== 'active'"
            @click="handleReactivate"
            class="flex items-center justify-center space-x-2 rounded-lg border-2 border-amber-600 bg-white px-4 py-3 font-medium text-amber-600 transition-all hover:bg-amber-50"
          >
            <Icon name="heroicons:arrow-path" class="h-5 w-5" />
            <span>Reactivar</span>
          </button>

          <!-- Delete -->
          <button
            @click="showDeleteModal = true"
            class="flex items-center justify-center space-x-2 rounded-lg border-2 border-red-600 bg-white px-4 py-3 font-medium text-red-600 transition-all hover:bg-red-50"
          >
            <Icon name="heroicons:trash" class="h-5 w-5" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      <!-- Sightings Section -->
      <div
        v-if="report.sightingCount && report.sightingCount > 0"
        class="mt-6 rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 class="mb-4 text-xl font-bold text-gray-900">
          🔍 Avistamientos Reportados ({{ report.sightingCount }})
        </h2>
        <p class="text-gray-600">
          Hay {{ report.sightingCount }} avistamiento{{
            report.sightingCount !== 1 ? 's' : ''
          }}
          reportado{{ report.sightingCount !== 1 ? 's' : '' }} de esta mascota.
        </p>
      </div>

      <!-- Back Button -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/perdidas"
          class="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-all hover:bg-gray-50"
        >
          <Icon name="heroicons:arrow-left" class="h-5 w-5" />
          <span>Volver a reportes</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Contact Modal -->
    <Teleport to="body">
      <div
        v-if="showContactModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showContactModal = false"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <h3 class="mb-4 text-2xl font-bold text-gray-900">Contactar</h3>
          <p class="mb-4 text-gray-600">
            Contacta al dueño si has visto a {{ report.name }}
          </p>
          <div class="space-y-3">
            <a
              :href="`tel:${report.contact}`"
              class="flex items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
            >
              <Icon name="heroicons:phone" class="h-5 w-5" />
              <span>Llamar: {{ report.contact }}</span>
            </a>
            <a
              :href="`https://wa.me/${report.contact.replace(/\D/g, '')}`"
              target="_blank"
              class="flex items-center justify-center space-x-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
            >
              <Icon name="logos:whatsapp-icon" class="h-5 w-5" />
              <span>WhatsApp</span>
            </a>
            <button
              @click="copyContact"
              class="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              Copiar número
            </button>
          </div>
          <button
            @click="showContactModal = false"
            class="mt-4 w-full rounded-lg bg-gray-100 px-6 py-3 text-gray-700 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Share Modal -->
    <Teleport to="body">
      <div
        v-if="showShareModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showShareModal = false"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <h3 class="mb-4 text-2xl font-bold text-gray-900">Compartir</h3>
          <p class="mb-4 text-gray-600">Ayuda a difundir para encontrar a {{ report.name }}</p>
          <div class="space-y-3">
            <button
              @click="shareToWhatsApp"
              class="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
            >
              <Icon name="logos:whatsapp-icon" class="h-5 w-5" />
              <span>WhatsApp</span>
            </button>
            <button
              @click="shareToFacebook"
              class="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              <Icon name="logos:facebook" class="h-5 w-5" />
              <span>Facebook</span>
            </button>
            <button
              @click="shareToTwitter"
              class="flex w-full items-center justify-center space-x-2 rounded-lg bg-sky-500 px-6 py-3 text-white hover:bg-sky-600"
            >
              <Icon name="logos:twitter" class="h-5 w-5" />
              <span>Twitter</span>
            </button>
            <button
              @click="copyLink"
              class="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              <Icon name="heroicons:link" class="h-5 w-5" />
              <span>Copiar enlace</span>
            </button>
          </div>
          <button
            @click="showShareModal = false"
            class="mt-4 w-full rounded-lg bg-gray-100 px-6 py-3 text-gray-700 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Sighting Report Modal -->
    <Teleport to="body">
      <div
        v-if="showSightingModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showSightingModal = false"
      >
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
          <h3 class="mb-4 text-2xl font-bold text-gray-900">Reportar Avistamiento</h3>
          <p class="mb-4 text-gray-600">¿Viste a {{ report.name }}? Ayuda con tu información</p>

          <form @submit.prevent="submitSighting" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tu nombre</label>
              <input
                v-model="sightingForm.reporterName"
                type="text"
                required
                class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tu contacto</label>
              <input
                v-model="sightingForm.reporterContact"
                type="text"
                required
                class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Teléfono o email"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Ubicación</label>
              <input
                v-model="sightingForm.location"
                type="text"
                required
                class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="¿Dónde viste a la mascota?"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                v-model="sightingForm.description"
                required
                rows="3"
                class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Describe qué viste..."
              ></textarea>
            </div>

            <div class="flex space-x-3">
              <button
                type="submit"
                :disabled="sightingLoading"
                class="flex-1 rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ sightingLoading ? 'Enviando...' : 'Enviar Reporte' }}
              </button>
              <button
                type="button"
                @click="showSightingModal = false"
                class="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div class="mb-4 flex items-center space-x-3 text-red-600">
            <Icon name="heroicons:exclamation-triangle" class="h-8 w-8" />
            <h3 class="text-2xl font-bold">Confirmar Eliminación</h3>
          </div>
          <p class="mb-6 text-gray-600">
            ¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.
          </p>
          <div class="flex space-x-3">
            <button
              @click="confirmDelete"
              :disabled="deleteLoading"
              class="flex-1 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {{ deleteLoading ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
            <button
              @click="showDeleteModal = false"
              class="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLostPets } from '~/composables/useLostPets'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { formatDate as formatFullDate } from '~/utils/dateFormatter'
import type { LostPet } from '~/models/LostPet'

const route = useRoute()
const router = useRouter()
const { getLostPetById, incrementViews, deleteLostPet, updateStatus, reportSighting } =
  useLostPets()
const { user, isAdmin } = useAuth()
const { showToast } = useToast()

// State
const report = ref<LostPet | null>(null)
const loading = ref(true)
const currentImageIndex = ref(0)
const showContactModal = ref(false)
const showShareModal = ref(false)
const showSightingModal = ref(false)
const showDeleteModal = ref(false)
const deleteLoading = ref(false)
const sightingLoading = ref(false)

const sightingForm = ref({
  reporterName: '',
  reporterContact: '',
  location: '',
  description: '',
})

// Status configuration
const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Activa', class: 'bg-red-100 text-red-800' },
  found: { label: 'Encontrada', class: 'bg-green-100 text-green-800' },
  archived: { label: 'Archivada', class: 'bg-gray-100 text-gray-800' },
}

// Computed
const isOwner = computed(() => {
  return user.value && report.value && (user.value.uid === report.value.ownerId || isAdmin.value)
})

// Methods
function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'Fecha desconocida'
  return formatFullDate(timestamp)
}

function formatReward(amount: number | undefined): string {
  if (!amount) return '0.00'
  return amount.toFixed(2)
}

function daysAgo(timestamp: number | undefined): number {
  if (!timestamp) return 0
  const now = Date.now()
  const diff = now - timestamp
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function previousImage() {
  if (!report.value?.images) return
  currentImageIndex.value =
    (currentImageIndex.value - 1 + report.value.images.length) % report.value.images.length
}

function nextImage() {
  if (!report.value?.images) return
  currentImageIndex.value = (currentImageIndex.value + 1) % report.value.images.length
}

async function handleMarkAsFound() {
  if (!report.value) return
  const success = await updateStatus(report.value.id!, 'found')
  if (success) {
    showToast('Mascota marcada como encontrada', 'success')
    report.value.status = 'found'
  } else {
    showToast('Error al actualizar el estado', 'error')
  }
}

async function handleReactivate() {
  if (!report.value) return
  const success = await updateStatus(report.value.id!, 'active')
  if (success) {
    showToast('Reporte reactivado', 'success')
    report.value.status = 'active'
  } else {
    showToast('Error al reactivar', 'error')
  }
}

async function confirmDelete() {
  if (!report.value) return
  deleteLoading.value = true
  const success = await deleteLostPet(report.value.id!)
  deleteLoading.value = false

  if (success) {
    showToast('Reporte eliminado exitosamente', 'success')
    router.push('/perdidas')
  } else {
    showToast('Error al eliminar el reporte', 'error')
    showDeleteModal.value = false
  }
}

async function submitSighting() {
  if (!report.value || !user.value) {
    showToast('Debes iniciar sesión para reportar un avistamiento', 'error')
    return
  }

  sightingLoading.value = true
  const success = await reportSighting({
    petId: report.value.id!,
    reportedBy: user.value.uid,
    reporterName: sightingForm.value.reporterName,
    reporterContact: sightingForm.value.reporterContact,
    location: sightingForm.value.location,
    description: sightingForm.value.description,
  })

  sightingLoading.value = false

  if (success) {
    showToast('¡Gracias por tu reporte!', 'success')
    showSightingModal.value = false
    sightingForm.value = {
      reporterName: '',
      reporterContact: '',
      location: '',
      description: '',
    }
    // Refresh to show updated sighting count
    if (report.value.sightingCount !== undefined) {
      report.value.sightingCount++
    }
  } else {
    showToast('Error al enviar el reporte', 'error')
  }
}

function copyContact() {
  if (!report.value?.contact) return
  navigator.clipboard.writeText(report.value.contact)
  showToast('Contacto copiado al portapapeles', 'success')
}

// Share functions handled by ShareModal component

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  loading.value = true
  report.value = await getLostPetById(id)
  loading.value = false

  // Track view (only once per session)
  if (report.value && !sessionStorage.getItem(`viewed_lost_${id}`)) {
    await incrementViews(id)
    sessionStorage.setItem(`viewed_lost_${id}`, 'true')
  }
})

// SEO
useHead({
  title: computed(() => `${report.value?.name || 'Mascota'} - Mascota Perdida | Adopta Zulia`),
  meta: computed(() => [
    {
      name: 'description',
      content: `${report.value?.name} está perdida. Última vez vista en ${report.value?.lastSeenLocation}. ${report.value?.description}`,
    },
    { property: 'og:title', content: `SE BUSCA: ${report.value?.name}` },
    {
      property: 'og:description',
      content: `Ayúdanos a encontrar a ${report.value?.name}. Contacto: ${report.value?.contact}`,
    },
    { property: 'og:image', content: report.value?.images?.[0] || '' },
    { property: 'og:type', content: 'website' },
  ]),
})
</script>
