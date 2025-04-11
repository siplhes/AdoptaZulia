import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.client) {
    return 
  }

  const { isLoggedIn, isAdmin, user } = useAuth()

  if (!isLoggedIn()) {
    console.log('Middleware: Usuario no autenticado, redirigiendo a login')
    return navigateTo('/login')
  }
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (!isAdmin.value) {
    console.log('Middleware: Usuario no es administrador, redirigiendo a inicio')
    console.log('Usuario actual:', user.value?.email)
    console.log('Estado admin:', isAdmin.value)
    return navigateTo('/')
  }

  console.log('Middleware: Usuario autenticado y es administrador, permitiendo acceso')
})
