import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth'
import { getDatabase, ref as dbRef, onValue, update, get, push, remove, set } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const firebaseApp = useFirebaseApp()
  const db = getDatabase(firebaseApp)
  
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)
  
  let notificationsListener = null
  
  const listenToNotifications = () => {
    if (!isAuthenticated.value || !user.value) return
    
    loading.value = true
    
    try {
      const notificationsRef = dbRef(db, `notifications/${user.value.uid}`)
      
      // Eliminar el listener anterior si existe
      if (notificationsListener) {
        notificationsListener()
      }
      
      notificationsListener = onValue(notificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          const notificationsList = Object.entries(data).map(([id, notification]) => ({
            id,
            ...notification
          }))
          

          notifications.value = notificationsList.sort((a, b) => b.createdAt - a.createdAt)
      
          unreadCount.value = notificationsList.filter(n => !n.read).length
        } else {
          notifications.value = []
          unreadCount.value = 0
        }
        loading.value = false
      }, (err) => {
        console.error('Error al cargar notificaciones:', err)
        error.value = 'Error al cargar notificaciones'
        loading.value = false
      })
    } catch (err) {
      console.error('Error al configurar listener de notificaciones:', err)
      error.value = 'Error al configurar notificaciones'
      loading.value = false
    }
  }
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated.value || !user.value) return false
    
    try {
      const notificationRef = dbRef(db, `notifications/${user.value.uid}/${notificationId}`)
      await update(notificationRef, { read: true })
      return true
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err)
      error.value = 'Error al actualizar notificación'
      return false
    }
  }
  const markAllAsRead = async () => {
    if (!isAuthenticated.value || !user.value) return false
    
    try {
      const updates = {}
      notifications.value.forEach(notification => {
        if (!notification.read) {
          updates[`notifications/${user.value.uid}/${notification.id}/read`] = true
        }
      })
      
      if (Object.keys(updates).length > 0) {
        await update(dbRef(db), updates)
      }
      
      return true
    } catch (err) {
      console.error('Error al marcar todas las notificaciones como leídas:', err)
      error.value = 'Error al actualizar notificaciones'
      return false
    }
  }
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated.value || !user.value) return false
    
    try {
      const notificationRef = dbRef(db, `notifications/${user.value.uid}/${notificationId}`)
      await remove(notificationRef)
      return true
    } catch (err) {
      console.error('Error al eliminar notificación:', err)
      error.value = 'Error al eliminar notificación'
      return false
    }
  }
  const createNotification = async (userId, data) => {
    if (!userId) {
      console.error('No se pudo crear notificación: userId es undefined o null')
      return false
    }
    
    try {
      const notificationsRef = dbRef(db, `notifications/${userId}`)
      const newNotification = {
        ...data,
        read: false,
        createdAt: Date.now()
      }
      
      const newNotificationRef = push(notificationsRef)
      await set(newNotificationRef, newNotification)
      return true
    } catch (err) {
      console.error('Error al crear notificación:', err)
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