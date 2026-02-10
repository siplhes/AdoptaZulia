<template>
  <div class="relative inline-block">
    <!-- Botón de notificaciones -->
    <button
      class="relative flex h-9 w-9 items-center justify-center rounded-full focus:outline-none"
      aria-label="Notificaciones"
      @click="toggleNotifications"
    >
      <Icon name="heroicons:bell" class="h-6 w-6 text-white" />

      <!-- Contador de notificaciones -->
      <span
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Panel de notificaciones -->
    <div
      v-show="isOpen"
      class="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div class="flex items-center justify-between border-b border-gray-200 p-3">
        <h3 class="text-md font-medium text-gray-900">Notificaciones</h3>
        <button
          v-if="notifications.length > 0 && unreadCount > 0"
          class="text-xs text-emerald-600 hover:text-emerald-800"
          @click="handleMarkAllAsRead"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div v-if="loading" class="p-4 text-center">
        <div
          class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        />
        <p class="mt-2 text-sm text-gray-500">Cargando notificaciones...</p>
      </div>

      <div v-else-if="notifications.length === 0" class="p-4 text-center">
        <Icon name="heroicons:bell-slash" class="mx-auto h-12 w-12 text-gray-400" />
        <p class="mt-2 text-sm text-gray-500">No tienes notificaciones</p>
      </div>

      <ul v-else role="list" class="divide-y divide-gray-100">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="relative cursor-pointer px-4 py-3 transition-colors hover:bg-gray-50"
          :class="{ 'bg-emerald-50': !notification.read }"
          @click="openNotification(notification)"
        >
          <div class="flex items-start gap-x-3">
            <div class="flex-shrink-0">
              <Icon
                :name="getIconForType(notification.type)"
                class="h-5 w-5"
                :class="getColorForType(notification.type)"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="text-sm font-medium text-gray-900"
                :class="{ 'font-semibold': !notification.read }"
              >
                {{ notification.title }}
              </p>
              <p class="mt-1 line-clamp-2 text-xs text-gray-500">
                {{ notification.message }}
              </p>
              <div class="mt-1 flex items-center gap-x-2 text-xs text-gray-500">
                <p>{{ formatDate(notification.createdAt) }}</p>

                <div v-if="notification.actionLink" class="flex">
                  <NuxtLink
                    :to="notification.actionLink"
                    class="font-medium text-emerald-600 hover:text-emerald-800"
                    @click="handleNotificationClick(notification)"
                  >
                    {{ notification.actionText || 'Ver' }}
                  </NuxtLink>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <button
                v-if="!notification.read"
                class="text-emerald-600 hover:text-emerald-800"
                aria-label="Marcar como leída"
                @click.stop="markAsRead(notification.id)"
              >
                <Icon name="heroicons:check-circle" class="h-5 w-5" />
              </button>
              <button
                class="text-gray-400 hover:text-gray-600"
                aria-label="Eliminar notificación"
                @click.stop="deleteNotification(notification.id)"
              >
                <Icon name="heroicons:trash" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '~/composables/useNotifications'
import { formatRelativeTime } from '~/utils/dateFormatter'

// No necesitamos importar useToast aquí porque useNotifications ya maneja el feedback visual para acciones grandes,
// aunque para acciones locales (como clickear) podemos dejarlo simple.

const {
  notifications,
  unreadCount,
  loading,
  markAsRead: markNotificationAsRead,
  markAllAsRead,
  deleteNotification: removeNotification,
} = useNotifications()

const isOpen = ref(false)
const router = useRouter()

const toggleNotifications = () => {
  isOpen.value = !isOpen.value
}

const closeOnClickOutside = (event) => {
  const notificationsPanel = document.querySelector('[role="list"]')?.parentElement
  const notificationsButton = document.querySelector('[aria-label="Notificaciones"]')

  if (
    isOpen.value &&
    notificationsPanel &&
    notificationsButton &&
    !notificationsPanel.contains(event.target) &&
    !notificationsButton.contains(event.target)
  ) {
    isOpen.value = false
  }
}

const markAsRead = async (notificationId) => {
  await markNotificationAsRead(notificationId)
}

const deleteNotification = async (notificationId) => {
  await removeNotification(notificationId)
}

const handleMarkAllAsRead = async () => {
  await markAllAsRead()
}

const handleNotificationClick = (notification) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
  isOpen.value = false
}

const openNotification = (notification) => {
  if (!notification) return
  if (!notification.read) {
    markAsRead(notification.id)
  }
  isOpen.value = false
  if (notification.actionLink) {
    try {
      router.push(notification.actionLink)
    } catch (err) {
      console.warn('Navigation failed', err)
    }
  }
}

const getIconForType = (type) => {
  switch (type) {
    case 'adoption_request':
      return 'heroicons:heart'
    case 'adoption_approved':
      return 'heroicons:check-badge'
    case 'adoption_rejected':
      return 'heroicons:x-circle'
    case 'message':
      return 'heroicons:chat-bubble-left-text'
    case 'system':
      return 'heroicons:information-circle'
    default:
      return 'heroicons:bell'
  }
}

const getColorForType = (type) => {
  switch (type) {
    case 'adoption_request':
      return 'text-pink-500'
    case 'adoption_approved':
      return 'text-green-500'
    case 'adoption_rejected':
      return 'text-red-500'
    case 'message':
      return 'text-blue-500'
    case 'system':
      return 'text-amber-500'
    default:
      return 'text-gray-500'
  }
}

const formatDate = (timestamp) => formatRelativeTime(timestamp)

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen.value) isOpen.value = false
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside)
})
</script>

<style scoped>
/* Estilizar la barra de desplazamiento para el panel de notificaciones */
div[role='list'] {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

div[role='list']::-webkit-scrollbar {
  width: 6px;
}

div[role='list']::-webkit-scrollbar-track {
  background: transparent;
}

div[role='list']::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
</style>
