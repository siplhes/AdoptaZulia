import { ref, computed, watch } from 'vue'
import { getDb, updateData } from '@/config/firebase'
import { ref as dbRef, query, orderByChild, equalTo, onValue, off, limitToLast } from 'firebase/database'
import type { Notification } from '@/models/Notification'
import { useAuth } from '@/composables/useAuth'

import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

const notifications = ref<Notification[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const fcmToken = ref<string | null>(null)
let unsubscribe: (() => void) | null = null

export function useNotifications() {
  const { currentUser } = useAuth()
  const db = getDb()

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  function cleanupListener() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  function setupListener(userId: string) {
    if (unsubscribe) return // Already listening

    loading.value = true
    error.value = null

    const notificationsRef = dbRef(db, 'notifications')
    const userNotificationsQuery = query(
        notificationsRef, 
        orderByChild('userId'), 
        equalTo(userId),
        limitToLast(50) // Reasonable limit
    )

    unsubscribe = onValue(userNotificationsQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        notifications.value = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a, b) => b.createdAt - a.createdAt)
      } else {
        notifications.value = []
      }
      loading.value = false
    }, (err) => {
      console.error('Error listening to notifications:', err)
      error.value = 'No se pudieron cargar las notificaciones'
      loading.value = false
    })
  }

  // Auto-init listener when user is available
  watch(currentUser, (newUser) => {
      if (newUser) {
          setupListener(newUser.uid)
      } else {
          cleanupListener()
          notifications.value = []
      }
  }, { immediate: true })

  // Push Logic (unchanged mostly, but ensured logic is robust)
  async function registerPushNotifications() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push Notifications only work on native devices')
      return
    }

    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      error.value = 'Permiso de notificaciones denegado'
      return
    }

    await PushNotifications.register()

    PushNotifications.addListener('registration', (token) => {
      console.log('Push Registration Token: ', token.value)
      fcmToken.value = token.value
      if (currentUser.value) {
        updateData(`users/${currentUser.value.uid}`, { fcmToken: token.value })
      }
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push Registration Error: ', err.error)
    })

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push Received: ', notification)
        // Listener handles data update automatically via Firebase real-time
    })

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push Action Performed: ', notification)
    })
  }

  // Deprecated manual load (kept for compatibility logic if needed, but now auto-managed)
  async function loadNotifications() {
      if (currentUser.value && !unsubscribe) {
          setupListener(currentUser.value.uid)
      }
  }

  async function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      // Optimistic
      notification.read = true 
      try {
        await updateData(`notifications/${id}`, { read: true })
      } catch (e) {
        console.error('Error marking as read', e)
        notification.read = false // Revert
      }
    }
  }

  async function markAllAsRead() {
    const unread = notifications.value.filter(n => !n.read)
    unread.forEach(n => n.read = true)

    try {
      const updates = unread.map(n => updateData(`notifications/${n.id}`, { read: true }))
      await Promise.all(updates)
    } catch (e) {
      console.error('Error marking all as read', e)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    registerPushNotifications
  }
}
