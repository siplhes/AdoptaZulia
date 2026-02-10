<template>
  <div class="relative flex min-h-screen flex-col justify-center bg-amber-50 py-12 sm:px-6 lg:px-8">
    <!-- Background pattern -->
    <div
      class="absolute inset-0 z-0 opacity-40"
      style="
        background-image: radial-gradient(#059669 0.5px, transparent 0.5px);
        background-size: 24px 24px;
      "
    ></div>

    <div class="relative z-10 w-full">
      <slot />
    </div>

    <div class="absolute bottom-4 z-10 w-full text-center">
      <NuxtLink to="/" class="text-sm font-medium text-gray-500 hover:text-emerald-600">
        &larr; Volver al inicio
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>
