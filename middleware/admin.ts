import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getCurrentUser } from 'vuefire'
import { AuthService } from '~/services/AuthService'
import { useSecureLogger } from '~/composables/useSecureLogger'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser()
  const { warn } = useSecureLogger()

  // Si no está autenticado, redirigir al login
  if (!user) {
    warn('Acceso denegado: Usuario no autenticado')
    return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
  }

  // Verify admin permissions
  const authService = new AuthService()
  const isAdmin = (await authService.isAdmin(user.uid)) || authService.isAdminEmail(user.email || '')
  
  if (!isAdmin) {
    warn('Acceso denegado: El usuario no tiene permisos de administrador')
    return navigateTo('/')
  }
})
