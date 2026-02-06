<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      
      <!-- Welcome Header with Quick Status -->
      <div v-if="!loading" class="mb-10 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
           <p class="text-sm font-semibold uppercase tracking-wider text-slate-400">Panel de Control</p>
           <h1 class="mt-1 text-3xl font-bold text-slate-800">
            Hola, <span class="text-emerald-600">{{ user?.displayName || 'Admin' }}</span> 👋
           </h1>
           <p class="mt-2 text-slate-600">
             Tienes <strong class="text-amber-600">{{ stats.pendingRequests }} solicitudes pendientes</strong> hoy.
           </p>
        </div>
        
        <div class="flex gap-3">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            <Icon name="mdi:home-outline" class="h-5 w-5" />
            Ver Sitio
          </NuxtLink>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <div v-else class="space-y-10">
        
        <!-- Module Group: Gestión -->
        <section>
          <h2 class="mb-5 flex items-center gap-2 text-lg font-bold text-slate-700">
            <Icon name="mdi:folder-account-outline" class="h-5 w-5" />
            Gestión General
          </h2>
          
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
             <!-- Adopciones (High Priority) -->
             <NuxtLink
              to="/admin/adopciones"
              class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100"
            >
              <div class="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-amber-50 opacity-50 transition-transform group-hover:scale-110" />
              
              <div class="relative z-10 flex items-start justify-between">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Icon name="mdi:handshake" class="h-6 w-6" />
                </div>
                
                <!-- Notification Badge -->
                <span v-if="stats.pendingRequests > 0" class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-sm animate-pulse">
                  {{ stats.pendingRequests }}
                </span>
              </div>
              
              <div class="relative z-10 mt-4">
                <h3 class="text-xl font-bold text-slate-800">Adopciones</h3>
                <p class="mt-1 text-sm text-slate-500">Revisar solicitudes de adopción pendientes.</p>
              </div>
            </NuxtLink>

            <!-- Mascotas -->
            <NuxtLink
              to="/admin/mascotas"
              class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100"
            >
              <div class="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-emerald-50 opacity-50 transition-transform group-hover:scale-110" />
              
               <div class="relative z-10 flex items-start justify-between">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Icon name="mdi:paw" class="h-6 w-6" />
                </div>
                 <!-- Urgent Badge -->
                 <span v-if="stats.urgentPets > 0" class="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  ⚠️ {{ stats.urgentPets }} Urgentes
                </span>
              </div>
              
              <div class="relative z-10 mt-4">
                <h3 class="text-xl font-bold text-slate-800">Mascotas</h3>
                <p class="mt-1 text-sm text-slate-500">Gestionar inventario de mascotas.</p>
              </div>
            </NuxtLink>

            <!-- Usuarios -->
            <NuxtLink
              to="/admin/usuarios"
              class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100"
            >
               <div class="relative z-10 flex items-start justify-between">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Icon name="mdi:account-group" class="h-6 w-6" />
                </div>
              </div>
              
              <div class="relative z-10 mt-4">
                <h3 class="text-xl font-bold text-slate-800">Usuarios</h3>
                <p class="mt-1 text-sm text-slate-500">Administrar roles y perfiles.</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Module Group: Sistema -->
        <section>
          <h2 class="mb-5 flex items-center gap-2 text-lg font-bold text-slate-700">
            <Icon name="mdi:cog-outline" class="h-5 w-5" />
            Sistema y Configuración
          </h2>
          
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <!-- Estadísticas -->
            <NuxtLink
              to="/admin/estadisticas"
              class="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 border border-slate-100"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Icon name="mdi:chart-bar" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-bold text-slate-700">Analíticas</h3>
                <p class="text-xs text-slate-400">Reportes de impacto</p>
              </div>
            </NuxtLink>

            <!-- Features -->
            <NuxtLink
              to="/admin/features"
              class="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 border border-slate-100"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Icon name="mdi:toggle-switch" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-bold text-slate-700">Features</h3>
                <p class="text-xs text-slate-400">Activar funciones</p>
              </div>
            </NuxtLink>
            
          </div>
        </section>

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
  layout: 'default'
})

const { user } = useAuth()
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
