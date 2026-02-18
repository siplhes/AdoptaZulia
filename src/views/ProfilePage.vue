<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mi perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/notifications">
            <ion-icon :icon="notificationsOutline" />
            <ion-badge v-if="unreadCount > 0" color="danger" class="notification-badge">{{ unreadCount }}</ion-badge>
          </ion-button>
          <ion-button @click="toggleTheme">
            <ion-icon :icon="isDark ? sunny : moon" />
          </ion-button>
          <ion-button @click="router.push('/settings')">
            <ion-icon :icon="settingsOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Not logged in -->
      <div v-if="!isAuthenticated && !authLoading" class="empty-state">
        <ion-icon :icon="personCircleOutline" />
        <h3>Inicia sesión</h3>
        <p>Accede a tu cuenta para ver tu perfil y guardar favoritos</p>
        <ion-button router-link="/login">Iniciar sesión</ion-button>
        <ion-button fill="outline" router-link="/register" style="margin-top:8px">Crear cuenta</ion-button>
      </div>

      <!-- Loading -->
      <div v-if="authLoading" class="profile-loading">
        <ion-skeleton-text animated style="width:80px;height:80px;border-radius:50%" />
        <ion-skeleton-text animated style="width:50%;height:20px;margin-top:12px" />
        <ion-skeleton-text animated style="width:30%;height:16px;margin-top:6px" />
      </div>

      <!-- Profile -->
      <div v-if="isAuthenticated" class="profile-content">
        <div class="profile-header">
          <img 
            :src="userProfile?.photoURL || currentUser?.photoURL || '/placeholder.webp'" 
            class="profile-avatar" 
          />
          <h2 class="profile-name">{{ userProfile?.displayName || currentUser?.displayName || 'Usuario' }}</h2>
          <p class="profile-email">{{ userProfile?.email || currentUser?.email }}</p>
          <ion-badge v-if="userProfile?.role" :color="userProfile.role === 'admin' ? 'warning' : 'primary'" class="role-badge">{{ userProfile.role }}</ion-badge>
        </div>

        <div v-if="!userProfile" class="error-banner">
          <ion-icon :icon="alertCircleOutline" />
          <p>No se pudo cargar el perfil completo (Error de permisos)</p>
        </div>

        <template v-if="userProfile">
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-value">{{ userProfile.postCount || 0 }}</span>
              <span class="stat-label">Publicaciones</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ favorites.length }}</span>
              <span class="stat-label">Favoritos</span>
            </div>
          </div>

          <!-- Tabs -->
          <ion-segment v-model="activeTab" class="profile-tabs">
            <ion-segment-button value="menu">
              <ion-label>Menú</ion-label>
            </ion-segment-button>
            <ion-segment-button value="favs">
              <ion-label>Favoritos</ion-label>
            </ion-segment-button>
          </ion-segment>

          <!-- Menu Tab -->
          <div v-if="activeTab === 'menu'" class="fade-in">
            <ion-list class="profile-menu">
              <ion-item v-if="userProfile.bio" lines="none">
                <ion-icon :icon="documentTextOutline" slot="start" color="primary" />
                <ion-label class="ion-text-wrap"><p>{{ userProfile.bio }}</p></ion-label>
              </ion-item>
              <ion-item v-if="userProfile.phone || userProfile.phoneNumber" lines="none">
                <ion-icon :icon="callOutline" slot="start" color="primary" />
                <ion-label>{{ userProfile.phone || userProfile.phoneNumber }}</ion-label>
              </ion-item>
              <ion-item v-if="userProfile.address" lines="none">
                <ion-icon :icon="locationOutline" slot="start" color="primary" />
                <ion-label>{{ userProfile.address }}</ion-label>
              </ion-item>
              <ion-item lines="none" v-if="userProfile.createdAt">
                <ion-icon :icon="calendarOutline" slot="start" color="medium" />
                <ion-label color="medium">Miembro desde {{ formatDate(userProfile.createdAt) }}</ion-label>
              </ion-item>
            </ion-list>

            <div class="profile-actions">
              <ion-button expand="block" fill="outline" color="danger" @click="handleLogout">
                <ion-icon :icon="logOutOutline" slot="start" /> Cerrar sesión
              </ion-button>
            </div>
          </div>

          <!-- Favorites Tab -->
          <div v-if="activeTab === 'favs'" class="fade-in">
            <div v-if="favoritePets.length === 0" class="empty-favs">
              <ion-icon :icon="heartDislikeOutline" class="empty-icon" />
              <p>No tienes veterinarios favoritos aún</p>
              <ion-button fill="clear" router-link="/tabs/mascotas">Explorar mascotas</ion-button>
            </div>
            <div v-else class="favs-grid">
              <ion-card v-for="pet in favoritePets" :key="pet.id" class="fav-card" :router-link="`/mascotas/${pet.id}`" button>
                <div class="fav-img-wrapper">
                  <img :src="pet.image || pet.photos?.[0] || '/placeholder.webp'" loading="lazy" />
                </div>
                <ion-card-content class="fav-content">
                  <div class="fav-name">{{ pet.name }}</div>
                  <div class="fav-breed">{{ pet.breed || pet.type }}</div>
                </ion-card-content>
              </ion-card>
            </div>
          </div>
        </template>
        
        <div v-else class="profile-actions">
           <ion-button expand="block" fill="outline" color="danger" @click="handleLogout">
              <ion-icon :icon="logOutOutline" slot="start" /> Cerrar sesión
            </ion-button>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonBadge, 
  IonRefresher, IonRefresherContent, IonSkeletonText, 
  IonSegment, IonSegmentButton, IonCard, IonCardContent, IonToggle,
  IonButtons
} from '@ionic/vue'
import { 
  personCircleOutline, documentTextOutline, callOutline, 
  locationOutline, calendarOutline, logOutOutline, 
  heartDislikeOutline, alertCircleOutline, contrastOutline,
  settingsOutline, moon, sunny, notificationsOutline,
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useFavorites } from '@/composables/useFavorites'
import { usePets } from '@/composables/usePets'
import { useTheme } from '@/composables/useTheme'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { isAuthenticated, userProfile, currentUser, loading: authLoading, initAuth, logout } = useAuth()
const { favorites } = useFavorites()
const { isDark, toggleTheme } = useTheme()
const { pets, loadPets } = usePets()
const { unreadCount } = useNotifications()
const toast = useToast()

