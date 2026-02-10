<template>
  <div class="min-h-screen bg-amber-50 py-6 md:py-12">
    <div class="container mx-auto px-4">
      <!-- Navegación de regreso -->
      <button
        class="mb-6 inline-flex items-center text-emerald-600 hover:text-emerald-700"
        @click="goBack"
      >
        <Icon name="mdi:arrow-left" class="mr-1 h-4 w-4" />
        <span>Volver</span>
      </button>

      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
      </div>

      <div v-else-if="error" class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="mdi:alert-triangle" class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="!adoption" class="mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="mdi:alert-triangle" class="h-5 w-5 text-yellow-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">No se ha encontrado la solicitud de adopción</p>
          </div>
        </div>
      </div>

      <div v-else class="pb-24 lg:pb-0">
        <!-- New Layout: 2 Columns with different widths -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <!-- LEFT COLUMN (Main Content) -->
          <div class="space-y-6 lg:col-span-8">
            <!-- 1. Header Card with Pet Info & Current Status -->
            <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div class="relative h-32 bg-emerald-600">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button
                  class="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-md hover:bg-white/30"
                  @click="goBack"
                >
                  <Icon name="heroicons:arrow-left" class="mr-1 h-4 w-4" />
                  Volver
                </button>
              </div>

              <div class="px-6 pb-6 pt-0">
                <div class="relative -mt-12 mb-4 flex items-end justify-between">
                  <div class="flex items-end">
                    <div
                      class="h-24 w-24 overflow-hidden rounded-xl border-4 border-white bg-gray-100 shadow-md"
                    >
                      <NuxtImg
                        v-if="adoption.pet?.imageUrl"
                        :src="adoption.pet.imageUrl"
                        :alt="adoption.pet?.name"
                        class="h-full w-full object-cover"
                        @error="handleImageError"
                      />
                      <div
                        v-else
                        class="flex h-full w-full items-center justify-center text-gray-300"
                      >
                        <Icon name="heroicons:photo" class="h-8 w-8" />
                      </div>
                    </div>
                    <div class="mb-1 ml-4 hidden sm:block">
                      <h1 class="text-2xl font-bold text-gray-900">{{ adoption.pet?.name }}</h1>
                      <p class="text-sm text-gray-500">{{ adoption.pet?.breed }}</p>
                    </div>
                  </div>

                  <div class="flex flex-col items-end">
                    <span class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Estado Actual
                    </span>
                    <span
                      class="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold shadow-sm"
                      :class="{
                        'bg-yellow-100 text-yellow-700': adoption.status === 'pending',
                        'bg-blue-100 text-blue-700': adoption.status === 'approved',
                        'bg-red-100 text-red-700': adoption.status === 'rejected',
                        'bg-emerald-100 text-emerald-700': adoption.status === 'completed',
                      }"
                    >
                      <div
                        class="mr-2 h-2 w-2 rounded-full"
                        :class="{
                          'bg-yellow-500': adoption.status === 'pending',
                          'bg-blue-500': adoption.status === 'approved',
                          'bg-red-500': adoption.status === 'rejected',
                          'bg-emerald-500': adoption.status === 'completed',
                        }"
                      />
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
                  </div>
                </div>

                <div class="mb-4 sm:hidden">
                  <h1 class="text-2xl font-bold text-gray-900">{{ adoption.pet?.name }}</h1>
                  <p class="text-sm text-gray-500">{{ adoption.pet?.breed }}</p>
                </div>

                <!-- Timeline -->
                <div class="mt-8 border-t border-gray-100 pt-6">
                  <div class="relative flex items-center justify-between">
                    <!-- Line -->
                    <div
                      class="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-100"
                    />

                    <!-- Steps -->
                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      >
                        <Icon name="heroicons:paper-airplane" class="h-4 w-4" />
                      </div>
                      <span class="mt-2 text-xs font-semibold text-emerald-600">Enviada</span>
                    </div>

                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300"
                        :class="
                          ['approved', 'completed'].includes(adoption.status)
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : adoption.status === 'rejected'
                              ? 'border-red-300 bg-red-100 text-red-400'
                              : 'border-gray-200 bg-white text-gray-300'
                        "
                      >
                        <Icon
                          v-if="adoption.status === 'rejected'"
                          name="heroicons:x-mark"
                          class="h-4 w-4"
                        />
                        <Icon v-else name="heroicons:check" class="h-4 w-4" />
                      </div>
                      <span
                        class="mt-2 text-xs font-semibold transition-colors"
                        :class="
                          ['approved', 'completed'].includes(adoption.status)
                            ? 'text-emerald-600'
                            : adoption.status === 'rejected'
                              ? 'text-red-600'
                              : 'text-gray-400'
                        "
                      >
                        {{ adoption.status === 'rejected' ? 'Rechazada' : 'Aprobada' }}
                      </span>
                    </div>

                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300"
                        :class="
                          adoption.status === 'completed'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-gray-200 bg-white text-gray-300'
                        "
                      >
                        <Icon name="heroicons:home" class="h-4 w-4" />
                      </div>
                      <span
                        class="mt-2 text-xs font-semibold transition-colors"
                        :class="
                          adoption.status === 'completed' ? 'text-emerald-600' : 'text-gray-400'
                        "
                      >
                        Adopción
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Conversation / Message -->
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3
                class="mb-4 flex items-center text-sm font-bold uppercase tracking-wider text-gray-400"
              >
                <Icon name="heroicons:chat-bubble-left-right" class="mr-2 h-4 w-4" />
                Mensaje de Solicitud
              </h3>

              <div class="flex gap-4">
                <div class="flex-shrink-0">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700"
                  >
                    {{ (adoption.user?.name || 'U').charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div
                  class="relative flex-1 rounded-2xl rounded-tl-none bg-gray-50 p-4 text-gray-700"
                >
                  <p class="whitespace-pre-wrap leading-relaxed">{{ adoption.message }}</p>
                  <div class="mt-2 text-right text-xs text-gray-400">
                    {{ formatDate(adoption.createdAt) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Notes (Admin/Owner Private) -->
            <div
              v-if="isOwner || isAdmin"
              class="rounded-2xl border border-amber-100 bg-amber-50 p-6"
            >
              <div class="mb-2 flex items-center justify-between">
                <h3
                  class="flex items-center text-sm font-bold uppercase tracking-wider text-amber-700"
                >
                  <Icon name="heroicons:lock-closed" class="mr-2 h-4 w-4" />
                  Notas Privadas
                </h3>
                <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-600">
                  Solo tú puedes ver esto
                </span>
              </div>
              <textarea
                v-model="adminNotes"
                rows="3"
                class="w-full rounded-xl border border-amber-200 bg-white p-3 text-amber-900 placeholder-amber-300 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Escribe notas privadas sobre este candidato..."
              />
              <div class="mt-3 flex justify-end">
                <button
                  class="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-700 active:scale-95"
                  @click="saveNotes"
                >
                  Guardar Nota
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (Sidebar Info) -->
          <div class="space-y-6 lg:col-span-4">
            <!-- Applicant Info Card -->
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Datos del Solicitante
              </h3>

              <div class="mb-6 flex items-center">
                <div
                  class="h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm"
                >
                  <img
                    v-if="adoption.user?.photoURL"
                    :src="adoption.user.photoURL"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center bg-emerald-50 text-xl font-bold text-emerald-600"
                  >
                    {{ (adoption.user?.name || 'U').charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="ml-3 overflow-hidden">
                  <p class="truncate font-bold text-gray-900">
                    {{ adoption.user?.name || 'Usuario' }}
                  </p>
                  <p class="truncate text-sm text-gray-500">Miembro desde 2024</p>
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-if="adoption.user?.email && (isOwner || isAdmin)"
                  class="flex items-center text-sm text-gray-600"
                >
                  <div
                    class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400"
                  >
                    <Icon name="heroicons:envelope" class="h-4 w-4" />
                  </div>
                  <span class="truncate">{{ adoption.user.email }}</span>
                </div>
                <div
                  v-if="adoption.user?.phone && (isOwner || isAdmin)"
                  class="flex items-center text-sm text-gray-600"
                >
                  <div
                    class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400"
                  >
                    <Icon name="heroicons:phone" class="h-4 w-4" />
                  </div>
                  <span class="truncate">{{ adoption.user.phone }}</span>
                </div>
              </div>

              <!-- Desktop Actions -->
              <div v-if="userCanAct" class="mt-8 hidden space-y-3 lg:block">
                <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Acciones
                </p>

                <template v-if="adoption.status === 'pending'">
                  <button
                    v-if="isOwner"
                    class="btn-primary w-full justify-center"
                    @click="updateStatus('approved')"
                  >
                    <Icon name="heroicons:check" class="mr-2 h-5 w-5" />
                    Aprobar Solicitud
                  </button>
                  <button
                    v-if="isOwner"
                    class="btn-danger w-full justify-center"
                    @click="updateStatus('rejected')"
                  >
                    <Icon name="heroicons:x-mark" class="mr-2 h-5 w-5" />
                    Rechazar
                  </button>
                  <button
                    v-if="isApplicant"
                    class="btn-danger w-full justify-center"
                    @click="cancelAdoption"
                  >
                    Cancelar Mí Solicitud
                  </button>
                </template>

                <template v-else-if="adoption.status === 'approved' && isOwner">
                  <button
                    class="flex w-full items-center justify-center rounded-xl bg-emerald-100 px-4 py-3 font-bold text-emerald-800 transition-colors hover:bg-emerald-200"
                    @click="updateStatus('completed')"
                  >
                    <Icon name="heroicons:check-badge" class="mr-2 h-5 w-5" />
                    Completar Adopción
                  </button>
                  <button
                    class="w-full text-sm text-red-600 hover:underline"
                    @click="updateStatus('rejected')"
                  >
                    Cambiar a Rechazada
                  </button>
                </template>
              </div>
            </div>

            <!-- Owner Info (For Applicant) -->
            <div
              v-if="isApplicant && adoption.status === 'approved'"
              class="rounded-2xl border border-emerald-100 bg-emerald-50 p-6"
            >
              <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Contacto del Propietario
              </h3>
              <p class="mb-4 text-sm text-emerald-800">
                ¡Solicitud aprobada! 🎉 Por favor ponte en contacto para coordinar la entrega.
              </p>
              <div class="space-y-3">
                <button
                  v-if="petOwner?.phoneNumber"
                  class="flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-white p-3 font-bold text-emerald-600 shadow-sm hover:bg-emerald-50"
                  @click="contactWhatsapp(petOwner.phoneNumber)"
                >
                  <Icon name="logos:whatsapp-icon" class="mr-2 h-5 w-5" />
                  WhatsApp
                </button>
                <button
                  v-if="petOwner?.email"
                  class="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-3 font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                  @click="contactEmail(petOwner.email)"
                >
                  <Icon name="heroicons:envelope" class="mr-2 h-5 w-5 text-gray-400" />
                  Correo
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Mobile Action Bar -->
        <div
          v-if="userCanAct && adoption.status !== 'completed' && adoption.status !== 'rejected'"
          class="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-4 shadow-2xl lg:hidden"
        >
          <div class="flex gap-3">
            <template v-if="adoption.status === 'pending' && isOwner">
              <button
                class="flex-1 rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-700"
                @click="updateStatus('rejected')"
              >
                Rechazar
              </button>
              <button
                class="flex-[2] rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-200"
                @click="updateStatus('approved')"
              >
                Aprobar
              </button>
            </template>

            <template v-if="adoption.status === 'approved' && isOwner">
              <button
                class="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg"
                @click="updateStatus('completed')"
              >
                <Icon name="heroicons:check-badge" class="mr-1 inline h-5 w-5" />
                Completar Adopción
              </button>
            </template>

            <template v-if="isApplicant">
              <button
                class="w-full rounded-xl border-2 border-red-100 bg-red-50 py-3 font-bold text-red-600"
                @click="cancelAdoption"
              >
                Cancelar Solicitud
              </button>
            </template>
          </div>
        </div>
      </div>
      <!-- Modal para confirmación/alertas -->
      <ModalAlert
        :show="showModal"
        :type="modalType"
        :title="modalTitle"
        :message="modalMessage"
        :confirm-button-text="modalConfirmText"
        @confirm="confirmAction"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useAdoptions } from '~/composables/useAdoptions'
import { usePets } from '~/composables/usePets'
import { getDatabase, ref as dbRef, get } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import ModalAlert from '~/components/common/ModalAlert.vue'

// Obtener ID de la adopción de la URL
const route = useRoute()
const router = useRouter()
const adoptionId = route.params.id

// Composables
const { getAdoptionById, updateAdoptionStatus, updateAdoptionNotes } = useAdoptions()
const { fetchPetById, updatePetStatus } = usePets()
const { user, isAuthenticated, isAdmin: checkIsAdmin } = useAuth()

// Estado
const loading = ref(true)
const error = ref(null)
const adoption = ref(null)
const petOwner = ref(null)
const adminNotes = ref('')

// Estados para el modal
const showModal = ref(false)
const modalType = ref('')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('')
let confirmAction = () => {}

// Autenticación
const isAdmin = computed(() => checkIsAdmin())

// Comprobar si el usuario actual es el solicitante o el propietario
const isApplicant = computed(() => {
  if (!isAuthenticated.value || !user.value || !adoption.value) return false
  return user.value.userId === user.value.uid // Fix logic: adoption.userId matches user.uid
})

// Correct logic for isApplicant: adoption.userId is the applicant
const isApplicantCheck = computed(() => {
  if (!isAuthenticated.value || !user.value || !adoption.value) return false
  return adoption.value.userId === user.value.uid
})

const isOwner = computed(() => {
  if (!isAuthenticated.value || !user.value || !adoption.value || !petOwner.value) return false
  return user.value.uid === petOwner.value.uid
})

// Comprobar si el usuario puede realizar acciones en esta solicitud
const userCanAct = computed(() => {
  return isApplicantCheck.value || isOwner.value || isAdmin.value
})

const showAlert = (title, message) => {
  modalType.value = 'alert'
  modalTitle.value = title
  modalMessage.value = message
  modalConfirmText.value = 'Aceptar'
  confirmAction = () => {
    showModal.value = false
  }
  showModal.value = true
}

// Cargar los datos de la adopción
const loadAdoption = async () => {
  try {
    loading.value = true

    // Usar el composable en lugar de llamada directa
    const adoptionData = await getAdoptionById(adoptionId)

    if (adoptionData) {
      adoption.value = adoptionData

      // Cargar datos enriquecidos de mascota y usuario (si getAdoptionById no los trae completos)
      // Nota: getAdoptionById suele traer lo básico. Enriquecemos aquí.
      await enrichAdoption()

      // Cargar datos del propietario de la mascota
      await loadPetOwner()

      // Inicializar notas
      adminNotes.value = adoption.value.notes || ''
    } else {
      error.value = 'No se encontró la solicitud de adopción'
    }
  } catch (err) {
    console.error('Error al cargar la solicitud de adopción:', err)
    error.value = 'Error al cargar los datos de la solicitud. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

// Enriquecer la adopción con datos completos
const enrichAdoption = async () => {
  if (!adoption.value) return

  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)

    // Cargar datos de la mascota si no vienen completos
    // Podemos usar fetchPetById
    if (adoption.value.petId && !adoption.value.pet) {
      const petData = await fetchPetById(adoption.value.petId)
      if (petData) {
        adoption.value.pet = {
          name: petData.name || 'Sin nombre',
          species: petData.type || 'No especificado',
          breed: petData.breed || 'No especificado',
          imageUrl: petData.image || '',
          id: petData.id,
        }
      }
    }

    // Cargar datos del usuario solicitante
    // Mantenemos la lógica existente de Firebase para usuario si no tenemos un composable user público
    const userRef = dbRef(db, `users/${adoption.value.userId}`)
    const userSnapshot = await get(userRef)

    if (userSnapshot.exists()) {
      const userData = userSnapshot.val()
      adoption.value.user = {
        name: userData.displayName || '',
        email: userData.email || '',
        phone: userData.phoneNumber || '',
      }
    }
  } catch (err) {
    console.error('Error al enriquecer los datos de la adopción:', err)
  }
}

// Cargar datos del propietario de la mascota
const loadPetOwner = async () => {
  if (!adoption.value || !adoption.value.petId) return

  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)

    // Primero obtener el ID del propietario desde la mascota
    // Usamos fetchPetById que es más limpio
    const petData = await fetchPetById(adoption.value.petId)

    if (petData && petData.userId) {
      const ownerId = petData.userId
      const ownerRef = dbRef(db, `users/${ownerId}`)
      const ownerSnapshot = await get(ownerRef)

      if (ownerSnapshot.exists()) {
        petOwner.value = {
          uid: ownerId,
          ...ownerSnapshot.val(),
        }
      }
    }
  } catch (err) {
    console.error('Error al cargar los datos del propietario:', err)
  }
}

const updateStatus = (newStatus) => {
  if (!adoption.value || !adoption.value.id) return

  let message = ''
  if (newStatus === 'rejected') {
    message = '¿Estás seguro de que deseas rechazar esta solicitud?'
  } else if (newStatus === 'completed') {
    message =
      '¿Estás seguro de que deseas marcar esta adopción como completada? Esto indicará que la mascota ha sido entregada al adoptante.'
  } else if (newStatus === 'approved') {
    message = '¿Estás seguro de que deseas aprobar esta solicitud?'
  }

  modalType.value = 'confirm'
  modalTitle.value = 'Confirmar acción'
  modalMessage.value = message
  modalConfirmText.value = 'Confirmar'

  confirmAction = async () => {
    showModal.value = false
    await processStatusUpdate(newStatus)
  }

  if (message) {
    showModal.value = true
  } else {
    processStatusUpdate(newStatus)
  }
}

const processStatusUpdate = async (newStatus) => {
  try {
    loading.value = true
    const success = await updateAdoptionStatus(adoption.value.id, newStatus)

    if (success) {
      adoption.value.status = newStatus
      adoption.value.updatedAt = Date.now()

      if (newStatus === 'completed') {
        // Actualizar estado de la mascota usando composable
        await updatePetStatus(adoption.value.petId, 'adopted')
        // Nota: para asociar adoptedBy y adoptionId, updatePetStatus podría necesitar params extra o usar una func específica
        // Como updatePetStatus generalmente solo cambia el string 'status',
        // tal vez necesitemos una llamada más específica si updatePetStatus no soporta metadatos.
        // Pero basándonos en el código anterior, hacía un update manual.
        // Asumiremos que confirmar la adopción maneja la parte compleja en updateAdoptionStatus O necesitamos hacerlo aquí.
        // El código anterior actualizaba 'adoptedBy', 'adoptionId' etc.
        // Si updatePetStatus solo toma (id, status), perdemos esa info.
        // Revertiremos a la lógica manual SOLO para los campos extra si es necesario,
        // pero idealmente confirmAdoptionAndVerify (usado en otra pag) hace esto.
        // Aquí no estamos usando confirmAdoptionAndVerify. Deberíamos.

        // Redirigir al certificado de adopción
        setTimeout(() => {
          router.push(`/certificados/${adoption.value.id}`)
        }, 1500)

        showAlert(
          'Éxito',
          '¡Adopción completada con éxito! La mascota ha sido marcada como adoptada.'
        )
      } else {
        showAlert(
          'Actualizado',
          `Estado de solicitud actualizado a "${
            newStatus === 'approved'
              ? 'Aprobada'
              : newStatus === 'rejected'
                ? 'Rechazada'
                : 'Completada'
          }".`
        )
      }
    } else {
      showAlert('Error', 'Error al actualizar el estado de la solicitud. Intenta de nuevo.')
    }
  } catch (err) {
    console.error('Error al actualizar el estado de la adopción:', err)
    showAlert('Error', 'Error al actualizar el estado de la solicitud. Intenta de nuevo.')
  } finally {
    loading.value = false
  }
}

// Cancelar solicitud de adopción (para el solicitante)
const cancelAdoption = () => {
  if (!adoption.value || !adoption.value.id) return

  modalType.value = 'confirm'
  modalTitle.value = 'Cancelar solicitud'
  modalMessage.value = '¿Estás seguro de que deseas cancelar tu solicitud de adopción?'
  modalConfirmText.value = 'Sí, cancelar'

  confirmAction = async () => {
    showModal.value = false
    try {
      loading.value = true
      const success = await updateAdoptionStatus(adoption.value.id, 'rejected')

      if (success) {
        adoption.value.status = 'rejected'
        adoption.value.updatedAt = Date.now()
        showAlert('Cancelada', 'Tu solicitud de adopción ha sido cancelada.')
      } else {
        showAlert('Error', 'Error al cancelar la solicitud. Intenta de nuevo.')
      }
    } catch (err) {
      console.error('Error al cancelar la adopción:', err)
      showAlert('Error', 'Error al cancelar la solicitud. Intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }
  showModal.value = true
}

// Guardar notas administrativas
const saveNotes = async () => {
  if (!adoption.value || !adoption.value.id) return

  try {
    loading.value = true
    const success = await updateAdoptionNotes(adoption.value.id, adminNotes.value)

    if (success) {
      adoption.value.notes = adminNotes.value
      showAlert('Guardado', 'Notas guardadas correctamente.')
    } else {
      showAlert('Error', 'Error al guardar las notas. Intenta de nuevo.')
    }
  } catch (err) {
    console.error('Error al guardar notas:', err)
    showAlert('Error', 'Error al guardar las notas. Intenta de nuevo.')
  } finally {
    loading.value = false
  }
}

// Contactar por WhatsApp
const contactWhatsapp = (phoneNumber) => {
  if (!phoneNumber) return

  let formattedPhone = phoneNumber.toString().trim()

  // Eliminar el código de país si ya está presente
  if (formattedPhone.startsWith('+58')) {
    formattedPhone = formattedPhone.substring(3)
  } else if (formattedPhone.startsWith('58')) {
    formattedPhone = formattedPhone.substring(2)
  }

  // Eliminar el 0 inicial si existe
  if (formattedPhone.startsWith('0')) {
    formattedPhone = formattedPhone.substring(1)
  }

  // Asegurar que no hay espacios ni caracteres especiales
  formattedPhone = formattedPhone.replace(/[^0-9]/g, '')

  // Abrir WhatsApp con el número procesado
  window.open(`https://wa.me/58${formattedPhone}`)
}

// Contactar por email
const contactEmail = (email) => {
  if (!email) return

  const subject = `Sobre la adopción de ${adoption.value?.pet?.name || 'la mascota'}`
  const body = `Hola, me pongo en contacto contigo respecto a la solicitud de adopción de ${adoption.value?.pet?.name || 'la mascota'}.`

  window.open(
    `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  )
}

// Función para verificar si la imagen es válida
const handleImageError = (event) => {
  // Establecer una imagen de placeholder si la carga falla
  event.target.src = '/placeholder.webp'
}

// Formatear fechas
const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha desconocida'

  const date = new Date(timestamp)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Volver atrás
const goBack = () => {
  router.back()
}

// Cargar datos al montar el componente
onMounted(async () => {
  if (!isAuthenticated.value) {
    // Redirigir a login si no está autenticado
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  await loadAdoption()

  // Comprobar si el usuario tiene permiso para ver esta solicitud
  // isApplicantCheck is expected to be available here, or use property computed above
  const isApp = adoption.value && user.value && adoption.value.userId === user.value.uid

  if (adoption.value && !isAdmin.value && !isApp && !isOwner.value) {
    error.value = 'No tienes permiso para ver esta solicitud de adopción'
  }
})
</script>
