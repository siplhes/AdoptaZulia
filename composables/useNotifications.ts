import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth'
import { getDatabase, ref as dbRef, onValue, update, get, push, remove, set } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import { useSecureLogger } from './useSecureLogger'

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const firebaseApp = useFirebaseApp()
  const db = getDatabase(firebaseApp)
  const { debug, warn, error: logError } = useSecureLogger()

  const notifications = ref<any[]>([])
  const unreadCount = ref<number>(0)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  let notificationsListener: (() => void) | null = null
  
  const listenToNotifications = () => {
    if (!isAuthenticated.value || !user.value) return

    loading.value = true

    try {
      // Defensive: log current auth/user info to help debug permission issues
      debug('listenToNotifications: current user', { uid: user.value?.uid, isAuthenticated: isAuthenticated.value })

      const notificationsRef = dbRef(db, `notifications/${user.value.uid}`)

      // Eliminar el listener anterior si existe
      if (notificationsListener) {
        notificationsListener()
      }

      notificationsListener = onValue(notificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          const notificationsList = Object.entries(data).map(([id, notification]: [string, any]) => ({
            id,
            ...(notification as any)
          }))

          // Defensive filter: ensure recipientId matches current user uid. If recipientId is missing
          // keep the item but log a warning to help detect malformed notifications.
          const uid = user?.value?.uid || null
          const filtered = notificationsList.filter((n: any) => {
            if (!n.recipientId) {
              warn('notification without recipientId received', n)
              // Auto-fix: add recipientId if missing (legacy notification migration)
              n.recipientId = uid
              return true
            }
            const ok = uid && n.recipientId === uid
            if (!ok) {
              warn('notification recipient mismatch — dropping item', { expected: uid, found: n.recipientId, id: n.id })
            }
            return ok
          })

          notifications.value = filtered.sort((a: any, b: any) => b.createdAt - a.createdAt)

          unreadCount.value = filtered.filter((n: any) => !n.read).length
        } else {
          notifications.value = []
          unreadCount.value = 0
        }
        loading.value = false
      }, (err: any) => {
        // Provide clearer message when rules block access
        logError('Error al cargar notificaciones:', err)
        const errCode = (err && (err as any).code) ? (err as any).code : null
        if (errCode === 'permission_denied') {
          error.value = 'Permiso denegado al leer notificaciones. Revisa las reglas de Realtime Database y asegúrate de que estén desplegadas.'
        } else {
          error.value = 'Error al cargar notificaciones'
        }
        loading.value = false
      })
    } catch (err) {
      logError('Error al configurar listener de notificaciones:', err)
      error.value = 'Error al configurar notificaciones'
      loading.value = false
    }
  }
  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticated.value || !user.value) return false

    try {
      const notificationRef = dbRef(db, `notifications/${user.value.uid}/${notificationId}`)
      await update(notificationRef, { read: true })
      return true
    } catch (err) {
      logError('Error al marcar notificación como leída:', err)
      error.value = 'Error al actualizar notificación'
      return false
    }
  }
  const markAllAsRead = async () => {
    if (!isAuthenticated.value || !user.value) return false

    try {
      const updates: Record<string, any> = {}
      const uid = user.value.uid
      notifications.value.forEach((notification: any) => {
        if (!notification.read) {
          updates[`notifications/${uid}/${notification.id}/read`] = true
        }
      })

      if (Object.keys(updates).length > 0) {
        await update(dbRef(db), updates)
      }

      return true
    } catch (err) {
      logError('Error al marcar todas las notificaciones como leídas:', err)
      error.value = 'Error al actualizar notificaciones'
      return false
    }
  }
  const deleteNotification = async (notificationId: string) => {
    if (!isAuthenticated.value || !user.value) return false

    try {
      const notificationRef = dbRef(db, `notifications/${user.value.uid}/${notificationId}`)
      await remove(notificationRef)
      return true
    } catch (err) {
      logError('Error al eliminar notificación:', err)
      error.value = 'Error al eliminar notificación'
      return false
    }
  }
  const createNotification = async (userId: string, data: Record<string, any>) => {
    if (!userId) {
      logError('No se pudo crear notificación: userId es undefined o null')
      return false
    }

    try {
      const notificationsRef = dbRef(db, `notifications/${userId}`)
      const newNotification = {
        ...data,
        recipientId: userId,
        senderId: user?.value?.uid || null,
        read: false,
        createdAt: Date.now()
      }

      const newNotificationRef = push(notificationsRef)
      await set(newNotificationRef, newNotification)
      return true
    } catch (err) {
      logError('Error al crear notificación:', err)
      return false
    }
  }
  
  watch(() => isAuthenticated.value, (newValue) => {
    if (newValue) {
      listenToNotifications()
    } else {
      if (notificationsListener) {
        notificationsListener()
        notificationsListener = null
      }
      notifications.value = []
      unreadCount.value = 0
    }
  }, { immediate: true })
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    listenToNotifications
  }
}