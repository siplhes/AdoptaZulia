<script setup>
import { useAuth } from '~/composables/useAuth'
const { userProfile } = useAuth()

if (userProfile.value?.username) {
  await navigateTo(`/${userProfile.value.username}`, { replace: true })
} else {
  await navigateTo('/login', { replace: true })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
  </div>
</template>
