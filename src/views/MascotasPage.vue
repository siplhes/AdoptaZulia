<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Mascotas en adopción</ion-title>
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
      <div class="hero-banner">
        <div class="hero-content">
          <h1>Encuentra tu<br>compañero ideal</h1>
          <p>Explora nuestra lista de mascotas disponibles para adopción.</p>
          
          <div class="search-wrapper">
            <ion-searchbar
              v-model="searchQuery"
              placeholder="Buscar por nombre, raza..."
              class="custom-searchbar"
              animated
            />
            <VoiceInput v-model="searchQuery" class="voice-btn" />
          </div>

          <div class="hero-filters">
            <ion-chip @click="setFilter('type', 'perro')" :color="filters.type === 'perro' ? 'primary' : 'light'">🐕 Perros</ion-chip>
            <ion-chip @click="setFilter('type', 'gato')" :color="filters.type === 'gato' ? 'primary' : 'light'">🐈 Gatos</ion-chip>
            <ion-chip @click="setFilter('urgent', true)" :color="filters.urgent ? 'danger' : 'light'">🚨 Urgentes</ion-chip>
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
          <ion-button size="small" fill="outline" color="danger" @click="loadPets()">
            <ion-icon :icon="reloadOutline" slot="start" />
            Reintentar
          </ion-button>
        </div>
      </div>


      <!-- Filter chips -->
      <div class="filter-chips">
        <ion-chip
          :outline="!filters.urgent"
          :color="filters.urgent ? 'danger' : 'medium'"
          @click="toggleUrgent"
        >
          <ion-icon :icon="alertCircleOutline" />
          <ion-label>Urgente</ion-label>
        </ion-chip>
        <ion-chip outline color="medium" @click="showSizeFilter = true">
          <ion-icon :icon="resizeOutline" />
          <ion-label>{{ filters.size ? sizeLabel(filters.size) : 'Tamaño' }}</ion-label>
        </ion-chip>
        <ion-chip
          v-if="hasActiveFilters"
          color="primary"
          @click="clearAllFilters"
        >
          <ion-icon :icon="closeCircleOutline" />
          <ion-label>Limpiar</ion-label>
        </ion-chip>
      </div>

      <!-- Pet count -->
      <div class="results-count" v-if="!loading">
        <span>{{ displayedPets.length }} mascota{{ displayedPets.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Pet Grid -->
      <div class="pet-grid" v-if="!loading && displayedPets.length > 0">
        <ion-card
          v-for="pet in displayedPets"
          :key="pet.id"
          class="pet-card fade-in-up"
          button
          @click="router.push(`/mascotas/${pet.id}`)"
        >
          <div class="card-img-wrapper">
             <img
              :src="pet.image || pet.photos?.[0] || '/placeholder.webp'"
              :alt="pet.name"
              class="pet-image"
              loading="lazy"
            />
            <ion-button
              fill="clear"
              class="fav-btn"
              @click.stop="toggleFavorite(pet.id)"
            >
              <ion-icon :icon="isFavorite(pet.id) ? heart : heartOutline" :color="isFavorite(pet.id) ? 'danger' : 'light'" />
            </ion-button>
          </div>
          <ion-card-header>
            <ion-card-title class="pet-name">{{ pet.name }}</ion-card-title>
            <ion-card-subtitle>{{ pet.breed || pet.type }} {{ pet.age ? `· ${pet.age}` : '' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="pet-meta">
              <span class="pet-location" v-if="pet.location">
                <ion-icon :icon="locationOutline" />
                {{ pet.location }}
              </span>
              <span class="pet-gender" v-if="pet.gender">
                {{ pet.gender === 'macho' ? '♂️' : '♀️' }} {{ pet.gender }}
              </span>
            </div>
            <div class="pet-badges">
              <ion-badge v-if="pet.urgent" color="danger">Urgente</ion-badge>
              <ion-badge v-if="pet.vaccinated" color="success">Vacunado</ion-badge>
              <ion-badge v-if="pet.neutered" color="tertiary">Esterilizado</ion-badge>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Loading skeleton -->
      <div class="pet-grid" v-if="loading">
        <ion-card v-for="i in 6" :key="i" class="pet-card">
          <ion-skeleton-text animated style="width: 100%; height: 200px" />
          <ion-card-header>
            <ion-skeleton-text animated style="width: 60%; height: 20px" />
            <ion-skeleton-text animated style="width: 40%; height: 16px" />
          </ion-card-header>
          <ion-card-content>
            <ion-skeleton-text animated style="width: 80%; height: 14px" />
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Empty state -->
      <div class="empty-state" v-if="!loading && displayedPets.length === 0">
        <ion-icon :icon="pawOutline" />
        <h3>No se encontraron mascotas</h3>
        <p>Intenta cambiar los filtros o vuelve más tarde</p>
        <ion-button fill="outline" @click="clearAllFilters">Limpiar filtros</ion-button>
      </div>

      <!-- FAB - Publicar -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button router-link="/publicar">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <!-- Size Filter Action Sheet -->
      <ion-action-sheet
        :is-open="showSizeFilter"
        header="Filtrar por tamaño"
        :buttons="sizeButtons"
        @did-dismiss="showSizeFilter = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonSegment, IonSegmentButton, IonLabel, IonChip, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonBadge, IonButton, IonButtons, IonFab, IonFabButton,
  IonRefresher, IonRefresherContent, IonSkeletonText, IonActionSheet,
} from '@ionic/vue'
import {
  pawOutline, alertCircleOutline, locationOutline,
  resizeOutline, closeCircleOutline, addOutline, arrowForward,
  heart, heartOutline, reloadOutline, moon, sunny, notificationsOutline,
} from 'ionicons/icons'
import { usePets } from '@/composables/usePets'
import { useFavorites } from '@/composables/useFavorites'
import { useTheme } from '@/composables/useTheme'
import { useNotifications } from '@/composables/useNotifications'
import VoiceInput from '@/components/VoiceInput.vue'

const router = useRouter()
const route = useRoute()
const { filteredPets, loading, error, filters, loadPets, setFilter, clearFilters } = usePets()
const { toggleFavorite, isFavorite } = useFavorites()
const { isDark, toggleTheme } = useTheme()
const { unreadCount } = useNotifications()

const searchQuery = ref('')
const activeType = ref('')
const showSizeFilter = ref(false)

const hasActiveFilters = computed(() => {
  return !!(filters.value.type || filters.value.size || filters.value.gender || filters.value.urgent)
})

const displayedPets = computed(() => {
  if (!searchQuery.value) return filteredPets.value
  const q = searchQuery.value.toLowerCase()
  return filteredPets.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.breed?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
  )
})

function onTypeChange() {
  setFilter('type', activeType.value || undefined)
}

function toggleUrgent() {
  setFilter('urgent', filters.value.urgent ? undefined : true)
}

function sizeLabel(size: string) {
  const labels: Record<string, string> = { pequeño: 'Pequeño', mediano: 'Mediano', grande: 'Grande' }
  return labels[size] || size
}

const sizeButtons = [
  { text: 'Pequeño', handler: () => setFilter('size', 'pequeño') },
  { text: 'Mediano', handler: () => setFilter('size', 'mediano') },
  { text: 'Grande', handler: () => setFilter('size', 'grande') },
  { text: 'Todos los tamaños', handler: () => setFilter('size', undefined) },
  { text: 'Cancelar', role: 'cancel' },
]

function clearAllFilters() {
  clearFilters()
  activeType.value = ''
  searchQuery.value = ''
}

async function handleRefresh(event: any) {
  await loadPets()
  event.target.complete()
}

onMounted(async () => {
  // Check for query params (e.g., from category click)
  if (route.query.type) {
    activeType.value = route.query.type as string
    setFilter('type', activeType.value)
  }
  await loadPets()
})

watch(() => route.query.type, (newType) => {
  if (newType) {
    activeType.value = newType as string
    setFilter('type', activeType.value)
  }
})
</script>

<style scoped>
/* Hero Banner */
.hero-banner {
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1000&q=80') center/cover;
  padding: 40px 20px 30px;
  color: white;
  text-align: center;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  margin-bottom: 24px;
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

.search-wrapper {
  background: white;
  border-radius: 16px;
  padding: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 16px;
}

.custom-searchbar {
  padding: 0 !important;
  --background: transparent;
  --box-shadow: none !important;
  --icon-color: var(--ion-color-medium);
  flex: 1;
}

.voice-btn {
  margin-right: 4px;
}

.hero-filters {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-filters ion-chip {
  margin: 0;
  font-weight: 700;
  border: none;
  backdrop-filter: blur(4px);
}

.hero-filters ion-chip[color="light"] {
  background: rgba(255,255,255,0.2);
  color: white;
}

.filters-bar {
  padding: 0 16px;
  margin-bottom: 8px;
}

ion-segment {
  --background: transparent;
  background: transparent;
  gap: 8px;
  padding: 4px;
}

ion-segment-button {
  --indicator-color: transparent;
  --color: var(--ion-color-medium);
  --color-checked: var(--ion-color-primary-contrast);
  --background-checked: var(--ion-color-primary);
  border-radius: 16px;
  border: 2px solid var(--ion-color-light-shade);
  margin: 0;
  min-width: auto;
  padding: 0 12px;
  font-weight: 700;
  height: 40px;
  transition: transform 0.1s;
}

ion-segment-button::part(indicator) { display: none; }
ion-segment-button.segment-button-checked {
  border-color: var(--ion-color-primary-shade);
  box-shadow: 0 4px 0 var(--ion-color-primary-shade);
  transform: translateY(-2px);
}

.filter-chips {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  overflow-x: auto;
  align-items: center;
}
.filter-chips::-webkit-scrollbar { display: none; }

.results-count {
  padding: 8px 20px 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ion-color-medium);
  letter-spacing: -0.5px;
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px 20px 80px; /* Added bottom padding for FAB/Tabs */
}
.empty-state {
  padding: 18px;
}

.pet-card {
  margin: 0;
  border-radius: 20px;
  overflow: hidden;
  /* Shadow global */
  background: var(--ion-card-background, white);
  border: 2px solid var(--ion-color-light-shade);
  display: flex;
  flex-direction: column;
}

.pet-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 2px solid var(--ion-color-light-shade);
}

ion-card-header {
  padding: 12px 12px 4px;
}

.pet-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ion-text-color);
}

ion-card-subtitle {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ion-color-medium);
  text-transform: none;
  margin-top: 2px;
}

ion-card-content {
  padding: 8px 12px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.pet-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.pet-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ion-color-medium);
}
.pet-location ion-icon { font-size: 16px; color: var(--ion-color-primary); }

.pet-gender {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ion-color-medium);
}

.pet-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pet-badges ion-badge {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 8px;
}

.card-img-wrapper {
  position: relative;
}

.fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 36px;
  width: 36px;
  --border-radius: 50%;
  --background: rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
  margin: 0;
  --box-shadow: none;
}

.section-error {
  padding: 16px 16px 0;
}

.error-card {
  background: var(--ion-color-light);
  border: 2px solid var(--ion-color-danger);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--ion-color-danger);
}

.error-icon {
  font-size: 32px;
}

.error-content {
  flex: 1;
}

.error-content h3 {
  margin: 0 0 4px;
  font-weight: 800;
  font-size: 1rem;
}

.error-content p {
  margin: 0;
  font-size: 0.85rem;
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
