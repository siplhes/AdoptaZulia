<template>
  <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
    <a
      v-for="(category, index) in categories"
      :key="index"
      :href="category.link"
      class="group rounded-xl bg-emerald-800 p-6 text-center transition-transform hover:scale-105 hover:transform"
    >
      <div
        class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 shadow-md transition-colors group-hover:bg-emerald-700"
      >
        <component :is="category.icon" class="h-12 w-12 text-[#fefffa]" />
      </div>
      <h3 class="mb-2 text-xl font-semibold text-[#FEFFFA]">
        {{ category.name }}
      </h3>
      <p class="text-gray-200">{{ category.count }} disponibles</p>
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: {
    name: string
    icon: any
    count: number
    link: string
  }[]
}>()
</script>
