<template>
  <div class="min-h-screen bg-amber-50 py-6 md:py-12">
    <div class="container mx-auto px-4">
      <!-- Navegación de regreso -->
      <button
        class="mb-6 inline-flex items-center text-emerald-600 hover:text-emerald-700"
        @click="goBack"
      >
        <Icon name="heroicons:arrow-left" class="mr-1 h-4 w-4" />
        <span>Volver a la mascota</span>
      </button>

      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
      </div>

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

      <div v-else>
        <!-- Título y resumen -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-emerald-800">Solicitudes de adopción</h1>
          <p v-if="pet" class="mt-2 text-gray-600">
            Solicitudes para adoptar a
            <span class="font-semibold">{{ pet.name }}</span>
          </p>
          <p v-if="adoptionRequests.length === 0" class="mt-4 text-gray-500">
            Aún no has recibido solicitudes para esta mascota.
          </p>
        </div>

        <!-- Lista de solicitudes -->
        <div v-if="adoptionRequests.length > 0" class="grid gap-6">
          <div
            v-for="request in adoptionRequests"
            :key="request.id"
            class="overflow-hidden rounded-lg bg-white shadow-md"
          >
            <div class="p-6">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between">
                <div class="flex-1">
                  <div class="mb-4 flex items-center">
                    <div class="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                      <img
                        v-if="request.user?.photoURL"
                        :src="request.user.photoURL"
                        :alt="request.user?.name || 'Usuario'"
                        class="h-full w-full object-cover"
                      />
                      <div
                        v-else
                        class="flex h-full w-full items-center justify-center font-bold text-emerald-700"
                      >
                        {{ getInitials(request.user?.name || request.user?.email || 'U') }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <h2 class="text-lg font-semibold text-gray-900">
                        {{ request.user?.name || 'Usuario' }}
                      </h2>
                      <p class="text-sm text-gray-500">
                        Solicitud enviada {{ formatDate(request.createdAt) }}
                      </p>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h3 class="mb-2 font-medium">Mensaje del solicitante:</h3>
                    <div class="rounded-lg bg-gray-50 p-4">
                      <p class="text-gray-700">{{ request.message }}</p>
                    </div>
                  </div>

                  <div v-if="request.notes" class="mb-4">
                    <h3 class="mb-2 font-medium">Tus notas:</h3>
                    <div class="rounded-lg bg-amber-50 p-4">
                      <p class="text-gray-700">{{ request.notes }}</p>
                    </div>
                  </div>

                  <!-- Información de contacto -->
                  <div class="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div class="flex items-center text-gray-700">
                      <Icon name="heroicons:envelope" class="mr-2 h-5 w-5 text-gray-400" />
                      <a
                        :href="`mailto:${request.user?.email}`"
                        class="text-emerald-600 hover:text-emerald-800"
                      >
                        {{ request.user?.email || 'No disponible' }}
                      </a>
                    </div>
                    <div v-if="request.user?.phone" class="flex items-center text-gray-700">
                      <Icon name="heroicons:phone" class="mr-2 h-5 w-5 text-gray-400" />
                      <a
                        :href="`tel:${request.user.phone}`"
                        class="text-emerald-600 hover:text-emerald-800"
                      >
                        {{ request.user.phone }}
                      </a>
                    </div>
                  </div>

                  <!-- Información del solicitante -->
                  <div v-if="request.user" class="mt-6">
                    <h3 class="mb-2 font-medium">Información del solicitante:</h3>
                    <div class="rounded-lg bg-gray-50 p-4">
                      <div class="flex items-center">
                        <div class="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                          <img
                            v-if="request.user.photoURL"
                            :src="request.user.photoURL"
                            :alt="request.user.name || 'Usuario'"
                            class="h-full w-full object-cover"
                          />
                          <div
                            v-else
                            class="flex h-full w-full items-center justify-center font-bold text-emerald-700"
                          >
                            {{ getInitials(request.user.name || request.user.email || 'U') }}
                          </div>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">
                            {{ request.user.name || request.user.email || 'Usuario' }}
                          </h3>
                          <p class="text-sm text-gray-500">Solicitante</p>
                        </div>
                      </div>

                      <div class="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div class="flex items-center text-gray-700">
                          <Icon name="heroicons:envelope" class="mr-2 h-5 w-5 text-gray-400" />
                          <a
                            :href="`mailto:${request.user.email}`"
                            class="text-emerald-600 hover:text-emerald-800"
                          >
                            {{ request.user.email || 'No disponible' }}
                          </a>
                        </div>
                        <div v-if="request.user.phone" class="flex items-center text-gray-700">
                          <Icon name="heroicons:phone" class="mr-2 h-5 w-5 text-gray-400" />
                          <a
                            :href="`tel:${request.user.phone}`"
                            class="text-emerald-600 hover:text-emerald-800"
                          >
                            {{ request.user.phone }}
                          </a>
                        </div>
                        <div v-if="request.user.address" class="flex items-center text-gray-700">
                          <Icon name="heroicons:map-pin" class="mr-2 h-5 w-5 text-gray-400" />
                          <span>{{ request.user.address }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Información del propietario (tus datos) -->
                  <div class="mt-6">
                    <h3 class="mb-2 font-medium">Tu información (propietario):</h3>
                    <div class="rounded-lg bg-blue-50 p-4">
                      <div class="flex items-center">
                        <div class="h-10 w-10 overflow-hidden rounded-full bg-blue-100">
                          <img
                            v-if="user.photoURL"
                            :src="user.photoURL"
                            alt="Propietario"
                            class="h-full w-full object-cover"
                          />
                          <div
                            v-else
                            class="flex h-full w-full items-center justify-center font-bold text-blue-700"
                          >
                            {{ getInitials(user.displayName || user.email || 'P') }}
                          </div>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">
                            {{ user.displayName || user.email || 'Propietario' }}
                          </h3>
                          <p class="text-sm text-gray-500">Propietario</p>
                        </div>
                      </div>

                      <div class="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div class="flex items-center text-gray-700">
                          <Icon name="heroicons:envelope" class="mr-2 h-5 w-5 text-gray-400" />
                          <span>{{ user.email || 'No disponible' }}</span>
                        </div>
                        <div v-if="user.phoneNumber" class="flex items-center text-gray-700">
                          <Icon name="heroicons:phone" class="mr-2 h-5 w-5 text-gray-400" />
                          <span>{{ user.phoneNumber }}</span>
                        </div>
                        <div v-if="user.address" class="flex items-center text-gray-700">
                          <Icon name="heroicons:map-pin" class="mr-2 h-5 w-5 text-gray-400" />
                          <span>{{ user.address }}</span>
                        </div>
                      </div>

                      <p class="mt-4 text-sm text-blue-600">
                        Esta es la información que se comparte con el solicitante cuando apruebas su
                        solicitud. Para actualizarla, ve a la
                        <NuxtLink to="/perfil/configuracion" class="underline">
                          configuración de tu perfil
                        </NuxtLink>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Estado y acciones -->
                <div class="mt-4 flex-shrink-0 md:ml-6 md:mt-0 md:self-start">
                  <div class="mb-4 flex flex-col items-center">
                    <span
                      class="mb-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                      :class="{
                        'bg-yellow-100 text-yellow-800': request.status === 'pending',
                        'bg-green-100 text-green-800': request.status === 'approved',
                        'bg-red-100 text-red-800': request.status === 'rejected',
                        'bg-blue-100 text-blue-800': request.status === 'completed',
                      }"
                    >
                      {{ getStatusText(request.status) }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatDate(request.updatedAt || request.createdAt) }}
                    </span>
                  </div>

                  <div class="space-y-2">
                    <button
                      v-if="request.status === 'pending'"
                      class="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                      @click="updateStatus(request.id, 'approved')"
                    >
                      Aprobar
                    </button>
                    <button
                      v-if="request.status === 'pending'"
                      class="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      @click="updateStatus(request.id, 'rejected')"
                    >
                      Rechazar
                    </button>

                    <!-- Botón para completar adopción y generar certificado -->
                    <button
                      v-if="
                        request.status === 'approved' && (!pet.status || pet.status !== 'adopted')
                      "
                      class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      @click="completeAdoption(request)"
                    >
                      <Icon name="heroicons:check-badge" class="mr-1 h-5 w-5" />
                      Confirmar adopción
                    </button>

                    <!-- Acciones para adopciones completadas -->
                    <div v-if="request.status === 'completed'" class="space-y-2">
                      <!-- Enlace al certificado -->
                      <NuxtLink
                        :to="`/certificados/${request.id}`"
                        class="inline-flex w-full items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-center text-white hover:bg-amber-700"
                      >
                        <Icon name="heroicons:document-text" class="mr-1 h-5 w-5" />
                        Ver certificado
                      </NuxtLink>

                      <!-- Promover creación de historia de adopción -->
                      <div class="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                        <p class="mb-2 text-sm text-emerald-800">
                          <Icon
                            name="heroicons:information-circle"
                            class="mr-1 inline-block h-4 w-4"
                          />
                          ¡La adopción ha sido completada exitosamente!
                        </p>
                        <p class="mb-2 text-xs text-emerald-700">
                          Invita al adoptante a compartir su historia de adopción.
                        </p>
                        <NuxtLink
                          :to="`/historias/crear?petId=${request.petId}&adoptionId=${request.id}`"
                          class="inline-flex w-full items-center justify-center rounded-md border border-emerald-600 px-3 py-1 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                        >
                          <Icon name="heroicons:pencil-square" class="mr-1 h-4 w-4" />
                          Crear historia de adopción
                        </NuxtLink>
                      </div>
                    </div>

                    <button
                      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                      @click="openNotesModal(request)"
                    >
                      {{ request.notes ? 'Editar notas' : 'Añadir notas' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para añadir/editar notas -->
    <div
      v-if="showNotesModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Notas sobre esta solicitud</h3>
          <button class="text-gray-400 hover:text-gray-500" @click="closeNotesModal">
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>

        <div class="mb-6">
          <label for="notes" class="mb-1 block text-sm font-medium text-gray-700">
            Notas privadas (solo tú puedes verlas)
          </label>
          <textarea
            id="notes"
            v-model="notesText"
            rows="5"
            class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            placeholder="Escribe aquí tus notas sobre esta solicitud o el solicitante..."
          />
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
            @click="closeNotesModal"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700"
            @click="saveNotes"
          >
            Guardar
          </button>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdoptions } from '~/composables/useAdoptions'
import { usePets } from '~/composables/usePets'
import { useAuth } from '~/composables/useAuth'
import ModalAlert from '~/components/common/ModalAlert.vue'

// Obtener parámetros de ruta
const route = useRoute()
const router = useRouter()
const petId = route.params.id

// Composables
const {
  fetchAdoptionsForOwner,
  updateAdoptionStatus,
  updateAdoptionNotes,
  getAdoptionById,
  confirmAdoptionAndVerify,
} = useAdoptions()
const { fetchPetById } = usePets()
const { isAuthenticated, user, isAdmin } = useAuth()

// Estado
const pet = ref(null)
const adoptionRequests = ref([])
const loading = ref(true)
const error = ref(null)

// Estado para el modal de notas
const showNotesModal = ref(false)
const notesText = ref('')
const currentAdoption = ref(null)

// Estados para el modal global
const showModal = ref(false)
const modalType = ref('')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('')
let confirmAction = () => {}

// Cargar datos
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    // Cargar la mascota (el parámetro puede ser petId o accidentalmente adoptionId)
    loading.value = true
    pet.value = await fetchPetById(petId)

    // Si no encontramos una mascota, intentamos tratar el id como adoptionId
    if (!pet.value) {
      try {
        const adoption = await getAdoptionById(petId)
        if (adoption && adoption.petId) {
          // Redirigir al petId correcto para mostrar las solicitudes del propietario
          await router.replace(`/adopciones/${adoption.petId}`)
          return
        }
      } catch (adErr) {
        // Si falla la consulta, seguimos al error general abajo
        console.debug('No se pudo resolver como adoptionId:', adErr)
      }
    }

    // Verificar si el usuario es el propietario o admin
    if (!pet.value || (pet.value.userId !== user.value.uid && !isAdmin.value)) {
      error.value = 'No tienes permiso para ver estas solicitudes'
      loading.value = false
      return
    }

    // Cargar las solicitudes de adopción
    const adoptions = await fetchAdoptionsForOwner(user.value.uid)

    // Filtrar solo las solicitudes para esta mascota
    adoptionRequests.value = adoptions.filter((adoption) => adoption.petId === petId)
  } catch (err) {
    console.error('Error al cargar solicitudes:', err)
    error.value = 'Error al cargar las solicitudes. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

// Formatear fecha
const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha desconocida'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'hace unos segundos'
  } else if (diffMin < 60) {
    return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`
  } else if (diffHour < 24) {
    return `hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`
  } else if (diffDay < 7) {
    return `hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
}

// Obtener texto del estado
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'approved':
      return 'Aprobada'
    case 'rejected':
      return 'Rechazada'
    case 'completed':
      return 'Completada'
    default:
      return 'Desconocido'
  }
}

