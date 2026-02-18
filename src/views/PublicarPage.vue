<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/tabs/mascotas" text="Volver" /></ion-buttons>
        <ion-title>{{ pageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="!isAuthenticated" class="empty-state">
        <ion-icon :icon="lockClosedOutline" />
        <h3>Inicia sesión</h3>
        <p>Necesitas una cuenta para publicar mascotas</p>
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
            <!-- Image Upload -->
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

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Nombre *</ion-label>
              <ion-input v-model="form.name" required placeholder="Nombre de la mascota" />
            </ion-item>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Tipo *</ion-label>
              <ion-select v-model="form.type" interface="action-sheet" placeholder="Selecciona el tipo">
                <ion-select-option value="perro">🐕 Perro</ion-select-option>
                <ion-select-option value="gato">🐈 Gato</ion-select-option>
                <ion-select-option value="ave">🦜 Ave</ion-select-option>
                <ion-select-option value="conejo">🐰 Conejo</ion-select-option>
                <ion-select-option value="otro">🐾 Otro</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Raza</ion-label>
              <ion-input v-model="form.breed" placeholder="Ej. Mestizo, Labrador..." />
            </ion-item>
          </div>

          <!-- STEP 2: Detalles -->
          <div v-show="currentStep === 2" class="step-content fade-in">
            <div class="row-2">
              <ion-item lines="none" class="input-item">
                <ion-label position="stacked">Edad</ion-label>
                <ion-select v-model="form.age" interface="action-sheet" placeholder="Selecciona">
                  <ion-select-option value="cachorro">Cachorro</ion-select-option>
                  <ion-select-option value="joven">Joven</ion-select-option>
                  <ion-select-option value="adulto">Adulto</ion-select-option>
                  <ion-select-option value="senior">Senior</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item lines="none" class="input-item">
                <ion-label position="stacked">Género</ion-label>
                <ion-select v-model="form.gender" interface="action-sheet" placeholder="Selecciona">
                  <ion-select-option value="macho">♂️ Macho</ion-select-option>
                  <ion-select-option value="hembra">♀️ Hembra</ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Tamaño</ion-label>
              <ion-select v-model="form.size" interface="action-sheet" placeholder="Selecciona tamaño">
                <ion-select-option value="pequeño">Pequeño</ion-select-option>
                <ion-select-option value="mediano">Mediano</ion-select-option>
                <ion-select-option value="grande">Grande</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Descripción *</ion-label>
              <ion-textarea v-model="form.description" :rows="6" required placeholder="Cuéntanos sobre su personalidad, historia, etc." />
            </ion-item>
          </div>

          <!-- STEP 3: Estado & Contacto -->
          <div v-show="currentStep === 3" class="step-content fade-in">
            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Ubicación *</ion-label>
              <ion-input v-model="form.location" required placeholder="Ej. Maracaibo, Zulia" />
            </ion-item>

            <div class="toggles">
              <ion-item lines="none" class="toggle-item">
                <ion-toggle v-model="form.vaccinated">Vacunado</ion-toggle>
              </ion-item>
              <ion-item lines="none" class="toggle-item">
                <ion-toggle v-model="form.neutered">Esterilizado</ion-toggle>
              </ion-item>
              <ion-item lines="none" class="toggle-item">
                <ion-toggle v-model="form.urgent" color="danger">🚨 Urgente</ion-toggle>
              </ion-item>
            </div>

            <h3 class="step-subtitle">Contacto</h3>
            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Nombre de contacto</ion-label>
              <ion-input v-model="form.contactName" placeholder="Tu nombre" />
            </ion-item>
            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Teléfono / WhatsApp *</ion-label>
              <ion-input v-model="form.contactPhone" type="tel" required placeholder="0414-1234567" />
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
            <ion-button v-else type="submit" :disabled="submitting || uploading" class="nav-btn">
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
import { usePets } from '@/composables/usePets'
import { useToast } from '@/composables/useToast'
import { S3Service } from '@/services/S3Service'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, currentUser } = useAuth()
const { createPet, editPet, loadPet, currentPet } = usePets()
const toast = useToast()
const submitting = ref(false)
const uploading = ref(false)
const currentStep = ref(1)
const isEditing = computed(() => !!route.params.id)

const form = reactive({
  name: '', type: 'perro', breed: '', age: '', gender: '', size: '', location: '', description: '',
  vaccinated: false, neutered: false, urgent: false,
  contactName: '', contactPhone: '', contactEmail: '',
})

const images = ref<{ preview: string, blob?: Blob, url?: string }[]>([])

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 1: return 'Información básica'
    case 2: return 'Detalles'
    case 3: return 'Ubicación y Contacto'
    default: return ''
  }
})

const pageTitle = computed(() => isEditing.value ? 'Editar mascota' : 'Publicar mascota')
const submitLabel = computed(() => isEditing.value ? 'Actualizar' : 'Publicar')

