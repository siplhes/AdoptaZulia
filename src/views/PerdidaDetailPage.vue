<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/tabs/perdidas" text="Volver" /></ion-buttons>
        <ion-title>{{ lostPet?.name || 'Mascota perdida' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="canEdit" :router-link="`/editar-perdida/${lostPet?.id}`">
            <ion-icon :icon="createOutline" slot="icon-only" />
          </ion-button>
          <ion-button @click="sharePet"><ion-icon :icon="shareOutline" slot="icon-only" /></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <template v-if="loading">
        <ion-skeleton-text animated style="width:100%;height:300px" />
        <div style="padding:16px"><ion-skeleton-text animated style="width:60%;height:24px;margin-bottom:8px" /><ion-skeleton-text animated style="width:90%;height:14px" /></div>
      </template>
      <template v-else-if="lostPet">
        <div class="image-gallery">
          <img :src="lostPet.images?.[0] || '/placeholder.webp'" :alt="lostPet.name" class="main-image" />
          <ion-badge :color="lostPet.status === 'active' ? 'danger' : 'success'" class="status-floating">
            {{ lostPet.status === 'active' ? '🔴 Perdida' : '✅ Encontrada' }}
          </ion-badge>
        </div>
        <div class="detail-content">
          <h1 class="pet-name">{{ lostPet.name }}</h1>
          <div class="info-chips">
            <div class="info-chip" v-if="lostPet.breed"><span>🐾</span><span>{{ lostPet.breed }}</span></div>
            <div class="info-chip" v-if="lostPet.color"><span>🎨</span><span>{{ lostPet.color }}</span></div>
            <div class="info-chip" v-if="lostPet.size"><span>📏</span><span>{{ sizeLabel(lostPet.size) }}</span></div>
            <div class="info-chip" v-if="lostPet.sex"><span>{{ lostPet.sex === 'male' ? '♂️' : '♀️' }}</span><span>{{ lostPet.sex === 'male' ? 'Macho' : 'Hembra' }}</span></div>
          </div>

          <ion-card class="detail-card">
            <ion-card-header><ion-card-title class="card-title">📍 Última vez vista</ion-card-title></ion-card-header>
            <ion-card-content>
              <p><strong>Ubicación:</strong> {{ lostPet.lastSeenLocation }}</p>
              <p><strong>Fecha:</strong> {{ formatDate(lostPet.lastSeenDate) }}</p>
            </ion-card-content>
          </ion-card>

          <ion-card v-if="lostPet.description" class="detail-card">
            <ion-card-header><ion-card-title class="card-title">Descripción</ion-card-title></ion-card-header>
            <ion-card-content><p>{{ lostPet.description }}</p></ion-card-content>
          </ion-card>

          <ion-card v-if="lostPet.identificationMarks?.length" class="detail-card">
            <ion-card-header><ion-card-title class="card-title">Marcas distintivas</ion-card-title></ion-card-header>
            <ion-card-content>
              <ion-chip v-for="mark in lostPet.identificationMarks" :key="mark" outline color="secondary">{{ mark }}</ion-chip>
            </ion-card-content>
          </ion-card>

          <ion-card v-if="lostPet.reward" class="detail-card reward-card">
            <ion-card-content class="reward-content">
              <span class="reward-emoji">💰</span>
              <div><strong>Recompensa</strong><p>${{ lostPet.reward }}</p></div>
            </ion-card-content>
          </ion-card>

          <ion-card class="detail-card contact-card">
            <ion-card-header><ion-card-title class="card-title">Contacto</ion-card-title></ion-card-header>
            <ion-card-content>
              <ion-button expand="block" @click="contactOwner" color="primary">
                <ion-icon :icon="chatbubbleOutline" slot="start" />
                Contactar dueño
              </ion-button>
            </ion-card-content>
          </ion-card>
          <div style="height:40px" />
        </div>
      </template>
      <div class="empty-state" v-else-if="!loading"><ion-icon :icon="searchOutline" /><h3>Reporte no encontrado</h3></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonChip, IonSkeletonText } from '@ionic/vue'
import { shareOutline, searchOutline, chatbubbleOutline, createOutline } from 'ionicons/icons'
import { Share } from '@capacitor/share'
import { useLostPets } from '@/composables/useLostPets'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { currentLostPet: lostPet, loading, loadLostPet } = useLostPets()
const { currentUser } = useAuth()

const canEdit = computed(() => {
    return lostPet.value && currentUser.value && (lostPet.value.ownerId === currentUser.value.uid || lostPet.value.ownerId === 'anonymous')
})

function sizeLabel(s?: string) { return ({ small: 'Pequeño', medium: 'Mediano', large: 'Grande' } as any)[s || ''] || s }
function formatDate(ts?: number) { return ts ? new Date(ts).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Desconocida' }

async function sharePet() {
  if (!lostPet.value) return
  try { await Share.share({ title: `¡Ayuda a encontrar a ${lostPet.value.name}!`, text: `${lostPet.value.name} está perdida. Última ubicación: ${lostPet.value.lastSeenLocation}`, url: `https://adopta-zulia.vercel.app/perdidas/${lostPet.value.id}` }) } catch {}
}

function contactOwner() {
  if (!lostPet.value?.contact) return
  const msg = encodeURIComponent(`Hola, vi tu reporte de ${lostPet.value.name} en Adopta Zulia.`)
  const phone = lostPet.value.contact.phone?.replace(/\D/g, '') || ''
  if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
}

onMounted(() => { const id = route.params.id as string; if (id) loadLostPet(id) })
</script>

<style scoped>
.image-gallery { position: relative; }
.main-image { width: 100%; height: 300px; object-fit: cover; }
.status-floating { position: absolute; top: 16px; left: 16px; font-size: 12px; padding: 6px 12px; border-radius: 8px; }
.detail-content { padding: 16px; }
.pet-name { font-size: 1.5rem; font-weight: 800; margin: 0 0 12px; }
.info-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.info-chip { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--ion-color-light); border-radius: 10px; font-size: .85rem; }
.detail-card { border-radius: 14px; margin: 0 0 12px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.card-title { font-size: 1rem; font-weight: 700; }
.reward-card { border: 2px solid var(--ion-color-secondary); }
.reward-content { display: flex; align-items: center; gap: 12px; }
.reward-emoji { font-size: 2rem; }
.contact-card { border: 2px solid var(--ion-color-primary-tint); }
</style>
