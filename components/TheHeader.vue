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
          type="button"
          class="inline-flex items-center justify-center rounded-md p-2 text-white lg:hidden"
          aria-expanded="false"
            @click="isMenuOpen = !isMenuOpen"
        >
          <span class="sr-only">Abrir menú principal</span>
          <!-- Icono de menú -->
          <Icon  v-if="!isMenuOpen"  name="heroicons:bars-3"  class="h-6 w-6"/>
          <!-- Icono de cerrar -->
          <Icon v-else name="heroicons:x-mark"  class="h-6 w-6" />
        </button>

        <!-- Menú de navegación para escritorio -->
        <div class="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-6">
          <NuxtLink
            v-for="(link, index) in navigationLinksWithoutProfile"
            :key="index"
            :to="link.link"
            class="nav-link"
            :aria-label="link.alt"
          >
            {{ link.name }}
          </NuxtLink>

          <!-- Avatar del usuario (si está autenticado) -->
          <div v-if="isAuthenticated" class="relative">
            <button 
             
              class="flex items-center space-x-2 focus:outline-none"
              aria-haspopup="true"
              aria-expanded="userMenuOpen"
               @click="toggleUserMenu" 
            >
              <!-- Avatar del usuario -->
              <div class="overflow-hidden h-9 w-9 rounded-full border-2 border-amber-300">
                <NuxtImg 
                  v-if="user?.photoURL" 
                  :src="user.photoURL" 
                  :alt="user.displayName || 'Usuario'" 
                  class="h-full w-full object-cover"
                />
                <div 
                  v-else 
                  class="flex h-full w-full items-center justify-center bg-emerald-100 text-emerald-700 font-bold"
                >
                  {{ getInitials(user.displayName || user.email || 'U') }}
                </div>
              </div>
            </button>

            <!-- Menú desplegable del usuario -->
            <div 
              v-show="userMenuOpen"
              class="absolute right-0 mt-2 w-48 rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              role="menu"
            >
              <NuxtLink 
                :to="profileRoute" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                role="menuitem"
                @click="userMenuOpen = false"
              >
                {{user.userName || user.displayName || user.email}}
              </NuxtLink>
              
              <NuxtLink 
                to="/perfil/configuracion" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                role="menuitem"
                @click="userMenuOpen = false"
              >
                Configuración
              </NuxtLink>

              <div v-if="isAdmin" class="border-t border-gray-100 my-1"/>
              
              <NuxtLink 
                v-if="isAdmin"
                to="/admin" 
                class="block px-4 py-2 text-sm text-emerald-700 hover:bg-gray-100" 
                role="menuitem"
                @click="userMenuOpen = false"
              >
                Panel de administración
              </NuxtLink>

              <div class="border-t border-gray-100 my-1"/>
              
              <button 
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" 
                role="menuitem"
                @click="handleLogout"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <NuxtLink v-if="!isAuthenticated" to="/login" class="nav-link">Iniciar sesión</NuxtLink>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
const isMenuOpen = ref(false)
const userMenuOpen = ref(false)

const { isAdmin, isAuthenticated, logout, user, userProfile } = useAuth()

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
  userMenuOpen.value = false
  await logout()
}

// Function to handle logout in mobile view
const handleLogoutMobile = async () => {
  isMenuOpen.value = false
  await logout()
}

// Función para mostrar/ocultar el menú del usuario
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

// Función para obtener las iniciales del nombre completo
const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Computed para obtener el nombre de usuario o el correo
const userName = computed(() => {
  if (!user.value) return 'Usuario'
  return user.value.displayName || user.value.userName || user.value.email?.split('@')[0] || 'Usuario'
})

// Computed para obtener la ruta del perfil
const profileRoute = computed(() => {
  if (!isAuthenticated.value) return '/perfil'
  return userProfile.value?.userName ? `/${userProfile.value.userName}` : '/perfil'
})

// Cerrar el menú de usuario cuando se hace clic fuera de él
const closeUserMenuOnClickOutside = (event) => {
  const userMenu = document.querySelector('[role="menu"]')
  const userButton = document.querySelector('[aria-haspopup="true"]')
  
  if (userMenuOpen.value && userMenu && userButton && 
      !userMenu.contains(event.target) && 
      !userButton.contains(event.target)) {
    userMenuOpen.value = false
  }
}

// Añadir y eliminar event listeners
onMounted(() => {
  document.addEventListener('click', closeUserMenuOnClickOutside)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && userMenuOpen.value) {
      userMenuOpen.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenuOnClickOutside)
})

// Computed property for all navigation links
const navigationLinks = computed(() => {
  const links = [...baseLinks]

  // Añadir enlace de perfil si el usuario está autenticado
  if (isAuthenticated.value) {
    links.push({
      name: userName.value,
      link: profileRoute.value,
      alt: 'Perfil de usuario',
    })
  } 

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

// Computed property for links without profile (used in desktop view with avatar)
const navigationLinksWithoutProfile = computed(() => {
  return baseLinks
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
