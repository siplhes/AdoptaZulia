import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Usar el composable de autenticación
  const { isAuthenticated, isAdmin, userProfile } = useAuth()
  
  // Verificar si el usuario está autenticado
  if (!isAuthenticated.value) {
    console.warn('Acceso denegado: Usuario no autenticado')
    return navigateTo('/login?redirect=' + to.fullPath)
  }
  
  // Esperar a que los datos del usuario estén cargados
  // (importante para la autenticación basada en Firebase que puede ser asíncrona)
  if (!userProfile.value) {
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  
  // Verificar si el usuario tiene rol de administrador
  if (!isAdmin.value) {
    console.warn('Acceso denegado: El usuario no tiene permisos de administrador')
    return navigateTo('/')
  }

})
