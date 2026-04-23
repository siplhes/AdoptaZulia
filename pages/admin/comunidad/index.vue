<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Comunidad</h1>
        <p class="text-sm text-gray-500 mt-1">Administra las noticias y eventos del tablón público</p>
      </div>
      
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/comunidad/nueva-noticia" class="inline-flex items-center justify-center rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200 transition-colors">
          <Icon name="ph:newspaper-duotone" class="mr-2 h-5 w-5" />
          Nueva Noticia
        </NuxtLink>
        <NuxtLink to="/admin/comunidad/nuevo-evento" class="inline-flex items-center justify-center rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-200 transition-colors">
          <Icon name="ph:calendar-plus-duotone" class="mr-2 h-5 w-5" />
          Nuevo Evento
        </NuxtLink>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          @click="activeTab = 'noticias'"
          :class="[
            activeTab === 'noticias'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors'
          ]"
        >
          Noticias ({{ noticias.length }})
        </button>
        <button
          @click="activeTab = 'eventos'"
          :class="[
            activeTab === 'eventos'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors'
          ]"
        >
          Eventos ({{ eventos.length }})
        </button>
      </nav>
    </div>

    <!-- Content -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
    </div>

    <!-- Noticias Tab -->
    <div v-else-if="activeTab === 'noticias'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="noticias.length === 0" class="text-center py-12">
        <p class="text-gray-500">No hay noticias publicadas.</p>
      </div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pub.</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="noticia in noticias" :key="noticia.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <NuxtImg v-if="noticia.imageUrl" :src="noticia.imageUrl" class="h-10 w-10 rounded-lg object-cover" />
                  <div v-else class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon name="ph:image" class="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">{{ noticia.title }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ noticia.authorName || 'Admin' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(noticia.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="handleDeleteNoticia(noticia.id!)" class="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg">
                <Icon name="ph:trash-duotone" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Eventos Tab -->
    <div v-else-if="activeTab === 'eventos'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="eventos.length === 0" class="text-center py-12">
        <p class="text-gray-500">No hay eventos publicados.</p>
      </div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Planeada</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencias</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="evento in eventos" :key="evento.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <NuxtImg v-if="evento.imageUrl" :src="evento.imageUrl" class="h-10 w-10 rounded-lg object-cover" />
                  <div v-else class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon name="ph:image" class="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">{{ evento.title }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatEventDate(evento.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ evento.attendees ? Object.keys(evento.attendees).length : 0 }} van
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="handleDeleteEvento(evento.id!)" class="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg">
                <Icon name="ph:trash-duotone" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTablon, type TablonNoticia, type TablonEvento } from '~/composables/useTablon'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { fetchNoticias, fetchEventos, deleteNoticia, deleteEvento, loading } = useTablon()

const activeTab = ref('noticias')
const noticias = ref<TablonNoticia[]>([])
const eventos = ref<TablonEvento[]>([])

const loadData = async () => {
  const [n, e] = await Promise.all([
    fetchNoticias(),
    fetchEventos()
  ])
  noticias.value = n
  eventos.value = e
}

onMounted(loadData)

const formatDate = (timestamp: number) => {
  return format(new Date(timestamp), "d MMM yyyy", { locale: es })
}

const formatEventDate = (timestamp: number) => {
  return format(new Date(timestamp), "d MMM yyyy, h:mm a", { locale: es })
}

const handleDeleteNoticia = async (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
    await deleteNoticia(id)
    await loadData()
  }
}

const handleDeleteEvento = async (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
    await deleteEvento(id)
    await loadData()
  }
}
</script>
