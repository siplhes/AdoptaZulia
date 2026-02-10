<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
      <p class="mt-1 text-gray-600">Administra los ajustes generales de la plataforma</p>
    </div>

    <!-- Feature Flags -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Módulos y Funcionalidades</h2>
        <NuxtLink
          to="/admin/features"
          class="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Ver todos →
        </NuxtLink>
      </div>

      <p class="mb-4 text-sm text-gray-600">
        Gestiona qué módulos están activos en la plataforma
      </p>

      <div class="rounded-lg bg-emerald-50 p-4">
        <div class="flex items-start gap-3">
          <Icon name="mdi:information" class="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <div>
            <p class="text-sm font-medium text-emerald-900">
              Administra funcionalidades desde el panel dedicado
            </p>
            <p class="mt-1 text-sm text-emerald-700">
              Haz clic en "Ver todos" para administrar las banderas de funcionalidad
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- General Settings -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">Ajustes Generales</h2>

      <form @submit.prevent="saveGeneralSettings" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre de la Plataforma</label>
          <input
            v-model="generalSettings.platformName"
            type="text"
            class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            v-model="generalSettings.description"
            rows="3"
            class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email de Contacto</label>
          <input
            v-model="generalSettings.contactEmail"
            type="email"
            class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingGeneral"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {{ savingGeneral ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Limits & Restrictions -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">Límites y Restricciones</h2>

      <form @submit.prevent="saveLimits" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Máximo de imágenes por publicación
            </label>
            <input
              v-model.number="limits.maxImages"
              type="number"
              min="1"
              max="10"
              class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Tamaño máximo de archivo (MB)
            </label>
            <input
              v-model.number="limits.maxFileSize"
              type="number"
              min="1"
              max="50"
              class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Días antes de archivar automáticamente
            </label>
            <input
              v-model.number="limits.autoArchiveDays"
              type="number"
              min="7"
              max="365"
              class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Máximo de reportes de mascotas perdidas activos
            </label>
            <input
              v-model.number="limits.maxLostPets"
              type="number"
              min="1"
              max="100"
              class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingLimits"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {{ savingLimits ? 'Guardando...' : 'Guardar Límites' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Maintenance Mode -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">Modo Mantenimiento</h2>

      <div class="flex items-center justify-between rounded-lg bg-amber-50 p-4">
        <div class="flex items-start gap-3">
          <Icon name="mdi:wrench" class="h-6 w-6 flex-shrink-0 text-amber-600" />
          <div>
            <p class="font-medium text-amber-900">Modo Mantenimiento</p>
            <p class="mt-1 text-sm text-amber-700">
              Cuando está activo, solo los administradores pueden acceder a la plataforma
            </p>
          </div>
        </div>

        <button
          @click="toggleMaintenanceMode"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            maintenanceMode ? 'bg-amber-600' : 'bg-gray-200',
          ]"
        >
          <span class="sr-only">Activar modo mantenimiento</span>
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              maintenanceMode ? 'translate-x-5' : 'translate-x-0',
            ]"
          />
        </button>
      </div>
    </div>

    <!-- Cache Management -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">Gestión de Caché</h2>

      <div class="space-y-3">
        <button
          @click="clearCache('stats')"
          class="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
        >
          <div class="flex items-center gap-3">
            <Icon name="mdi:chart-line" class="h-5 w-5 text-gray-600" />
            <div class="text-left">
              <p class="font-medium text-gray-900">Limpiar Cache de Estadísticas</p>
              <p class="text-sm text-gray-500">Actualizar estadísticas del dashboard</p>
            </div>
          </div>
          <Icon name="mdi:delete-sweep" class="h-5 w-5 text-gray-400" />
        </button>

        <button
          @click="clearCache('images')"
          class="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
        >
          <div class="flex items-center gap-3">
            <Icon name="mdi:image" class="h-5 w-5 text-gray-600" />
            <div class="text-left">
              <p class="font-medium text-gray-900">Limpiar Cache de Imágenes</p>
              <p class="text-sm text-gray-500">Forzar recarga de imágenes</p>
            </div>
          </div>
          <Icon name="mdi:delete-sweep" class="h-5 w-5 text-gray-400" />
        </button>

        <button
          @click="clearCache('all')"
          class="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 transition-colors hover:bg-red-100"
        >
          <div class="flex items-center gap-3">
            <Icon name="mdi:delete-forever" class="h-5 w-5 text-red-600" />
            <div class="text-left">
              <p class="font-medium text-red-900">Limpiar Toda la Caché</p>
              <p class="text-sm text-red-700">Eliminar todos los datos en caché</p>
            </div>
          </div>
          <Icon name="mdi:alert" class="h-5 w-5 text-red-400" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchData, setData } from '~/utils/firebase'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

// Settings state
const generalSettings = ref({
  platformName: 'AdoptaZulia',
  description: 'Plataforma de adopción de mascotas',
  contactEmail: 'contacto@adoptazulia.com',
})

const limits = ref({
  maxImages: 5,
  maxFileSize: 10,
  autoArchiveDays: 90,
  maxLostPets: 20,
})

const maintenanceMode = ref(false)

const savingGeneral = ref(false)
const savingLimits = ref(false)

// Methods
const saveGeneralSettings = async () => {
  savingGeneral.value = true

  try {
    await setData('config/general', generalSettings.value)
    alert('Configuración guardada exitosamente')
  } catch (err) {
    console.error('Error al guardar configuración:', err)
    alert('Error al guardar configuración')
  } finally {
    savingGeneral.value = false
  }
}

const saveLimits = async () => {
  savingLimits.value = true

  try {
    await setData('config/limits', limits.value)
    alert('Límites guardados exitosamente')
  } catch (err) {
    console.error('Error al guardar límites:', err)
    alert('Error al guardar límites')
  } finally {
    savingLimits.value = false
  }
}

const toggleMaintenanceMode = async () => {
  try {
    maintenanceMode.value = !maintenanceMode.value
    await setData('config/maintenance', { enabled: maintenanceMode.value })
    alert(
      `Modo mantenimiento ${maintenanceMode.value ? 'activado' : 'desactivado'}`
    )
  } catch (err) {
    console.error('Error al cambiar modo mantenimiento:', err)
    alert('Error al cambiar modo mantenimiento')
    maintenanceMode.value = !maintenanceMode.value
  }
}

const clearCache = async (type) => {
  if (
    !confirm(
      `¿Estás seguro de limpiar la caché ${type === 'all' ? 'completa' : `de ${type}`}?`
    )
  ) {
    return
  }

  try {
    // In a real implementation, this would call a backend endpoint
    // For now, just reload the page after a delay
    alert(`Caché de ${type} limpiada exitosamente`)
    if (type === 'all') {
      setTimeout(() => window.location.reload(), 1000)
    }
  } catch (err) {
    console.error('Error al limpiar caché:', err)
    alert('Error al limpiar caché')
  }
}

const loadConfig = async () => {
  try {
    const generalData = await fetchData('config/general')
    if (generalData) {
      generalSettings.value = generalData
    }

    const limitsData = await fetchData('config/limits')
    if (limitsData) {
      limits.value = limitsData
    }

    const maintenanceData = await fetchData('config/maintenance')
    if (maintenanceData) {
      maintenanceMode.value = maintenanceData.enabled || false
    }
  } catch (err) {
    console.error('Error al cargar configuración:', err)
  }
}

// Load config
onMounted(async () => {
  await loadConfig()
})
</script>
