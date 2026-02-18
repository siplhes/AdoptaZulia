<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/tabs/perdidas" text="Volver" /></ion-buttons>
        <ion-title>{{ pageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="!isAuthenticated" class="empty-state">
        <ion-icon :icon="lockClosedOutline" />
        <h3>Inicia sesión</h3>
        <p>Necesitas una cuenta para reportar una mascota perdida</p>
        <ion-button router-link="/login">Iniciar sesión</ion-button>
      </div>

      <div v-else class="wizard-container">
        <!-- Progress Bar -->
        <div class="step-progress">
          <div class="step-indicator" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">1</div>
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>
          <div class="step-indicator" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">2</div>
          <div class="step-line" :class="{ active: currentStep > 2 }"></div>
          <div class="step-indicator" :class="{ active: currentStep >= 3 }">3</div>
        </div>
        <div class="step-label">{{ stepTitle }}</div>

        <form @submit.prevent="handleSubmit" class="publish-form">
          <!-- STEP 1: Mascota (Basic Info + Photos) -->
          <div v-show="currentStep === 1" class="step-content fade-in">
            <div class="image-upload-section">
              <div v-if="images.length > 0" class="image-preview-container">
                <div v-for="(img, idx) in images" :key="idx" class="image-preview">
                  <img :src="img.preview" alt="Preview" />
                  <ion-button fill="clear" color="danger" class="remove-btn" @click="removeImage(idx)">
                    <ion-icon :icon="trashOutline" slot="icon-only" />
                  </ion-button>
                </div>
              </div>
              <div v-if="images.length < 3" class="add-image-btn" @click="takePhoto">
                <ion-icon :icon="cameraOutline" />
                <span>Agregar foto</span>
              </div>
            </div>

            <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Nombre *</ion-label>
              <ion-input v-model="form.name" required />
            </ion-item>

            <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Tipo *</ion-label>
              <ion-select v-model="form.type" interface="action-sheet">
                <ion-select-option value="perro">🐕 Perro</ion-select-option>
                <ion-select-option value="gato">🐈 Gato</ion-select-option>
                <ion-select-option value="ave">🦜 Ave</ion-select-option>
                <ion-select-option value="otro">🐾 Otro</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Raza</ion-label>
              <ion-input v-model="form.breed" />
            </ion-item>
          </div>

          <!-- STEP 2: Desaparición -->
          <div v-show="currentStep === 2" class="step-content fade-in">
             <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Última vez visto en *</ion-label>
              <ion-input v-model="form.lastSeenLocation" placeholder="Ej. Plaza de la República" required />
            </ion-item>

            <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Fecha de desaparición *</ion-label>
              <ion-input v-model="form.lastSeenDate" type="date" required />
            </ion-item>

             <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Descripción / Detalles *</ion-label>
              <ion-textarea v-model="form.description" :rows="5" required />
            </ion-item>
          </div>

          <!-- STEP 3: Contacto & Recompensa -->
          <div v-show="currentStep === 3" class="step-content fade-in">
             <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Recompensa (Opcional)</ion-label>
              <ion-input v-model="form.reward" type="number" placeholder="$" />
            </ion-item>
            
            <div class="toggles">
              <ion-item lines="none">
                <ion-toggle v-model="form.urgent" color="danger">🚨 Alta Urgencia</ion-toggle>
              </ion-item>
            </div>

            <h3 class="step-subtitle">Información de Contacto</h3>
            <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Nombre de contacto</ion-label>
              <ion-input v-model="form.contactName" />
            </ion-item>
            <ion-item fill="outline" class="input-item">
              <ion-label position="floating">Teléfono / WhatsApp *</ion-label>
              <ion-input v-model="form.contactPhone" type="tel" required />
            </ion-item>
          </div>
          
          <!-- Navigation Buttons -->
          <div class="wizard-actions">
            <ion-button v-if="currentStep > 1" fill="outline" class="nav-btn" @click="currentStep--">
              Atrás
            </ion-button>
            <div class="spacer"></div>
            <ion-button v-if="currentStep < 3" class="nav-btn" @click="nextStep">
              Siguiente
              <ion-icon :icon="arrowForward" slot="end" />
            </ion-button>
            <ion-button v-else type="submit" :disabled="submitting || uploading" class="nav-btn" color="danger">
              <ion-spinner v-if="submitting || uploading" name="crescent" />
              <span v-else>{{ uploading ? 'Subiendo...' : submitLabel }}</span>
              <ion-icon :icon="checkmarkOutline" slot="end" v-if="!submitting && !uploading" />
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonToggle, IonButton, IonIcon, IonSpinner } from '@ionic/vue'
import { lockClosedOutline, cameraOutline, trashOutline, arrowForward, checkmarkOutline } from 'ionicons/icons'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { useAuth } from '@/composables/useAuth'
import { useLostPets } from '@/composables/useLostPets'
import { useToast } from '@/composables/useToast'
import { S3Service } from '@/services/S3Service'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, currentUser } = useAuth()
const { createLostPet, updateLostPet, loadLostPet, currentLostPet } = useLostPets()
const toast = useToast()
const submitting = ref(false)
const uploading = ref(false)
const currentStep = ref(1)
const isEditing = computed(() => !!route.params.id)

const form = reactive({
  name: '', type: 'perro', breed: '', lastSeenLocation: '', lastSeenDate: '', 
  reward: '', description: '', urgent: false,
  contactName: '', contactPhone: '',
})

const images = ref<{ preview: string, blob?: Blob, url?: string }[]>([])

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 1: return 'Mascota'
    case 2: return 'Detalles de desaparición'
    case 3: return 'Contacto y Recompensa'
    default: return ''
  }
})

