<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button default-href="/login" text="Volver" /></ion-buttons><ion-title>Crear cuenta</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <div class="register-container">
        <div class="register-header">
          <h1>Únete a Adopta Zulia</h1>
          <p>Crea tu cuenta y ayuda a mascotas</p>
        </div>
        <form @submit.prevent="handleRegister" class="register-form">
          <ion-item lines="none" class="input-item">
            <ion-label position="stacked">Nombre completo</ion-label>
            <ion-input v-model="displayName" required autocomplete="name" placeholder="Tu nombre" />
          </ion-item>
          <ion-item lines="none" class="input-item">
            <ion-label position="stacked">Correo electrónico</ion-label>
            <ion-input v-model="email" type="email" required autocomplete="email" placeholder="ejemplo@correo.com" />
          </ion-item>
          <ion-item lines="none" class="input-item">
            <ion-label position="stacked">Contraseña</ion-label>
            <ion-input v-model="password" type="password" required autocomplete="new-password" placeholder="Mínimo 6 caracteres" />
          </ion-item>
          <ion-item lines="none" class="input-item">
            <ion-label position="stacked">Confirmar contraseña</ion-label>
            <ion-input v-model="confirmPassword" type="password" required placeholder="Repite tu contraseña" />
          </ion-item>
          <ion-text color="danger" v-if="formError"><p class="error-text">{{ formError }}</p></ion-text>
          <ion-button expand="block" type="submit" :disabled="authLoading" class="register-btn">
            <ion-spinner v-if="authLoading" name="crescent" /><span v-else>Crear cuenta</span>
          </ion-button>
        </form>
        <p class="login-link">¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonButton, IonText, IonSpinner } from '@ionic/vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { register, loading: authLoading, error: authError } = useAuth()
const toast = useToast()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const formError = computed(() => {
  if (password.value && confirmPassword.value && password.value !== confirmPassword.value) return 'Las contraseñas no coinciden'
  if (password.value && password.value.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
  return authError.value
})

async function handleRegister() {
  if (formError.value) return
  try {
    await register(email.value, password.value, displayName.value)
    toast.success('¡Cuenta creada exitosamente!')
    router.replace('/tabs/home')
  } catch {}
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 32px 0;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
  animation: fadeInDown 0.6s ease-out;
}

.register-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 8px;
  color: var(--ion-text-color);
}

.register-header p {
  color: var(--ion-color-medium);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.input-item {
  --border-radius: 16px;
  --background: var(--ion-color-light);
  --border-color: transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.error-text {
  text-align: center;
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ion-color-danger);
}

.register-btn {
  --border-radius: 16px;
  font-weight: 800;
  height: 56px;
  margin-top: 16px;
  font-size: 1.05rem;
  --box-shadow: 0 8px 20px rgba(var(--ion-color-primary-rgb), 0.3);
}

.login-link {
  text-align: center;
  margin-top: 32px;
  font-size: 0.95rem;
  color: var(--ion-color-medium);
  font-weight: 500;
  animation: fadeIn 0.8s ease-out 0.4s backwards;
}

.login-link a {
  color: var(--ion-color-primary);
  font-weight: 700;
  text-decoration: none;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
