<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/tabs/perfil" text="Volver" /></ion-buttons>
        <ion-title>Configuración</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list inset>
        <ion-list-header>
          <ion-label>Apariencia</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-icon :icon="contrastOutline" slot="start" color="primary" />
          <ion-label>Modo Oscuro</ion-label>
          <ion-toggle slot="end" :checked="isDark" @ionChange="toggleTheme" />
        </ion-item>
      </ion-list>

      <ion-list inset>
        <ion-list-header>
          <ion-label>Acerca de</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-icon :icon="informationCircleOutline" slot="start" color="secondary" />
          <ion-label>Versión</ion-label>
          <ion-note slot="end">1.0.0 (Beta)</ion-note>
        </ion-item>
        <ion-item button href="https://github.com/siplhes/AdoptaZulia" target="_blank">
          <ion-icon :icon="logoGithub" slot="start" />
          <ion-label>Código Fuente</ion-label>
        </ion-item>
      </ion-list>

      <div class="footer-actions">
        <ion-button expand="block" fill="outline" color="danger" @click="handleLogout">
          <ion-icon :icon="logOutOutline" slot="start" />
          Cerrar Sesión
        </ion-button>
      </div>

      <div class="copyright">
        <p>Hecho con ❤️ en Zulia</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonList, IonListHeader, IonItem, IonLabel, IonIcon, IonToggle, IonNote, IonButton } from '@ionic/vue'
import { contrastOutline, informationCircleOutline, logoGithub, logOutOutline } from 'ionicons/icons'
import { useTheme } from '@/composables/useTheme'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { isDark, toggleTheme } = useTheme()
const { logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.replace('/tabs/home')
}
</script>

<style scoped>
.footer-actions {
  margin-top: 32px;
  padding: 0 16px;
}
.copyright {
  text-align: center;
  margin-top: 32px;
  color: var(--ion-color-medium);
  font-size: 0.8rem;
}
</style>
