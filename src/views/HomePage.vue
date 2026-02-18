<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>
          <div class="header-brand">
            <img src="/logo.svg" alt="Adopta Zulia" class="header-logo" />
            <span>Adopta Zulia</span>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <FontSizeZoomer />
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
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Error State -->
      <div v-if="petsError || lostPetsError" class="section">
        <div class="error-card">
          <ion-icon :icon="alertCircleOutline" class="error-icon" />
          <div class="error-content">
            <h3>Algo salió mal</h3>
            <p>{{ petsError || lostPetsError }}</p>
          </div>
          <ion-button size="small" fill="outline" color="danger" @click="handleRefresh($event)">
            <ion-icon :icon="reloadOutline" slot="start" />
            Reintentar
          </ion-button>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-overlay">
          <div class="hero-content">
            <h1 class="hero-title">Encuentra tu<br>compañero ideal</h1>
            <p class="hero-subtitle">Más de 1,200 mascotas en Zulia esperan por una segunda oportunidad.</p>
            <div class="hero-buttons">
              <ion-button class="hero-btn primary" router-link="/tabs/mascotas">
                Ver mascotas
                <ion-icon :icon="arrowForward" slot="end" />
              </ion-button>
              <ion-button class="hero-btn secondary" fill="outline" router-link="/publicar">
                Dar en adopción
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lost Pets Alert -->
      <!-- Lost Pets Alert -->
      <div class="lost-alert-container" v-if="activeLostPets.length > 0">
        <ion-card class="lost-card-visual" router-link="/tabs/perdidas">
          <div class="lost-content">
            <div class="lost-tag">
              <ion-icon :icon="alertCircleOutline" />
              Acción Urgente
            </div>
            <h2>¿Has visto a estas mascotas?</h2>
            <p>Están lejos de casa y sus familias las buscan. Tu ayuda es clave.</p>
            <ion-button size="small" color="danger" class="lost-btn">
              Ver {{ activeLostPets.length }} reportes
              <ion-icon :icon="arrowForward" slot="end" />
            </ion-button>
          </div>
          <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80" class="lost-img" alt="Lost Dog" />
        </ion-card>
      </div>

      <!-- Featured Pets -->
      <div class="section" v-if="featuredPets.length > 0">
        <div class="section-header">
          <h2 class="section-title">🏠 En busca de hogar</h2>
          <ion-button fill="clear" size="small" router-link="/tabs/mascotas">
            Ver todos
            <ion-icon :icon="arrowForward" slot="end" />
          </ion-button>
        </div>

        <div class="pets-scroll">
          <ion-card
            v-for="pet in featuredPets"
            :key="pet.id"
            class="pet-card-mini fade-in-up"
            :router-link="`/mascotas/${pet.id}`"
            button
          >
            <img
              :src="pet.image || pet.photos?.[0] || '/placeholder.webp'"
              :alt="pet.name"
              class="pet-card-image"
              loading="lazy"
            />
            <ion-card-content class="pet-card-body">
              <div class="pet-card-name">{{ pet.name }}</div>
              <div class="pet-card-info">
                <span>{{ pet.breed || pet.type }}</span>
                <span v-if="pet.age">· {{ pet.age }}</span>
              </div>
              <div class="pet-card-location" v-if="pet.location">
                <ion-icon :icon="locationOutline" />
                {{ pet.location }}
              </div>
              <ion-badge v-if="pet.urgent" color="danger" class="urgent-badge">Urgente</ion-badge>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Categories -->
      <div class="section">
        <h2 class="section-title">🔍 Buscar por tipo</h2>
        <div class="categories-grid">
          <ion-card
            v-for="cat in categories"
            :key="cat.value"
            class="category-card"
            button
            @click="goToCategory(cat.value)"
          >
            <ion-card-content class="category-content">
              <span class="category-emoji">{{ cat.emoji }}</span>
              <span class="category-label">{{ cat.label }}</span>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- How it works -->
      <div class="section how-it-works">
        <h2 class="section-title">💡 ¿Cómo funciona?</h2>
        <div class="steps">
          <div class="step" v-for="(step, i) in steps" :key="i">
            <div class="step-number">{{ i + 1 }}</div>
            <div class="step-text">
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="petsLoading" class="section">
        <ion-skeleton-text animated style="width: 60%; height: 20px; margin-bottom: 12px" />
        <div class="pets-scroll">
          <ion-card v-for="i in 3" :key="i" class="pet-card-mini">
            <ion-skeleton-text animated style="width: 100%; height: 160px" />
            <ion-card-content>
              <ion-skeleton-text animated style="width: 70%; height: 16px" />
              <ion-skeleton-text animated style="width: 50%; height: 14px" />
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonButton, IonIcon, IonBadge,
  IonRefresher, IonRefresherContent, IonSkeletonText,
  IonButtons,
} from '@ionic/vue'
import {
  pawOutline, alertCircleOutline, chevronForward,
  arrowForward, locationOutline, reloadOutline,
  moon, sunny, notificationsOutline,
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { usePets } from '@/composables/usePets'
import { useLostPets } from '@/composables/useLostPets'
import { useTheme } from '@/composables/useTheme'
import { useNotifications } from '@/composables/useNotifications'
import FontSizeZoomer from '@/components/FontSizeZoomer.vue'

const router = useRouter()
const { featuredPets, loading: petsLoading, error: petsError, loadPets } = usePets()
const { activeLostPets, error: lostPetsError, loadLostPets } = useLostPets()
const { isDark, toggleTheme } = useTheme()
const { unreadCount, loadNotifications } = useNotifications()

const categories = [
  { label: 'Perros', value: 'perro', emoji: '🐕' },
  { label: 'Gatos', value: 'gato', emoji: '🐈' },
  { label: 'Aves', value: 'ave', emoji: '🦜' },
  { label: 'Otros', value: 'otro', emoji: '🐾' },
]

const steps = [
  { title: 'Explora', desc: 'Navega entre las mascotas disponibles para adopción' },
  { title: 'Conecta', desc: 'Contacta al dueño o refugio a través de la app' },
  { title: '¡Adopta!', desc: 'Dale un hogar a quien más lo necesita' },
]

function goToCategory(type: string) {
  router.push({ path: '/tabs/mascotas', query: { type } })
}

async function handleRefresh(event: any) {
  await Promise.all([loadPets(), loadLostPets()])
  event.target.complete()
}

onMounted(async () => {
  await Promise.all([loadPets(), loadLostPets(), loadNotifications()])
  
  // Initialize Push Notifications (Request permissions)
  const { registerPushNotifications } = useNotifications()
  registerPushNotifications()
})
</script>

<style scoped>
.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.header-logo {
  width: 32px;
  height: 32px;
}

.header-brand span {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  color: var(--ion-color-primary);
  letter-spacing: -0.5px;
}

/* Hero */
.hero-section {
  position: relative;
  height: 400px; /* Taller hero */
  background: url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1000&q=80') no-repeat center center;
  background-size: cover;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  margin-bottom: 24px;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(34,197,94,0.9) 100%); /* Green fade at bottom */
  display: flex;
  align-items: flex-end;
  padding: 30px 24px;
}

