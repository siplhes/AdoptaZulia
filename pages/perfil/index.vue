<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="mb-6 text-3xl font-bold text-emerald-800">Mi Perfil</h1>

      <!-- Mensajes de error/éxito -->
      <div v-if="error" class="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="mdi:alert-circle-outline" class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-if="updateSuccess" class="mb-6 rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="mdi:check-circle-outline" class="h-5 w-5 text-green-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">¡Perfil actualizado correctamente!</p>
          </div>
        </div>
      </div>

      <!-- Contenido del perfil -->
      <div v-if="!isAuthenticated">
        <div class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center shadow-md">
          <h2 class="mb-2 text-xl font-semibold text-amber-800">Necesitas iniciar sesión</h2>
          <p class="mb-4 text-amber-700">
            Para ver tu perfil, por favor inicia sesión o regístrate.
          </p>
          <div class="flex justify-center space-x-4">
            <NuxtLink
              to="/login"
              class="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50"
            >
              Iniciar sesión
            </NuxtLink>

          </div>
        </div>
      </div>

      <div v-else-if="loading" class="flex justify-center py-12">
        <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Panel de información del perfil -->
        <div class="col-span-1">
          <div class="rounded-lg bg-white p-6 shadow-md">
            <div class="flex flex-col items-center text-center">
              <div class="relative mb-4">
                <NuxtImg
                  :src="userProfile?.photoURL || '/placeholder.webp'"
                  width="120"
                  height="120"
                  :alt="userProfile?.displayName || 'Usuario'"
                  :title="userProfile?.displayName || 'Usuario'"
                  loading="lazy"
                  class="h-24 w-24 rounded-full object-cover shadow-md"
                  sizes="96px"
                  placeholder
                />
                <button
                  class="absolute bottom-0 right-0 rounded-full bg-emerald-600 p-1 text-white shadow-md hover:bg-emerald-700"
                  title="Cambiar foto"
                >
                  <Icon name="mdi:pencil" class="h-4 w-4" />
                </button>
              </div>
              <h2 class="mb-1 text-xl font-semibold text-gray-800">
                {{ userProfile?.displayName || 'Usuario' }}
              </h2>
              <p class="text-sm text-gray-500">{{ userProfile?.email }}</p>
              <p><NuxtLink :to="userUserName">@{{ userUserName}}</NuxtLink></p>

              <div class="mt-4 w-full border-t border-gray-200 pt-4">
                <div class="mb-3 flex items-center">
                  <Icon name="mdi:calendar" class="mr-2 h-4 w-4 text-gray-500" />
                  <span class="text-sm text-gray-600">
                    Miembro desde {{ formatDate(userProfile?.createdAt) }}
                  </span>
                </div>
                <div class="mb-3 flex items-center">
                  <Icon name="mdi:clock-outline" class="mr-2 h-4 w-4 text-gray-500" />
                  <span class="text-sm text-gray-600">
                    Último acceso {{ formatDate(userProfile?.lastLogin) }}
                  </span>
                </div>
              </div>

              <button
                class="mt-4 flex w-full items-center justify-center rounded-lg border border-red-500 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                @click="handleLogout"
              >
                <Icon name="mdi:logout" class="mr-2 h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        <!-- Formulario de edición de perfil -->
        <div class="col-span-1 lg:col-span-2">
          <div class="rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 text-lg font-semibold text-gray-800">Información del perfil</h3>
            <form @submit.prevent="saveProfile">
              <div class="mb-4">
                <label for="displayName" class="mb-1 block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  id="displayName"
                  v-model="formData.displayName"
                  type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Tu nombre completo"
                >
              </div>

              <div class="mb-4">
                <label for="phone" class="mb-1 block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="phone"
                  v-model="formData.phoneNumber"
                  type="tel"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Tu número de teléfono"
                >
              </div>

              <div class="mb-6">
                <label for="bio" class="mb-1 block text-sm font-medium text-gray-700">
                  Biografía
                </label>
                <textarea
                  id="bio"
                  v-model="formData.bio"
                  rows="4"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <span v-if="loading" class="mr-2">
                    <svg
                      class="h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>


          
          <!-- Sección de Solicitudes de Adopción -->
          <div v-if="userPets.length > 0" class="mt-6 rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 flex items-center justify-between text-lg font-semibold text-gray-800">
              <span>Solicitudes de adopción para tus mascotas</span>
              <span v-if="petAdoptions.length > 0" class="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-medium text-emerald-800">
                {{ pendingAdoptions.length }} pendientes
              </span>
            </h3>
            
            <div v-if="loadingAdoptions" class="text-center py-8">
              <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"/>
              <p class="mt-2 text-gray-600">Cargando solicitudes de adopción...</p>
            </div>
            <div v-else-if="petAdoptions.length === 0" class="bg-white p-6 rounded-lg shadow-md">
              <div class="text-center">
                <Icon name="heroicons:clipboard-document-list" class="h-12 w-12 mx-auto text-gray-400" />
                <h3 class="mt-2 text-lg font-medium text-gray-900">No hay solicitudes de adopción</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Aún no has recibido solicitudes para tus mascotas publicadas.
                </p>
              </div>
            </div>
            <div v-else>
              <div class="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <!-- Panel de solicitudes de adopción -->
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Mascota
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Solicitante
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Fecha
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Estado
                        </th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="adoption in petAdoptions" :key="adoption.id">
                        <td class="whitespace-nowrap px-6 py-4">
                          <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                              <NuxtImg
                                v-if="adoption.pet?.imageUrl"
                                :src="adoption.pet.imageUrl"
                                alt="Imagen de mascota"
                                class="h-full w-full object-cover"
                              />
                              <div v-else class="flex h-full w-full items-center justify-center">
                                <Icon name="heroicons:paw-print" class="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">
                                {{ adoption.pet?.name || 'Mascota no disponible' }}
                              </div>
                              <div class="text-xs text-gray-500">
                                {{ adoption.pet?.species || 'N/A' }} - {{ adoption.pet?.breed || 'N/A' }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-6 py-4">
                          <div class="text-sm text-gray-900">
                            {{ adoption.user?.name || adoption.user?.email || 'Usuario desconocido' }}
                          </div>
                          <div class="text-xs text-gray-500">{{ adoption.user?.email || 'N/A' }}</div>
                        </td>
                        <td class="whitespace-nowrap px-6 py-4">
                          <div class="text-sm text-gray-900">{{ formatDate(adoption.createdAt) }}</div>
                        </td>
                        <td class="whitespace-nowrap px-6 py-4">
                          <span
                            :class="[
                              'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                              adoption.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : adoption.status === 'approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : adoption.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800',
                            ]"
                          >
                            {{
                              adoption.status === 'pending'
                                ? 'Pendiente'
                                : adoption.status === 'approved'
                                  ? 'Aprobada'
                                  : adoption.status === 'rejected'
                                    ? 'Rechazada'
                                    : 'Completada'
                            }}
                          </span>
                        </td>
                        <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button 
                            class="text-emerald-600 hover:text-emerald-900"
                            @click="viewAdoptionDetails(adoption)"
                          >
                            Ver detalles
                          </button>
                          <template v-if="adoption.status === 'pending'">
                            <button 
                              class="ml-2 text-green-600 hover:text-green-900"
                              @click="approveAdoption(adoption)"
                            >
                              Aprobar
                            </button>
                            <button 
                              class="ml-2 text-red-600 hover:text-red-900"
                              @click="rejectAdoption(adoption)"
                            >
                              Rechazar
                            </button>
                          </template>
                          <button 
                            v-if="adoption.status === 'approved'"
                            class="ml-2 text-blue-600 hover:text-blue-900"
                            @click="completeAdoption(adoption)"
                          >
                            Completar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal de detalles de adopción -->
      <div v-if="selectedAdoption" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Detalles de la solicitud</h3>
            <button class="text-gray-400 hover:text-gray-500" @click="selectedAdoption = null">
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Pet Details -->
            <div class="space-y-4 rounded-lg bg-gray-50 p-4">
              <h4 class="text-md font-medium text-gray-900">Información de la mascota</h4>
              <div class="flex items-center">
                <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <img
                    v-if="selectedAdoption.pet?.imageUrl"
                    :src="selectedAdoption.pet.imageUrl"
                    alt="Imagen de mascota"
                    class="h-full w-full object-cover"
                  >
                  <div v-else class="flex h-full w-full items-center justify-center">
                    <Icon name="mdi:paw" class="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="font-medium">
                    {{ selectedAdoption.pet?.name || 'Mascota no disponible' }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ selectedAdoption.pet?.species || 'N/A' }} -
                    {{ selectedAdoption.pet?.breed || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Applicant Details -->
            <div class="space-y-4 rounded-lg bg-gray-50 p-4">
              <h4 class="text-md font-medium text-gray-900">Información del solicitante</h4>
              <div class="space-y-2">
                <p>
                  <span class="font-medium">Nombre:</span>
                  {{ selectedAdoption.user?.name || 'No disponible' }}
                </p>
                <p>
                  <span class="font-medium">Email:</span>
                  {{ selectedAdoption.user?.email || 'No disponible' }}
                </p>
                <p>
                  <span class="font-medium">Teléfono:</span>
                  {{ selectedAdoption.user?.phone || 'No disponible' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Application Details -->
          <div class="mt-6 space-y-4 rounded-lg bg-gray-50 p-4">
            <h4 class="text-md font-medium text-gray-900">Detalles de la solicitud</h4>
            <div class="space-y-2">
              <p>
                <span class="font-medium">Fecha de solicitud:</span>
                {{ formatDateFull(selectedAdoption.createdAt) }}
              </p>
              <p>
                <span class="font-medium">Estado:</span>
                <span
                  :class="[
                    'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                    selectedAdoption.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedAdoption.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedAdoption.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{
                    selectedAdoption.status === 'pending'
                      ? 'Pendiente'
                      : selectedAdoption.status === 'approved'
                        ? 'Aprobada'
                        : selectedAdoption.status === 'rejected'
                          ? 'Rechazada'
                          : 'Completada'
                  }}
                </span>
              </p>
              <p><span class="font-medium">Mensaje del solicitante:</span></p>
              <p class="whitespace-pre-wrap rounded-md bg-white p-3 text-sm">
                {{ selectedAdoption.message || 'Sin mensaje' }}
              </p>

              <p v-if="selectedAdoption.notes">
                <span class="font-medium">Notas administrativas:</span>
              </p>
              <p
                v-if="selectedAdoption.notes"
                class="whitespace-pre-wrap rounded-md bg-white p-3 text-sm"
              >
                {{ selectedAdoption.notes }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex justify-end space-x-3">
            <input
              v-model="adminNotes"
              class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Añadir notas..."
            >

            <button
              class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              @click="saveNotes"
            >
              Guardar notas
            </button>

            <button
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="selectedAdoption = null"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modal para alertas y mensajes -->
      <!-- Verificaciones de adopción del usuario -->
      <div v-if="verifiedAdoptions.length > 0" class="mt-6 rounded-lg bg-white p-6 shadow-md">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">Verificaciones de adopción</h3>
        <div class="space-y-3">
          <div v-for="v in verifiedAdoptions" :key="v.id" class="flex items-center justify-between rounded-md border p-3">
            <div>
              <div class="text-sm font-medium text-gray-900">{{ v.pet?.name || 'Mascota' }}</div>
            <!-- Reportes de mascotas perdidas del usuario -->
            <div v-if="userLostReports.length > 0" class="mt-6">
              <h3 class="mb-4 text-lg font-semibold text-gray-800">Tus reportes de mascotas perdidas</h3>
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <PetCard
                  v-for="r in mappedUserLost"
                  :key="r.id"
                  :pet="r"
                  class=""
                />
              </div>
            </div>

            <!-- Verificaciones de adopción del usuario -->
            </div>
            <div class="flex items-center gap-3">
              <NuxtLink v-if="v.adoptionId" :to="`/certificados/${v.adoptionId}`" class="text-amber-800 underline text-sm">Ver certificado</NuxtLink>
              <NuxtLink :to="`/verificar?vid=${v.id}`" class="text-amber-800 underline text-sm">Verificar</NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <ModalAlert
        :show="showModal"
        :type="modalType"
        :title="modalTitle"
        :message="modalMessage"
        :confirm-button-text="modalConfirmText"
        @confirm="closeModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
const { user } = useAuth()
import { usePets } from '~/composables/usePets'
import { useAdoptions } from '~/composables/useAdoptions'
import { getDatabase, ref as dbRef, get, query, orderByChild, equalTo } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import ModalAlert from '~/components/common/ModalAlert.vue'
import { useLostPets } from '~/composables/useLostPets'
import PetCard from '~/components/PetCard.vue'

function formatDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('es-ES')
}

// Verificaciones
const verifiedAdoptions = ref([])
const loadingVerified = ref(false)
const userLostReports = ref([])

onMounted(async () => {
  try {
    if (!user || !user.value) return
    loadingVerified.value = true
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)
    const userVerSnap = await get(dbRef(db, `users/${user.value.uid}/verifiedAdoptions`))
    if (!userVerSnap.exists()) return
    const userVer = userVerSnap.val()
    for (const vid of Object.keys(userVer)) {
      try {
        const verSnap = await get(dbRef(db, `adoptionVerifications/${vid}`))
        if (!verSnap.exists()) continue
        const ver = verSnap.val()
        const item = { id: vid, ...ver }
        // fetch pet basic
        if (ver.petId) {
          const petSnap = await get(dbRef(db, `pets/${ver.petId}`))
          if (petSnap.exists()) item.pet = petSnap.val()
        }
        verifiedAdoptions.push(item)
      } catch (e) {
        // ignore individual failures
      }
    }
      // Cargar reportes perdidos del usuario
      try {
        const { fetchUserLostPets } = useLostPets()
        const lost = await fetchUserLostPets(user.value.uid)
        userLostReports.value = lost || []
      } catch (e) {
        console.error('Error loading user lost reports', e)
      }
  } catch (e) {
    console.error('Error loading verified adoptions', e)
  } finally {
    loadingVerified.value = false
  }
})

// Map lost report shape into PetCard-friendly pet objects
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
</script>
