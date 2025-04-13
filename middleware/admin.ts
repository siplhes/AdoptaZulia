import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, isAdmin, userProfile } = useAuth()
  if (!isAuthenticated.value) {
    console.warn('Acceso denegado: Usuario no autenticado')
    return navigateTo('/login?redirect=' + to.fullPath)
  }
  if (!userProfile.value) {
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  if (!isAdmin.value) {
    console.warn('Acceso denegado: El usuario no tiene permisos de administrador')
    return navigateTo('/')
  }
})
