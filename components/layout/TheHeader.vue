<template>
  <header
    class="sticky top-0 z-50 bg-emerald-700/95 shadow-lg backdrop-blur-md transition-all duration-300"
  >
    <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="group flex items-center gap-3 transition-transform hover:scale-105">
          <NuxtPicture
            src="/logo.svg"
            class="h-10 w-10 drop-shadow-md lg:h-12 lg:w-12"
            loading="eager"
            alt="Adopta Zulia Logo"
            width="48"
            height="48"
            placeholder
          />
          <h1 class="text-xl font-bold tracking-tight text-white drop-shadow-sm md:text-2xl">
            Adopta Zulia
          </h1>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex lg:items-center lg:gap-8">
          <NuxtLink
            v-for="(link, index) in navigationLinksWithoutProfile"
            :key="index"
            :to="link.link"
            class="relative px-3 py-2 text-sm font-medium text-emerald-50 transition-colors hover:text-white"
            active-class="text-white font-bold"
          >
            {{ link.name }}
            <!-- Active Indicator -->
            <span
              v-if="$route.path === link.link"
              class="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            />
          </NuxtLink>

          <!-- Auth Section -->
          <div
            v-if="isAuthenticated"
            class="relative ml-4 flex items-center border-l border-emerald-600/50 pl-4"
          >
            <NotificationsPanel class="mr-4 text-emerald-200 transition-colors hover:text-white" />

            <div class="relative">
              <button
                class="flex items-center gap-2 rounded-full transition-all hover:ring-2 hover:ring-emerald-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-emerald-700"
                aria-haspopup="true"
                aria-expanded="userMenuOpen"
                @click="toggleUserMenu"
              >
                <div
                  class="h-9 w-9 overflow-hidden rounded-full border-2 border-amber-400 bg-emerald-800 shadow-sm"
                >
                  <NuxtImg
                    v-if="user?.photoURL"
                    :src="user.photoURL"
                    :alt="user.displayName || 'Usuario'"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    sizes="36px"
                    placeholder
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center text-xs font-bold text-white"
                  >
                    {{ getInitials(user.displayName || user.email || 'U') }}
                  </div>
                </div>
                <Icon
                  name="heroicons:chevron-down"
                  class="h-4 w-4 text-emerald-200"
                  :class="{ 'rotate-180': userMenuOpen }"
                />
              </button>

              <!-- User Dropdown -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-show="userMenuOpen"
                  class="absolute right-0 top-12 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5 focus:outline-none"
                  role="menu"
                >
                  <div class="px-4 py-3">
                    <p class="text-xs text-gray-500">Conectado como</p>
                    <p class="truncate text-sm font-bold text-gray-900">{{ userName }}</p>
                  </div>

                  <div class="py-1">
                    <NuxtLink
                      :to="profileRoute"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                      role="menuitem"
                      @click="userMenuOpen = false"
                    >
                      <Icon
                        name="heroicons:user"
                        class="mr-3 h-4 w-4 text-gray-400 group-hover:text-emerald-500"
                      />
                      Mi perfil
                    </NuxtLink>
                    <NuxtLink
                      to="/mis-publicaciones"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                      role="menuitem"
                      @click="userMenuOpen = false"
                    >
                      <Icon
                        name="heroicons:photo"
                        class="mr-3 h-4 w-4 text-gray-400 group-hover:text-emerald-500"
                      />
                      Mis publicaciones
                    </NuxtLink>
                  </div>

                  <div v-if="isAdmin" class="py-1">
                    <NuxtLink
                      to="/admin"
                      class="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                      role="menuitem"
                      @click="userMenuOpen = false"
                    >
                      <Icon name="heroicons:shield-check" class="mr-3 h-4 w-4 text-purple-500" />
                      Panel Admin
                    </NuxtLink>
                  </div>

                  <div class="py-1">
                    <button
                      class="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                      @click="handleLogout"
                    >
                      <Icon
                        name="heroicons:arrow-right-on-rectangle"
                        class="mr-3 h-4 w-4 text-red-400"
                      />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div v-else class="flex items-center gap-4">
            <NuxtLink
              to="/login"
              class="text-sm font-medium text-emerald-100 transition-colors hover:text-white"
            >
              Iniciar sesión
            </NuxtLink>
            <NuxtLink
              to="/registro"
              class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30"
            >
              Registrarse
            </NuxtLink>
          </div>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg p-2 text-emerald-100 transition-colors hover:bg-emerald-800 lg:hidden"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span class="sr-only">Abrir menú principal</span>
          <Icon v-if="!isMenuOpen" name="heroicons:bars-3" class="h-7 w-7" />
          <Icon v-else name="heroicons:x-mark" class="h-7 w-7" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="isMenuOpen"
        class="absolute inset-x-0 top-full max-h-[90vh] overflow-y-auto border-t border-emerald-600 bg-emerald-800 shadow-xl lg:hidden"
      >
        <div class="space-y-1 px-4 py-6">
          <NuxtLink
            v-for="(link, index) in navigationLinks"
            :key="index"
            :to="link.link"
            class="block rounded-lg px-4 py-3 text-base font-medium text-emerald-50 transition-colors hover:bg-emerald-700 hover:text-white"
            active-class="bg-emerald-900/50 text-white font-bold"
            @click="isMenuOpen = false"
          >
            {{ link.name }}
          </NuxtLink>

          <div class="my-4 border-t border-emerald-600/50" />

          <template v-if="!isAuthenticated">
            <NuxtLink
              to="/login"
              class="block rounded-lg px-4 py-3 text-base font-medium text-emerald-50 hover:bg-emerald-700 hover:text-white"
              @click="isMenuOpen = false"
            >
              Iniciar sesión
            </NuxtLink>
            <NuxtLink
              to="/registro"
              class="mt-2 block rounded-lg bg-amber-500 px-4 py-3 text-center text-base font-bold text-white shadow-md hover:bg-amber-600"
              @click="isMenuOpen = false"
            >
              ¡Regístrate ahora!
            </NuxtLink>
          </template>

          <button
            v-else
            class="flex w-full items-center rounded-lg px-4 py-3 text-base font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200"
            @click="handleLogoutMobile"
          >
            <Icon name="heroicons:arrow-right-on-rectangle" class="mr-3 h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isMenuOpen = ref(false)