const pageTitle = computed(() => isEditing.value ? 'Editar reporte' : 'Reportar perdida')
const submitLabel = computed(() => isEditing.value ? 'Actualizar Alerta' : 'Publicar Alerta')

function nextStep() {
  if (currentStep.value === 1) {
    if (!form.name) { toast.warning('Ingresa el nombre'); return }
    if (images.value.length === 0) { toast.warning('Agrega al menos una foto'); return }
  } else if (currentStep.value === 2) {
    if (!form.lastSeenLocation || !form.lastSeenDate || !form.description) { 
      toast.warning('Completa los detalles de desaparición'); return 
    }
  }
  currentStep.value++
}

async function takePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      width: 1024,
    })

    if (image.webPath) {
      const response = await fetch(image.webPath)
      const blob = await response.blob()
      images.value.push({ preview: image.webPath, blob })
    }
  } catch (e) {
    // cancelled
  }
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

async function uploadImages(): Promise<string[]> {
  const urls: string[] = []
  for (const img of images.value) {
    if (img.url) {
        urls.push(img.url)
    } else if (img.blob) {
        const url = await S3Service.uploadFile(img.blob, 'lost-pets')
        if (url) urls.push(url)
    }
  }
  return urls
}

async function handleSubmit() {
  if (!form.contactPhone) {
    toast.warning('Ingresa un teléfono de contacto'); return
  }

  submitting.value = true
  uploading.value = true
  
  try {
    const uploadedUrls = await uploadImages()
    uploading.value = false

    const petData = {
      name: form.name,
      species: form.type as any,
      breed: form.breed,
      lastSeenLocation: form.lastSeenLocation,
      lastSeenDate: new Date(form.lastSeenDate).getTime(),
      description: form.description,
      urgencyLevel: form.urgent ? 'high' : 'medium' as any,
      reward: form.reward ? Number(form.reward) : undefined,
      contact: {
        name: form.contactName,
        phone: form.contactPhone,
        email: currentUser.value?.email || '',
        preferredMethod: 'whatsapp'
      },
      images: uploadedUrls,
    }

    if (isEditing.value) {
        const success = await updateLostPet(route.params.id as string, petData)
        if (success) { toast.success('¡Reporte actualizado!'); router.replace(`/perdidas/${route.params.id}`) }
        else toast.error('Error al actualizar')
    } else {
        const id = await createLostPet({
            ...petData,
             ownerId: currentUser.value?.uid || 'anonymous',
             identificationMarks: [],
        })
        if (id) { 
          toast.success('¡Alerta publicada!'); 
          router.replace(`/perdidas/${id}`) 
        }
        else toast.error('Error al publicar')
    }
  } catch (e) { 
    console.error(e)
    toast.error('Error al publicar') 
  } finally { 
    submitting.value = false
    uploading.value = false
  }
}

onMounted(async () => {
    if (isEditing.value) {
        const id = route.params.id as string
        await loadLostPet(id)
        if (currentLostPet.value) {
            const p = currentLostPet.value
            form.name = p.name
            form.type = p.species || 'perro'
            form.breed = p.breed || ''
            form.lastSeenLocation = p.lastSeenLocation || ''
            form.lastSeenDate = p.lastSeenDate ? new Date(p.lastSeenDate).toISOString().split('T')[0] : ''
            form.description = p.description || ''
            form.reward = p.reward?.toString() || ''
            form.urgent = p.urgencyLevel === 'high'
            if (p.contact) {
                form.contactName = p.contact.name || ''
                form.contactPhone = p.contact.phone || ''
            }
            if (p.images && p.images.length > 0) {
                images.value = p.images.map(url => ({ preview: url, url }))
            }
        }
    }
})
</script>

<style scoped>
.wizard-container { max-width: 500px; margin: 0 auto; padding-bottom: 40px; }
.step-progress { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding: 0 20px; }
.step-indicator { width: 32px; height: 32px; border-radius: 50%; background: var(--ion-color-light-shade); color: var(--ion-color-medium); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; z-index: 2; border: 2px solid transparent; transition: all 0.3s; }
.step-indicator.active { background: var(--ion-color-danger); color: white; box-shadow: 0 4px 10px rgba(var(--ion-color-danger-rgb), 0.3); }
.step-indicator.completed { background: var(--ion-color-success); }
.step-line { flex: 1; height: 3px; background: var(--ion-color-light-shade); margin: 0 8px; border-radius: 2px; transition: all 0.3s; }
.step-line.active { background: var(--ion-color-danger); }
.step-label { text-align: center; font-weight: 800; font-size: 1.2rem; margin-bottom: 20px; color: var(--ion-text-color); }

.step-content { min-height: 300px; }
.input-item { --border-radius: 16px; margin-bottom: 16px; --background: var(--ion-color-light); }
.step-subtitle { font-size: 1rem; font-weight: 700; margin: 24px 0 12px; color: var(--ion-color-dark); }
.wizard-actions { display: flex; gap: 12px; margin-top: 32px; }
.spacer { flex: 1; }
.nav-btn { min-width: 120px; font-weight: 700; --border-radius: 12px; height: 48px; }

.image-upload-section { margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; background: var(--ion-color-light); padding: 16px; border-radius: 20px; border: 2px dashed var(--ion-color-medium-tint); }
.add-image-btn { width: 90px; height: 90px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--ion-color-medium); cursor: pointer; background: white; }
.image-preview { width: 90px; height: 90px; border-radius: 16px; overflow: hidden; position: relative; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.remove-btn { position: absolute; top: 0; right: 0; margin: 0; padding: 0; --padding-start: 0; --padding-end: 0; width: 24px; height: 24px; min-height: 0; }
.toggles { margin: 8px 0 16px; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
