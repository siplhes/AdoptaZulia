import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getCurrentUser } from 'vuefire'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser()

  if (!user) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
