<template>
  <div class="voice-input-wrapper">
    <ion-button
      fill="clear"
      class="mic-button"
      :color="isListening ? 'danger' : 'medium'"
      @click="toggleListening"
    >
      <ion-icon :icon="mic" slot="icon-only" class="mic-icon" :class="{ listening: isListening }" />
    </ion-button>
    <div v-if="isListening" class="listening-indicator">
      <span>Escuchando...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { mic } from 'ionicons/icons'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { Capacitor } from '@capacitor/core'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isListening = ref(false)
const available = ref(false)

async function checkAvailability() {
  if (!Capacitor.isNativePlatform()) {
    available.value = false;
    return;
  }
  
  try {
    const { available: isAvailable } = await SpeechRecognition.available()
    available.value = isAvailable
  } catch (e) {
    console.error('Speech recognition not available', e)
    available.value = false
  }
}

async function startListening() {
  if (!available.value) {
    alert('El reconocimiento de voz no está disponible en este dispositivo')
    return
  }

  isListening.value = true
  
  try {
    // Request permissions first
    await SpeechRecognition.requestPermissions()
    
    await SpeechRecognition.start({
      language: 'es-ES', // Spanish
      partialResults: true,
      popup: false,
    })

    SpeechRecognition.addListener('partialResults', (data: any) => {
      if (data.matches && data.matches.length > 0) {
        emit('update:modelValue', props.modelValue + ' ' + data.matches[0])
      }
    })

  } catch (e) {
    console.error('Error starting speech recognition', e)
    isListening.value = false
  }
}

async function stopListening() {
  isListening.value = false
  try {
    await SpeechRecognition.stop()
  } catch (e) {
    console.error('Error stopping speech recognition', e)
  }
}

function toggleListening() {
  if (isListening.value) {
    stopListening()
  } else {
    startListening()
  }
}

onMounted(() => {
  checkAvailability()
})

onUnmounted(() => {
  if (isListening.value) {
    stopListening()
  }
})
</script>

<style scoped>
.voice-input-wrapper {
  display: inline-flex;
  align-items: center;
  position: relative;
}

.mic-button {
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  height: 36px;
}

.mic-icon {
  font-size: 24px;
  transition: transform 0.2s;
}

.mic-icon.listening {
  transform: scale(1.2);
  animation: pulse 1s infinite;
}

.listening-indicator {
  position: absolute;
  top: -30px;
  right: 0;
  background: var(--ion-color-danger);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  animation: fadeIn 0.2s;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