const userMenuOpen = ref(false)

const { isAdmin, isAuthenticated, logout, user, userProfile } = useAuth()

const baseLinks = [
  { name: 'Adopta', link: '/mascotas', alt: 'Adoptar mascotas' },
  { name: 'Perdidas', link: '/perdidas', alt: 'Mascotas perdidas' },
  { name: 'Publica', link: '/publicar', alt: 'Dar en adopcion' },
  { name: 'Dona', link: '/donaciones', alt: 'Donar' },
]

const handleLogout = async () => {
  userMenuOpen.value = false
  await logout()
}

const handleLogoutMobile = async () => {
  isMenuOpen.value = false
  await logout()
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const userName = computed(() => {
  if (!user.value) return 'Usuario'
  return (
    user.value.displayName || user.value.userName || user.value.email?.split('@')[0] || 'Usuario'
  )
})

const profileRoute = computed(() => {
  if (!isAuthenticated.value) return '/perfil'
  return userProfile.value?.userName ? `/${userProfile.value.userName}` : '/perfil'
})

const closeUserMenuOnClickOutside = (event) => {
  const userMenu = document.querySelector('[role="menu"]')
  const userButton = document.querySelector('[aria-haspopup="true"]')

  if (
    userMenuOpen.value &&
    userMenu &&
    userButton &&
    !userMenu.contains(event.target) &&
    !userButton.contains(event.target)
  ) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeUserMenuOnClickOutside)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') userMenuOpen.value = false
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenuOnClickOutside)
})

const navigationLinks = computed(() => {
  const links = [...baseLinks]
  if (isAuthenticated.value) {
    links.push({
      name: 'Mi Perfil',
      link: profileRoute.value,
      alt: 'Perfil de usuario',
    })
  }
  if (isAdmin.value) {
    links.push({
      name: 'Admin',
      link: '/admin',
      alt: 'Panel de administración',
    })
  }
  return links
})

const navigationLinksWithoutProfile = computed(() => baseLinks)
</script>
