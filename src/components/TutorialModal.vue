<template>
  <ion-modal :is-open="isOpen" :can-dismiss="false" class="tutorial-modal">
    <div class="tutorial-content">
      <div class="slides">
        <div v-if="step === 1" class="slide fade-in">
          <img src="/logo.svg" alt="Logo" class="slide-img" />
          <h2>¡Bienvenido a Adopta Zulia! 🐾</h2>
          <p>La forma más fácil de encontrar a tu nuevo mejor amigo.</p>
        </div>

        <div v-if="step === 2" class="slide fade-in">
          <div class="icon-circle"><ion-icon :icon="micOutline" /></div>
          <h2>Usa tu voz 🎤</h2>
          <p>No necesitas escribir. Toca el micrófono y dinos qué buscas.</p>
        </div>

        <div v-if="step === 3" class="slide fade-in">
          <div class="icon-circle"><ion-icon :icon="textOutline" /></div>
          <h2>Letra grande 👓</h2>
          <p>Si el texto es muy pequeño, puedes agrandarlo en el menú principal.</p>
        </div>
      </div>

      <div class="dots">
        <span :class="{ active: step === 1 }"></span>
        <span :class="{ active: step === 2 }"></span>
        <span :class="{ active: step === 3 }"></span>
      </div>

      <div class="actions">
        <ion-button v-if="step < 3" expand="block" @click="step++">Siguiente</ion-button>
        <ion-button v-else expand="block" color="success" @click="finish">¡Empezar!</ion-button>
        <ion-button v-if="step < 3" fill="clear" @click="finish">Saltar</ion-button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonModal, IonButton, IonIcon } from '@ionic/vue'
import { micOutline, textOutline } from 'ionicons/icons'

const isOpen = ref(false)
const step = ref(1)

function finish() {
  isOpen.value = false
  localStorage.setItem('tutorial-seen', 'true')
}

onMounted(() => {
  const seen = localStorage.getItem('tutorial-seen')
  if (!seen) {
    isOpen.value = true
  }
})
</script>

<style scoped>
.tutorial-modal {
  --height: auto;
  --max-height: 90%;
  --border-radius: 20px;
}

.tutorial-content {
  background: white;
  padding: 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: center;
}

.slide {
  margin-bottom: 20px;
}

.slide-img {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.icon-circle {
  width: 100px;
  height: 100px;
  background: var(--ion-color-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 50px;
  color: var(--ion-color-primary);
}

h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 10px;
  color: var(--ion-color-dark);
}

p {
  font-size: 1.1rem;
  color: var(--ion-color-medium);
  line-height: 1.5;
}

.dots {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
}

.dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ion-color-light-shade);
  transition: all 0.3s;
}

.dots span.active {
  background: var(--ion-color-primary);
  width: 20px;
  border-radius: 5px;
}

.actions {
  width: 100%;
}
</style>