const activeTab = ref('menu')

const favoritePets = computed(() => {
  return pets.value.filter((p) => p.id && favorites.value.includes(p.id))
})

function formatDate(ts?: number) { 
  return ts ? new Date(ts).toLocaleDateString('es-VE', { month: 'long', year: 'numeric' }) : '' 
}

async function handleLogout() { 
  await logout()
  toast.info('Sesión cerrada')
  router.replace('/tabs/home') 
}

async function handleRefresh(ev: any) { 
  await Promise.all([initAuth(), loadPets()])
  setTimeout(() => ev.target.complete(), 1000) 
}

onMounted(async () => {
  await initAuth()
  if (pets.value.length === 0) await loadPets()
})
</script>

<style scoped>
.profile-loading { display: flex; flex-direction: column; align-items: center; padding: 48px 24px; }
.profile-content { padding: 24px 20px; }

.profile-header {
  text-align: center;
  margin-bottom: 24px;
  background: var(--ion-color-light);
  padding: 24px;
  border-radius: 24px;
  border: 2px solid var(--ion-color-light-shade);
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--ion-color-primary);
  margin-bottom: 12px;
  box-shadow: 0 4px 0 var(--ion-color-primary-shade);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 4px;
  color: var(--ion-text-color);
}

.profile-email {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ion-color-medium);
  margin: 0 0 12px;
}

.role-badge {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 12px;
  border-radius: 12px;
}

/* Gamified Stats */
.profile-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.stat {
  background: var(--ion-card-background, white);
  border: 2px solid var(--ion-color-light-shade);
  border-radius: 20px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 4px 0 var(--ion-color-light-shade);
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ion-color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ion-color-medium);
  text-transform: uppercase;
}

/* Tabs */
.profile-tabs { margin-bottom: 24px; }

ion-segment-button {
  --indicator-color: transparent;
  --color: var(--ion-color-medium);
  --color-checked: var(--ion-color-primary-contrast);
  --background-checked: var(--ion-color-primary);
  border-radius: 16px;
  border: 2px solid var(--ion-color-light-shade);
  margin: 0 4px;
  font-weight: 700;
  height: 40px;
}

ion-segment-button.segment-button-checked {
  border-color: var(--ion-color-primary-shade);
  box-shadow: 0 4px 0 var(--ion-color-primary-shade);
  transform: translateY(-2px);
}

/* Menu */
.profile-menu {
  background: transparent;
  padding: 0;
  margin-bottom: 24px;
}

ion-item {
  --background: var(--ion-card-background, white);
  --border-radius: 16px;
  --inner-border-width: 0;
  margin-bottom: 12px;
  border: 2px solid var(--ion-color-light-shade);
  box-shadow: 0 2px 0 var(--ion-color-light-shade);
}

.profile-actions { padding: 0 4px; }

/* Favs */
.empty-favs {
  text-align: center;
  padding: 40px 0;
  color: var(--ion-color-medium);
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.favs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.fav-card {
  margin: 0;
  border-radius: 16px;
  box-shadow: 0 2px 0 var(--ion-color-light-shade);
  border: 2px solid var(--ion-color-light-shade);
  display: flex;
  flex-direction: column;
}

.fav-img-wrapper {
  height: 120px;
  overflow: hidden;
  background: var(--ion-color-light);
}

.fav-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fav-content {
  padding: 10px;
  flex: 1;
}

.fav-name {
  font-weight: 800;
  font-size: 0.9rem;
  margin-bottom: 2px;
  color: var(--ion-text-color);
}

.fav-breed {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  margin-top: 40px;
}

.empty-state ion-icon {
  font-size: 64px;
  color: var(--ion-color-medium-tint);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 24px;
}

.error-banner {
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  color: var(--ion-color-danger);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--ion-color-danger);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 0.9rem;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 8px;
  padding: 2px 4px;
  border-radius: 6px;
  min-width: 14px;
}
</style>
