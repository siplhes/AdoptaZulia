import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, waitForAuth } = useAuth()

  // Wait for initial auth state to be determined
  await waitForAuth()

  if (!isAuthenticated.value) {
    return navigateTo(`/login?redirect=${to.fullPath}`)
  }
})
