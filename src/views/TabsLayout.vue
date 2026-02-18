<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline" />
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="mascotas" href="/tabs/mascotas">
          <ion-icon :icon="pawOutline" />
          <ion-label>Adoptar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="perdidas" href="/tabs/perdidas">
          <ion-icon :icon="searchOutline" />
          <ion-label>Perdidas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="perfil" href="/tabs/perfil">
          <ion-icon :icon="personOutline" />
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/vue'
import { homeOutline, pawOutline, searchOutline, personOutline } from 'ionicons/icons'
</script>

<style scoped>
ion-tab-bar {
  --border: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

ion-tab-button {
  --color: #a3a3a3;
  --color-selected: #059669;
  font-size: 11px;
  font-weight: 500;
}

ion-tab-button ion-icon {
  font-size: 22px;
}
</style>
