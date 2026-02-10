import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'
import { useSecureLogger } from '~/composables/useSecureLogger'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, isAdmin, waitForAuth } = useAuth()
  const { warn } = useSecureLogger()

  // Wait for initial auth state to be determined first
  await waitForAuth()

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated.value) {
    warn('Acceso denegado: Usuario no autenticado')
    return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
  }

  // After waiting for auth, isAdmin should already be set
  if (!isAdmin.value) {
    warn('Acceso denegado: El usuario no tiene permisos de administrador')
    return navigateTo('/')
  }
})
