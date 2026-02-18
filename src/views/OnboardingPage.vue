<template>
  <ion-page>
    <ion-content :fullscreen="true" class="onboarding-content">
      <div class="slides-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <!-- Slide 1 -->
        <div class="slide">
          <div class="slide-image-wrapper">
            <span class="slide-emoji">🐶</span>
          </div>
          <h2 class="slide-title">Encuentra tu compañero</h2>
          <p class="slide-text">Miles de mascotas esperan un hogar amoroso en Zulia. ¡Descúbrelas!</p>
        </div>

        <!-- Slide 2 -->
        <div class="slide">
          <div class="slide-image-wrapper">
            <span class="slide-emoji">💬</span>
          </div>
          <h2 class="slide-title">Conecta fácilmente</h2>
          <p class="slide-text">Comunícate directamente con refugios y dueños para iniciar el proceso.</p>
        </div>

        <!-- Slide 3 -->
        <div class="slide">
          <div class="slide-image-wrapper">
            <span class="slide-emoji">🏠</span>
          </div>
          <h2 class="slide-title">Salva una vida</h2>
          <p class="slide-text">Adopta, no compres. Dale una segunda oportunidad a quien más lo necesita.</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <div class="dots">
          <span 
            v-for="(_, i) in 3" 
            :key="i" 
            class="dot" 
            :class="{ active: i === currentSlide }"
          />
        </div>

        <div class="buttons">
          <ion-button 
            v-if="currentSlide < 2" 
            expand="block" 
            class="main-btn" 
            @click="nextSlide"
          >
            Siguiente
          </ion-button>
          <ion-button 
            v-else 
            expand="block" 
            class="main-btn" 
            @click="finishOnboarding"
          >
            ¡Empezar!
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonButton } from '@ionic/vue'

const router = useRouter()
const currentSlide = ref(0)

function nextSlide() {
  if (currentSlide.value < 2) {
    currentSlide.value++
  }
}

function finishOnboarding() {
  localStorage.setItem('seenOnboarding', 'true')
  router.replace('/tabs/home')
}
</script>

<style scoped>
.onboarding-content {
  --background: var(--ion-background-color);
}

.slides-container {
  display: flex;
  height: 80%;
  width: 300%; /* 3 slides */
  transition: transform 0.3s ease-in-out;
}

.slide {
  width: 33.33%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
}

.slide-image-wrapper {
  width: 200px;
  height: 200px;
  background: var(--ion-color-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  border: 4px solid var(--ion-color-light-shade);
}

.slide-emoji {
  font-size: 80px;
}

.slide-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ion-color-primary);
  margin-bottom: 16px;
}

.slide-text {
  font-size: 1rem;
  color: var(--ion-color-medium);
  line-height: 1.5;
}

.controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: var(--ion-background-color);
}

.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ion-color-light-shade);
  transition: all 0.2s;
}

.dot.active {
  background: var(--ion-color-primary);
  width: 24px;
  border-radius: 12px;
}

.main-btn {
  --background: var(--ion-color-primary);
  --border-radius: 16px;
  font-weight: 800;
  height: 56px;
  font-size: 1.1rem;
  --box-shadow: 0 4px 0 var(--ion-color-primary-shade);
}
</style>
