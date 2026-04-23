<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Logs del Sistema</h1>
        <p class="text-sm text-gray-500 mt-1">Historial de acciones administrativas y auditoría</p>
      </div>
      <button 
        @click="fetchLogs" 
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
      >
        <Icon :name="loading ? 'ph:spinner-gap-bold' : 'ph:arrows-clockwise-bold'" :class="{ 'animate-spin': loading }" class="h-4 w-4" />
        Actualizar
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Módulo:</label>
        <select v-model="filterModule" class="text-sm rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
          <option value="all">Todos</option>
          <option value="pets">Mascotas</option>
          <option value="users">Usuarios</option>
          <option value="communication">Comunicación (Comunidad)</option>
          <option value="auth">Autenticación</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading && logs.length === 0" class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
      </div>
      <div v-else-if="filteredLogs.length === 0" class="text-center py-12">
        <Icon name="ph:clipboard-text-duotone" class="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p class="text-gray-500">No hay registros que coincidan con los filtros.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                {{ formatDateTime(log.timestamp) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ log.userName }}</div>
                <div class="text-xs text-gray-400 font-mono">{{ log.userId.substring(0, 8) }}...</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getActionClass(log.action)" class="px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 italic">
                {{ log.module }}
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ log.details }}</div>
                <div v-if="log.metadata && Object.keys(log.metadata).length > 0" class="mt-1">
                  <button @click="toggleMetadata(log.id!)" class="text-[10px] text-emerald-600 hover:underline">
                    {{ expandedMetadata.has(log.id!) ? 'Ocultar meta' : 'Ver meta' }}
                  </button>
                  <pre v-if="expandedMetadata.has(log.id!)" class="mt-2 p-2 bg-gray-50 rounded text-[10px] overflow-x-auto max-w-xs sm:max-w-md">{{ JSON.stringify(log.metadata, null, 2) }}</pre>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAdminLogs } from '~/composables/useAdminLogs'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { logs, loading, fetchLogs } = useAdminLogs()
const filterModule = ref('all')
const expandedMetadata = ref(new Set<string>())

onMounted(() => {
  fetchLogs()
})

const filteredLogs = computed(() => {
  if (filterModule.value === 'all') return logs.value
  return logs.value.filter(log => log.module === filterModule.value)
})

const formatDateTime = (timestamp: number) => {
  return format(new Date(timestamp), "dd/MM/yyyy HH:mm:ss", { locale: es })
}

const getActionClass = (action: string) => {
  switch (action) {
    case 'create': return 'bg-emerald-100 text-emerald-700'
    case 'update': return 'bg-blue-100 text-blue-700'
    case 'delete': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const toggleMetadata = (id: string) => {
  if (expandedMetadata.value.has(id)) {
    expandedMetadata.value.delete(id)
  } else {
    expandedMetadata.value.add(id)
  }
}
</script>
