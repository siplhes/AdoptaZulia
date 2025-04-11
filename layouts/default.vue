<template>
  <div>
    <TheHeader />
    <main>
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
