<template>
  <section class="bg-emerald-600">
    <!-- Versión para escritorio -->
    <header class="mx-auto max-w-4xl px-6 py-4 lg:py-6">
      <div class="flex flex-wrap items-center justify-between">
        <!-- Logo y título -->
        <NuxtLink to="/" class="flex items-center">
          <NuxtPicture src="/logo.svg" class="h-12 w-12 text-[#fefffa] lg:h-16 lg:w-16" />
          <span id="webTitle" class="ml-2">Adopta Zulia</span>
        </NuxtLink>

        <!-- Botón de hamburguesa para móvil -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="inline-flex items-center justify-center rounded-md p-2 text-white lg:hidden"
          aria-expanded="false"
        >
          <span class="sr-only">Abrir menú principal</span>
          <!-- Icono de menú -->
          <Icon name="heroicons:bars-3" v-if="!isMenuOpen" class="h-6 w-6" />
          <!-- Icono de cerrar -->
          <Icon name="heroicons:x-mark" v-else class="h-6 w-6" />
        </button>

        <!-- Menú de navegación para escritorio -->
        <div class="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-6">
          <NuxtLink
            v-for="(link, index) in navigationLinks"
            :key="index"
            :to="link.link"
            class="nav-link"
            :aria-label="link.alt"
          >
            {{ link.name }}
          </NuxtLink>

          <NuxtLink v-if="!isAuthenticated" to="/login" class="nav-link">Iniciar sesión</NuxtLink>

          <button v-else class="nav-link" aria-label="Cerrar sesión" @click="handleLogout">
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Menú móvil -->
    <div v-show="isMenuOpen" class="lg:hidden">
      <div class="space-y-1 px-4 pb-3 pt-2">
        <NuxtLink
          v-for="(link, index) in navigationLinks"
          :key="index"
          :to="link.link"
          class="mobile-nav-link block"
          :aria-label="link.alt"
          @click="isMenuOpen = false"
        >
          {{ link.name }}
        </NuxtLink>

        <NuxtLink
          v-if="!isAuthenticated"
          to="/login"
          class="mobile-nav-link block"
          @click="isMenuOpen = false"
        >
          Iniciar sesión
        </NuxtLink>

        <button
          v-else
          class="mobile-nav-link block w-full text-left"
          aria-label="Cerrar sesión"
          @click="handleLogoutMobile"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

// Estado para el menú móvil
const isMenuOpen = ref(false)

// Información de autenticación
const { isAdmin, isAuthenticated, logout } = useAuth()

// Enlaces en el menu de la cabecera
const baseLinks = [
  {
    name: 'Adopta',
    link: '/mascotas',
    alt: 'Adoptar mascotas',
  },
  {
    name: 'Publica',
    link: '/publicar',
    alt: 'Dar en adopcion a mascotas',
  },
  {
    name: 'Dona',
    link: '/donaciones',
    alt: 'Donar para ayudar a las mascotas',
  },
]

// Function to handle logout
const handleLogout = async () => {
  await logout()
}

// Function to handle logout in mobile view
const handleLogoutMobile = async () => {
  isMenuOpen.value = false
  await logout()
}

// Computed property for navigation links
const navigationLinks = computed(() => {
  const links = [...baseLinks]

  // Añadir enlace de admin si el usuario es administrador
  if (isAdmin.value) {
    links.push({
      name: 'Admin',
      link: '/admin',
      alt: 'Panel de administración',
    })
  }

  return links
})
</script>

<style scoped>
#webTitle {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: bold;
  color: #fefffa;
}

@media (min-width: 768px) {
  #webTitle {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

.nav-link {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: #fefffa;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.nav-link:hover,
.nav-link:focus {
  background-color: rgba(217, 119, 6, 0.8);
}

.mobile-nav-link {
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-size: 1.125rem;
  font-weight: 500;
  color: #fefffa;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.mobile-nav-link:hover,
.mobile-nav-link:focus {
  background-color: rgba(217, 119, 6, 0.8);
}
</style>
