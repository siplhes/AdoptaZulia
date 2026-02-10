<template>
  <div class="min-h-screen bg-amber-50 py-12">
    <div class="container mx-auto max-w-6xl px-4">
      <!-- Welcome Header -->
      <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Mi Panel</h1>
          <p class="text-gray-600">
            Bienvenido de nuevo, {{ userProfile?.displayName || 'Usuario' }}
          </p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/perfil/configuracion"
            class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Icon name="heroicons:cog-6-tooth" class="mr-2 h-5 w-5 text-gray-500" />
            Configuración
          </NuxtLink>
          <button
            class="inline-flex items-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
            @click="handleLogout"
          >
            <Icon name="heroicons:arrow-right-on-rectangle" class="mr-2 h-5 w-5" />
            Salir
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
        />
      </div>

      <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <!-- Sidebar: Profile Summary & Stats -->
        <div class="space-y-6 lg:col-span-1">
          <!-- Profile Card -->
          <div
            class="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div
              class="mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-emerald-50 bg-emerald-100"
            >
              <NuxtImg
                v-if="userProfile?.photoURL"
                :src="userProfile.photoURL"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-3xl font-bold text-emerald-600"
              >
                {{ userProfile?.displayName?.charAt(0).toUpperCase() || 'U' }}
              </div>
            </div>
            <h2 class="text-center text-xl font-bold text-gray-900">
              {{ userProfile?.displayName }}
            </h2>
            <p class="mb-4 text-sm text-gray-500">{{ userProfile?.email }}</p>

            <div class="w-full space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div class="flex items-center justify-between">
                <span>Miembro desde:</span>
                <span class="font-medium">{{ formatDate(userProfile?.createdAt) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Último acceso:</span>
                <span class="font-medium text-emerald-600">Hoy</span>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="rounded-xl bg-emerald-800 p-6 text-white shadow-sm">
            <h3 class="mb-4 font-semibold opacity-90">Tu Impacto</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-emerald-100">Adopciones</span>
                <span class="text-2xl font-bold">{{ verifiedAdoptions.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-emerald-100">Mascotas Publicadas</span>
                <span class="text-2xl font-bold">{{ petAdoptions.length }}</span>
                <!-- Adjusted logic for count -->
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="space-y-8 lg:col-span-3">
          <!-- Adoption Requests Section -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h3 class="flex items-center text-xl font-bold text-gray-900">
                <Icon name="heroicons:inbox-arrow-down" class="mr-2 h-6 w-6 text-emerald-600" />
                Solicitudes de Adopción
              </h3>
            </div>

            <!-- Tabs -->
            <div class="mb-6 border-b border-gray-200">
              <nav class="-mb-px flex space-x-8">
                <button
                  :class="[
                    activeTab === 'received'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'flex items-center whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                  ]"
                  @click="activeTab = 'received'"
                >
                  <Icon name="heroicons:inbox" class="mr-2 h-5 w-5" />
                  Recibidas
                  <span
                    v-if="petAdoptions.length"
                    class="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-600"
                  >
                    {{ petAdoptions.length }}
                  </span>
                </button>

                <button
                  :class="[
                    activeTab === 'sent'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'flex items-center whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                  ]"
                  @click="activeTab = 'sent'"
                >
                  <Icon name="heroicons:paper-airplane" class="mr-2 h-5 w-5" />
                  Enviadas
                  <span
                    v-if="sentAdoptions.length"
                    class="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-600"
                  >
                    {{ sentAdoptions.length }}
                  </span>
                </button>
              </nav>
            </div>

            <div
              v-if="loadingAdoptions"
              class="flex justify-center rounded-xl bg-white p-8 shadow-sm"
            >
              <span class="text-gray-500">Cargando solicitudes...</span>
            </div>

            <!-- Tab: Received -->
            <div v-else-if="activeTab === 'received'">
              <div
                v-if="petAdoptions.length === 0"
                class="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm"
              >
                <div
                  class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
                >
                  <Icon name="heroicons:inbox" class="h-8 w-8 text-gray-400" />
                </div>
                <h4 class="font-medium text-gray-900">No hay solicitudes recibidas</h4>
                <p class="mt-1 text-sm text-gray-500">
                  Aquí aparecerán las personas interesadas en tus mascotas.
                </p>
              </div>

              <div
                v-else
                class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead class="border-b border-gray-100 bg-gray-50 font-medium text-gray-500">
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
                        v-for="adoption in petAdoptions"
                        :key="adoption.id"
                        class="hover:bg-gray-50/50"
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
                            <span class="text-gray-900">
                              {{ adoption.user?.name || 'Usuario' }}
                            </span>
                            <span class="text-xs text-gray-500">{{ adoption.user?.email }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-gray-500">
                          {{ formatDate(adoption.createdAt) }}
                        </td>
                        <td class="px-6 py-4">
                          <span :class="statusBadge(adoption.status)">
                            {{ statusLabel(adoption.status) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <button
                            class="text-sm font-medium text-emerald-600 hover:text-emerald-800"
                            @click="viewAdoptionDetails(adoption)"
                          >
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Tab: Sent -->
            <div v-else-if="activeTab === 'sent'">
              <div
                v-if="sentAdoptions.length === 0"
                class="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm"
              >
                <div
                  class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50"
                >
                  <Icon name="heroicons:paper-airplane" class="h-8 w-8 text-blue-400" />
                </div>
                <h4 class="font-medium text-gray-900">No has enviado solicitudes</h4>
                <p class="mt-1 text-sm text-gray-500">
                  ¡Explora las mascotas disponibles y dales un hogar!
                </p>
                <NuxtLink
                  to="/mascotas"
                  class="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Ver mascotas &rarr;
                </NuxtLink>
              </div>

              <div
                v-else
                class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead class="border-b border-gray-100 bg-gray-50 font-medium text-gray-500">
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
                        class="hover:bg-gray-50/50"
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
                        <td class="px-6 py-4 text-gray-500">
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
                            class="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Ver estado
                          </NuxtLink>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <!-- My Lost Reports -->
          <section v-if="userLostReports.length > 0">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="flex items-center text-xl font-bold text-gray-900">
                <Icon name="heroicons:megaphone" class="mr-2 h-6 w-6 text-amber-600" />
                Mis Reportes de Extravío
              </h3>
              <NuxtLink
                to="/perdidas/crear"
                class="text-sm font-medium text-emerald-600 hover:underline"
              >
                Nuevo reporte
              </NuxtLink>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <PetCard v-for="pet in mappedUserLost" :key="pet.id" :pet="pet" />
            </div>
          </section>

          <!-- Verified Adoptions (My Pets) -->
          <section v-if="verifiedAdoptions.length > 0">
            <h3 class="mb-4 flex items-center text-xl font-bold text-gray-900">
              <Icon name="heroicons:heart" class="mr-2 h-6 w-6 text-rose-500" />
              Mascotas Adoptadas
            </h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                v-for="ver in verifiedAdoptions"
                :key="ver.id"
                class="flex items-center justify-between rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
              >
                <div class="flex items-center">
                  <div
                    class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                  >
                    <Icon name="heroicons:check-badge" class="h-6 w-6" />
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-900">{{ ver.pet?.name || 'Mascota' }}</h4>
                    <p class="text-xs text-emerald-600">Adopción Verificada</p>
                  </div>
                </div>
                <NuxtLink
                  :to="`/certificados/${ver.adoptionId}`"
                  class="text-gray-400 hover:text-emerald-600"
                >
                  <Icon name="heroicons:document-text" class="h-6 w-6" />
                </NuxtLink>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Adoption Detail Modal -->
      <div
        v-if="selectedAdoption"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <div
          class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4"
          >
            <h3 class="text-lg font-bold text-gray-900">Detalle de Solicitud</h3>
            <button
              class="text-gray-400 transition-colors hover:text-gray-600"
              @click="selectedAdoption = null"
            >
              <Icon name="heroicons:x-mark" class="h-6 w-6" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="overflow-y-auto p-6">
            <div class="mb-6 flex gap-6">
              <div class="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                <img :src="selectedAdoption.pet?.imageUrl" class="h-full w-full object-cover" />
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-900">{{ selectedAdoption.pet?.name }}</h4>
                <p class="text-sm text-gray-500">{{ selectedAdoption.pet?.breed }}</p>
                <div class="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-sm">
                  Solicitante:
                  <span class="font-medium">{{ selectedAdoption.user?.name }}</span>
                </div>
              </div>
            </div>

            <div class="mb-6 rounded-xl bg-gray-50 p-4">
              <h5 class="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">
                Mensaje del Solicitante
              </h5>
              <p class="text-sm leading-relaxed text-gray-600">
                {{ selectedAdoption.message || 'Sin mensaje adjunto.' }}
              </p>
            </div>

            <div class="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div class="rounded-lg border p-3">
                <span class="block text-xs text-gray-500">Email</span>
                <span class="font-medium">{{ selectedAdoption.user?.email }}</span>
              </div>
              <div class="rounded-lg border p-3">
                <span class="block text-xs text-gray-500">Teléfono</span>
                <span class="font-medium">
                  {{ selectedAdoption.user?.phone || 'No especificado' }}
                </span>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="mt-4">
              <label class="mb-2 block text-sm font-medium text-gray-700">Notas Privadas</label>
              <textarea
                v-model="adminNotes"
                class="w-full rounded-lg border-gray-300 text-sm"
                rows="2"
                placeholder="Notas internas sobre esta solicitud..."
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-6">
            <button class="text-sm font-medium text-emerald-600 hover:underline" @click="saveNotes">
              Guardar nota
            </button>

            <div v-if="selectedAdoption.status === 'pending'" class="flex gap-3">
              <button
                class="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                @click="rejectAdoption(selectedAdoption)"
              >
                Rechazar
              </button>
              <button
                class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-200 hover:bg-emerald-700"
                @click="approveAdoption(selectedAdoption)"
              >
                Aprobar Solicitud
              </button>
            </div>
            <div v-else class="text-sm italic text-gray-500">
              Esta solicitud está
              <strong>{{ statusLabel(selectedAdoption.status) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useLostPets } from '~/composables/useLostPets'
import { useAdoptions } from '~/composables/useAdoptions' // Import composable
import { getDatabase, ref as dbRef, get } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import PetCard from '~/components/PetCard.vue'
import { formatShortDate } from '~/utils/dateFormatter'

const router = useRouter()
const { user, userProfile, isAuthenticated, logout } = useAuth()
const { fetchUserLostPets } = useLostPets()
const { fetchAdoptionsForOwner, fetchUserAdoptions } = useAdoptions() // Import new method

// State
const loading = ref(true)
const loadingAdoptions = ref(true)
const activeTab = ref('received') // 'received' | 'sent'
const petAdoptions = ref([]) // Recibidas (Como dueño)
const sentAdoptions = ref([]) // Enviadas (Como adoptante)
const verifiedAdoptions = ref([])
const userLostReports = ref([])
const selectedAdoption = ref(null)
const adminNotes = ref('')

// Helpers
const formatDate = (ts) => formatShortDate(ts) || '—'

const statusBadge = (s) => {
  switch (s) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold'
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold'
    case 'rejected':
      return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold'
    case 'completed':
      return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold'
    default:
      return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold'
  }
}
const statusLabel = (s) => {
  const map = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    completed: 'Completada',
  }
  return map[s] || s
}

// Data Fetching
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    const uid = user.value.uid

    // Parallel fetching
    const [lost, received, sent] = await Promise.all([
      fetchUserLostPets(uid),
      fetchAdoptionsForOwner(uid),
      fetchUserAdoptions(uid),
    ])

    userLostReports.value = lost || []
    petAdoptions.value = received || []
    sentAdoptions.value = sent || []

    // Filter verified (completed) from received for "Adopted Pets" section if needed
    verifiedAdoptions.value = received.filter((a) => a.status === 'completed')
  } catch (e) {
    console.error('Error fetching profile data', e)
  } finally {
    loading.value = false
    loadingAdoptions.value = false
  }
})

// Mapped User Lost Reports for Card
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

// Actions
const handleLogout = async () => {
  await logout()
  router.push('/')
}

const viewAdoptionDetails = (adoption) => {
  selectedAdoption.value = adoption
  adminNotes.value = adoption.notes || ''
}

// Placeholders for actions
const saveNotes = () => {
  /* Logic to save notes to firebase */ selectedAdoption.value = null
}
const approveAdoption = (a) => {
  /* Update status to approved */ a.status = 'approved'
  selectedAdoption.value = null
}
const rejectAdoption = (a) => {
  /* Update status to rejected */ a.status = 'rejected'
  selectedAdoption.value = null
}
</script>
