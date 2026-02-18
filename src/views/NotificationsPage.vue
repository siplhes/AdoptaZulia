<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/tabs/home" text="Volver" /></ion-buttons>
        <ion-title>Notificaciones</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="markAllAsRead" :disabled="unreadCount === 0">
            <ion-icon :icon="checkmarkDoneOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <div v-if="loading && notifications.length === 0" class="loading-state">
        <ion-skeleton-text animated style="width: 100%; height: 80px; margin-bottom: 12px; border-radius: 12px;" v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon-wrapper">
          <ion-icon :icon="notificationsOffOutline" />
        </div>
        <h3>Sin notificaciones</h3>
        <p>Te avisaremos cuando haya novedades importantes para ti</p>
      </div>

      <ion-list v-else lines="none" class="notification-list">
        <ion-item-sliding v-for="notification in notifications" :key="notification.id">
          <ion-item 
            button 
            @click="handleNotificationClick(notification)"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
          >
            <div class="notification-icon" :class="getTypeColor(notification.type)">
              <ion-icon :icon="getIcon(notification.type)" />
            </div>
            <ion-label class="ion-text-wrap">
              <h2>{{ notification.title }}</h2>
              <p>{{ notification.message }}</p>
              <ion-note>{{ formatDate(notification.createdAt) }}</ion-note>
            </ion-label>
            <div v-if="!notification.read" class="unread-dot" slot="end"></div>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" @click="markAsRead(notification.id)">
              <ion-icon slot="icon-only" :icon="checkmarkOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonItemSliding, IonItemOptions, IonItemOption, IonRefresher, IonRefresherContent, IonSkeletonText } from '@ionic/vue'
import { notificationsOffOutline, checkmarkDoneOutline, checkmarkOutline, informationCircleOutline, alertCircleOutline, heartOutline, pawOutline } from 'ionicons/icons'
import { useNotifications } from '@/composables/useNotifications'
import type { Notification } from '@/models/Notification'

const router = useRouter()
const { notifications, unreadCount, loading, loadNotifications, markAsRead, markAllAsRead } = useNotifications()

async function handleRefresh(event: any) {
  await loadNotifications()
  event.target.complete()
}

function getTypeColor(type: string) {
  switch (type) {
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'alert': return 'danger'
    default: return 'primary'
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'success': return heartOutline
    case 'warning': return alertCircleOutline
    case 'alert': return pawOutline
    default: return informationCircleOutline
  }
}

function formatDate(ts: number) {
  const date = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'Justo ahora'
  if (diff < 3600 * 1000) return `Hace ${Math.floor(diff / 60000)} min`
  if (diff < 86400 * 1000) return `Hace ${Math.floor(diff / 3600000)} h`
  return date.toLocaleDateString()
}

async function handleNotificationClick(notification: Notification) {
  if (!notification.read) {
    await markAsRead(notification.id)
  }
  if (notification.link) {
    router.push(notification.link)
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.loading-state { padding: 16px; }
.empty-state { text-align: center; padding: 60px 20px; color: var(--ion-color-medium); }
.empty-icon-wrapper { background: var(--ion-color-light); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon-wrapper ion-icon { font-size: 40px; }
.empty-state h3 { font-size: 1.2rem; font-weight: 800; color: var(--ion-text-color); margin-bottom: 8px; }

.notification-list { background: transparent; padding: 0; }
.notification-item { 
  --padding-start: 16px; --padding-end: 16px; --padding-top: 12px; --padding-bottom: 12px;
  --background: var(--ion-card-background, white);
  margin-bottom: 1px;
}
.notification-item.unread { --background: var(--ion-color-light); }

.notification-icon {
  width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-size: 20px; color: white;
}
.notification-icon.primary { background: var(--ion-color-primary); }
.notification-icon.success { background: var(--ion-color-success); }
.notification-icon.warning { background: var(--ion-color-warning); }
.notification-icon.danger { background: var(--ion-color-danger); }

ion-label h2 { font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
ion-label p { font-size: 0.85rem; color: var(--ion-color-medium); margin-bottom: 4px; }
ion-note { font-size: 0.75rem; }

.unread-dot { width: 10px; height: 10px; background: var(--ion-color-primary); border-radius: 50%; margin-left: 8px; }
</style>