.hero-content {
  width: 100%;
  text-align: left;
  color: white;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.hero-subtitle {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.95;
  margin-bottom: 24px;
  max-width: 80%;
  line-height: 1.4;
}

.hero-buttons {
  display: flex;
  gap: 12px;
}

.hero-btn {
  --border-radius: 12px;
  font-weight: 700;
  flex: 1;
  height: 48px;
  margin: 0;
}

.hero-btn.primary {
  --background: #fff;
  --color: var(--ion-color-primary);
}

.hero-btn.secondary {
  --background: rgba(255,255,255,0.2);
  --color: #fff;
  --border-color: #fff;
  --border-width: 2px;
  backdrop-filter: blur(4px);
}

/* Lost Alert Visual */
.lost-alert-container {
  padding: 0 20px;
  margin-bottom: 24px;
}

.lost-card-visual {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  margin: 0;
  display: flex;
  flex-direction: row;
  height: 160px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
  position: relative;
}

.lost-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
}

.lost-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fee2e2;
  color: #ef4444;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  width: fit-content;
  margin-bottom: 8px;
}

.lost-content h2 {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 0 4px;
  color: var(--ion-color-dark);
  line-height: 1.2;
}

.lost-content p {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  margin: 0 0 12px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lost-btn {
  height: 32px;
  font-size: 0.8rem;
  --border-radius: 8px;
  margin: 0;
  width: fit-content;
}

.lost-img {
  width: 40%;
  object-fit: cover;
  height: 100%;
}

/* Section */
.section {
  padding: 16px 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--ion-text-color);
  margin: 0 0 4px;
  letter-spacing: -0.5px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Horizontal pet scroll */
.pets-scroll {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 12px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.pets-scroll::-webkit-scrollbar { display: none; }

.pet-card-mini {
  min-width: 180px;
  max-width: 180px;
  border-radius: 20px;
  overflow: hidden;
  margin: 0;
  scroll-snap-align: start;
  /* Shadow handled globally */
  background: var(--ion-card-background, white);
  border: 2px solid var(--ion-color-light-shade);
}

.pet-card-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-bottom: 2px solid var(--ion-color-light-shade);
}

.pet-card-body {
  padding: 12px;
}

.pet-card-name {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.pet-card-info {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ion-color-medium);
  margin-bottom: 6px;
}

.pet-card-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ion-color-medium);
}

/* Categories */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.category-card {
  margin: 0;
  border-radius: 20px;
  /* Shadow global */
}

.category-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  text-align: center;
}

.category-emoji {
  font-size: 2.5rem;
  background: var(--ion-color-light);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.category-label {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--ion-text-color);
}

/* How it works */
.steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--ion-color-light);
  padding: 16px;
  border-radius: 20px;
  border: 2px solid transparent;
}

.step-number {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 14px;
  background: var(--ion-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 4px 0 var(--ion-color-primary-shade);
}

.step-text strong {
  display: block;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 4px;
  color: var(--ion-text-color);
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
