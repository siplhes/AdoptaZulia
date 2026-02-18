<template>
  <ion-buttons slot="end">
    <ion-button @click="openFontSizeModal">
      <ion-icon :icon="textOutline" slot="icon-only" />
    </ion-button>
  </ion-buttons>

  <ion-modal :is-open="isOpen" @didDismiss="closeFontSizeModal" :initial-breakpoint="0.25" :breakpoints="[0, 0.25]">
    <div class="font-size-modal ion-padding">
      <h3>Tamaño de letra</h3>
      <div class="slider-container">
        <ion-icon :icon="textOutline" size="small" />
        <ion-range
          :min="0.8"
          :max="1.7"
          :step="0.1"
          :value="currentScale"
          @ionChange="updateFontSize"
        ></ion-range>
        <ion-icon :icon="textOutline" size="large" />
      </div>
      <p class="preview-text" :style="{ fontSize: currentScale + 'rem' }">
        Así se verá el texto en la aplicación.
      </p>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonButtons, IonButton, IonIcon, IonModal, IonRange, IonContent } from '@ionic/vue'
import { textOutline } from 'ionicons/icons'

const isOpen = ref(false)
const currentScale = ref(1)

function openFontSizeModal() {
  isOpen.value = true
}

function closeFontSizeModal() {
  isOpen.value = false
}

function updateFontSize(ev: CustomEvent) {
  const scale = ev.detail.value
  currentScale.value = scale
  document.documentElement.style.setProperty('--ion-dynamic-font', `${scale}rem`)
  // Save preference
  localStorage.setItem('user-font-scale', String(scale))
}

onMounted(() => {
  const savedScale = localStorage.getItem('user-font-scale')
  if (savedScale) {
    currentScale.value = Number(savedScale)
    document.documentElement.style.setProperty('--ion-dynamic-font', `${savedScale}rem`)
  } else {
    // Set default
    document.documentElement.style.setProperty('--ion-dynamic-font', '1rem')
  }
})
</script>

<style scoped>
.font-size-modal {
  text-align: center;
}

.slider-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 20px 0;
}

.preview-text {
  margin-top: 20px;
  line-height: 1.5;
}
</style>
