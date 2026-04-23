<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-72 transform border-r-2 border-emerald-500/30 bg-[#021008] font-mono shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 ease-in-out lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- CRT Scanline Effect -->
      <div class="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>

      <!-- Header: Terminal Brand -->
      <div class="relative flex h-20 items-center px-6 border-b border-emerald-500/20">
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center border-2 border-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Icon name="ph:terminal-fill" class="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 class="text-sm font-black tracking-tighter text-emerald-400">ROBCO INDUSTRIES</h1>
            <p class="text-[10px] font-bold text-emerald-500/60 leading-none">OS v4.2.0 - ADMIN</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation: Accordions -->
      <nav class="relative flex-1 overflow-y-auto p-4 scrollbar-terminal">
        <div class="space-y-2">
          <!-- 01. DASHBOARD -->
          <NuxtLink
            to="/admin"
            :class="navItemClass('/admin')"
            class="flex items-center gap-3 border border-transparent px-4 py-3 text-xs font-bold transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30"
          >
            <span class="text-emerald-500/40">></span>
            <span>01 // DASHBOARD</span>
          </NuxtLink>

          <!-- 02. GESTIÓN (Accordion) -->
          <div class="border border-emerald-500/20 bg-emerald-950/10 overflow-hidden">
            <button 
              @click="toggleAccordion('gestion')"
              class="flex w-full items-center justify-between px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5"
            >
              <span class="flex items-center gap-2">
                <span class="text-emerald-500/40">#</span> 02 GESTIÓN_DATOS
              </span>
              <Icon 
                :name="activeAccordion === 'gestion' ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
                class="h-3 w-3" 
              />
            </button>
            <div v-show="activeAccordion === 'gestion'" class="border-t border-emerald-500/10 bg-black/40">
              <NuxtLink to="/admin/mascotas" :class="navSubItemClass('/admin/mascotas')">
                <span>[ MASCOTAS ]</span>
                <span v-if="stats.urgentPets > 0" class="ml-auto text-amber-500">(!{{ stats.urgentPets }})</span>
              </NuxtLink>
              <NuxtLink to="/admin/perdidas" :class="navSubItemClass('/admin/perdidas')">
                <span>[ EXTRAVIADAS ]</span>
              </NuxtLink>
              <NuxtLink to="/admin/adopciones" :class="navSubItemClass('/admin/adopciones')">
                <span>[ SOLICITUDES ]</span>
                <span v-if="stats.pendingRequests > 0" class="ml-auto animate-pulse text-red-500">*</span>
              </NuxtLink>
              <NuxtLink to="/admin/historias" :class="navSubItemClass('/admin/historias')">
                <span>[ HISTORIAS ]</span>
              </NuxtLink>
              <NuxtLink to="/admin/usuarios" :class="navSubItemClass('/admin/usuarios')">
                <span>[ USUARIOS ]</span>
              </NuxtLink>
            </div>
          </div>

          <!-- 03. HERRAMIENTAS (Accordion) -->
          <div class="border border-emerald-500/20 bg-emerald-950/10 overflow-hidden">
            <button 
              @click="toggleAccordion('tools')"
              class="flex w-full items-center justify-between px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5"
            >
              <span class="flex items-center gap-2">
                <span class="text-emerald-500/40">#</span> 03 HERRAMIENTAS
              </span>
              <Icon 
                :name="activeAccordion === 'tools' ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
                class="h-3 w-3" 
              />
            </button>
            <div v-show="activeAccordion === 'tools'" class="border-t border-emerald-500/10 bg-black/40">
              <NuxtLink to="/admin/comunidad" :class="navSubItemClass('/admin/comunidad')">
                <span>[ COMUNIDAD ]</span>
              </NuxtLink>
              <NuxtLink to="/admin/estadisticas" :class="navSubItemClass('/admin/estadisticas')">
                <span>[ ESTADÍSTICAS ]</span>
              </NuxtLink>
              <NuxtLink to="/admin/reportes" :class="navSubItemClass('/admin/reportes')">
                <span>[ REPORTES ]</span>
              </NuxtLink>
              <NuxtLink to="/admin/comunicacion" :class="navSubItemClass('/admin/comunicacion')">
                <span>[ CHAT_MAILS ]</span>
              </NuxtLink>
            </div>
          </div>

          <!-- 04. SISTEMA (Accordion) -->
          <div class="border border-emerald-500/20 bg-emerald-950/10 overflow-hidden">
            <button 
              @click="toggleAccordion('system')"
              class="flex w-full items-center justify-between px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5"
            >
              <span class="flex items-center gap-2">
                <span class="text-emerald-500/40">#</span> 04 SISTEMA
              </span>
              <Icon 
                :name="activeAccordion === 'system' ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
                class="h-3 w-3" 
              />
            </button>
            <div v-show="activeAccordion === 'system'" class="border-t border-emerald-500/10 bg-black/40">
              <NuxtLink to="/admin/features" :class="navSubItemClass('/admin/features')">
                <span>[ MÓDULOS ]</span>
              </NuxtLink>
              <NuxtLink to="/admin/logs" :class="navSubItemClass('/admin/logs')">
                <span>[ LOGS_AUDIT ]</span>
              </NuxtLink>
              <NuxtLink to="/admin/configuracion" :class="navSubItemClass('/admin/configuracion')">
                <span>[ AJUSTES ]</span>
              </NuxtLink>
            </div>
          </div>

          <!-- 05. DEV_TOOLS (Accordion) -->
          <div v-if="isDevelopment" class="border border-amber-500/20 bg-amber-950/10 overflow-hidden">
            <button 
              @click="toggleAccordion('dev')"
              class="flex w-full items-center justify-between px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/5"
            >
              <span class="flex items-center gap-2">
                <span class="text-amber-500/40">#</span> 05 DEV_LAB
              </span>
              <Icon 
                :name="activeAccordion === 'dev' ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" 
                class="h-3 w-3" 
              />
            </button>
            <div v-show="activeAccordion === 'dev'" class="border-t border-amber-500/10 bg-black/40">
              <NuxtLink to="/admin/pruebas" :class="navSubItemClass('/admin/pruebas', 'amber')">
                <span>[ LAB_TESTS ]</span>
              </NuxtLink>
              <NuxtLink to="/admin/seeders" :class="navSubItemClass('/admin/seeders', 'amber')">
                <span>[ SEED_DATABASE ]</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Section: Low-Fi -->
      <div class="relative border-t-2 border-emerald-500/30 p-6 bg-[#041a0d]">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center border-2 border-emerald-500 bg-emerald-500/20 text-emerald-400 font-black shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            {{ user?.displayName?.charAt(0) || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate text-xs font-black text-emerald-400 uppercase tracking-tighter">{{ user?.displayName || 'USER_01' }}</p>
            <p class="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">STATUS: ONLINE</p>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <NuxtLink
            to="/"
            class="flex items-center justify-center border border-emerald-500/40 bg-emerald-500/5 py-2 text-[10px] font-bold text-emerald-400 transition-all hover:bg-emerald-500/20"
          >
            SITIO_WEB
          </NuxtLink>
          <button
            class="flex items-center justify-center border border-red-500/40 bg-red-500/5 py-2 text-[10px] font-bold text-red-500 transition-all hover:bg-red-500/20"
          >
            LOGOUT
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
      <header class="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 px-8 backdrop-blur-md">
        <!-- Menu Button (Mobile) -->
        <button
          @click="sidebarOpen = true"
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Icon name="ph:list-bold" class="h-6 w-6" />
        </button>

        <!-- Breadcrumbs / Page Title -->
        <div class="flex items-center gap-4">
          <div class="hidden h-8 w-[1px] bg-gray-200 lg:block"></div>
          <div>
            <h2 class="text-xl font-black tracking-tight text-gray-900">
              {{ pageTitle }}
            </h2>
            <div class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Admin</span>
              <Icon name="ph:caret-right-bold" class="h-2 w-2" />
              <span class="text-emerald-500">{{ pageTitle }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Quick Search -->
          <button class="hidden items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-gray-400 transition-colors hover:bg-gray-100 lg:flex">
            <Icon name="ph:magnifying-glass-bold" class="h-4 w-4" />
            <span class="text-xs font-bold">Buscar...</span>
            <span class="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-black text-gray-500">⌘K</span>
          </button>

          <!-- Notifications -->
          <button class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100">
            <Icon name="ph:bell-bold" class="h-5 w-5" />
            <span
              v-if="stats.pendingRequests > 0"
              class="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-black text-white"
            >
              {{ stats.pendingRequests }}
            </span>
          </button>

          <!-- User Menu -->
          <div class="ml-2 flex items-center gap-3 pl-3 border-l border-gray-100">
            <div class="hidden text-right lg:block">
              <p class="text-xs font-black text-gray-900 leading-none">{{ user?.displayName || 'Admin' }}</p>
              <p class="mt-1 text-[10px] font-bold text-emerald-600 leading-none">Online</p>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 font-black text-white shadow-md">
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
      ? 'bg-emerald-500 text-[#021008] shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
      : 'text-emerald-500'
  }
})

const navSubItemClass = computed(() => {
  return (path, color = 'emerald') => {
    const isActive = route.path === path || route.path.startsWith(path + '/')
    const base = 'flex w-full items-center gap-3 px-8 py-2.5 text-[10px] font-bold transition-all hover:pl-10'
    const colors = {
      emerald: isActive ? 'text-emerald-400 bg-emerald-500/10 border-l-2 border-emerald-500' : 'text-emerald-600 hover:text-emerald-400',
      amber: isActive ? 'text-amber-400 bg-amber-500/10 border-l-2 border-amber-500' : 'text-amber-600 hover:text-amber-400'
    }
    return [base, colors[color]]
  }
})
</script>

<style scoped>
/* Terminal Scrollbar */
.scrollbar-terminal::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-terminal::-webkit-scrollbar-track {
  background: #010804;
}
.scrollbar-terminal::-webkit-scrollbar-thumb {
  background: #10b98144;
  border: 1px solid #10b98166;
}
.scrollbar-terminal::-webkit-scrollbar-thumb:hover {
  background: #10b98188;
}

/* Retro Terminal Animation */
@keyframes pulse-border {
  0% { border-color: rgba(16, 185, 129, 0.2); }
  50% { border-color: rgba(16, 185, 129, 0.5); }
  100% { border-color: rgba(16, 185, 129, 0.2); }
}

nav > div {
  animation: pulse-border 4s infinite ease-in-out;
}

/* Glassmorphism utility */
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Animations */
.nav-enter-active,
.nav-leave-active {
  transition: all 0.3s ease;
}

.nav-enter-from,
.nav-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
