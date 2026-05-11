<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Redirigiendo al registro...</p>
    </div>
  </div>
</template>

<script setup>
// Redirect to the first step of registration
await navigateTo('/register-step-two')
</script>
