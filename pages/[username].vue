<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        ></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Usuario no encontrado -->
      <div v-else-if="!userProfile" class="mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-yellow-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">Usuario no encontrado</p>
          </div>
        </div>
      </div>

      <!-- Perfil de usuario -->
      <div v-else class="overflow-hidden rounded-lg bg-white shadow-lg">
        <!-- Portada del perfil -->
        <div class="relative h-48 bg-emerald-600">
          <!-- Foto de perfil -->
          <div class="absolute -bottom-16 left-8">
            <div class="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white">
              <img
                v-if="userProfile.photoURL"
                :src="userProfile.photoURL"
                :alt="userProfile.displayName"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-emerald-100">
                <span class="text-3xl font-bold text-emerald-600">
                  {{ userProfile.displayName?.charAt(0).toUpperCase() || 'U' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Botón de editar perfil (solo si es el perfil del usuario autenticado) -->
          <div v-if="isOwnProfile" class="absolute right-4 top-4">
            <NuxtLink
              to="/perfil/configuracion"
              class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-gray-100"
            >
              <Icon name="heroicons:pencil-square" class="mr-2 inline-block h-5 w-5" />
              Editar perfil
            </NuxtLink>
          </div>
        </div>

        <!-- Información del perfil -->
        <div class="px-8 pb-6 pt-20">
          <h1 class="text-2xl font-bold text-gray-900">{{ userProfile.displayName }}</h1>
          <p class="mb-4 text-gray-500">@{{ username }}</p>

          <!-- Biografía -->
          <div v-if="userProfile.bio" class="mb-6">
            <p class="whitespace-pre-line text-gray-700">{{ userProfile.bio }}</p>
          </div>

          <!-- Información adicional -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <!-- Fecha de registro -->
            <div v-if="userProfile.createdAt" class="flex items-center gap-2">
              <Icon name="heroicons:calendar" class="h-5 w-5 text-gray-400" />
              <span class="text-sm text-gray-600">
                Se unió {{ formatDate(userProfile.createdAt) }}
              </span>
            </div>

            <!-- Email -->
            <div v-if="userProfile.email && isOwnProfile" class="flex items-center gap-2">
              <Icon name="heroicons:envelope" class="h-5 w-5 text-gray-400" />
              <span class="text-sm text-gray-600">
                {{ userProfile.email }}
              </span>
            </div>

            <!-- Teléfono -->
            <div v-if="userProfile.phoneNumber && isOwnProfile" class="flex items-center gap-2">
              <Icon name="heroicons:phone" class="h-5 w-5 text-gray-400" />
              <span class="text-sm text-gray-600">
                {{ userProfile.phoneNumber }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pestañas de contenido -->
        <div class="border-t border-gray-200">
          <div class="flex border-b border-gray-200">
            <button
              v-for="(tab, index) in tabs"
              :key="index"
              @click="activeTab = tab.id"
              class="border-b-2 px-6 py-3 text-sm font-medium transition-colors"
              :class="
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              "
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Contenido de las pestañas -->
          <div class="p-6">
            <!-- Mascotas publicadas -->
            <div
              v-if="activeTab === 'pets' && userPets.length > 0"
              class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <PetCard v-for="pet in userPets" :key="pet.id" :pet="pet" />
            </div>

            <!-- Historias de adopción -->
            <div
              v-else-if="activeTab === 'stories' && userStories.length > 0"
              class="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <AdoptionStoryCard v-for="story in userStories" :key="story.id" :story="story" />
            </div>

            <!-- Favoritos -->
            <div
              v-else-if="activeTab === 'favorites' && isOwnProfile && favoritePets.length > 0"
              class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <PetCard v-for="pet in favoritePets" :key="pet.id" :pet="pet" />
            </div>

            <!-- Sin contenido -->
            <div v-else class="py-8 text-center">
              <Icon name="heroicons:document-text" class="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <h3 class="font-medium text-gray-500">
                No hay {{ getTabLabel(activeTab) }} para mostrar
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { usePets } from '~/composables/usePets'
import { useAdoptionStories } from '~/composables/useAdoptionStories'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Obtener el nombre de usuario de la URL
const route = useRoute()
const username = route.params.username

// Estado
const loading = ref(true)
const error = ref(null)
const userProfile = ref(null)
const userPets = ref([])
const userStories = ref([])
const favoritePets = ref([])
const activeTab = ref('pets')

// Composables
const { getUserByUsername, user, isAuthenticated } = useAuth()
const { fetchUserPets, fetchPetsByIds } = usePets()
const { fetchUserStories } = useAdoptionStories()

// Verificar si es el propio perfil del usuario
const isOwnProfile = computed(() => {
  if (!isAuthenticated.value || !userProfile.value) return false
  return user.value?.uid === userProfile.value.uid
})

// Pestañas disponibles
const tabs = computed(() => {
  const baseTabs = [
    { id: 'pets', label: 'Mascotas publicadas' },
    { id: 'stories', label: 'Historias de adopción' },
  ]

  // Solo mostrar pestaña de favoritos si el usuario está viendo su propio perfil
  if (isOwnProfile.value) {
    baseTabs.push({ id: 'favorites', label: 'Favoritos' })
  }

  return baseTabs
})

// Obtener etiqueta para el mensaje de "no hay contenido"
function getTabLabel(tabId) {
  switch (tabId) {
    case 'pets':
      return 'mascotas'
    case 'stories':
      return 'historias'
    case 'favorites':
      return 'favoritos'
    default:
      return 'contenido'
  }
}

// Formatear fecha
function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return format(date, 'dd MMMM yyyy', { locale: es })
}

// Cargar información del usuario y su contenido
onMounted(async () => {
  try {
    loading.value = true
    error.value = null

    // Obtener perfil de usuario por nombre de usuario
    const profile = await getUserByUsername(username)

    if (!profile) {
      error.value = 'Usuario no encontrado'
      return
    }

    userProfile.value = profile

    // Cargar mascotas publicadas por el usuario
    userPets.value = await fetchUserPets(profile.uid)

    // Cargar historias de adopción del usuario
    userStories.value = await fetchUserStories(profile.uid)

    // Si es el propio perfil, cargar favoritos
    if (isOwnProfile.value) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (favorites.length > 0) {
        favoritePets.value = await fetchPetsByIds(favorites)
      }
    }
  } catch (err) {
    console.error('Error al cargar el perfil:', err)
    error.value = 'Error al cargar la información del perfil'
  } finally {
    loading.value = false
  }
})
</script>
