<template>
  <div class="min-h-screen bg-page py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Back Button -->
      <NuxtLink to="/comunidad" class="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 mb-8 transition-colors">
        <Icon name="ph:arrow-left-bold" class="mr-2 h-4 w-4" />
        Volver a la comunidad
      </NuxtLink>

      <div v-if="loadingEvent" class="flex justify-center py-20">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"></div>
      </div>
      
      <div v-else-if="!evento" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
        <Icon name="ph:calendar-x-duotone" class="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Evento no encontrado</h2>
        <p class="text-gray-500 mb-6">Parece que el evento que buscas no existe o ha sido cancelado.</p>
        <NuxtLink to="/comunidad" class="inline-flex justify-center rounded-xl bg-amber-600 px-6 py-3 font-bold text-white hover:bg-amber-700 transition-colors">
          Explorar otros eventos
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Main Content -->
        <article class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div v-if="evento.imageUrl" class="relative w-full h-[300px]">
            <NuxtImg
              :src="evento.imageUrl"
              :alt="evento.title"
              class="w-full h-full object-cover"
            />
          </div>
          
          <div class="p-8">
            <span :class="['inline-flex items-center rounded-full px-3 py-1 text-sm font-bold mb-4', statusBadge.class]">
              {{ statusBadge.text }}
            </span>
            <h1 class="text-3xl font-extrabold text-gray-900 leading-tight mb-6">{{ evento.title }}</h1>
            
            <h2 class="text-lg font-bold text-gray-900 mb-2">Acerca del evento</h2>
            <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ evento.description }}</p>
          </div>
        </article>

        <!-- Sidebar Info -->
        <aside class="space-y-6">
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Detalles del Evento</h3>
            
            <div class="space-y-5">
              <div class="flex items-start">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mr-4">
                  <Icon name="ph:clock-duotone" class="h-6 w-6" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">Fecha y Hora</p>
                  <p class="text-sm text-gray-600">{{ timeString }}</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mr-4">
                  <Icon name="ph:map-pin-duotone" class="h-6 w-6" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">Ubicación</p>
                  <p class="text-sm text-gray-600">{{ evento.location }}</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mr-4">
                  <Icon name="ph:users-duotone" class="h-6 w-6" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">Asistencia</p>
                  <p class="text-sm text-gray-600">{{ attendeesCount }} personas irán</p>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100">
              <button 
                @click="handleToggleAttendance"
                :disabled="isPastEvent || toggleLoading"
                :class="[
                  'w-full flex justify-center items-center rounded-xl px-6 py-3.5 font-bold transition-all',
                  isPastEvent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                  isAttending ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200'
                ]"
              >
                <Icon v-if="toggleLoading" name="ph:spinner-gap-bold" class="animate-spin h-5 w-5 mr-2" />
                <template v-else>
                  <Icon :name="isAttending ? 'ph:check-circle-fill' : 'ph:calendar-plus-duotone'" class="h-5 w-5 mr-2" />
                  {{ isPastEvent ? 'Evento Finalizado' : (isAttending ? 'Asistiré (Confirmado)' : 'Asistiré') }}
                </template>
              </button>
              <p v-if="!user" class="text-xs text-center text-gray-500 mt-3">Debes iniciar sesión para confirmar tu asistencia.</p>
            </div>
          </div>
        </aside>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { format, isFuture, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTablon, type TablonEvento } from '~/composables/useTablon'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const { getEventoById, toggleAsistenciaEvento, loading: tablonLoading } = useTablon()
const { user } = useAuth()

const evento = ref<TablonEvento | null>(null)
const loadingEvent = ref(true)
const toggleLoading = ref(false)

const loadEvent = async () => {
  const id = route.params.id as string
  if (id) {
    evento.value = await getEventoById(id)
  }
  loadingEvent.value = false
}

onMounted(() => {
  loadEvent()
})

const eventDate = computed(() => evento.value ? new Date(evento.value.date) : new Date())

const timeString = computed(() => {
  if (!evento.value) return ''
  return format(eventDate.value, "EEEE d 'de' MMMM, h:mm a", { locale: es })
})

const isPastEvent = computed(() => {
  if (!evento.value) return true
  return !isFuture(eventDate.value) && !isToday(eventDate.value)
})

const statusBadge = computed(() => {
  if (isToday(eventDate.value)) {
    return { text: 'Hoy', class: 'bg-emerald-100 text-emerald-800' }
  } else if (isFuture(eventDate.value)) {
    return { text: 'Próximamente', class: 'bg-amber-100 text-amber-800' }
  } else {
    return { text: 'Finalizado', class: 'bg-gray-100 text-gray-600' }
  }
})

const attendeesCount = computed(() => {
  if (!evento.value?.attendees) return 0
  return Object.keys(evento.value.attendees).length
})

const isAttending = computed(() => {
  if (!evento.value?.attendees || !user.value) return false
  return !!evento.value.attendees[user.value.uid]
})

const handleToggleAttendance = async () => {
  if (!user.value) {
    // Show login modal or alert ideally
    alert("Debes iniciar sesión para registrar tu asistencia")
    return
  }
  if (!evento.value?.id) return
  
  toggleLoading.value = true
  const success = await toggleAsistenciaEvento(evento.value.id)
  if (success) {
    await loadEvent() // Reload data to update counts locally
  }
  toggleLoading.value = false
}

useHead({
  title: computed(() => evento.value ? `${evento.value.title} | Eventos Adopta Zulia` : 'Evento | Adopta Zulia'),
})
</script>