// Obtener iniciales
const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

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

// Actualizar estado de una solicitud
const updateStatus = (adoptionId, status) => {
  const action = status === 'approved' ? 'aprobar' : 'rechazar'

  modalType.value = 'confirm'
  modalTitle.value = `Confirmar ${action}`
  modalMessage.value = `¿Estás seguro de que quieres ${action} esta solicitud?`
  modalConfirmText.value = 'Confirmar'

  confirmAction = async () => {
    showModal.value = false
    try {
      loading.value = true
      const success = await updateAdoptionStatus(adoptionId, status)

      if (success) {
        // Actualizar el estado en la UI
        const index = adoptionRequests.value.findIndex((a) => a.id === adoptionId)
        if (index !== -1) {
          adoptionRequests.value[index].status = status
          adoptionRequests.value[index].updatedAt = Date.now()
        }
      } else {
        error.value = `Error al ${action} la solicitud`
      }
    } catch (err) {
      console.error(`Error al actualizar estado:`, err)
      error.value = 'Error al actualizar el estado. Por favor, intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }
  showModal.value = true
}

// Completar adopción y generar certificado
const completeAdoption = (adoption) => {
  modalType.value = 'confirm'
  modalTitle.value = 'Confirmar adopción'
  modalMessage.value = `¿Estás seguro de que quieres confirmar que ${pet.value.name} ha sido adoptado por ${adoption.user?.name || 'este usuario'}? Esto marcará la mascota como adoptada y generará un certificado de adopción.`
  modalConfirmText.value = 'Confirmar'

  confirmAction = async () => {
    showModal.value = false
    try {
      loading.value = true

      // Completar la adopción y crear verificación
      const verificationId = await confirmAdoptionAndVerify(adoption.id, null, false)

      if (verificationId) {
        // Actualizar el estado en la UI
        const index = adoptionRequests.value.findIndex((a) => a.id === adoption.id)
        if (index !== -1) {
          adoptionRequests.value[index].status = 'completed'
          adoptionRequests.value[index].updatedAt = Date.now()
        }
        // Actualizar el estado de la mascota en la UI
        if (pet.value) {
          pet.value.status = 'adopted'
          pet.value.adoptedBy = adoption.userId
          pet.value.adoptionId = adoption.id
          pet.value.adoptionDate = Date.now()
        }

        // Redirigir al certificado de adopción
        router.push(`/certificados/${adoption.id}`)
      } else {
        error.value = 'Error al completar la adopción'
      }
    } catch (err) {
      console.error('Error al completar adopción:', err)
      error.value = 'Error al completar la adopción. Por favor, intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }
  showModal.value = true
}

// Abrir modal de notas
const openNotesModal = (adoption) => {
  currentAdoption.value = adoption
  notesText.value = adoption.notes || ''
  showNotesModal.value = true
}

// Cerrar modal de notas
const closeNotesModal = () => {
  showNotesModal.value = false
  currentAdoption.value = null
  notesText.value = ''
}

// Guardar notas
const saveNotes = async () => {
  if (!currentAdoption.value) return

  try {
    loading.value = true

    const success = await updateAdoptionNotes(currentAdoption.value.id, notesText.value)

    if (success) {
      // Actualizar las notas en la UI
      const index = adoptionRequests.value.findIndex((a) => a.id === currentAdoption.value.id)
      if (index !== -1) {
        adoptionRequests.value[index].notes = notesText.value
        adoptionRequests.value[index].updatedAt = Date.now()
      }

      closeNotesModal()
    } else {
      error.value = 'Error al guardar las notas'
    }
  } catch (err) {
    console.error('Error al guardar notas:', err)
    error.value = 'Error al guardar las notas. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

// Volver atrás
const goBack = () => {
  router.push(`/mascotas/${petId}`)
}
</script>
