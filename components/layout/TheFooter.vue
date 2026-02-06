<script setup lang="ts">
import { ref } from 'vue'

const currentYear = new Date().getFullYear()

const links = [
  { label: 'Adoptar', to: '/mascotas' },
  { label: 'Publicar', to: '/publicar' },
  { label: 'Historias', to: '/historias' },
  { label: 'Donar', to: '/donaciones' },
]

const legals = [
  { label: 'Términos', to: '/terminos' },
  { label: 'Privacidad', to: '/privacidad' },
]
</script>

<template>
  <footer class="bg-white border-t border-gray-100 pt-16 pb-8">
    <div class="mx-auto max-w-5xl px-4">
      <div class="flex flex-col items-center justify-center text-center">
        <!-- Logo/Brand -->
        <NuxtLink to="/" class="mb-6 inline-flex flex-col items-center group">
           <div class="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
             <Icon name="ph:paw-print-fill" class="h-6 w-6" />
           </div>
           <span class="text-xl font-bold text-emerald-900 tracking-tight">Adopta Zulia</span>
        </NuxtLink>

        <!-- Main Nav -->
        <nav class="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
          <NuxtLink 
            v-for="link in links" 
            :key="link.to" 
            :to="link.to"
            class="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Divider -->
        <div class="mb-10 h-px w-24 bg-gray-200" />

        <!-- Socials -->
        <div class="mb-10 flex gap-6">
          <a href="https://instagram.com/adopta.zulia" target="_blank" class="text-gray-400 hover:text-pink-600 transition-colors">
            <Icon name="mdi:instagram" class="h-6 w-6" />
            <span class="sr-only">Instagram</span>
          </a>
          <a href="https://x.com/AdoptaZulia" target="_blank" class="text-gray-400 hover:text-black transition-colors">
             <Icon name="mdi:twitter" class="h-6 w-6" />
            <span class="sr-only">Twitter</span>
          </a>
          <a href="https://facebook.com/adopta.zulia" target="_blank" class="text-gray-400 hover:text-blue-600 transition-colors">
             <Icon name="mdi:facebook" class="h-6 w-6" />
            <span class="sr-only">Facebook</span>
          </a>
        </div>

        <!-- Copyright & Legal -->
        <div class="flex flex-col items-center gap-4 text-xs text-gray-400 md:flex-row">
          <p>&copy; {{ currentYear }} Adopta Zulia</p>
          <span class="hidden md:block">•</span>
          <div class="flex gap-4">
            <NuxtLink 
              v-for="legal in legals" 
              :key="legal.to" 
              :to="legal.to" 
              class="hover:text-gray-600 transition-colors"
            >
              {{ legal.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
