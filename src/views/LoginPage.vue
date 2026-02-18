<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>Iniciar sesión</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="login-header">
          <img src="/logo.svg" alt="Adopta Zulia" class="login-logo" />
          <h1>Bienvenido</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <ion-item class="input-item" lines="none">
            <ion-label position="stacked">Correo electrónico</ion-label>
            <ion-input v-model="email" type="email" required autocomplete="email" placeholder="ejemplo@correo.com" />
          </ion-item>

          <ion-item class="input-item" lines="none">
            <ion-label position="stacked">Contraseña</ion-label>
            <ion-input v-model="password" :type="showPass ? 'text' : 'password'" required autocomplete="current-password" />
            <ion-button fill="clear" slot="end" @click="showPass = !showPass" class="pass-toggle">
              <ion-icon :icon="showPass ? eyeOffOutline : eyeOutline" slot="icon-only" />
            </ion-button>
          </ion-item>

          <ion-text color="danger" v-if="authError" class="error-text">
            <p>{{ authError }}</p>
          </ion-text>

          <ion-button expand="block" type="submit" :disabled="authLoading" class="login-btn">
            <ion-spinner v-if="authLoading" name="crescent" />
            <span v-else>Iniciar sesión</span>
          </ion-button>
        </form>

        <div class="divider"><span>o continuar con</span></div>

        <ion-button expand="block" fill="outline" @click="handleGoogleLogin" :disabled="authLoading" class="google-btn">
          <span class="google-icon">G</span>
          Google
        </ion-button>

        <p class="register-link">
          ¿No tienes cuenta?
          <router-link to="/register">Regístrate</router-link>
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText, IonSpinner } from '@ionic/vue'
import { eyeOutline, eyeOffOutline } from 'ionicons/icons'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { login, loginWithGoogle, loading: authLoading, error: authError } = useAuth()
const toast = useToast()

const email = ref('')
const password = ref('')
const showPass = ref(false)

async function handleLogin() {
  try {
    await login(email.value, password.value)
    toast.success('¡Bienvenido!')
    router.replace('/tabs/home')
  } catch {}
}

async function handleGoogleLogin() {
  try {
    await loginWithGoogle()
    toast.success('¡Bienvenido!')
    router.replace('/tabs/home')
  } catch {}
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInDown 0.6s ease-out;
}

.login-logo {
  width: 90px;
  height: 90px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3));
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px;
  color: var(--ion-text-color);
}

.login-header p {
  color: var(--ion-color-medium);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.input-item {
  --border-radius: 16px;
  --background: var(--ion-color-light);
  --border-color: transparent;
  --highlight-color-focused: var(--ion-color-primary);
  margin-bottom: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.pass-toggle {
  --color: var(--ion-color-medium);
  margin-right: 8px;
}

.error-text {
  text-align: center;
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.login-btn {
  --border-radius: 16px;
  font-weight: 800;
  height: 56px;
  margin-top: 12px;
  font-size: 1.05rem;
  --box-shadow: 0 8px 20px rgba(var(--ion-color-primary-rgb), 0.3);
}

.divider {
  text-align: center;
  margin: 32px 0;
  position: relative;
  animation: fadeIn 0.8s ease-out 0.4s backwards;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: var(--ion-color-light-shade);
}

.divider span {
  background: var(--ion-background-color);
  padding: 0 16px;
  position: relative;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  font-weight: 600;
}

.google-btn {
  --border-radius: 16px;
  --border-color: var(--ion-color-light-shade);
  --border-width: 2px;
  --color: var(--ion-text-color);
  height: 56px;
  font-weight: 700;
  font-size: 1rem;
  animation: fadeInUp 0.6s ease-out 0.5s backwards;
}

.google-icon {
  font-family: 'Product Sans', sans-serif;
  font-weight: 700;
  font-size: 1.4rem;
  margin-right: 12px;
  color: #4285f4;
}

.register-link {
  text-align: center;
  margin-top: 32px;
  font-size: 0.95rem;
  color: var(--ion-color-medium);
  font-weight: 500;
  animation: fadeIn 0.8s ease-out 0.6s backwards;
}

.register-link a {
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
