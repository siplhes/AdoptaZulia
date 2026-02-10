<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-40">
      <div
        class="h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
      />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || !userProfile"
      class="flex flex-col items-center justify-center px-4 py-40 text-center"
    >
      <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <Icon name="heroicons:user-minus" class="h-12 w-12 text-gray-400" />
      </div>
      <h2 class="mb-2 text-2xl font-bold text-gray-900">Usuario no encontrado</h2>
      <p class="mx-auto mb-8 max-w-sm text-gray-500">
        El perfil que buscas no está disponible o ha sido desactivado.
      </p>
      <NuxtLink
        to="/"
        class="rounded-xl bg-emerald-600 px-8 py-3 font-medium text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700"
      >
        Volver al inicio
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Hero Profile Header -->
      <div class="relative overflow-hidden bg-white pb-12">
        <!-- Cover Background -->
        <div class="group relative h-64 w-full md:h-80">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-800 to-teal-600 opacity-90" />
          <!-- Pattern Overlay -->
          <div
            class="absolute inset-0 opacity-10"
            style="
              background-image: radial-gradient(#ffffff 1px, transparent 1px);
              background-size: 20px 20px;
            "
          ></div>

          <!-- Action Buttons -->
          <div class="absolute right-6 top-6 z-10 flex gap-3">
            <button
              @click="shareProfile"
              class="flex items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-md"
            >
              <Icon name="heroicons:share" class="mr-2 h-4 w-4" />
              Compartir
            </button>
            <NuxtLink
              v-if="isOwnProfile"
            <NuxtLink
              to="/perfil/configuracion"
              class="flex items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-md"
            >
              <Icon name="heroicons:pencil-square" class="mr-2 h-4 w-4" />
              Editar
            </NuxtLink>
          </div>
        </div>

        <div class="container relative mx-auto max-w-6xl px-4 md:px-6">
          <div class="-mt-20 mb-6 flex flex-col items-end md:-mt-24 md:flex-row">
            <!-- Avatar -->
            <div class="relative z-10 mx-auto md:mx-0">
              <div
                class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl transition-transform duration-300 hover:scale-105 md:h-40 md:w-40"
              >
                <NuxtImg
                  v-if="userProfile.photoURL"
                  :src="userProfile.photoURL"
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-5xl font-bold text-emerald-600">
                  {{ userProfile.displayName?.charAt(0).toUpperCase() || 'U' }}
                </span>
              </div>
              <!-- Status Indicator -->
              <div
                class="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white bg-green-500 md:bottom-3 md:right-3"
                title="Online"
              />
            </div>

            <!-- Key Stats -->
            <div class="mt-6 w-full md:ml-auto md:mt-0 md:w-auto">
              <div
                class="grid grid-cols-3 gap-2 rounded-xl bg-white p-2 md:gap-6 md:border md:border-gray-100 md:p-4 md:shadow-lg"
              >
                <div class="px-2 text-center md:px-4">
                  <span class="block text-2xl font-black text-gray-900 md:text-3xl">
                    {{ userPets.length }}
                  </span>
                  <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Mascotas
                  </span>
                </div>
                <div class="border-l border-r border-gray-100 px-2 text-center md:px-4">
                  <span class="block text-2xl font-black text-emerald-600 md:text-3xl">
                    {{ verifiedCount }}
                  </span>
                  <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Adopciones
                  </span>
                </div>
                <div class="px-2 text-center md:px-4">
                  <span class="block text-2xl font-black text-amber-500 md:text-3xl">
                    {{ userStories.length }}
                  </span>
                  <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Historias
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="mt-8 border-b border-gray-200">
            <!-- Profile Info -->
            <div class="mt-4 flex-1 text-center md:ml-8 md:mt-0 md:text-left">
              <h1 class="mb-1 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
                {{ userProfile.displayName || userProfile.username || 'Usuario' }}
              </h1>
              <p class="mb-4 text-lg font-semibold text-emerald-500">
                @{{ userProfile.username || username }}
              </p>

              <!-- Bio -->
              <div v-if="userProfile.bio" class="mx-auto max-w-2xl md:mx-0">
                <p
                  class="line-clamp-2 cursor-default text-sm leading-relaxed text-gray-600 transition-all hover:line-clamp-none md:text-base"
                >
                  {{ userProfile.bio }}
                </p>
              </div>

              <!-- Meta Info -->
              <div
                class="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500 md:justify-start md:gap-6"
              >
                <div
                  v-if="userProfile.createdAt"
                  class="flex items-center rounded-full border border-gray-100 bg-gray-50 px-3 py-1"
                >
                  <Icon name="heroicons:calendar" class="mr-2 h-4 w-4 text-emerald-500" />
                  Se unió en {{ formatDate(userProfile.createdAt) }}
                </div>
                <div
                  v-if="userProfile.location"
                  class="flex items-center rounded-full border border-gray-100 bg-gray-50 px-3 py-1"
                >
                  <Icon name="heroicons:map-pin" class="mr-2 h-4 w-4 text-rose-500" />
                  {{ userProfile.location }}
                </div>
              </div>
            </div>
            <div class="hide-scrollbar flex gap-8 overflow-x-auto">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                class="group flex items-center whitespace-nowrap border-b-2 pb-4 text-sm font-medium transition-all duration-200 focus:outline-none"
                :class="
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
                "
                @click="activeTab = tab.id"
              >
                <span
                  :class="{
                    'text-emerald-500': activeTab === tab.id,
                    'text-gray-400 group-hover:text-gray-500': activeTab !== tab.id,
                  }"
                  class="mr-2"
                >
                  <Icon v-if="tab.id === 'pets'" name="heroicons:home-modern" class="h-5 w-5" />
                  <Icon v-else-if="tab.id === 'lost'" name="heroicons:megaphone" class="h-5 w-5" />
                  <Icon
                    v-else-if="tab.id === 'stories'"
                    name="heroicons:book-open"
                    class="h-5 w-5"
                  />
                  <Icon v-else-if="tab.id === 'adopted'" name="heroicons:heart" class="h-5 w-5" />
                  <Icon
                    v-else-if="tab.id === 'received'"
                    name="heroicons:inbox-arrow-down"
                    class="h-5 w-5"
                  />
                  <Icon
                    v-else-if="tab.id === 'sent'"
                    name="heroicons:paper-airplane"
                    class="h-5 w-5"
                  />
                </span>
                {{ tab.label }}
                <span
                  v-if="getTabCount(tab.id) > 0"
                  class="ml-2 rounded-full px-2 py-0.5 text-xs font-bold transition-colors"
                  :class="
                    activeTab === tab.id
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  "
                >
                  {{ getTabCount(tab.id) }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content Container -->
      <div class="container mx-auto max-w-6xl px-4 py-8 md:px-6">
        <transition name="fade" mode="out-in">
          <!-- Pets Tab -->
          <div v-if="activeTab === 'pets'" key="pets">
            <div
              v-if="userPets.length > 0"
              class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <PetCard v-for="pet in userPets" :key="pet.id" :pet="pet" class="h-full" />
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
            >
              <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                <Icon name="heroicons:home-modern" class="h-10 w-10 text-gray-300" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Sin mascotas en adopción</h3>
              <p class="mt-1 text-gray-500">
                Este usuario no tiene mascotas publicadas actualmente.
              </p>
            </div>
          </div>

          <!-- Lost Pets Tab -->
          <div v-else-if="activeTab === 'lost'" key="lost">
            <div
              v-if="userLostReports.length > 0"
              class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <PetCard v-for="pet in mappedUserLost" :key="pet.id" :pet="pet" class="h-full" />
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
            >
              <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                <Icon name="heroicons:megaphone" class="h-10 w-10 text-amber-300" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Sin reportes activos</h3>
              <p class="mt-1 text-gray-500">No hay reportes de mascotas perdidas.</p>
            </div>
          </div>

          <!-- Stories Tab -->
          <div v-else-if="activeTab === 'stories'" key="stories">
            <div v-if="userStories.length > 0" class="grid grid-cols-1 gap-8 md:grid-cols-2">
              <AdoptionStoryCard v-for="story in userStories" :key="story.id" :story="story" />
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
            >
              <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                <Icon name="heroicons:book-open" class="h-10 w-10 text-blue-300" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Sin historias compartidas</h3>
              <p class="mt-1 text-gray-500">Aún no ha compartido momentos especiales.</p>
            </div>
          </div>

          <!-- Verified Adoptions Link -->
          <div v-else-if="activeTab === 'adopted'" key="adopted">
            <div
              v-if="verifiedAdoptions.length > 0"
              class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div
                v-for="ver in verifiedAdoptions"
                :key="ver.id"
                class="group flex h-full flex-col overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <div class="relative h-56 overflow-hidden">
                  <NuxtImg
                    :src="ver.pet?.imageUrl || '/placeholder.webp'"
                    class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5"
                  >
                    <div
                      class="translate-y-2 transform transition-transform duration-300 group-hover:translate-y-0"
                    >
                      <span
                        class="mb-2 inline-block rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                      >
                        Completada
                      </span>
                      <h3 class="text-xl font-bold text-white">{{ ver.pet?.name || 'Mascota' }}</h3>
                    </div>
                  </div>
                </div>
                <div class="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div class="mb-4 flex items-center text-sm text-gray-500">
                      <Icon name="heroicons:calendar-days" class="mr-2 h-4 w-4" />
                      {{ formatDateFull(ver.adoptionDate || ver.updatedAt) }}
                    </div>
                    <p class="line-clamp-2 text-sm text-gray-600">
                      {{ ver.notes || 'Una historia con final feliz.' }}
                    </p>
                  </div>
                  <NuxtLink
                    :to="`/certificados/${ver.id}`"
                    class="mt-4 flex w-full items-center justify-center rounded-lg bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <Icon name="heroicons:document-Check" class="mr-2 h-4 w-4" />
                    Ver Certificado
                  </NuxtLink>
                </div>
              </div>
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
            >
              <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
                <Icon name="heroicons:heart" class="h-10 w-10 text-rose-300" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Ninguna adopción verificada</h3>
              <p class="mt-1 text-gray-500">Aún no hay adopciones completadas para mostrar.</p>
            </div>
          </div>

          <!-- Received Adoptions (Private) -->
          <div v-else-if="activeTab === 'received' && isOwnProfile" key="received">
            <div class="mb-6 flex items-start rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Icon name="heroicons:lock-closed" class="mr-3 mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <h4 class="text-sm font-bold text-amber-800">Sección Privada</h4>
                <p class="mt-1 text-xs text-amber-700">
                  Solo tú puedes ver estas solicitudes recibidas para tus mascotas.
                </p>
              </div>
            </div>

            <div
              v-if="receivedAdoptions.length > 0"
              class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead class="border-b border-gray-200 bg-gray-50 font-medium text-gray-500">
                    <tr>
                      <th class="px-6 py-4">Mascota</th>
                      <th class="px-6 py-4">Solicitante</th>
                      <th class="px-6 py-4">Fecha</th>
                      <th class="px-6 py-4">Estado</th>
                      <th class="px-6 py-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr
                      v-for="adoption in receivedAdoptions"
                      :key="adoption.id"
                      class="transition-colors hover:bg-gray-50/50"
                    >
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <NuxtImg
                            :src="
                              adoption.pet?.imageUrl || adoption.pet?.image || '/placeholder.webp'
                            "
                            class="mr-3 h-10 w-10 rounded-lg bg-gray-200 object-cover"
                          />
                          <span class="font-medium text-gray-900">
                            {{ adoption.pet?.name || 'Mascota' }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex flex-col">
                          <span class="font-medium text-gray-900">
                            {{ adoption.user?.name || 'Usuario' }}
                          </span>
                          <span class="text-xs text-gray-500">{{ adoption.user?.email }}</span>
                        </div>
                      </td>
                      <td class="whitespace-nowrap px-6 py-4 text-gray-500">
                        {{ formatDate(adoption.createdAt) }}
                      </td>
                      <td class="px-6 py-4">
                        <span :class="statusBadge(adoption.status)">
                          {{ statusLabel(adoption.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <NuxtLink
                          to="/perfil"
                          class="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800"
                        >
                          Gestionar
                          <Icon name="heroicons:arrow-right" class="ml-1 h-3 w-3" />
                        </NuxtLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
            >
              <Icon name="heroicons:inbox" class="mb-3 h-12 w-12 text-gray-300" />
              <p class="text-gray-500">No tienes solicitudes pendientes.</p>
            </div>
          </div>

          <!-- Sent Adoptions (Private) -->
          <div v-else-if="activeTab === 'sent' && isOwnProfile" key="sent">
            <div class="mb-6 flex items-start rounded-xl border border-blue-200 bg-blue-50 p-4">
              <Icon name="heroicons:lock-closed" class="mr-3 mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 class="text-sm font-bold text-blue-800">Sección Privada</h4>
                <p class="mt-1 text-xs text-blue-700">
                  Solo tú puedes ver las solicitudes que has enviado.
                </p>
              </div>
            </div>

            <div
              v-if="sentAdoptions.length > 0"
              class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead class="border-b border-gray-200 bg-gray-50 font-medium text-gray-500">
                    <tr>
                      <th class="px-6 py-4">Mascota</th>
                      <th class="px-6 py-4">Fecha Envío</th>
                      <th class="px-6 py-4">Estado</th>
                      <th class="px-6 py-4 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr
                      v-for="adoption in sentAdoptions"
                      :key="adoption.id"
                      class="transition-colors hover:bg-gray-50/50"
                    >
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <NuxtImg
                            :src="
                              adoption.pet?.imageUrl || adoption.pet?.image || '/placeholder.webp'
                            "
                            class="mr-3 h-10 w-10 rounded-lg bg-gray-200 object-cover"
                          />
                          <span class="font-medium text-gray-900">
                            {{ adoption.pet?.name || 'Mascota' }}
                          </span>
                        </div>
                      </td>
                      <td class="whitespace-nowrap px-6 py-4 text-gray-500">
                        {{ formatDate(adoption.createdAt) }}
                      </td>
                      <td class="px-6 py-4">
                        <span :class="statusBadge(adoption.status)">
                          {{ statusLabel(adoption.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <NuxtLink
                          :to="`/mi-solicitud/${adoption.id}`"
                          class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Ver estado
                          <Icon name="heroicons:arrow-top-right-on-square" class="ml-1 h-3 w-3" />
                        </NuxtLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
            >
              <Icon name="heroicons:paper-airplane" class="mb-3 h-12 w-12 text-gray-300" />
              <p class="text-gray-500">No has enviado ninguna solicitud aún.</p>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <!-- Share Modal -->
    <ShareModal
      v-model:isOpen="showShareModal"
      title="Compartir Perfil"
      :description="`Comparte el perfil de ${userProfile?.displayName || userProfile?.username}`"
      :shareData="{
        title: `Perfil de ${userProfile?.displayName || userProfile?.username} en Adopta Zulia`,
        text: `Mira las mascotas y adopciones de ${userProfile?.displayName || userProfile?.username}.`,
        url: shareUrl
      }"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { usePets } from '~/composables/usePets'
import { useAdoptionStories } from '~/composables/useAdoptionStories'
import { useLostPets } from '~/composables/useLostPets'
import { useAdoptions } from '~/composables/useAdoptions'
import ShareModal from '~/components/common/ShareModal.vue'

const route = useRoute()
const usernameParam = route.params.username
const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam
const { getUserByUsername, user, isAuthenticated } = useAuth()
const { fetchUserPets } = usePets()
const { fetchUserStories } = useAdoptionStories()
const { fetchUserLostPets } = useLostPets()
const { fetchAdoptionsForOwner, fetchUserAdoptions } = useAdoptions()

// State
const loading = ref(true)
const error = ref(null)
const userProfile = ref(null)
const userPets = ref([])
const userLostReports = ref([])
const userStories = ref([])
const verifiedAdoptions = ref([])
const receivedAdoptions = ref([]) // For owner only: Requests received
const sentAdoptions = ref([]) // For owner only: Requests sent
const activeTab = ref('pets')

// Computed
const isOwnProfile = computed(
  () => isAuthenticated.value && user.value?.uid === userProfile.value?.uid
)
const verifiedCount = computed(() => verifiedAdoptions.value.length)

// Mapped Data
const mappedUserLost = computed(() => {
  return userLostReports.value.map((r) => ({
    id: r.id,
    image: r.images?.[0] || r.image || '/placeholder.webp',
    name: r.name || 'Sin nombre',
    status: r.status || 'lost',
    createdAt: r.createdAt || r.lastSeenAt || Date.now(),
    breed: r.breed || null,
    age: r.age || null,
    location: r.location || null,
    urgent: r.urgent || false,
    vaccinated: false,
    neutered: false,
    size: r.size || null,
    gender: r.gender || null,
  }))
})

// Tabs
const tabs = computed(() => {
  const baseTabs = [
    { id: 'pets', label: 'En Adopción' },
    { id: 'lost', label: 'Reportes Perdidos' },
    { id: 'stories', label: 'Historias' },
    { id: 'adopted', label: 'Adoptados' },
  ]

  // Add private tabs if owner
  if (isOwnProfile.value) {
    baseTabs.push({ id: 'received', label: 'Solicitudes Recibidas' })
    baseTabs.push({ id: 'sent', label: 'Solicitudes Enviadas' })
  }

  return baseTabs
})

const getTabCount = (id) => {
  switch (id) {
    case 'pets':
      return userPets.value.length
    case 'lost':
      return userLostReports.value.length
    case 'stories':
      return userStories.value.length
    case 'adopted':
      return verifiedAdoptions.value.length
    case 'received':
      return receivedAdoptions.value.length
    case 'sent':
      return sentAdoptions.value.length
    default:
      return 0
  }
}

// Helpers
const formatDate = (ts) => {
  if (!ts) return 'fecha desconocida'
  try {
    return new Date(ts).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  } catch {
    return 'fecha desconocida'
  }
}
const formatDateFull = (ts) => {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

const statusBadge = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium'
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-medium'
    case 'rejected':
      return 'bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium'
    case 'completed':
      return 'bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium'
    default:
      return 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium'
  }
}

const statusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    completed: 'Completada',
  }
  return labels[status] || status
}

// Load Data
onMounted(async () => {
  try {
    const profile = await getUserByUsername(username)
    if (!profile) {
      error.value = 'User not found'
      return
    }

    userProfile.value = profile
    // Fix ID/UID mismatch if any
    const uid = profile.uid || profile.id

    if (uid) {
      const promises = [
        fetchUserPets(uid),
        fetchUserLostPets(uid),
        fetchUserStories(uid),
        fetchAdoptionsForOwner(uid), // Always fetch owner's received requests (publicly used for 'completed', privately for 'received')
      ]

      // If viewing own profile, also fetch SENT requests
      const currentUser = user.value
      if (currentUser && currentUser.uid === uid) {
        promises.push(fetchUserAdoptions(uid))
      } else {
        promises.push(Promise.resolve([]))
      }

      // Parallel fetch for efficiency
      const [pets, lost, stories, received, sent] = await Promise.all(promises)

      userPets.value = pets || []
      userLostReports.value = lost || []
      userStories.value = stories || []

      // "Recibidas" (Private): All requests received
      receivedAdoptions.value = received || []

      // "Enviadas" (Private): Requests sent by me
      sentAdoptions.value = sent || []

      // "Adopted" (Public): Completed adoptions from what I received (i.e., my pets that were adopted)
      verifiedAdoptions.value = (received || []).filter((a) => a.status === 'completed')
    }
  } catch (e) {
    console.error(e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})

// Share Logic
const showShareModal = ref(false)
const shareUrl = ref('')

const shareProfile = () => {
  shareUrl.value = window.location.href
  showShareModal.value = true
}
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