function nextStep() {
  if (currentStep.value === 1) {
    if (!form.name) { toast.warning('Ingresa el nombre'); return }
    if (images.value.length === 0) { toast.warning('Agrega al menos una foto'); return }
  } else if (currentStep.value === 2) {
    if (!form.description) { toast.warning('Ingresa una descripción'); return }
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
        urls.push(img.url) // Existing image
    } else if (img.blob) {
        const url = await S3Service.uploadFile(img.blob, 'pets')
        if (url) urls.push(url)
    }
  }
  return urls
}

async function handleSubmit() {
  if (!form.location || !form.contactPhone) {
    toast.warning('Completa ubicación y teléfono'); return
  }

  submitting.value = true
  uploading.value = true
  
  try {
    const uploadedUrls = await uploadImages()
    uploading.value = false

    const petData = {
      name: form.name, type: form.type, typeValue: form.type, breed: form.breed,
      age: form.age, ageValue: form.age, gender: form.gender, size: form.size, sizeValue: form.size,
      location: form.location, description: form.description,
      vaccinated: form.vaccinated, neutered: form.neutered, urgent: form.urgent,
      contact: { name: form.contactName, phone: form.contactPhone, email: form.contactEmail, preferredMethod: 'whatsapp' },
      photos: uploadedUrls,
      image: uploadedUrls[0] || '',
    }

    if (isEditing.value) {
        const success = await editPet(route.params.id as string, petData)
        if (success) { toast.success('¡Mascota actualizada!'); router.replace(`/mascotas/${route.params.id}`) }
        else toast.error('Error al actualizar')
    } else {
        const id = await createPet({
            ...petData,
            status: 'available', userId: currentUser.value?.uid || null,
        })
        if (id) { toast.success('¡Mascota publicada!'); router.replace(`/mascotas/${id}`) }
        else toast.error('Error al publicar')
    }
  } catch (e) { 
    console.error(e)
    toast.error('Error al procesar') 
  } finally { 
    submitting.value = false
    uploading.value = false
  }
}

onMounted(async () => {
    if (isEditing.value) {
        const id = route.params.id as string
        await loadPet(id)
        if (currentPet.value) {
            const p = currentPet.value
            form.name = p.name
            form.type = p.type || 'perro'
            form.breed = p.breed || ''
            form.age = p.age || ''
            form.gender = p.gender as any || ''
            form.size = p.size || ''
            form.location = p.location || ''
            form.description = p.description || ''
            form.vaccinated = p.vaccinated || false
            form.neutered = p.neutered || false
            form.urgent = p.urgent || false
            if (p.contact) {
                form.contactName = p.contact.name || ''
                form.contactPhone = p.contact.phone || ''
                form.contactEmail = p.contact.email || ''
            }
            if (p.photos && p.photos.length > 0) {
                images.value = p.photos.map(url => ({ preview: url, url }))
            } else if (p.image) {
                images.value = [{ preview: p.image, url: p.image }]
            }
        }
    }
})
</script>

<style scoped>
.wizard-container {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.step-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 0 20px;
  position: relative;
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ion-color-light);
  color: var(--ion-color-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  z-index: 2;
  border: 3px solid var(--ion-background-color);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.step-indicator.active {
  background: var(--ion-color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.4);
  transform: scale(1.1);
}

.step-indicator.completed {
  background: var(--ion-color-success);
}

.step-line {
  flex: 1;
  height: 4px;
  background: var(--ion-color-light);
  margin: 0 -10px;
  border-radius: 2px;
  transition: all 0.4s ease;
  z-index: 1;
}

.step-line.active {
  background: var(--ion-color-primary);
}

.step-label {
  text-align: center;
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: var(--ion-text-color);
  letter-spacing: -0.5px;
}

.step-content {
  min-height: 400px;
}

.input-item {
  --border-radius: 16px;
  margin-bottom: 16px;
  --background: var(--ion-color-light);
  --border-width: 0;
  --inner-padding-end: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.step-subtitle {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 32px 0 16px;
  color: var(--ion-color-dark);
}

.wizard-actions {
  display: flex;
  gap: 16px;
  margin-top: 40px;
}

.spacer {
  flex: 1;
}

.nav-btn {
  min-width: 140px;
  font-weight: 700;
  --border-radius: 16px;
  height: 52px;
  font-size: 1rem;
}

.image-upload-section {
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ion-color-light);
  padding: 24px;
  border-radius: 24px;
  border: 2px dashed var(--ion-color-medium-tint);
  transition: all 0.3s;
}

.image-upload-section:hover {
  border-color: var(--ion-color-primary);
  background: rgba(var(--ion-color-primary-rgb), 0.03);
}

.add-image-btn {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-medium);
  cursor: pointer;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.add-image-btn:active {
  transform: scale(0.95);
}

.image-preview {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  margin: 0;
  padding: 0;
  --padding-start: 0;
  --padding-end: 0;
  width: 28px;
  height: 28px;
  min-height: 0;
  --border-radius: 50%;
  --background: rgba(255,255,255,0.9);
  color: var(--ion-color-danger);
}

.toggles {
  background: var(--ion-color-light);
  border-radius: 20px;
  padding: 8px;
  margin-bottom: 24px;
}

.fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); scale: 0.98; }
  to { opacity: 1; transform: translateY(0); scale: 1; }
}
</style>
