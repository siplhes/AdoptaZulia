<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/mascotas" text="Volver" />
        </ion-buttons>
        <ion-title>{{ pet?.name || 'Mascota' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="canEdit" :router-link="`/editar-mascota/${pet?.id}`">
            <ion-icon :icon="createOutline" slot="icon-only" />
          </ion-button>
          <ion-button @click="toggleFavorite(pet.id)" v-if="pet">
            <ion-icon :icon="isFavorite(pet.id) ? heart : heartOutline" :color="isFavorite(pet.id) ? 'danger' : 'primary'" slot="icon-only" />
          </ion-button>
          <ion-button @click="sharePet">
            <ion-icon :icon="shareOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Loading State -->
      <template v-if="loading">
        <ion-skeleton-text animated style="width: 100%; height: 300px" />
        <div style="padding: 16px">
          <ion-skeleton-text animated style="width: 60%; height: 24px; margin-bottom: 8px" />
          <ion-skeleton-text animated style="width: 40%; height: 18px; margin-bottom: 16px" />
          <ion-skeleton-text animated style="width: 100%; height: 14px; margin-bottom: 8px" />
          <ion-skeleton-text animated style="width: 90%; height: 14px" />
        </div>
      </template>

      <template v-else-if="pet">
        <!-- Image Gallery -->
        <div class="image-gallery">
          <img
            :src="currentImage"
            :alt="pet.name"
            class="main-image"
          />
          <ion-badge v-if="pet.urgent" color="danger" class="urgent-floating">🚨 Urgente</ion-badge>
          <div class="image-dots" v-if="allImages.length > 1">
            <span
              v-for="(_, i) in allImages"
              :key="i"
              class="dot"
              :class="{ active: i === currentImageIndex }"
              @click="currentImageIndex = i"
            />
          </div>
        </div>

        <!-- Pet Info -->
        <div class="pet-detail-content">
          <div class="pet-header">
            <div>
              <h1 class="pet-name">{{ pet.name }}</h1>
              <p class="pet-breed">{{ pet.breed || pet.type }} {{ pet.age ? `· ${pet.age}` : '' }}</p>
            </div>
            <ion-badge :color="statusColor">{{ statusLabel }}</ion-badge>
          </div>

          <!-- Quick Info Cards -->
          <div class="info-chips">
            <div class="info-chip" v-if="pet.gender">
              <span class="info-emoji">{{ pet.gender === 'macho' ? '♂️' : '♀️' }}</span>
              <span>{{ pet.gender }}</span>
            </div>
            <div class="info-chip" v-if="pet.size || pet.sizeValue">
              <span class="info-emoji">📏</span>
              <span>{{ pet.size || pet.sizeValue }}</span>
            </div>
            <div class="info-chip" v-if="pet.location">
              <span class="info-emoji">📍</span>
              <span>{{ pet.location }}</span>
            </div>
          </div>

          <!-- Description -->
          <ion-card v-if="pet.description" class="detail-card">
            <ion-card-header>
              <ion-card-title class="card-title">Descripción</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p class="description-text">{{ pet.description }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Health Info -->
          <ion-card class="detail-card">
            <ion-card-header>
              <ion-card-title class="card-title">Salud</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list lines="none">
                <ion-item v-if="pet.vaccinated !== undefined">
                  <ion-icon :icon="pet.vaccinated ? checkmarkCircle : closeCircle" slot="start"
                    :color="pet.vaccinated ? 'success' : 'danger'" />
                  <ion-label>{{ pet.vaccinated ? 'Vacunado' : 'Sin vacunas' }}</ion-label>
                </ion-item>
                <ion-item v-if="pet.neutered !== undefined">
                  <ion-icon :icon="pet.neutered ? checkmarkCircle : closeCircle" slot="start"
                    :color="pet.neutered ? 'success' : 'danger'" />
                  <ion-label>{{ pet.neutered ? 'Esterilizado' : 'Sin esterilizar' }}</ion-label>
                </ion-item>
                <ion-item v-if="pet.microchipped !== undefined">
                  <ion-icon :icon="pet.microchipped ? checkmarkCircle : closeCircle" slot="start"
                    :color="pet.microchipped ? 'success' : 'danger'" />
                  <ion-label>{{ pet.microchipped ? 'Con microchip' : 'Sin microchip' }}</ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Traits -->
          <ion-card v-if="pet.traits?.length" class="detail-card">
            <ion-card-header>
              <ion-card-title class="card-title">Personalidad</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="traits-grid">
                <ion-chip v-for="trait in pet.traits" :key="trait" color="primary" outline>
                  {{ trait }}
                </ion-chip>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Contact -->
          <ion-card class="detail-card contact-card">
            <ion-card-header>
              <ion-card-title class="card-title">Información de contacto</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list lines="none">
                <ion-item v-if="pet.contact?.name">
                  <ion-icon :icon="personOutline" slot="start" color="primary" />
                  <ion-label>{{ pet.contact.name }}</ion-label>
                </ion-item>
                <ion-item v-if="pet.contact?.phone">
                  <ion-icon :icon="callOutline" slot="start" color="primary" />
                  <ion-label>{{ pet.contact.phone }}</ion-label>
                </ion-item>
                <ion-item v-if="pet.contact?.email">
                  <ion-icon :icon="mailOutline" slot="start" color="primary" />
                  <ion-label>{{ pet.contact.email }}</ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Bottom spacing for FAB -->
          <div style="height: 80px" />
        </div>
      </template>

      <!-- Not Found -->
      <div class="empty-state" v-else-if="!loading">
        <ion-icon :icon="pawOutline" />
        <h3>Mascota no encontrada</h3>
        <p>Es posible que haya sido adoptada o eliminada</p>
        <ion-button router-link="/tabs/mascotas">Ver mascotas</ion-button>
      </div>
    </ion-content>

    <!-- Adopt FAB -->
    <ion-footer v-if="pet && pet.status === 'available' && !canEdit" class="adopt-footer">
      <ion-toolbar>
        <ion-button expand="block" class="adopt-button" @click="contactOwner">
          <ion-icon :icon="heartOutline" slot="start" />
          ¡Quiero adoptar!
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonIcon, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonList, IonItem, IonLabel,
  IonBadge, IonChip, IonSkeletonText, IonFooter,
} from '@ionic/vue'
import {
  shareOutline, heartOutline, pawOutline, personOutline,
  callOutline, mailOutline, checkmarkCircle, closeCircle,
  locationOutline, heart, createOutline,
} from 'ionicons/icons'
import { Share } from '@capacitor/share'
import { usePets } from '@/composables/usePets'
import { useToast } from '@/composables/useToast'
import { useFavorites } from '@/composables/useFavorites'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { currentPet: pet, loading, loadPet } = usePets()
const { toggleFavorite, isFavorite } = useFavorites()
const { currentUser } = useAuth()
const toast = useToast()

const canEdit = computed(() => {
    return pet.value && currentUser.value && pet.value.userId === currentUser.value.uid
})

const currentImageIndex = ref(0)

const allImages = computed(() => {
  if (!pet.value) return []
  const imgs: string[] = []
  if (pet.value.image) imgs.push(pet.value.image)
  if (pet.value.photos) imgs.push(...pet.value.photos.filter((p) => p !== pet.value?.image))
  return imgs.length ? imgs : ['/placeholder.webp']
})

const currentImage = computed(() => allImages.value[currentImageIndex.value] || '/placeholder.webp')

const statusColor = computed(() => {
  const colors: Record<string, string> = {
    available: 'success',
    adopted: 'medium',
    pending: 'warning',
  }
  return colors[pet.value?.status || 'available'] || 'primary'
})

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    available: 'Disponible',
    adopted: 'Adoptado',
    pending: 'En proceso',
  }
  return labels[pet.value?.status || 'available'] || pet.value?.status || ''
})

