<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Mascotas perdidas</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/notifications">
            <ion-icon :icon="notificationsOutline" />
            <ion-badge v-if="unreadCount > 0" color="danger" class="notification-badge">{{ unreadCount }}</ion-badge>
          </ion-button>
          <ion-button @click="toggleTheme">
            <ion-icon :icon="isDark ? sunny : moon" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="hero-banner lost-hero">
        <div class="hero-content">
          <h1>Ayúdanos a<br>encontrarlos</h1>
          <p>La comunidad de Zulia unida para reunir mascotas con sus familias.</p>
          
          <div class="hero-actions">
            <ion-button color="danger" router-link="/publicar-perdida" shape="round">
              <ion-icon :icon="addOutline" slot="start" />
              Reportar Mascota Perdida
            </ion-button>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">{{ filteredLostPets.filter(p => p.status === 'active').length }}</span>
              <span class="stat-label">Buscando</span>
            </div>
            <div class="stat-item success">
              <span class="stat-number">{{ filteredLostPets.filter(p => p.status === 'found').length }}</span>
              <span class="stat-label">Encontrados</span>
            </div>
          </div>
        </div>
      </div>

      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Error State -->
      <div v-if="error" class="section-error">
        <div class="error-card">
          <ion-icon :icon="alertCircleOutline" class="error-icon" />
          <div class="error-content">
            <h3>Error al cargar</h3>
            <p>{{ error }}</p>
          </div>
          <ion-button size="small" fill="outline" color="danger" @click="loadLostPets()">
            <ion-icon :icon="reloadOutline" slot="start" />
            Reintentar
          </ion-button>
        </div>
      </div>

      <div class="filters-bar">
        <ion-segment v-model="statusFilter">
          <ion-segment-button value="all"><ion-label>Todas</ion-label></ion-segment-button>
          <ion-segment-button value="active"><ion-label>🔴 Perdidas</ion-label></ion-segment-button>
          <ion-segment-button value="found"><ion-label>✅ Encontradas</ion-label></ion-segment-button>
        </ion-segment>
      </div>

      <div class="results-count" v-if="!loading">
        {{ filteredLostPets.length }} reporte{{ filteredLostPets.length !== 1 ? 's' : '' }}
      </div>

      <ion-list v-if="!loading && filteredLostPets.length > 0" class="lost-list">
        <ion-card v-for="pet in filteredLostPets" :key="pet.id" class="lost-card fade-in-up" :router-link="`/perdidas/${pet.id}`" button>
          <div class="lost-card-layout">
            <img :src="pet.images?.[0] || '/placeholder.webp'" :alt="pet.name" class="lost-card-image" loading="lazy" />
            <div class="lost-card-info">
              <div class="lost-card-top">
                <h3 class="lost-card-name">{{ pet.name }}</h3>
                <ion-badge :color="pet.status === 'active' ? 'danger' : 'success'" class="status-badge">
                  {{ pet.status === 'active' ? 'Perdida' : 'Encontrada' }}
                </ion-badge>
              </div>
              <p class="lost-card-detail" v-if="pet.breed">{{ pet.breed }}</p>
              <p class="lost-card-location"><ion-icon :icon="locationOutline" /> {{ pet.lastSeenLocation || 'Sin ubicación' }}</p>
              <p class="lost-card-date"><ion-icon :icon="calendarOutline" /> {{ formatDate(pet.lastSeenDate || pet.createdAt) }}</p>
              <ion-badge v-if="pet.urgencyLevel === 'high'" color="warning" class="urgency-badge">⚡ Urgente</ion-badge>
              <div class="lost-card-reward" v-if="pet.reward">💰 ${{ pet.reward }}</div>
            </div>
          </div>
        </ion-card>
      </ion-list>

      <div v-if="loading" class="lost-list">
        <ion-card v-for="i in 4" :key="i" class="lost-card">
          <div class="lost-card-layout">
            <ion-skeleton-text animated style="width:110px;height:110px;border-radius:12px" />
            <div class="lost-card-info">
              <ion-skeleton-text animated style="width:60%;height:18px;margin-bottom:6px" />
              <ion-skeleton-text animated style="width:80%;height:14px" />
            </div>
          </div>
        </ion-card>
      </div>

      <div class="empty-state" v-if="!loading && filteredLostPets.length === 0">
        <ion-icon :icon="searchOutline" />
        <h3>No hay reportes</h3>
        <p>No hay mascotas perdidas en esta categoría</p>
      </div>

      <!-- FAB - Reportar Perdida -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button router-link="/publicar-perdida" color="danger">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonList, IonCard, IonBadge, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonSkeletonText, IonFab, IonFabButton, IonButtons } from '@ionic/vue'
