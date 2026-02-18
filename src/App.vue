<template>
  <ion-app>
    <ion-router-outlet />
    <TutorialModal />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useTheme } from '@/composables/useTheme'
import TutorialModal from '@/components/TutorialModal.vue'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>
