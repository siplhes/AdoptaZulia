<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-72 transform border-r border-gray-200 bg-white transition-all duration-300 ease-in-out lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Header -->
      <div class="flex h-20 items-center px-6 border-b border-gray-100">
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Icon name="ph:paw-print-fill" class="h-6 w-6" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-emerald-900">Adopta Zulia</h1>
            <p class="text-xs font-medium text-emerald-600">Panel Admin</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <div class="space-y-1">
          <!-- Dashboard -->
          <NuxtLink
            to="/admin"
            :class="navItemClass('/admin')"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          >
            <Icon name="ph:squares-four" class="h-5 w-5" />
            <span>Dashboard</span>
          </NuxtLink>

          <!-- Gestión (Accordion) -->
          <div>
            <button 
              @click="toggleAccordion('gestion')"
              class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span class="flex items-center gap-3">
                <Icon name="ph:database" class="h-5 w-5" />
                <span>Gestión</span>
              </span>
              <Icon 
                :name="activeAccordion === 'gestion' ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
                class="h-4 w-4 text-gray-400" 
              />
            </button>
            <div v-show="activeAccordion === 'gestion'" class="mt-1 space-y-1 pl-11">
              <NuxtLink to="/admin/mascotas" :class="navSubItemClass('/admin/mascotas')">
                <span>Mascotas</span>
                <span v-if="stats.urgentPets > 0" class="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-600">{{ stats.urgentPets }}</span>
              </NuxtLink>
              <NuxtLink to="/admin/perdidas" :class="navSubItemClass('/admin/perdidas')">
                <span>Extraviadas</span>
              </NuxtLink>
              <NuxtLink to="/admin/adopciones" :class="navSubItemClass('/admin/adopciones')">
                <span>Solicitudes</span>
                <span v-if="stats.pendingRequests > 0" class="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">{{ stats.pendingRequests }}</span>
              </NuxtLink>
              <NuxtLink to="/admin/historias" :class="navSubItemClass('/admin/historias')">
                <span>Historias</span>
              </NuxtLink>
              <NuxtLink to="/admin/organizaciones" :class="navSubItemClass('/admin/organizaciones')">
                <span>Organizaciones</span>
              </NuxtLink>
              <NuxtLink to="/admin/usuarios" :class="navSubItemClass('/admin/usuarios')">
                <span>Usuarios</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Herramientas (Accordion) -->
          <div>
            <button 
              @click="toggleAccordion('tools')"
              class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span class="flex items-center gap-3">
                <Icon name="ph:wrench" class="h-5 w-5" />
                <span>Herramientas</span>
              </span>
              <Icon 
                :name="activeAccordion === 'tools' ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
                class="h-4 w-4 text-gray-400" 
              />
            </button>
            <div v-show="activeAccordion === 'tools'" class="mt-1 space-y-1 pl-11">
              <NuxtLink to="/admin/comunidad" :class="navSubItemClass('/admin/comunidad')">
                <span>Comunidad</span>
              </NuxtLink>
              <NuxtLink to="/admin/estadisticas" :class="navSubItemClass('/admin/estadisticas')">
                <span>Estadísticas</span>
              </NuxtLink>
              <NuxtLink to="/admin/reportes" :class="navSubItemClass('/admin/reportes')">
                <span>Reportes</span>
              </NuxtLink>
              <NuxtLink to="/admin/comunicacion" :class="navSubItemClass('/admin/comunicacion')">
                <span>Chat y Mails</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Sistema (Accordion) -->
          <div>
            <button 
              @click="toggleAccordion('system')"
              class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span class="flex items-center gap-3">
                <Icon name="ph:gear" class="h-5 w-5" />
                <span>Sistema</span>
              </span>
              <Icon 
                :name="activeAccordion === 'system' ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
                class="h-4 w-4 text-gray-400" 
              />
            </button>
            <div v-show="activeAccordion === 'system'" class="mt-1 space-y-1 pl-11">
              <NuxtLink to="/admin/features" :class="navSubItemClass('/admin/features')">
                <span>Módulos</span>
              </NuxtLink>
              <NuxtLink to="/admin/logs" :class="navSubItemClass('/admin/logs')">
                <span>Logs de Auditoría</span>
              </NuxtLink>
              <NuxtLink to="/admin/configuracion" :class="navSubItemClass('/admin/configuracion')">
                <span>Ajustes</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Dev Tools (Accordion) -->
          <div v-if="isDevelopment">
            <button 
              @click="toggleAccordion('dev')"
              class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50"
            >
              <span class="flex items-center gap-3">
                <Icon name="ph:flask" class="h-5 w-5" />
                <span>Dev Lab</span>
              </span>
              <Icon 
                :name="activeAccordion === 'dev' ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
                class="h-4 w-4 text-amber-400" 
              />
            </button>
            <div v-show="activeAccordion === 'dev'" class="mt-1 space-y-1 pl-11">
              <NuxtLink to="/admin/pruebas" :class="navSubItemClass('/admin/pruebas', 'amber')">
                <span>Lab Tests</span>
              </NuxtLink>
              <NuxtLink to="/admin/seeders" :class="navSubItemClass('/admin/seeders', 'amber')">
                <span>Seed Database</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Section -->
      <div class="border-t border-gray-100 p-6 bg-gray-50">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
            {{ user?.displayName?.charAt(0) || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm font-bold text-gray-900">{{ user?.displayName || 'Usuario' }}</p>
            <p class="text-xs font-medium text-emerald-600">Online</p>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <NuxtLink
            to="/"
            class="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sitio Web
          </NuxtLink>
          <button
            class="flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Cerrar Sesión
          </button>
        </div>
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
      <header class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <!-- Menu Button (Mobile) -->
        <button
          @click="sidebarOpen = true"
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 lg:hidden"
        >
          <Icon name="ph:list" class="h-5 w-5" />
        </button>

        <!-- Page Title -->
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-bold text-gray-900">
            {{ pageTitle }}
          </h2>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Notifications -->
          <button class="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200">
            <Icon name="ph:bell" class="h-5 w-5" />
            <span
              v-if="stats.pendingRequests > 0"
              class="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white"
            >
              {{ stats.pendingRequests }}
            </span>
          </button>

          <!-- User Menu -->
          <div class="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div class="hidden text-right lg:block">
              <p class="text-sm font-bold text-gray-900 leading-none">{{ user?.displayName || 'Admin' }}</p>
            </div>
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
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
const activeAccordion = ref('gestion')
const isDevelopment = import.meta.dev

// Actions
const toggleAccordion = (section) => {
  activeAccordion.value = activeAccordion.value === section ? null : section
}

// Computed
const pageTitle = computed(() => {
  const path = route.path
  if (path === '/admin') return 'DASHBOARD'
  if (path.includes('/mascotas')) return 'DATABASE_MASCOTAS'
  if (path.includes('/perdidas')) return 'EXT_REPORTS'
  if (path.includes('/adopciones')) return 'ADOPTION_REQUESTS'
  if (path.includes('/historias')) return 'STORY_LOGS'
  if (path.includes('/organizaciones')) return 'ORGANIZATIONS'
  if (path.includes('/usuarios')) return 'USER_REGISTRY'
  if (path.includes('/estadisticas')) return 'SYS_STATS'
  if (path.includes('/reportes')) return 'INCIDENT_REPORTS'
  if (path.includes('/comunicacion')) return 'COMM_TERMINAL'
  if (path.includes('/features')) return 'MODULE_CONFIG'
  if (path.includes('/configuracion')) return 'CORE_SETTINGS'
  if (path.includes('/logs')) return 'KERNEL_LOGS'
  if (path.includes('/pruebas')) return 'LAB_FACILITY'
  if (path.includes('/seeders')) return 'DATA_INJECTOR'
  return 'ADMIN_SHELL'
})

const navItemClass = computed(() => {
  return (path) => {
    const isActive = route.path === path
    return isActive 
      ? 'bg-emerald-50 text-emerald-700 font-semibold' 
      : 'text-gray-600 hover:bg-gray-50'
  }
})

const navSubItemClass = computed(() => {
  return (path, color = 'emerald') => {
    const isActive = route.path === path || route.path.startsWith(path + '/')
    const base = 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors'
    const colors = {
      emerald: isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50',
      amber: isActive ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
    }
    return [base, colors[color]]
  }
})
</script>

<style scoped>
</style>