import { locationOutline, calendarOutline, searchOutline, alertCircleOutline, reloadOutline, addOutline, moon, sunny, notificationsOutline } from 'ionicons/icons'
import { useLostPets } from '@/composables/useLostPets'
import { useTheme } from '@/composables/useTheme'
import { useNotifications } from '@/composables/useNotifications'

const { filteredLostPets, loading, error, statusFilter, loadLostPets } = useLostPets()
const { isDark, toggleTheme } = useTheme()
const { unreadCount } = useNotifications()

function formatDate(ts?: number) {
  if (!ts) return 'Desconocida'
  return new Date(ts).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function handleRefresh(ev: any) { await loadLostPets(); ev.target.complete() }
onMounted(() => loadLostPets())
</script>

<style scoped>
.filters-bar { padding: 0 24px 12px; }
.results-count { padding: 0 24px; font-size: .8rem; color: var(--ion-color-medium); font-weight: 700; }
.lost-list { padding: 16px 24px 80px; }
.lost-card { margin: 0 0 16px; border-radius: 20px; overflow: hidden; box-shadow: none; border: 2px solid var(--ion-color-light-shade); }
.lost-card-layout { display: flex; gap: 12px; padding: 12px; }
.lost-card-image { width: 110px; height: 110px; object-fit: cover; border-radius: 12px; flex-shrink: 0; }
.lost-card-info { flex: 1; min-width: 0; }
.lost-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.lost-card-name { font-size: 1rem; font-weight: 700; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.status-badge { font-size: 10px; padding: 3px 8px; border-radius: 6px; flex-shrink: 0; }
.lost-card-detail { font-size: .8rem; color: var(--ion-color-medium); margin: 4px 0; }
.lost-card-location, .lost-card-date { display: flex; align-items: center; gap: 4px; font-size: .75rem; color: var(--ion-color-medium); margin: 3px 0; }
.lost-card-location ion-icon, .lost-card-date ion-icon { font-size: 14px; }
.urgency-badge { font-size: 10px; margin-top: 4px; }
.lost-card-reward { font-size: .8rem; font-weight: 600; color: var(--ion-color-primary); margin-top: 4px; }
.empty-state {
  padding: 18px;
}
.section-error { padding: 16px 24px 0; }
.error-card { background: var(--ion-color-light); border: 2px solid var(--ion-color-danger); border-radius: 20px; padding: 16px; display: flex; align-items: center; gap: 16px; color: var(--ion-color-danger); margin-bottom: 12px; }
.error-icon { font-size: 32px; }
.error-content { flex: 1; }
.error-content h3 { margin: 0 0 4px; font-weight: 800; font-size: 1rem; }
.error-content p { margin: 0; font-size: 0.85rem; }

/* Hero Banner */
.hero-banner {
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80') center/cover;
  padding: 40px 20px 30px;
  color: white;
  text-align: center;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  margin-bottom: 24px;
}

.hero-banner.lost-hero {
    background-position: center 30%;
}

.hero-content h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.hero-content p {
  font-size: 0.95rem;
  opacity: 0.95;
  margin-bottom: 20px;
  font-weight: 600;
}

.hero-actions {
    margin-bottom: 24px;
}

.hero-actions ion-button {
    --box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    font-weight: 800;
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 32px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-number {
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
}

.stat-label {
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-item.success .stat-number {
    color: #4ade80;
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
