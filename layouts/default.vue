<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LayoutTheHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutTheFooter />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Adopta Zulia | Salvemos a las mascotas',
})
</script>
