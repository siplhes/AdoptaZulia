import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth'
import { onValue } from 'firebase/database'
import { useSecureLogger } from './useSecureLogger'
import { useToast } from './useToast'
import { getDbRef, updateData, deleteData, pushData } from '~/utils/firebase'
import { handleFirebaseError } from '~/utils/errorHandler'

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const { debug, warn, error: logError } = useSecureLogger()
  const toast = useToast()

  const notifications = ref<any[]>([])
  const unreadCount = ref<number>(0)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  let notificationsListener: (() => void) | null = null

  // --- Email Sending Logic ---
  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      await $fetch('/api/emails/send', {
        method: 'POST',
        body: { to, subject, html },
      })
      toast.success('Correo enviado correctamente')
      return true
    } catch (err: any) {
      logError('Error enviando email:', err)
      toast.error('Error al enviar el correo')
      return false
    }
  }

  // --- Notification Listener ---
  const listenToNotifications = () => {
    if (!isAuthenticated.value || !user.value) return

    loading.value = true
    try {
      const notificationsRef = getDbRef(`notifications/${user.value.uid}`)

      if (notificationsListener) {
        notificationsListener()
      }

      notificationsListener = onValue(
        notificationsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val()
            const rawList = Object.entries(data).map(([id, val]: [string, any]) => ({
              id,
              ...val,
            }))

            // Filter for current user (defensive)
            const uid = user.value?.uid
            const filtered = rawList.filter((n) => !n.recipientId || n.recipientId === uid)

            // Sort by date desc
            notifications.value = filtered.sort((a: any, b: any) => b.createdAt - a.createdAt)
            unreadCount.value = filtered.filter((n: any) => !n.read).length
          } else {
            notifications.value = []
            unreadCount.value = 0
          }
          loading.value = false
        },
        (err) => {
          logError('Error loading notifications', err)
          error.value = handleFirebaseError(err)
          loading.value = false
        }
      )
    } catch (err) {
      logError('Error setting up notification listener', err)
      error.value = handleFirebaseError(err)
      loading.value = false
    }
  }

  // --- Actions ---
  const markAsRead = async (notificationId: string) => {
    if (!user.value) return
    try {
      await updateData(`notifications/${user.value.uid}/${notificationId}`, { read: true })
    } catch (err) {
      logError('Error marking as read', err)
      throw err
    }
  }

  const markAllAsRead = async () => {
    if (!user.value) return
    try {
      const updates: Record<string, any> = {}
      notifications.value.forEach((n) => {
        if (!n.read) updates[`notifications/${user.value?.uid}/${n.id}/read`] = true
      })
      if (Object.keys(updates).length) {
        await updateData('', updates) // Root update
        toast.success('Todas las notificaciones marcadas como leídas')
      }
    } catch (err) {
      logError('Error marking all as read', err)
      toast.error('Error al actualizar notificaciones')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!user.value) return
    try {
      await deleteData(`notifications/${user.value.uid}/${notificationId}`)
      toast.success('Notificación eliminada')
    } catch (err) {
      logError('Error deleting notification', err)
      toast.error('No se pudo eliminar la notificación')
    }
  }

  const createNotification = async (targetUserId: string, data: any) => {
    if (!targetUserId) return false
    try {
      await pushData(`notifications/${targetUserId}`, {
        ...data,
        recipientId: targetUserId,
        senderId: user.value?.uid || 'system',
        read: false,
        createdAt: Date.now(),
      })
      return true
    } catch (err) {
      logError('Error creating notification', err)
      return false
    }
  }

  // --- Watchers ---
  watch(
    () => isAuthenticated.value,
    (isAuth) => {
      if (isAuth) {
        listenToNotifications()
      } else {
        if (notificationsListener) notificationsListener()
        notifications.value = []
        unreadCount.value = 0
      }
    },
    { immediate: true }
  )

  return {
    notifications,
    unreadCount,
    loading,
    error,
    sendEmail,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  }
}
