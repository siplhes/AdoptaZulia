<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-emerald-700 to-emerald-900 shadow-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo/Header -->
      <div class="flex h-16 items-center justify-between border-b border-emerald-600 px-6">
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Icon name="mdi:paw" class="h-6 w-6 text-emerald-600" />
          </div>
          <div class="text-white">
            <h1 class="text-lg font-bold">AdoptaZulia</h1>
            <p class="text-xs text-emerald-200">Panel Admin</p>
          </div>
        </NuxtLink>
        <button
          @click="sidebarOpen = false"
          class="text-white lg:hidden"
        >
          <Icon name="mdi:close" class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        <!-- Dashboard -->
        <NuxtLink
          to="/admin"
          :class="navItemClass"
          @click="sidebarOpen = false"
        >
          <Icon name="mdi:view-dashboard" class="h-5 w-5" />
          <span>Dashboard</span>
        </NuxtLink>

        <!-- Gestión -->
        <div class="mt-6">
          <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Gestión
          </p>
          <NuxtLink
            to="/admin/mascotas"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:paw" class="h-5 w-5" />
            <span>Mascotas</span>
            <span
              v-if="stats.urgentPets > 0"
              class="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white"
            >
              {{ stats.urgentPets }}
            </span>
          </NuxtLink>

          <NuxtLink
            to="/admin/perdidas"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:map-marker-alert" class="h-5 w-5" />
            <span>Mascotas Perdidas</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/adopciones"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:handshake" class="h-5 w-5" />
            <span>Adopciones</span>
            <span
              v-if="stats.pendingRequests > 0"
              class="ml-auto animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white"
            >
              {{ stats.pendingRequests }}
            </span>
          </NuxtLink>

          <NuxtLink
            to="/admin/historias"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:heart-multiple" class="h-5 w-5" />
            <span>Historias</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/usuarios"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:account-group" class="h-5 w-5" />
            <span>Usuarios</span>
          </NuxtLink>
        </div>

        <!-- Herramientas -->
        <div class="mt-6">
          <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Herramientas
          </p>
          <NuxtLink
            to="/admin/estadisticas"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:chart-bar" class="h-5 w-5" />
            <span>Estadísticas</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/reportes"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:flag" class="h-5 w-5" />
            <span>Reportes</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/comunicacion"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:email" class="h-5 w-5" />
            <span>Comunicación</span>
          </NuxtLink>
        </div>

        <!-- Sistema -->
        <div class="mt-6">
          <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Sistema
          </p>
          <NuxtLink
            to="/admin/features"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:toggle-switch" class="h-5 w-5" />
            <span>Features</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/configuracion"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:cog" class="h-5 w-5" />
            <span>Configuración</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/logs"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:clipboard-text" class="h-5 w-5" />
            <span>Logs</span>
          </NuxtLink>
        </div>

        <!-- Desarrollo (Solo visible en dev o para admins) -->
        <div class="mt-6">
          <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Desarrollo
          </p>
          <NuxtLink
            to="/admin/pruebas"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:test-tube" class="h-5 w-5" />
            <span>Pruebas</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/seeders"
            :class="navItemClass"
            @click="sidebarOpen = false"
          >
            <Icon name="mdi:database-import" class="h-5 w-5" />
            <span>Seeders</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- User Section -->
      <div class="border-t border-emerald-600 p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">
            {{ user?.displayName?.charAt(0) || 'A' }}
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-white">{{ user?.displayName || 'Admin' }}</p>
            <p class="text-xs text-emerald-200">Administrador</p>
          </div>
        </div>
        <NuxtLink
          to="/"
          class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          <Icon name="mdi:home" class="h-4 w-4" />
          <span>Ver Sitio</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
    />

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top Navbar -->
      <header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        <!-- Menu Button (Mobile) -->
        <button
          @click="sidebarOpen = true"
          class="text-gray-600 lg:hidden"
        >
          <Icon name="mdi:menu" class="h-6 w-6" />
        </button>

        <!-- Breadcrumbs / Page Title -->
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-bold text-gray-800">
            {{ pageTitle }}
          </h2>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <!-- Search -->
          <button class="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Icon name="mdi:magnify" class="h-5 w-5" />
          </button>

          <!-- Notifications -->
          <button class="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Icon name="mdi:bell" class="h-5 w-5" />
            <span
              v-if="stats.pendingRequests > 0"
              class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
            >
              {{ stats.pendingRequests }}
            </span>
          </button>

          <!-- User Menu -->
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              {{ user?.displayName?.charAt(0) || 'A' }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useStats } from '~/composables/useStats'

// Composables
const route = useRoute()
const { user } = useAuth()
const { stats } = useStats()

// State
const sidebarOpen = ref(false)

// Computed
const pageTitle = computed(() => {
  const path = route.path
  if (path === '/admin') return 'Dashboard'
  if (path.includes('/mascotas')) return 'Mascotas'
  if (path.includes('/perdidas')) return 'Mascotas Perdidas'
  if (path.includes('/adopciones')) return 'Adopciones'
  if (path.includes('/historias')) return 'Historias'
  if (path.includes('/usuarios')) return 'Usuarios'
  if (path.includes('/estadisticas')) return 'Estadísticas'
  if (path.includes('/reportes')) return 'Reportes'
  if (path.includes('/comunicacion')) return 'Comunicación'
  if (path.includes('/features')) return 'Features'
  if (path.includes('/configuracion')) return 'Configuración'
  if (path.includes('/logs')) return 'Logs'
  if (path.includes('/pruebas')) return 'Zona de Pruebas'
  if (path.includes('/seeders')) return 'Seeders'
  return 'Admin'
})

const navItemClass = computed(() => {
  return (path) => {
    const isActive = route.path === path || route.path.startsWith(path + '/')
    return [
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
      isActive
        ? 'bg-emerald-600 text-white shadow-lg'
        : 'text-emerald-100 hover:bg-emerald-600 hover:text-white',
    ]
  }
})
</script>

<style scoped>
/* Custom scrollbar for sidebar */
aside nav::-webkit-scrollbar {
  width: 4px;
}

aside nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

aside nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

aside nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
