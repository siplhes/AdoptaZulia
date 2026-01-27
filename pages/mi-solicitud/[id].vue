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

      <div v-else-if="!adoption || !pet" class="mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-yellow-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">No se ha encontrado la solicitud de adopción</p>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Título y resumen -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-emerald-800">Detalles de tu solicitud</h1>
          <p class="mt-2 text-gray-600">
            Tu solicitud para adoptar a <span class="font-semibold">{{ pet.name }}</span>
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Información de la mascota (1/3) -->
          <div class="rounded-lg bg-white p-6 shadow-md">
            <h2 class="mb-4 text-xl font-bold text-emerald-800">Mascota</h2>
            
            <div class="mb-4">
              <NuxtImg
                :src="pet.image"
                :alt="pet.name"
                class=" w-full rounded-lg object-cover"
                sizes="sm:100vw md:33vw"
                placeholder
                @error="handleImageError"
              />
            </div>
            
            <h3 class="mb-2 text-lg font-semibold text-gray-900">{{ pet.name }}</h3>
            
            <div class="mb-4 grid grid-cols-2 gap-y-2">
              <div>
                <p class="text-sm text-gray-500">Tipo</p>
                <p class="font-medium">{{ formatType(pet.type) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Género</p>
                <p class="font-medium">{{ pet.gender === 'macho' ? 'Macho' : 'Hembra' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Edad</p>
                <p class="font-medium">{{ pet.age }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Ubicación</p>
                <p class="font-medium">{{ pet.location }}</p>
              </div>
            </div>
            
            <NuxtLink 
              :to="`/mascotas/${pet.id}`" 
              class="inline-flex items-center text-emerald-600 hover:text-emerald-800"
            >
              <span>Ver más detalles</span>
              <Icon name="heroicons:arrow-right" class="ml-1 h-4 w-4" />
            </NuxtLink>
          </div>
          
          <!-- Detalles de la solicitud (2/3) -->
          <div class="lg:col-span-2">
            <div class="rounded-lg bg-white p-6 shadow-md">
              <h2 class="mb-4 text-xl font-bold text-emerald-800">Estado de la solicitud</h2>
              
              <!-- Estado de la solicitud -->
              <div class="mb-6">
                <div 
                  class="mb-6 rounded-lg p-4"
                  :class="{
                    'bg-yellow-50 border border-yellow-200': adoption.status === 'pending',
                    'bg-green-50 border border-green-200': adoption.status === 'approved',
                    'bg-red-50 border border-red-200': adoption.status === 'rejected',
                  }"
                >
                  <div class="flex items-center">
                    <div 
                      class="flex h-10 w-10 items-center justify-center rounded-full"
                      :class="{
                        'bg-yellow-100': adoption.status === 'pending',
                        'bg-green-100': adoption.status === 'approved',
                        'bg-red-100': adoption.status === 'rejected',
                      }"
                    >
                      <Icon 
                        :name="adoption.status === 'pending' ? 'heroicons:clock' : adoption.status === 'approved' ? 'heroicons:check' : 'heroicons:x-mark'" 
                        class="h-6 w-6"
                        :class="{
                          'text-yellow-600': adoption.status === 'pending',
                          'text-green-600': adoption.status === 'approved',
                          'text-red-600': adoption.status === 'rejected',
                        }"
                      />
                    </div>
                    <div class="ml-4">
                      <h3 
                        class="text-lg font-semibold"
                        :class="{
                          'text-yellow-800': adoption.status === 'pending',
                          'text-green-800': adoption.status === 'approved',
                          'text-red-800': adoption.status === 'rejected',
                        }"
                      >
                        {{ getStatusTitle(adoption.status) }}
                      </h3>
                      <p 
                        class="text-sm"
                        :class="{
                          'text-yellow-600': adoption.status === 'pending',
                          'text-green-600': adoption.status === 'approved',
                          'text-red-600': adoption.status === 'rejected',
                        }"
                      >
                        {{ getStatusDescription(adoption.status) }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <!-- Fecha de solicitud -->
                  <div>
                    <p class="text-sm font-medium text-gray-500">Fecha de solicitud</p>
                    <p class="text-gray-900">{{ formatFullDate(adoption.createdAt) }}</p>
                  </div>
                  
                  <!-- Fecha de última actualización -->
                  <div v-if="adoption.updatedAt && adoption.updatedAt !== adoption.createdAt">
                    <p class="text-sm font-medium text-gray-500">Última actualización</p>
                    <p class="text-gray-900">{{ formatFullDate(adoption.updatedAt) }}</p>
                  </div>
                  
                  <!-- Tu mensaje -->
                  <div>
                    <p class="text-sm font-medium text-gray-500">Tu mensaje</p>
                    <div class="mt-1 rounded-lg bg-gray-50 p-4">
                      <p class="text-gray-700">{{ adoption.message }}</p>
                    </div>
                  </div>
                  
                  <!-- Acciones según el estado -->
                  <div class="mt-8">
                    <!-- Solicitud pendiente - Mostrar datos de contacto para agilizar proceso -->
                    <div v-if="adoption.status === 'pending' && pet.contact" class="space-y-3">
                      <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
                        <div class="flex items-start">
                          <Icon name="heroicons:information-circle" class="mr-2 h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p class="text-sm text-amber-700">
                            Puedes contactar directamente con el propietario sin esperar a que acepte tu solicitud. ¡Esto acelera el proceso de adopción!
                          </p>
                        </div>
                      </div>

                      <h3 class="text-lg font-semibold text-gray-900">Datos de contacto del propietario</h3>
                      
                      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <a 
                          :href="`tel:${pet.contact.phone}`" 
                          class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                        >
                          <Icon name="heroicons:phone" class="mr-2 h-5 w-5" />
                          Llamar
                        </a>
                        
                        <button 
                          class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                          @click="contactWhatsapp"
                        >
                          <Icon name="mdi:whatsapp" class="mr-2 h-5 w-5" />
                          WhatsApp
                        </button>
                        
                        <a 
                          :href="`mailto:${pet.contact.email}`" 
                          class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                        >
                          <Icon name="heroicons:envelope" class="mr-2 h-5 w-5" />
                          Email
                        </a>
                      </div>
                      
                      <!-- Detalles del contacto -->
                      <div class="mt-4 rounded-lg bg-gray-50 p-4">
                        <h4 class="font-medium text-gray-900">{{ pet.contact.name }}</h4>
                        <p class="mt-1 text-sm text-gray-500">{{ formatContactType(pet.contact.type) }}</p>
                        
                        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div class="flex items-center">
                            <Icon name="heroicons:phone" class="mr-2 h-5 w-5 text-gray-400" />
                            <span class="text-gray-700">{{ pet.contact.phone }}</span>
                          </div>
                          
                          <div class="flex items-center">
                            <Icon name="heroicons:envelope" class="mr-2 h-5 w-5 text-gray-400" />
                            <span class="text-gray-700">{{ pet.contact.email }}</span>
                          </div>
                        </div>
                        
                        <div v-if="pet.contact.notes" class="mt-3 border-t border-gray-200 pt-3">
                          <p class="text-sm text-gray-600">{{ pet.contact.notes }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Solicitud aprobada - Botones de contacto -->
                    <div v-else-if="adoption.status === 'approved' && pet.contact" class="space-y-3">
                      <h3 class="text-lg font-semibold text-gray-900">Información de contacto</h3>
                      
                      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <a 
                          :href="`tel:${pet.contact.phone}`" 
                          class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                        >
                          <Icon name="heroicons:phone" class="mr-2 h-5 w-5" />
                          Llamar
                        </a>
                        
                        <button 
                          class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                          @click="contactWhatsapp"
                        >
                          <Icon name="mdi:whatsapp" class="mr-2 h-5 w-5" />
                          WhatsApp
                        </button>
                        
                        <a 
                          :href="`mailto:${pet.contact.email}`" 
                          class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                        >
                          <Icon name="heroicons:envelope" class="mr-2 h-5 w-5" />
                          Email
                        </a>

                        <!-- Botón para confirmar adopción (por parte del adoptante) -->
                        <button 
                          v-if="!adoption.completed && (!pet.status || pet.status !== 'adopted')"
                          class="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 col-span-full"
                          @click="confirmAdoption"
                        >
                          <Icon name="heroicons:check-badge" class="mr-2 h-5 w-5" />
                          Confirmar adopción completada
                        </button>
                      </div>
                      
                      <!-- Detalles del contacto -->
                      <div class="mt-4 rounded-lg bg-gray-50 p-4">
                        <h4 class="font-medium text-gray-900">{{ pet.contact.name }}</h4>
                        <p class="mt-1 text-sm text-gray-500">{{ formatContactType(pet.contact.type) }}</p>
                        
                        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div class="flex items-center">
                            <Icon name="heroicons:phone" class="mr-2 h-5 w-5 text-gray-400" />
                            <span class="text-gray-700">{{ pet.contact.phone }}</span>
                          </div>
                          
                          <div class="flex items-center">
                            <Icon name="heroicons:envelope" class="mr-2 h-5 w-5 text-gray-400" />
                            <span class="text-gray-700">{{ pet.contact.email }}</span>
                          </div>
                        </div>
                        
                        <div v-if="pet.contact.notes" class="mt-3 border-t border-gray-200 pt-3">
                          <p class="text-sm text-gray-600">{{ pet.contact.notes }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Adopción completada - Mostrar certificado y opción para crear historia -->
                    <div v-else-if="adoption.status === 'completed'" class="space-y-3">
                      <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <p class="text-sm text-emerald-700 mb-3">
                          <Icon name="heroicons:check-circle" class="inline-block mr-1 h-5 w-5 text-emerald-600" />
                          ¡Felicidades! La adopción de {{ pet.name }} ha sido completada con éxito.
                        </p>
                        
                        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <!-- Enlace al certificado -->
                          <NuxtLink 
                            :to="`/certificados/${adoption.id}`"
                            class="flex items-center justify-center rounded-lg bg-amber-600 px-4 py-3 text-white hover:bg-amber-700"
                          >
                            <Icon name="heroicons:document-text" class="mr-2 h-5 w-5" />
                            Ver certificado de adopción
                          </NuxtLink>

                          <!-- Crear historia de adopción -->
                          <NuxtLink 
                            :to="`/historias/crear?petId=${adoption.petId}&adoptionId=${adoption.id}`"
                            class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                          >
                            <Icon name="heroicons:pencil-square" class="mr-2 h-5 w-5" />
                            Compartir tu historia
                          </NuxtLink>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Solicitud rechazada -->
                    <div v-else-if="adoption.status === 'rejected'" class="space-y-3">
                      <div class="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p class="text-sm text-red-700">
                          Lo sentimos, tu solicitud ha sido rechazada por el propietario. 
                          Puedes buscar otras mascotas disponibles para adopción.
                        </p>
                      </div>
                      
                      <NuxtLink 
                        to="/mascotas" 
                        class="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                      >
                        <Icon name="heroicons:heart" class="mr-2 h-5 w-5" />
                        Ver otras mascotas
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección de información del propietario -->
            <div class="mt-6 rounded-lg bg-white p-6 shadow-md">
              <h2 class="mb-4 text-xl font-bold text-emerald-800">Información del propietario</h2>
              
              <div v-if="adoption.status === 'pending'" class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p class="text-sm text-emerald-700">
                  <Icon name="heroicons:information-circle" class="inline-block mr-1 h-4 w-4" />
                  Puedes contactar directamente con el propietario sin esperar a que acepte tu solicitud.
                </p>
              </div>
              
              <div>
                <div class="flex items-start">
                  <div class="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                    <img 
                      v-if="pet.ownerPhotoURL" 
                      :src="pet.ownerPhotoURL" 
                      alt="Propietario" 
                      class="h-full w-full object-cover"
                    >
                    <div v-else class="flex h-full w-full items-center justify-center font-bold text-emerald-700">
                      {{ getInitials(pet.contact.name || 'P') }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="font-semibold text-gray-900">{{ pet.contact.name }}</h3>
                    <p class="text-sm text-gray-500">{{ formatContactType(pet.contact.type) }}</p>
                  </div>
                </div>
                
                <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div class="flex items-center">
                    <Icon name="heroicons:phone" class="mr-2 h-5 w-5 text-gray-400" />
                    <span class="text-gray-700">{{ pet.contact.phone }}</span>
                  </div>
                  
                  <div class="flex items-center">
                    <Icon name="heroicons:envelope" class="mr-2 h-5 w-5 text-gray-400" />
                    <span class="text-gray-700">{{ pet.contact.email }}</span>
                  </div>
                </div>
                
                <div v-if="pet.contact.notes" class="mt-4 rounded-lg bg-gray-50 p-3">
                  <p class="text-sm text-gray-700">{{ pet.contact.notes }}</p>
                </div>
              </div>
            </div>

            <!-- Sección de información del solicitante -->
            <div class="mt-6 rounded-lg bg-white p-6 shadow-md">
              <h2 class="mb-4 text-xl font-bold text-emerald-800">Tu información de contacto</h2>
              
              <div v-if="user">
                <div class="flex items-start">
                  <div class="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                    <img 
                      v-if="user.photoURL" 
                      :src="user.photoURL" 
                      alt="Tu perfil" 
                      class="h-full w-full object-cover"
                    >
                    <div v-else class="flex h-full w-full items-center justify-center font-bold text-emerald-700">
                      {{ getInitials(user.displayName || user.email || 'U') }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="font-semibold text-gray-900">{{ user.displayName || 'No disponible' }}</h3>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
                
                <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div class="flex items-center">
                    <Icon name="heroicons:phone" class="mr-2 h-5 w-5 text-gray-400" />
                    <span class="text-gray-700">{{ user.phoneNumber || 'No disponible' }}</span>
                  </div>
                  
                  <div v-if="user.address" class="flex items-center">
                    <Icon name="heroicons:map-pin" class="mr-2 h-5 w-5 text-gray-400" />
                    <span class="text-gray-700">{{ user.address }}</span>
                  </div>
                </div>
                
                <div class="mt-4 rounded-lg bg-gray-50 p-3">
                  <p class="text-sm text-gray-700">
                    Esta es la información que el propietario puede ver sobre ti. Puedes actualizar tu perfil en la 
                    <NuxtLink to="/perfil/configuracion" class="text-emerald-600 hover:text-emerald-700">
                      configuración de tu cuenta
                    </NuxtLink>.
                  </p>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdoptions } from '~/composables/useAdoptions'
import { usePets } from '~/composables/usePets'
import { useAuth } from '~/composables/useAuth'
import { useFirebaseApp } from 'vuefire'
import { getDatabase, ref as dbRef, update } from 'firebase/database'

// Obtener parámetros de ruta
const route = useRoute()
const router = useRouter()
const adoptionId = route.params.id

// Composables
const { getAdoptionById, updateAdoptionStatus, confirmAdoptionAndVerify } = useAdoptions()
const { fetchPetById, updatePetStatus } = usePets()
const { isAuthenticated, user } = useAuth()

// Estado
const adoption = ref(null)
const pet = ref(null)
const loading = ref(true)
const error = ref(null)

// Cargar datos
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  try {
    loading.value = true
    
    // Cargar los detalles de la solicitud
    const adoptionData = await getAdoptionById(adoptionId)
    
    if (!adoptionData) {
      error.value = 'No se encontró la solicitud de adopción'
      return
    }
    
    // Verificar que la solicitud pertenece al usuario actual
    if (adoptionData.userId !== user.value.uid) {
      error.value = 'No tienes permiso para ver esta solicitud'
      return
    }
    
    adoption.value = adoptionData
    
    // Cargar los detalles de la mascota
    if (adoptionData.petId) {
      pet.value = await fetchPetById(adoptionData.petId)
    }
    
    if (!pet.value) {
      error.value = 'No se encontró la mascota asociada a esta solicitud'
    }
  } catch (err) {
    console.error('Error al cargar la solicitud:', err)
    error.value = 'Error al cargar la solicitud. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

// Función para manejar errores de imagen
const handleImageError = (event) => {
  event.target.src = '/placeholder.webp'
}

// Formatear fecha
const formatFullDate = (timestamp) => {
  if (!timestamp) return 'Fecha desconocida'
  
  const date = new Date(timestamp)
  
  return date.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear tipo de mascota
const formatType = (type) => {
  switch (type) {
    case 'perro':
      return 'Perro'
    case 'gato':
      return 'Gato'
    case 'ave':
      return 'Ave'
    case 'conejo':
      return 'Conejo'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

// Obtener título del estado
const getStatusTitle = (status) => {
  switch (status) {
    case 'pending':
      return 'Solicitud en revisión'
    case 'approved':
      return 'Solicitud aprobada'
    case 'rejected':
      return 'Solicitud rechazada'
    default:
      return 'Estado desconocido'
  }
}

// Obtener descripción del estado
const getStatusDescription = (status) => {
  switch (status) {
    case 'pending':
      return 'Tu solicitud está siendo revisada por el propietario. Mientras tanto, ¡puedes contactar directamente con el propietario para agilizar el proceso de adopción!'
    case 'approved':
      return '¡Felicidades! Tu solicitud ha sido aprobada. Ahora puedes contactar al propietario.'
    case 'rejected':
      return 'Lo sentimos, tu solicitud ha sido rechazada por el propietario'
    default:
      return ''
  }
}

// Formatear tipo de contacto
const formatContactType = (type) => {
  switch (type) {
    case 'particular':
      return 'Particular'
    case 'protectora':
      return 'Protectora/Refugio'
    case 'veterinario':
      return 'Clínica Veterinaria'
    default:
      return type
  }
}

// Contactar via WhatsApp
const contactWhatsapp = () => {
  if (pet.value && pet.value.contact && pet.value.contact.phone) {
    let phoneNumber = pet.value.contact.phone.toString().trim()
    
    // Eliminar el código de país si ya está presente
    if (phoneNumber.startsWith('+58')) {
      phoneNumber = phoneNumber.substring(3)
    } else if (phoneNumber.startsWith('58')) {
      phoneNumber = phoneNumber.substring(2)
    }
    
    // Eliminar el 0 inicial si existe
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1)
    }
    
    // Asegurar que no hay espacios ni caracteres especiales
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
    
    // Abrir WhatsApp con el número procesado
    window.open(`https://wa.me/58${phoneNumber}`)
  }
}

// Volver a la página de la mascota
const goBack = () => {
  if (pet.value && pet.value.id) {
    router.push(`/mascotas/${pet.value.id}`)
  } else {
    router.push('/mascotas')
  }
}

// Obtener iniciales
const getInitials = (name) => {
  const words = name.split(' ')
  return words.map(word => word.charAt(0).toUpperCase()).join('')
}

// Confirmar adopción completada
const confirmAdoption = async () => {
  try {
    loading.value = true;
    
    // Confirmar la acción
    if (!confirm(`¿Estás seguro de que quieres confirmar la adopción de ${pet.value.name}? Esto marcará la mascota como adoptada y generará un certificado de adopción.`)) {
      loading.value = false;
      return;
    }
    
    // Importamos lo necesario para actualizar Firebase
    const firebaseApp = useFirebaseApp();
    const db = getDatabase(firebaseApp);
    
    // Completar la adopción y crear verificación
    const verificationId = await confirmAdoptionAndVerify(adoptionId, null, false)

    if (verificationId) {
      // Actualizar estado local similar a antes
      adoption.value.status = 'completed';
      adoption.value.updatedAt = Date.now();

      if (pet.value) {
        pet.value.status = 'adopted';
        pet.value.adoptedBy = user.value.uid;
        pet.value.adoptionId = adoptionId;
        pet.value.adoptionDate = Date.now();
      }

      alert('¡Felicidades! La adopción ha sido completada y verificada. Ahora puedes acceder al certificado de adopción.');
    } else {
      error.value = 'Error al completar la adopción';
    }
  } catch (err) {
    console.error('Error al completar adopción:', err);
    error.value = 'Error al completar la adopción. Por favor, intenta de nuevo.';
  } finally {
    loading.value = false;
  }
}
</script>