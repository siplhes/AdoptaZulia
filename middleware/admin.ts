import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'
import { useSecureLogger } from '~/composables/useSecureLogger'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, isAdmin, userProfile, loading } = useAuth()
  const { warn } = useSecureLogger()

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated.value) {
    warn('Acceso denegado: Usuario no autenticado')
    return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
  }

  // Esperar hasta que userProfile esté disponible o hasta un timeout corto
  const waitForProfile = async (timeoutMs = 1500) => {
    const start = Date.now()
    while (!userProfile.value && Date.now() - start < timeoutMs) {
      // Si hay un indicador de carga, respetarlo
      if (loading?.value === false && !userProfile.value) break
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  await waitForProfile()

  // Evaluar permisos de admin después de intentar cargar el profile
  if (!isAdmin.value) {
    warn('Acceso denegado: El usuario no tiene permisos de administrador')
    return navigateTo('/')
  }
})
