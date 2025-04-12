import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Obtener estado de autenticación
  const { isAuthenticated } = useAuth()
  
  // Si el usuario no está autenticado, redirigir al login
  if (!isAuthenticated.value) {
    console.log('Redirigiendo: Usuario no autenticado intentando acceder a ruta protegida')
    return navigateTo(`/login?redirect=${to.fullPath}`)
  }
})