<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Centro de Comunicación</h1>
      <p class="mt-1 text-gray-600">Envía notificaciones y mensajes a los usuarios</p>
    </div>

    <!-- Send Notification Form -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">Enviar Notificación</h2>

      <form @submit.prevent="handleSendNotification" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Destinatarios</label>
          <select
            v-model="notificationForm.recipientType"
            class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="all">Todos los usuarios</option>
            <option value="specific">Usuario específico</option>
          </select>
        </div>

        <div v-if="notificationForm.recipientType === 'specific'">
          <label class="block text-sm font-medium text-gray-700">ID de Usuario</label>
          <input
            v-model="notificationForm.userId"
            type="text"
            placeholder="uid del usuario"
            class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Asunto</label>
          <input
            v-model="notificationForm.subject"
            type="text"
            required
            placeholder="Título de la notificación"
            class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Mensaje</label>
          <textarea
            v-model="notificationForm.message"
            required
            rows="5"
            placeholder="Escribe tu mensaje aquí..."
            class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Tipo de Notificación</label>
          <select
            v-model="notificationForm.type"
            class="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="internal">Notificación Interna</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="resetForm"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Limpiar
          </button>
          <button
            type="submit"
            :disabled="sending"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="sending" class="flex items-center gap-2">
              <div class="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Enviando...
            </span>
            <span v-else>Enviar Notificación</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Quick Templates -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">Plantillas Rápidas</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="template in templates"
          :key="template.id"
          @click="applyTemplate(template)"
          class="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-emerald-500 hover:bg-emerald-50"
        >
          <div class="flex items-start gap-3">
            <div class="rounded-lg bg-emerald-100 p-2">
              <Icon :name="template.icon" class="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ template.name }}</h3>
              <p class="text-sm text-gray-600">{{ template.description }}</p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Notification History -->
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900">Historial de Envíos</h2>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <div v-else-if="sentNotifications.length === 0" class="p-8 text-center text-gray-500">
        <Icon name="mdi:email-off" class="mx-auto mb-2 h-12 w-12" />
        <p>No hay notificaciones enviadas</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Asunto
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Destinatarios
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Enviado Por
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="notif in paginatedHistory"
              :key="notif.id"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <p class="font-medium text-gray-900">{{ notif.subject }}</p>
                <p class="text-sm text-gray-500 line-clamp-1">{{ notif.message }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ notif.recipients === 'all' ? 'Todos' : `${notif.recipients.length} usuario(s)` }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                    notif.type === 'email'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800',
                  ]"
                >
                  {{ notif.type === 'email' ? 'Email' : 'Interna' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(notif.sentAt) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ notif.sentByName || 'Admin' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3"
      >
        <p class="text-sm text-gray-600">
          Mostrando {{ (currentPage - 1) * perPage + 1 }} a
          {{ Math.min(currentPage * perPage, sentNotifications.length) }} de
          {{ sentNotifications.length }} resultados
        </p>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '~/composables/useAuth'
import { fetchData, pushData } from '~/utils/firebase'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

const { user } = useAuth()

// Form state
const notificationForm = ref({
  recipientType: 'all',
  userId: '',
  subject: '',
  message: '',
  type: 'internal',
})

const sending = ref(false)
const loading = ref(false)
const sentNotifications = ref([])

// Pagination
const currentPage = ref(1)
const perPage = ref(10)

// Templates
const templates = [
  {
    id: 'welcome',
    name: 'Bienvenida',
    description: 'Mensaje de bienvenida a nuevos usuarios',
    icon: 'mdi:hand-wave',
    subject: '¡Bienvenido a AdoptaZulia!',
    message:
      '¡Hola! Bienvenido a nuestra plataforma. Estamos emocionados de tenerte con nosotros. Explora nuestras mascotas y encuentra tu compañero perfecto.',
  },
  {
    id: 'announcement',
    name: 'Anuncio',
    description: 'Anuncio general importante',
    icon: 'mdi:bullhorn',
    subject: 'Anuncio Importante',
    message: 'Tenemos novedades importantes que queremos compartir contigo...',
  },
  {
    id: 'reminder',
    name: 'Recordatorio',
    description: 'Recordatorio de acciones pendientes',
    icon: 'mdi:bell',
    subject: 'Recordatorio',
    message: 'Te recordamos que...',
  },
  {
    id: 'adoption_success',
    name: 'Adopción Exitosa',
    description: 'Felicitación por adopción',
    icon: 'mdi:heart',
    subject: '¡Felicidades por tu adopción!',
    message:
      '¡Felicidades! Estamos muy felices de que hayas encontrado tu nueva mascota. Recuerda cuidarla con amor.',
  },
  {
    id: 'maintenance',
    name: 'Mantenimiento',
    description: 'Notificación de mantenimiento',
    icon: 'mdi:wrench',
    subject: 'Mantenimiento Programado',
    message:
      'Te informamos que estaremos realizando mantenimiento el día... La plataforma estará temporalmente no disponible.',
  },
  {
    id: 'update',
    name: 'Actualización',
    description: 'Nueva actualización disponible',
    icon: 'mdi:update',
    subject: 'Nueva Actualización Disponible',
    message:
      'Hemos lanzado nuevas funcionalidades en la plataforma. ¡Descubre todas las novedades!',
  },
]

// Computed
const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return sentNotifications.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(sentNotifications.value.length / perPage.value)
})

// Methods
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  return format(new Date(timestamp), "d 'de' MMM yyyy HH:mm", { locale: es })
}

const applyTemplate = (template) => {
  notificationForm.value.subject = template.subject
  notificationForm.value.message = template.message
}

const resetForm = () => {
  notificationForm.value = {
    recipientType: 'all',
    userId: '',
    subject: '',
    message: '',
    type: 'internal',
  }
}

// ...
import { useAdminLogs } from '~/composables/useAdminLogs'

// ...
const { logAction } = useAdminLogs()

// ...

const handleSendNotification = async () => {
  sending.value = true

  try {
    const recipients =
      notificationForm.value.recipientType === 'all'
        ? 'all'
        : [notificationForm.value.userId]

    await $fetch('/api/notifications/send', {
      method: 'POST',
      body: {
        recipients,
        subject: notificationForm.value.subject,
        message: notificationForm.value.message,
        type: notificationForm.value.type,
        sentBy: user.value?.uid || 'admin',
        sentByName: user.value?.displayName || 'Admin',
      },
    })
    
    // Log action
    await logAction(
      'create',
      'communication',
      `Envió notificación: ${notificationForm.value.subject}`,
      { 
        type: notificationForm.value.type,
        recipients: recipients === 'all' ? 'Todos' : 'Usuario específico'
      }
    )

    // Clear form
    resetForm()

    // Reload history
    await loadNotificationHistory()

    alert(`¡Notificación enviada exitosamente!`)
  } catch (err) {
    console.error('Error al enviar notificación:', err)
    alert('Error al enviar notificación: ' + (err.data?.message || err.message))
  } finally {
    sending.value = false
  }
}

const loadNotificationHistory = async () => {
  loading.value = true

  try {
    const notificationsData = await fetchData('admin_notifications')

    if (notificationsData) {
      sentNotifications.value = Object.entries(notificationsData)
        .map(([id, data]) => ({
          ...data,
          id,
        }))
        .sort((a, b) => b.sentAt - a.sentAt)
    } else {
      sentNotifications.value = []
    }
  } catch (err) {
    console.error('Error al cargar historial:', err)
  } finally {
    loading.value = false
  }
}

// Load data
onMounted(async () => {
  await loadNotificationHistory()
})
</script>
