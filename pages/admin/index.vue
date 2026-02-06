<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Panel de Administración</h1>
          <p class="text-gray-600">Gestiona las mascotas, usuarios y configuraciones del sitio</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin/features"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 flex items-center gap-2"
          >
            <Icon name="mdi:cog" class="h-5 w-5" />
            Características
          </NuxtLink>
          <NuxtLink
            to="/"
            class="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Volver al sitio
          </NuxtLink>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="mb-8 flex h-32 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <!-- Admin stats -->
      <div v-else class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="rounded-lg bg-white p-6 shadow-md">
          <h2 class="mb-2 text-xl font-semibold text-emerald-800">Mascotas en adopción</h2>
          <div class="flex items-baseline justify-between">
            <p class="text-3xl font-bold text-emerald-600">{{ stats.totalPets }}</p>
            <p class="text-sm text-gray-500">Total</p>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-md">
          <h2 class="mb-2 text-xl font-semibold text-emerald-800">Mascotas urgentes</h2>
          <div class="flex items-baseline justify-between">
            <p class="text-3xl font-bold text-amber-600">{{ stats.urgentPets }}</p>
            <p class="text-sm text-gray-500">Necesitan atención</p>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-md">
          <h2 class="mb-2 text-xl font-semibold text-emerald-800">Usuarios registrados</h2>
          <div class="flex items-baseline justify-between">
            <p class="text-3xl font-bold text-blue-600">{{ stats.totalUsers }}</p>
            <p class="text-sm text-gray-500">Activos</p>
          </div>
        </div>
      </div>

      <!-- Admin menu -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          to="/admin/mascotas"
          class="flex flex-col items-center rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Icon name="mdi:paw" class="h-8 w-8 text-emerald-600" />
          </div>
          <h3 class="mb-2 text-xl font-semibold text-emerald-800">Gestionar Mascotas</h3>
          <p class="text-center text-sm text-gray-600">
            Administra las mascotas en adopción, perdidas y encontradas
          </p>
        </NuxtLink>

        <NuxtLink
          to="/admin/usuarios"
          class="flex flex-col items-center rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Icon name="mdi:account-group" class="h-8 w-8 text-blue-600" />
          </div>
          <h3 class="mb-2 text-xl font-semibold text-emerald-800">Gestionar Usuarios</h3>
          <p class="text-center text-sm text-gray-600">
            Administra los usuarios y permisos de la plataforma
          </p>
        </NuxtLink>

        <NuxtLink
          to="/admin/adopciones"
          class="flex flex-col items-center rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Icon name="mdi:handshake" class="h-8 w-8 text-amber-600" />
          </div>
          <h3 class="mb-2 text-xl font-semibold text-emerald-800">Adopciones</h3>
          <p class="text-center text-sm text-gray-600">
            Seguimiento de procesos de adopción y solicitudes
          </p>
        </NuxtLink>

        <NuxtLink
          to="/admin/estadisticas"
          class="flex flex-col items-center rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <Icon name="mdi:chart-bar" class="h-8 w-8 text-purple-600" />
          </div>
          <h3 class="mb-2 text-xl font-semibold text-emerald-800">Estadísticas</h3>
          <p class="text-center text-sm text-gray-600">
            Visualiza métricas y analíticas de la plataforma
          </p>
        </NuxtLink>

        <NuxtLink
          to="/admin/features"
          class="flex flex-col items-center rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <Icon name="mdi:toggle-multiple" class="h-8 w-8 text-indigo-600" />
          </div>
          <h3 class="mb-2 text-xl font-semibold text-emerald-800">Características</h3>
          <p class="text-center text-sm text-gray-600">
            Activa o desactiva funcionalidades de la plataforma
          </p>
        </NuxtLink>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useStats } from '~/composables/useStats'

// Verificar si el usuario es administrador
definePageMeta({
  middleware: ['admin'],
})

const { user, isAdmin } = useAuth()
const { stats, loading, fetchStats } = useStats()

// Cargar estadísticas al montar el componente
onMounted(async () => {
  try {
    await fetchStats()
  } catch (err) {
    console.error('Error al cargar estadísticas:', err)
  }
})
</script>
