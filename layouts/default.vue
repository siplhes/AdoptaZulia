<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <TheHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Adopta Zulia | Salvemos a las mascotas',
})
</script>