async function sharePet() {
  if (!pet.value) return
  try {
    await Share.share({
      title: `¡Conoce a ${pet.value.name}!`,
      text: `${pet.value.name} busca un hogar. ${pet.value.breed || pet.value.type}. Más info en Adopta Zulia.`,
      url: `https://adopta-zulia.vercel.app/mascotas/${pet.value.id}`,
    })
  } catch (e) {
    // User cancelled or share not available
  }
}

function contactOwner() {
  if (!pet.value?.contact) return

  const phone = pet.value.contact.phone
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(`¡Hola! Me interesa adoptar a ${pet.value.name} que vi en Adopta Zulia.`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  } else if (pet.value.contact.email) {
    const subject = encodeURIComponent(`Interés en adoptar a ${pet.value.name}`)
    const body = encodeURIComponent(`Hola, me interesa adoptar a ${pet.value.name} que vi en Adopta Zulia.`)
    window.open(`mailto:${pet.value.contact.email}?subject=${subject}&body=${body}`)
  } else {
    toast.info('No hay información de contacto disponible')
  }
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) await loadPet(id)
})
</script>

<style scoped>
.image-gallery {
  position: relative;
}

.main-image {
  width: 100%;
  height: 320px;
  object-fit: cover;
}

.urgent-floating {
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 8px;
}

.image-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.dot.active {
  background: #fff;
  width: 20px;
  border-radius: 4px;
}

.pet-detail-content {
  padding: 16px;
}

.pet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.pet-name {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.pet-breed {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  margin: 4px 0 0;
}

.info-chips {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--ion-color-light);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.info-emoji {
  font-size: 1.1rem;
}

.detail-card {
  border-radius: 14px;
  margin: 0 0 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
}

.description-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--ion-color-medium-shade);
}

.traits-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.contact-card {
  border: 2px solid var(--ion-color-primary-tint);
}

.adopt-footer {
  padding: 8px 12px;
}

.adopt-button {
  --border-radius: 14px;
  --background: var(--ion-color-primary);
  font-weight: 700;
  font-size: 1rem;
  height: 52px;
}
</style>
