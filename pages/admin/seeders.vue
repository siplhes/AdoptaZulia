<template>
  <div class="min-h-screen bg-gray-50 px-4 py-8">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h1 class="mb-2 text-3xl font-bold text-gray-900">🌱 Panel de Seeders - Datos de Prueba</h1>
        <p class="text-gray-600">
          Gestiona los datos de prueba para desarrollo. Solo disponible en modo desarrollo.
        </p>
        <div v-if="!isDevelopment" class="mt-4 rounded border border-red-200 bg-red-50 p-4">
          <p class="font-semibold text-red-800">
            ⚠️ Los seeders solo están disponibles en modo desarrollo
          </p>
        </div>
      </div>

      <!-- Seeders Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Lost Pets Seeder -->
        <div class="rounded-lg bg-white p-6 shadow-md">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">🐾 Mascotas Perdidas</h2>
            <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {{ lostPetsCount }} registros
            </span>
          </div>
          <p class="mb-4 text-gray-600">Genera mascotas perdidas con datos realistas de Zulia</p>
          <div class="mb-4 flex gap-2">
            <input
              v-model.number="lostPetsAmount"
              type="number"
              min="1"
              max="100"
              class="w-24 rounded border px-3 py-2"
              placeholder="30"
            />
            <button
              @click="seedLostPets"
              :disabled="loading.lostPets || !isDevelopment"
              class="flex-1 rounded bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600 disabled:bg-gray-300"
            >
              {{ loading.lostPets ? 'Creando...' : 'Crear' }}
            </button>
          </div>
          <button
            @click="clearLostPets"
            :disabled="loading.lostPets || !isDevelopment"
            class="w-full rounded bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600 disabled:bg-gray-300"
          >
            Limpiar Todo
          </button>
        </div>

        <!-- Adoptions Seeder -->
        <div class="rounded-lg bg-white p-6 shadow-md">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">🏠 Solicitudes de Adopción</h2>
            <span
              class="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800"
            >
              {{ adoptionsCount }} registros
            </span>
          </div>
          <p class="mb-4 text-gray-600">Genera solicitudes de adopción con diferentes estados</p>
          <div class="mb-4 flex gap-2">
            <input
              v-model.number="adoptionsAmount"
              type="number"
              min="1"
              max="100"
              class="w-24 rounded border px-3 py-2"
              placeholder="20"
            />
            <button
              @click="seedAdoptions"
              :disabled="loading.adoptions || !isDevelopment"
              class="flex-1 rounded bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600 disabled:bg-gray-300"
            >
              {{ loading.adoptions ? 'Creando...' : 'Crear' }}
            </button>
          </div>
          <button
            @click="clearAdoptions"
            :disabled="loading.adoptions || !isDevelopment"
            class="w-full rounded bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600 disabled:bg-gray-300"
          >
            Limpiar Todo
          </button>
        </div>

        <!-- Users Seeder -->
        <div class="rounded-lg bg-white p-6 shadow-md">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">👥 Usuarios</h2>
            <span
              class="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800"
            >
              {{ usersCount }} registros
            </span>
          </div>
          <p class="mb-4 text-gray-600">Genera perfiles de usuario con datos venezolanos</p>
          <div class="mb-4 flex gap-2">
            <input
              v-model.number="usersAmount"
              type="number"
              min="1"
              max="50"
              class="w-24 rounded border px-3 py-2"
              placeholder="10"
            />
            <button
              @click="seedUsers"
              :disabled="loading.users || !isDevelopment"
              class="flex-1 rounded bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600 disabled:bg-gray-300"
            >
              {{ loading.users ? 'Creando...' : 'Crear' }}
            </button>
          </div>
          <button
            @click="clearUsers"
            :disabled="loading.users || !isDevelopment"
            class="w-full rounded bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600 disabled:bg-gray-300"
          >
            Limpiar Todo
          </button>
        </div>

        <!-- Pet Comments Seeder -->
        <div class="rounded-lg bg-white p-6 shadow-md">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">💬 Comentarios</h2>
            <span class="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              {{ commentsCount }} registros
            </span>
          </div>
          <p class="mb-4 text-gray-600">Genera comentarios y valoraciones para mascotas</p>
          <div class="mb-4 flex gap-2">
            <input
              v-model.number="commentsAmount"
              type="number"
              min="1"
              max="100"
              class="w-24 rounded border px-3 py-2"
              placeholder="30"
            />
            <button
              @click="seedComments"
              :disabled="loading.comments || !isDevelopment"
              class="flex-1 rounded bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600 disabled:bg-gray-300"
            >
              {{ loading.comments ? 'Creando...' : 'Crear' }}
            </button>
          </div>
          <button
            @click="clearComments"
            :disabled="loading.comments || !isDevelopment"
            class="w-full rounded bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600 disabled:bg-gray-300"
          >
            Limpiar Todo
          </button>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="mt-6 rounded-lg bg-white p-6 shadow-md">
        <h2 class="mb-4 text-xl font-bold text-gray-900">⚡ Acciones Masivas</h2>
        <div class="flex gap-4">
          <button
            @click="seedAll"
            :disabled="loadingAll || !isDevelopment"
            class="flex-1 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:bg-gray-300"
          >
            {{ loadingAll ? 'Creando Todo...' : '🚀 Crear Todos los Datos' }}
          </button>
          <button
            @click="clearAll"
            :disabled="loadingAll || !isDevelopment"
            class="flex-1 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:bg-gray-300"
          >
            🗑️ Limpiar Todo
          </button>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="statusMessage" class="mt-6 rounded-lg p-4" :class="statusClass">
        <p class="font-semibold">{{ statusMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  seedLostPets,
  clearLostPetsTestData,
  getTestLostPetsCount,
} from '~/utils/seeders/lostPetsSeeder'
import { seedAdoptions, clearAdoptionsTestData } from '~/utils/seeders/adoptionsSeeder'
import { seedUsers, clearUsersTestData } from '~/utils/seeders/usersSeeder'
import { seedPetComments, clearPetCommentsTestData } from '~/utils/seeders/petCommentsSeeder'

// Check if development mode
const isDevelopment = computed(() => process.env.NODE_ENV === 'development')

// Amounts
const lostPetsAmount = ref(30)
const adoptionsAmount = ref(20)
const usersAmount = ref(10)
const commentsAmount = ref(30)

// Counts
const lostPetsCount = ref(0)
const adoptionsCount = ref(0)
const usersCount = ref(0)
const commentsCount = ref(0)

// Loading states
const loading = ref({
  lostPets: false,
  adoptions: false,
  users: false,
  comments: false,
})
const loadingAll = ref(false)

// Status
const statusMessage = ref('')
const statusType = ref<'success' | 'error' | 'info'>('info')

const statusClass = computed(() => ({
  'bg-green-50 border border-green-200 text-green-800': statusType.value === 'success',
  'bg-red-50 border border-red-200 text-red-800': statusType.value === 'error',
  'bg-blue-50 border border-blue-200 text-blue-800': statusType.value === 'info',
}))

// Refresh counts
async function refreshCounts() {
  try {
    lostPetsCount.value = await getTestLostPetsCount()
    // Add count functions for other seeders if needed
  } catch (error) {
    console.error('Error refreshing counts:', error)
  }
}

// Lost Pets Actions
async function seedLostPets() {
  loading.value.lostPets = true
  statusMessage.value = ''

  try {
    await seedLostPets(lostPetsAmount.value)
    statusMessage.value = `✅ ${lostPetsAmount.value} mascotas perdidas creadas exitosamente`
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loading.value.lostPets = false
  }
}

async function clearLostPets() {
  loading.value.lostPets = true
  statusMessage.value = ''

  try {
    await clearLostPetsTestData()
    statusMessage.value = '✅ Mascotas perdidas de prueba eliminadas'
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loading.value.lostPets = false
  }
}

// Adoptions Actions
async function seedAdoptions() {
  loading.value.adoptions = true
  statusMessage.value = ''

  try {
    await seedAdoptions(adoptionsAmount.value)
    statusMessage.value = `✅ ${adoptionsAmount.value} solicitudes de adopción creadas`
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loading.value.adoptions = false
  }
}

async function clearAdoptions() {
  loading.value.adoptions = true
  statusMessage.value = ''

  try {
    await clearAdoptionsTestData()
    statusMessage.value = '✅ Solicitudes de prueba eliminadas'
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loading.value.adoptions = false
  }
}

// Users Actions
async function seedUsers() {
  loading.value.users = true
  statusMessage.value = ''

  try {
    await seedUsers(usersAmount.value)
    statusMessage.value = `✅ ${usersAmount.value} usuarios creados`
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loading.value.users = false
  }
}

async function clearUsers() {
  loading.value.users = true
  statusMessage.value = ''

  try {
    await clearUsersTestData()
    statusMessage.value = '✅ Usuarios de prueba eliminados'
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loading.value.users = false
  }
}

// Comments Actions
async function seedComments() {
  loading.value.comments = true
  statusMessage.value = ''

  try {
    await seedPetComments(commentsAmount.value)
    statusMessage.value = `✅ ${commentsAmount.value} comentarios creados`
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loading.value.comments = false
  }
}

async function clearComments() {
  loading.value.comments = true
  statusMessage.value = ''

  try {
    await clearPetCommentsTestData()
    statusMessage.value = '✅ Comentarios de prueba eliminados'
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loading.value.comments = false
  }
}

// Bulk Actions
async function seedAll() {
  loadingAll.value = true
  statusMessage.value = '🌱 Creando todos los datos de prueba...'
  statusType.value = 'info'

  try {
    await seedLostPets(lostPetsAmount.value)
    await seedAdoptions(adoptionsAmount.value)
    await seedUsers(usersAmount.value)
    await seedPetComments(commentsAmount.value)

    statusMessage.value = '✅ ¡Todos los datos de prueba creados exitosamente!'
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loadingAll.value = false
  }
}

async function clearAll() {
  if (!confirm('¿Estás seguro de que quieres eliminar TODOS los datos de prueba?')) {
    return
  }

  loadingAll.value = true
  statusMessage.value = '🧹 Limpiando todos los datos de prueba...'
  statusType.value = 'info'

  try {
    await clearLostPetsTestData()
    await clearAdoptionsTestData()
    await clearUsersTestData()
    await clearPetCommentsTestData()

    statusMessage.value = '✅ ¡Todos los datos de prueba eliminados!'
    statusType.value = 'success'
    await refreshCounts()
  } catch (error: any) {
    statusMessage.value = `❌ Error: ${error.message}`
    statusType.value = 'error'
  } finally {
    loadingAll.value = false
  }
}

onMounted(() => {
  refreshCounts()
})
</script>
