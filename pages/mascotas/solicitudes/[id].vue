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

      <div v-else class="overflow-hidden rounded-lg bg-white shadow-lg">
        <!-- Cabecera con estado de la solicitud -->
        <div
          class="border-b px-6 py-4"
          :class="{
            'bg-yellow-50 border-yellow-100': adoption.status === 'pending',
            'bg-blue-50 border-blue-100': adoption.status === 'approved',
            'bg-red-50 border-red-100': adoption.status === 'rejected',
            'bg-green-50 border-green-100': adoption.status === 'completed',
          }"
        >
          <div class="flex items-center justify-between">
       
            
            <span
              class="inline-flex rounded-full px-3 py-1 text-sm font-semibold leading-5"
              :class="{
                'bg-yellow-100 text-yellow-800': adoption.status === 'pending',
                'bg-blue-100 text-blue-800': adoption.status === 'approved',
                'bg-red-100 text-red-800': adoption.status === 'rejected',
                'bg-green-100 text-green-800': adoption.status === 'completed',
              }"
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
          </div>
               <h1 class="text-2xl font-bold text-gray-800">
              Solicitud de adopciósssn para {{ adoption.pet?.name }}
            </h1>
          <p class="mt-1 text-sm text-gray-600">
            Enviada el {{ formatDate(adoption.createdAt) }}
            <span v-if="adoption.updatedAt && adoption.updatedAt !== adoption.createdAt">
              • Actualizada el {{ formatDate(adoption.updatedAt) }}
            </span>
          </p>
        </div>
        
        <div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
          <!-- Columna izquierda: Información de la mascota -->
          <div class="md:col-span-1">
            <div class="rounded-lg bg-gray-50 p-4">
              <h2 class="mb-4 text-lg font-semibold text-gray-800">Información de la mascota</h2>
              
              <div class="mb-4 flex flex-col items-center">
                <div class="mb-3 h-40 w-40 overflow-hidden rounded-lg">
                  <NuxtImg
                    v-if="adoption.pet?.imageUrl"
                    :src="adoption.pet.imageUrl"
                    :alt="adoption.pet?.name"
                    class="h-full w-full object-cover"
                    @error="handleImageError"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center bg-gray-200">
                    <Icon name="mdi:paw" class="h-10 w-10 text-gray-400" />
                  </div>
                </div>
                
                <h3 class="text-lg font-medium text-gray-900">{{ adoption.pet?.name }}</h3>
                
                <div class="mt-1 text-center text-gray-500">
                  <p>{{ adoption.pet?.species }} • {{ adoption.pet?.breed }}</p>
                </div>
                
                <NuxtLink
                  :to="`/mascotas/${adoption.petId}`"
                  class="mt-3 inline-flex items-center rounded-md border border-emerald-600 px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50"
                >
                  <Icon name="mdi:open-in-new" class="mr-1 h-3 w-3" />
                  Ver perfil completo
                </NuxtLink>
              </div>
            </div>
            
            <!-- Acciones disponibles según el estado y rol del usuario -->
            <div v-if="userCanAct" class="mt-6 space-y-3">
              <template v-if="adoption.status === 'pending'">
                <div v-if="isOwner" class="flex flex-col space-y-3">
                  <button
                    class="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
                    @click="updateStatus('approved')"
                  >
                    <Icon name="mdi:check" class="mr-2 h-4 w-4" />
                    Aprobar solicitud
                  </button>
                  
                  <button
                    class="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                    @click="updateStatus('rejected')"
                  >
                    <Icon name="mdi:close" class="mr-2 h-4 w-4" />
                    Rechazar solicitud
                  </button>
                </div>
                
                <div v-if="isApplicant" class="flex flex-col space-y-3">
                  <button
                    class="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                    @click="cancelAdoption"
                  >
                    <Icon name="mdi:close" class="mr-2 h-4 w-4" />
                    Cancelar solicitud
                  </button>
                </div>
              </template>
              
              <template v-else-if="adoption.status === 'approved'">
                <div v-if="isOwner" class="flex flex-col space-y-3">
                  <button
                    class="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
                    @click="updateStatus('completed')"
                  >
                    <Icon name="mdi:check-circle" class="mr-2 h-4 w-4" />
                    Completar adopción
                  </button>
                  
                  <button
                    class="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                    @click="updateStatus('rejected')"
                  >
                    <Icon name="mdi:close" class="mr-2 h-4 w-4" />
                    Rechazar solicitud
                  </button>
                </div>
                
                <div v-if="isApplicant" class="flex flex-col space-y-3">
                  <button
                    class="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                    @click="cancelAdoption"
                  >
                    <Icon name="mdi:close" class="mr-2 h-4 w-4" />
                    Cancelar solicitud
                  </button>
                </div>
              </template>
              
              <template v-else-if="adoption.status === 'rejected'">
                <div v-if="isApplicant" class="flex flex-col space-y-3">
                  <p class="text-sm text-gray-600">
                    Esta solicitud ha sido rechazada. Puedes encontrar otras mascotas disponibles para adopción.
                  </p>
                  <NuxtLink
                    to="/mascotas"
                    class="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
                  >
                    <Icon name="mdi:magnify" class="mr-2 h-4 w-4" />
                    Explorar más mascotas
                  </NuxtLink>
                </div>
              </template>
              
              <template v-else-if="adoption.status === 'completed'">
                <div class="rounded-lg border border-green-100 bg-green-50 p-4">
                  <p class="text-sm text-green-800">
                    <Icon name="mdi:check-circle" class="inline-block mr-1 h-4 w-4 text-green-600" />
                    ¡Felicidades! Esta adopción ha sido completada exitosamente.
                  </p>
                  
                  <div class="mt-4 flex flex-col space-y-3">
                    <NuxtLink
                      :to="`/certificados/${adoption.id}`"
                      class="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700"
                    >
                      <Icon name="mdi:file-document" class="mr-2 h-4 w-4" />
                      Ver certificado de adopción
                    </NuxtLink>
                    
                    <NuxtLink 
                      v-if="isApplicant"
                      :to="`/historias/crear?petId=${adoption.petId}&adoptionId=${adoption.id}`"
                      class="inline-flex items-center justify-center rounded-md border border-emerald-600 px-4 py-2 font-medium text-emerald-600 hover:bg-emerald-50"
                    >
                      <Icon name="mdi:pencil" class="mr-2 h-4 w-4" />
                      Compartir historia de adopción
                    </NuxtLink>
                  </div>
                </div>
              </template>
            </div>
          </div>
          
          <!-- Columna central y derecha: Detalles de la solicitud -->
          <div class="md:col-span-2">
            <!-- Mensaje del solicitante -->
            <div class="mb-6 rounded-lg bg-gray-50 p-4">
              <h2 class="mb-3 text-lg font-semibold text-gray-800">Mensaje del solicitante</h2>
              <div class="rounded-lg bg-white p-4">
                <p class="whitespace-pre-wrap text-gray-700">{{ adoption.message }}</p>
              </div>
            </div>
            
            <!-- Información del solicitante -->
            <div class="mb-6 rounded-lg bg-gray-50 p-4">
              <h2 class="mb-3 text-lg font-semibold text-gray-800">Información del solicitante</h2>
              <div class="space-y-2">
                <div class="flex items-start">
                  <Icon name="mdi:account" class="mr-2 mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p class="font-medium text-gray-900">{{ adoption.user?.name || 'No disponible' }}</p>
                    <p v-if="isOwner || isAdmin" class="text-sm text-gray-500">{{ adoption.user?.email || 'Email no disponible' }}</p>
                  </div>
                </div>
                
                <div v-if="(isOwner || isAdmin) && adoption.status === 'approved'" class="flex items-start">
                  <Icon name="mdi:phone" class="mr-2 mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p class="font-medium text-gray-900">{{ adoption.user?.phone || 'No disponible' }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Información de contacto del propietario (visible solo para el adoptante si está aprobada) -->
            <div v-if="(isApplicant && adoption.status === 'approved') || isOwner || isAdmin" class="mb-6 rounded-lg bg-gray-50 p-4">
              <h2 class="mb-3 text-lg font-semibold text-gray-800">Datos de contacto del propietario</h2>
              <div v-if="petOwner" class="space-y-2">
                <div class="flex items-start">
                  <Icon name="mdi:account" class="mr-2 mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p class="font-medium text-gray-900">{{ petOwner.displayName || 'No disponible' }}</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <Icon name="mdi:email" class="mr-2 mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <a :href="`mailto:${petOwner.email}`" class="font-medium text-emerald-600 hover:text-emerald-700">
                      {{ petOwner.email || 'No disponible' }}
                    </a>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <Icon name="mdi:phone" class="mr-2 mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <a :href="`tel:${petOwner.phoneNumber}`" class="font-medium text-emerald-600 hover:text-emerald-700">
                      {{ petOwner.phoneNumber || 'No disponible' }}
                    </a>
                  </div>
                </div>
                
                <div class="mt-4 flex space-x-3">
                  <button
                    v-if="petOwner.phoneNumber"
                    class="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    @click="contactWhatsapp(petOwner.phoneNumber)"
                  >
                    <Icon name="mdi:whatsapp" class="mr-2 h-4 w-4" />
                    Contactar por WhatsApp
                  </button>
                  
                  <button
                    v-if="petOwner.email"
                    class="inline-flex items-center rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                    @click="contactEmail(petOwner.email)"
                  >
                    <Icon name="mdi:email" class="mr-2 h-4 w-4" />
                    Enviar correo
                  </button>
                </div>
              </div>
              <div v-else class="text-gray-500">
                Cargando información del propietario...
              </div>
            </div>
            
            <!-- Notas administrativas (solo visible para el propietario o admin) -->
            <div v-if="isOwner || isAdmin" class="rounded-lg bg-gray-50 p-4">
              <h2 class="mb-3 text-lg font-semibold text-gray-800">Notas (solo visibles para ti)</h2>
              <textarea
                v-model="adminNotes"
                rows="3"
                class="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Añade notas privadas sobre esta solicitud..."
              />
              <div class="mt-3 flex justify-end">
                <button
                  class="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  @click="saveNotes"
                >
                  <Icon name="mdi:content-save" class="mr-2 h-4 w-4" />
                  Guardar notas
                </button>
              </div>
            </div>
            
            <!-- Historial de actividad -->
            <div v-if="adoption.status !== 'pending'" class="mt-6 rounded-lg bg-gray-50 p-4">
              <h2 class="mb-3 text-lg font-semibold text-gray-800">Historial de actividad</h2>
              <div class="space-y-3">
                <div class="flex items-start">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                    <Icon name="mdi:pencil" class="h-4 w-4 text-gray-500" />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-gray-600">
                      Solicitud enviada el {{ formatDate(adoption.createdAt) }}
                    </p>
                  </div>
                </div>
                
                <div v-if="adoption.status !== 'pending'" class="flex items-start">
                  <div 
                    class="flex h-8 w-8 items-center justify-center rounded-full"
                    :class="{
                      'bg-blue-100': adoption.status === 'approved',
                      'bg-red-100': adoption.status === 'rejected',
                      'bg-green-100': adoption.status === 'completed'
                    }"
                  >
                    <Icon 
                      v-if="adoption.status === 'approved'" 
                      name="mdi:check" 
                      class="h-4 w-4 text-blue-500" 
                    />
                    <Icon 
                      v-if="adoption.status === 'completed'" 
                      name="mdi:check-circle" 
                      class="h-4 w-4 text-green-500" 
                    />
                    <Icon 
                      v-if="adoption.status === 'rejected'" 
                      name="mdi:close" 
                      class="h-4 w-4 text-red-500" 
                    />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-gray-600">
                      Solicitud {{ 
                        adoption.status === 'approved' 
                          ? 'aprobada' 
                          : adoption.status === 'rejected' 
                            ? 'rechazada' 
                            : 'completada' 
                      }} el {{ formatDate(adoption.updatedAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useAdoptions } from '~/composables/useAdoptions'
import { getDatabase, ref as dbRef, get, update } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'

// Obtener ID de la adopción de la URL
const route = useRoute()
const router = useRouter()
const adoptionId = route.params.id

// Estado
const loading = ref(true)
const error = ref(null)
const adoption = ref(null)
const petOwner = ref(null)
const adminNotes = ref('')

// Autenticación
const { user, isAuthenticated, isAdmin: checkIsAdmin } = useAuth()
const isAdmin = computed(() => checkIsAdmin())

// Comprobar si el usuario actual es el solicitante o el propietario
const isApplicant = computed(() => {
  if (!isAuthenticated.value || !user.value || !adoption.value) return false
  return user.value.uid === adoption.value.userId
})

const isOwner = computed(() => {
  if (!isAuthenticated.value || !user.value || !adoption.value || !petOwner.value) return false
  return user.value.uid === petOwner.value.uid
})

// Comprobar si el usuario puede realizar acciones en esta solicitud
const userCanAct = computed(() => {
  return isApplicant.value || isOwner.value || isAdmin.value
})

// Cargar los datos de la adopción
const loadAdoption = async () => {
  try {
    loading.value = true
    
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)
    const adoptionRef = dbRef(db, `adoptions/${adoptionId}`)
    
    const snapshot = await get(adoptionRef)
    
    if (snapshot.exists()) {
      const adoptionData = snapshot.val()
      adoption.value = {
        id: adoptionId,
        ...adoptionData
      }
      
      // Cargar datos enriquecidos de mascota y usuario
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
    
    // Cargar datos de la mascota
    const petRef = dbRef(db, `pets/${adoption.value.petId}`)
    const petSnapshot = await get(petRef)
    
    if (petSnapshot.exists()) {
      const petData = petSnapshot.val()
      adoption.value.pet = {
        name: petData.name || 'Sin nombre',
        species: petData.type || 'No especificado',
        breed: petData.breed || 'No especificado',
        imageUrl: petData.image || '',
      }
    }
    
    // Cargar datos del usuario solicitante
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
    const petRef = dbRef(db, `pets/${adoption.value.petId}`)
    const petSnapshot = await get(petRef)
    
    if (petSnapshot.exists()) {
      const petData = petSnapshot.val()
      const ownerId = petData.userId
      
      if (ownerId) {
        // Cargar datos del propietario
        const ownerRef = dbRef(db, `users/${ownerId}`)
        const ownerSnapshot = await get(ownerRef)
        
        if (ownerSnapshot.exists()) {
          petOwner.value = {
            uid: ownerId,
            ...ownerSnapshot.val()
          }
        }
      }
    }
  } catch (err) {
    console.error('Error al cargar los datos del propietario:', err)
  }
}


const updateStatus = async (newStatus) => {
  if (!adoption.value || !adoption.value.id) return
  

  if (newStatus === 'rejected' && !confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
    return
  } else if (newStatus === 'completed' && !confirm('¿Estás seguro de que deseas marcar esta adopción como completada? Esto indicará que la mascota ha sido entregada al adoptante.')) {
    return
  }
  
  try {
    loading.value = true
    
    const { updateAdoptionStatus } = useAdoptions()
    const success = await updateAdoptionStatus(adoption.value.id, newStatus)
    
    if (success) {
      adoption.value.status = newStatus
      adoption.value.updatedAt = Date.now()
      

      if (newStatus === 'completed') {
        const firebaseApp = useFirebaseApp()
        const db = getDatabase(firebaseApp)
        const petRef = dbRef(db, `pets/${adoption.value.petId}`)
        
        await update(petRef, {
          status: 'adopted',
          adoptedBy: adoption.value.userId,
          adoptionId: adoption.value.id,
          adoptionDate: Date.now(),
          updatedAt: Date.now()
        })
        
        // Redirigir al certificado de adopción
        setTimeout(() => {
          router.push(`/certificados/${adoption.value.id}`)
        }, 1500)
        
        alert('¡Adopción completada con éxito! La mascota ha sido marcada como adoptada y se ha generado un certificado de adopción.')
      } else {
        alert(`Estado de solicitud actualizado a "${
          newStatus === 'approved' ? 'Aprobada' : 
          newStatus === 'rejected' ? 'Rechazada' : 
          'Completada'
        }".`)
      }
    } else {
      alert('Error al actualizar el estado de la solicitud. Intenta de nuevo.')
    }
  } catch (err) {
    console.error('Error al actualizar el estado de la adopción:', err)
    alert('Error al actualizar el estado de la solicitud. Intenta de nuevo.')
  } finally {
    loading.value = false
  }
}

// Cancelar solicitud de adopción (para el solicitante)
const cancelAdoption = async () => {
  if (!adoption.value || !adoption.value.id) return
  
  if (!confirm('¿Estás seguro de que deseas cancelar tu solicitud de adopción?')) {
    return
  }
  
  try {
    loading.value = true
    
    const { updateAdoptionStatus } = useAdoptions()
    const success = await updateAdoptionStatus(adoption.value.id, 'rejected')
    
    if (success) {
      adoption.value.status = 'rejected'
      adoption.value.updatedAt = Date.now()
      
      alert('Tu solicitud de adopción ha sido cancelada.')
    } else {
      alert('Error al cancelar la solicitud. Intenta de nuevo.')
    }
  } catch (err) {
    console.error('Error al cancelar la adopción:', err)
    alert('Error al cancelar la solicitud. Intenta de nuevo.')
  } finally {
    loading.value = false
  }
}

// Guardar notas administrativas
const saveNotes = async () => {
  if (!adoption.value || !adoption.value.id) return
  
  try {
    loading.value = true
    
    const { updateAdoptionNotes } = useAdoptions()
    const success = await updateAdoptionNotes(adoption.value.id, adminNotes.value)
    
    if (success) {
      adoption.value.notes = adminNotes.value
      alert('Notas guardadas correctamente.')
    } else {
      alert('Error al guardar las notas. Intenta de nuevo.')
    }
  } catch (err) {
    console.error('Error al guardar notas:', err)
    alert('Error al guardar las notas. Intenta de nuevo.')
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
  
  window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
}

// Función para verificar si la imagen es válida
const handleImageError = (event) => {
  // Establecer una imagen de placeholder si la carga falla
  event.target.src = '/placeholder.webp?height=300&width=400'
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
    minute: '2-digit'
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
  if (adoption.value && !isAdmin.value && !isApplicant.value && !isOwner.value) {
    error.value = 'No tienes permiso para ver esta solicitud de adopción'
  }
})
</script>