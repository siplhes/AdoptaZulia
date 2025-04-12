<template>
  <div class="min-h-screen bg-amber-50 py-6 md:py-12">
    <div class="container mx-auto px-4">
      <!-- Navegación de regreso -->
      <button
        class="mb-6 inline-flex items-center text-emerald-600 hover:text-emerald-700"
        @click="goBack"
      >
        <ArrowLeftIcon class="mr-1 h-4 w-4" />
        <span>Volver a mascotas</span>
      </button>

      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
      </div>

      <div v-else-if="error" class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <AlertTriangleIcon class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="!pet" class="mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <AlertTriangleIcon class="h-5 w-5 text-yellow-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">No se ha encontrado la mascota</p>
          </div>
        </div>
      </div>

      <div v-else class="overflow-hidden rounded-lg bg-white shadow-lg">
        <div class="grid grid-cols-1 lg:grid-cols-3">
          <!-- Galería de fotos (1/3) -->
          <div class="p-4 lg:col-span-1 lg:p-6">
            <div class="mb-4">
              <!-- Foto principal -->
              <img
                :src="currentPhoto || pet.image"
                :alt="pet.name"
                class="h-64 w-full rounded-lg object-cover lg:h-96"
                @error="handleImageError"
              >
            </div>

            <!-- Miniaturas de fotos -->
            <div v-if="pet.photos && pet.photos.length > 1" class="grid grid-cols-4 gap-2">
              <div
                v-for="(photo, index) in pet.photos"
                :key="index"
                class="h-16 cursor-pointer overflow-hidden rounded-md md:h-20"
                :class="{ 'ring-2 ring-emerald-500': currentPhoto === photo }"
                @click="currentPhoto = photo"
              >
                <img
                  :src="photo"
                  :alt="`Foto ${index + 1} de ${pet.name}`"
                  class="h-full w-full object-cover"
                  @error="handleImageError"
                >
              </div>
            </div>

            <!-- Estado de urgente si aplica -->
            <div v-if="pet.urgent" class="mt-4 rounded border-l-4 border-red-500 bg-red-100 p-3">
              <div class="flex">
                <div class="flex-shrink-0">
                  <AlertCircleIcon class="h-5 w-5 text-red-500" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-red-700">Adopción urgente</p>
                  <p class="mt-1 text-xs text-red-600">
                    Esta mascota necesita encontrar un hogar con urgencia.
                  </p>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="mt-6 flex flex-col space-y-3">
              <button
                class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                @click="contactWhatsapp"
              >
              <Icon name="mdi:whatsapp" class="mr-2 h-5 w-5" />
                WhatsApp
              </button>

              
             <button
                class="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
                @click="contactOwner"
              >
                <PhoneIcon class="mr-2 h-5 w-5" />
                Contactar
              </button>
              <button
                class="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 hover:bg-gray-50"
                :class="{
                  'text-red-500': isFavorite,
                  'text-gray-700': !isFavorite,
                }"
                @click="toggleFavorite"
              >
                <HeartIcon class="mr-2 h-5 w-5" />
                {{ isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos' }}
              </button>

              <button
                class="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50"
                @click="sharePet"
              >
                <ShareIcon class="mr-2 h-5 w-5" />
                Compartir
              </button>

              <button
                v-if="isOwner"
                class="flex items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700"
                @click="deletePet"
              >
                <TrashIcon class="mr-2 h-5 w-5" />
                Eliminar
              </button>

              <button
                v-if="isOwner"
                class="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
                @click="editPet"
              >
                <EditIcon class="mr-2 h-5 w-5" />
                Editar
              </button>
            </div>
          </div>

          <!-- Información de la mascota (2/3) -->
          <div class="border-gray-100 p-4 lg:col-span-2 lg:border-l lg:p-6">
            <div class="mb-6">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h1 class="text-3xl font-bold text-emerald-800">
                  {{ pet.name }}
                </h1>
                <span
                  :class="[
                    'rounded-full px-3 py-1 text-sm font-medium',
                    pet.gender === 'macho'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-pink-100 text-pink-800',
                  ]"
                >
                  {{ pet.gender === 'macho' ? 'Macho' : 'Hembra' }}
                </span>
              </div>

              <div class="mb-4 flex items-center text-gray-500">
                <MapPinIcon class="mr-1 h-4 w-4" />
                <span class="text-sm">{{ pet.location }}</span>
                <span class="mx-2">•</span>
                <CalendarIcon class="mr-1 h-4 w-4" />
                <span class="text-sm">Publicado {{ formatDate(pet.createdAt) }}</span>
              </div>

              <div class="mb-6 grid grid-cols-2 gap-y-3 sm:grid-cols-3">
                <div>
                  <p class="text-sm text-gray-500">Tipo</p>
                  <p class="font-medium">{{ formatType(pet.type) }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Raza</p>
                  <p class="font-medium">
                    {{ pet.breed || 'No especificada' }}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Edad</p>
                  <p class="font-medium">{{ pet.age }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Tamaño</p>
                  <p class="font-medium">{{ formatSize(pet.size) }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Vacunado</p>
                  <p class="font-medium">
                    {{ pet.vaccinated ? 'Sí' : 'No' }}
                    <span v-if="pet.vaccinated && pet.vaccineInfo" class="text-sm text-gray-500">
                      ({{ pet.vaccineInfo }})
                    </span>
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Esterilizado</p>
                  <p class="font-medium">
                    {{ pet.neutered ? 'Sí' : 'No' }}
                    <span v-if="pet.neutered && pet.neuterDate" class="text-sm text-gray-500">
                      ({{ pet.neuterDate }})
                    </span>
                  </p>
                </div>
                
                <div v-if="pet.microchipped">
                  <p class="text-sm text-gray-500">Microchip</p>
                  <p class="font-medium">
                    Sí
                    <span v-if="pet.chipNumber" class="text-sm text-gray-500">
                      ({{ pet.chipNumber }})
                    </span>
                  </p>
                </div>
              </div>

              <div class="mb-6">
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">Sobre {{ pet.name }}</h2>
                <p class="text-gray-700">{{ pet.description }}</p>
              </div>

              <div v-if="pet.healthDescription" class="mb-6">
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">Estado de salud</h2>
                <div class="mb-3 flex items-center">
                  <div class="h-2.5 w-full rounded-full bg-gray-200">
                    <div
                      class="h-2.5 rounded-full"
                      :class="getHealthColor(pet.healthStatus)"
                      :style="{ width: `${pet.healthStatus}%` }"
                    />
                  </div>
                  <span class="ml-4 text-sm font-medium">
                    {{ getHealthLabel(pet.healthStatus) }}
                  </span>
                </div>
                <p class="text-gray-700">{{ pet.healthDescription }}</p>
              </div>

              <!-- Vacunas -->
              <div v-if="pet.vaccinated && pet.vaccines && pet.vaccines.length > 0" class="mb-6">
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">Vacunas</h2>
                <ul class="space-y-2">
                  <li
                    v-for="(vaccine, index) in pet.vaccines"
                    :key="index"
                    class="flex items-center"
                  >
                    <CheckCircleIcon class="mr-2 h-5 w-5 text-green-500" />
                    <span>{{ vaccine.name }}</span>
                    <span v-if="vaccine.date" class="ml-2 text-sm text-gray-500">
                      ({{ formatShortDate(vaccine.date) }})
                    </span>
                  </li>
                </ul>
              </div>

              <!-- Historial médico -->
              <div v-if="pet.medicalRecords && pet.medicalRecords.length > 0" class="mb-6">
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">Historial médico</h2>
                <div class="space-y-3">
                  <div
                    v-for="(record, index) in pet.medicalRecords"
                    :key="index"
                    class="rounded-lg border border-gray-200 p-3"
                  >
                    <div class="flex items-start justify-between">
                      <h3 class="font-medium">{{ record.title }}</h3>
                      <span class="text-sm text-gray-500">{{ formatShortDate(record.date) }}</span>
                    </div>
                    <p class="mt-1 text-sm text-gray-700">
                      {{ record.description }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Requisitos para adopción -->
              <div v-if="pet.adoptionRequirements || pet.requiresContract || pet.requiresFollowUp || (pet.adoptionFee && pet.adoptionFee > 0)" class="mb-6">
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">Requisitos para adoptar</h2>
                <div class="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <div v-if="pet.adoptionRequirements" class="mb-3">
                    <p class="text-gray-700">{{ pet.adoptionRequirements }}</p>
                  </div>

                  <div v-if="pet.requiresContract || pet.requiresFollowUp" class="mb-3 space-y-2">
                    <div v-if="pet.requiresContract" class="flex items-center">
                      <CheckCircleIcon class="mr-2 h-5 w-5 text-emerald-600" />
                      <span class="text-gray-700">Requiere contrato de adopción</span>
                    </div>
                    
                    <div v-if="pet.requiresFollowUp" class="flex items-center">
                      <CheckCircleIcon class="mr-2 h-5 w-5 text-emerald-600" />
                      <span class="text-gray-700">
                        Requiere seguimiento post-adopción
                        <span v-if="pet.followUpDetails" class="text-sm text-gray-500">
                          ({{ pet.followUpDetails }})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="pet.adoptionFee && pet.adoptionFee > 0"
                    class="mt-3 border-t border-amber-100 pt-3"
                  >
                    <p class="text-gray-700">
                      <span class="font-medium">Tasa de adopción:</span>
                      ${{ pet.adoptionFee }}
                    </p>
                    <p v-if="pet.feeDetails" class="mt-1 text-sm text-gray-700">
                      {{ pet.feeDetails }}
                    </p>
                    <p v-else class="mt-1 text-xs text-gray-500">
                      Esta tasa ayuda a cubrir gastos veterinarios y de cuidado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información de contacto -->
            <div class="rounded-lg bg-gray-50 p-4">
              <h2 class="mb-2 text-xl font-semibold text-emerald-800">Información de contacto</h2>
              <div class="flex items-start">
                <UserIcon class="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p class="font-medium">{{ pet.contact.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ formatContactType(pet.contact.type) }}
                  </p>
                </div>
              </div>

              <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div class="flex items-center">
                  <PhoneIcon class="mr-3 h-5 w-5 text-gray-400" />
                  <a
                    :href="`tel:${pet.contact.phone}`"
                    class="text-emerald-600 hover:text-emerald-800"
                  >
                    {{ pet.contact.phone }}
                  </a>
                </div>

                <div class="flex items-center">
                  <MailIcon class="mr-3 h-5 w-5 text-gray-400" />
                  <a
                    :href="`mailto:${pet.contact.email}`"
                    class="text-emerald-600 hover:text-emerald-800"
                  >
                    {{ pet.contact.email }}
                  </a>
                </div>
              </div>
              
              <!-- Método preferido de contacto -->
              <div v-if="pet.contact.preferredMethod" class="mt-3">
                <p class="text-sm text-gray-700">
                  <span class="font-medium">Contacto preferido:</span>
                  <span class="ml-1">{{ formatPreferredMethod(pet.contact.preferredMethod) }}</span>
                </p>
              </div>
              
              <!-- Notas adicionales de contacto -->
              <div v-if="pet.contact.notes" class="mt-3">
                <p class="text-sm font-medium text-gray-700">Notas adicionales:</p>
                <p class="mt-1 text-sm text-gray-600">{{ pet.contact.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mascotas similares -->
      <div v-if="pet && similarPets.length > 0" class="mt-12">
        <h2 class="mb-6 text-2xl font-bold text-emerald-800">También te pueden interesar</h2>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <PetCard v-for="similarPet in similarPets" :key="similarPet.id" :pet="similarPet" />
        </div>
      </div>

      <!-- Sistema de comentarios -->
      <div v-if="pet" class="mt-12">
        <PetComments :pet-id="petId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ShareIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  UserIcon,
  TrashIcon,
  EditIcon,
} from 'lucide-vue-next'
import { usePets } from '~/composables/usePets'
import { useAuth } from '~/composables/useAuth'

// Obtener el ID de la mascota de la URL
const route = useRoute()
const router = useRouter()
const petId = route.params.id

// Usar el composable de mascotas
const { fetchPetById, loading, error, pet } = usePets()
const { fetchSimilarPets } = usePets()

// Estado para la galería de fotos
const currentPhoto = ref(null)

// Estado para favoritos
const isFavorite = ref(false)

// Mascotas similares
const similarPets = ref([])

// Información de autenticación
const { user, isLoggedIn } = useAuth()

// Verificar si el usuario actual es el propietario de la mascota
const isOwner = computed(() => {
  if (!isLoggedIn || !pet.value || !pet.value.userId) return false
  return user.value?.uid === pet.value.userId
})

// Función para verificar si la imagen es válida
const handleImageError = (event) => {
  // Establece una imagen de placeholder si la carga falla
  event.target.src = '/placeholder.webp?height=300&width=400'
}

// Función para eliminar una mascota
const deletePet = async () => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta mascota?')) return

  try {
    const { deletePet } = usePets()
    await deletePet(petId)

    // Redirigir a la página de mascotas
    router.push('/mascotas')
  } catch (err) {
    console.error('Error al eliminar la mascota:', err)
    alert('Error al eliminar la mascota. Por favor, inténtalo de nuevo.')
  }
}

// Función para editar una mascota
const editPet = () => {
  router.push(`/publicar/editar/${petId}`)
}

onMounted(async () => {
  // Cargar los datos de la mascota
  const petData = await fetchPetById(petId)

  if (petData) {
    // Establecer la foto actual a la foto principal
    currentPhoto.value = petData.image

    // Comprobar si está en favoritos
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    isFavorite.value = favorites.includes(petId)

    // Cargar mascotas similares
    similarPets.value = await fetchSimilarPets(petData, 4)
  }
  // Establecer el título de la página
  useHead({
  title: pet.value ? `Adopta a ${pet.value.name} | Adopta Zulia` : 'Mascota no encontrada',
  meta: [
    {
      name: 'description',
      content: pet.value
        ? `Conoce a ${pet.value.name}, una mascota en adopción. ${pet.value.description}`
        : 'Mascota no encontrada',
    },
    {
      property: 'og:title',
      content: pet.value ? `Adopta a ${pet.value.name}` : 'Mascota no encontrada',
    },
    {
      property: 'og:description',
      content: pet.value
        ? `Conoce a ${pet.value.name}, una mascota en adopción. ${pet.value.description}`
        : 'Mascota no encontrada',
    },
    {
      property: 'og:image',
      content: pet.value ? pet.value.image : '/placeholder.webp?height=300&width=400',
    },
    {
      property: 'og:url',
      content: window.location.href,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: 'Adopta un amigo',
    },
    {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      property: 'twitter:title',
      content: pet.value ? `Adopta a ${pet.value.name}` : 'Mascota no encontrada',
    },
    {
      property: 'twitter:description',
      content: pet.value
        ? `Conoce a ${pet.value.name}, una mascota en adopción. ${pet.value.description}`
        : 'Mascota no encontrada',
    },
    {
      property: 'twitter:image',
      content: pet.value ? pet.value.image : '/placeholder.webp?height=300&width=400',
    },
    {
      property: 'twitter:url',
      content: window.location.href,
    },
    {
      property: 'twitter:site',
      content: '@adoptazulia',
    },
    {
      property: 'twitter:creator',
      content: '@adoptazulia',
    },
    {
      property: 'twitter:image:alt',
      content: pet.value ? `Adopta a ${pet.value.name}` : 'Mascota no encontrada',
    },
    {
      property: 'twitter:image:width',
      content: '1200',
    },
    {
      property: 'twitter:image:height',
      content: '630',
    },
    {
      property: 'twitter:label1',
      content: 'Adopción',
    },
    {
      property: 'twitter:data1',
      content: pet.value ? `Adopta a ${pet.value.name}` : 'Mascota no encontrada',
    },
  ],
})
})

// Volver atrás
const goBack = () => {
  router.back()
}

// Alternar estado de favorito
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value

  // Guardar en localStorage
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
  if (isFavorite.value) {
    if (!favorites.includes(petId)) {
      favorites.push(petId)
    }
  } else {
    const index = favorites.indexOf(petId)
    if (index !== -1) {
      favorites.splice(index, 1)
    }
  }
  localStorage.setItem('favorites', JSON.stringify(favorites))
}

// Contactar al propietario
const contactOwner = () => {
  if (pet.value && pet.value.contact) {
    const phoneNumber = pet.value.contact.phone
    window.open(`tel:${phoneNumber}`)
  }
}

// Contactar al propietario via WhatsApp
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

// Compartir mascota
const sharePet = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Adopta a ${pet.value.name}`,
        text: `¡Mira a ${pet.value.name}, está buscando un hogar!`,
        url: window.location.href,
      })
    } catch (error) {
      console.error('Error compartiendo:', error)
    }
  } else {
    // Fallback para navegadores que no soportan Web Share API
    navigator.clipboard.writeText(window.location.href)
    alert('¡Enlace copiado al portapapeles!')
  }
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

// Formatear tamaño
const formatSize = (size) => {
  switch (size) {
    case 'pequeño':
      return 'Pequeño'
    case 'mediano':
      return 'Mediano'
    case 'grande':
      return 'Grande'
    default:
      return 'Desconocido'
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

// Formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha desconocida'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'hoy'
  } else if (diffDays === 1) {
    return 'ayer'
  } else if (diffDays < 7) {
    return `hace ${diffDays} días`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `hace ${years} ${years === 1 ? 'año' : 'años'}`
  }
}

const formatShortDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Obtener la etiqueta del nivel de salud
const getHealthLabel = (healthStatus) => {
  if (healthStatus >= 90) return 'Excelente'
  if (healthStatus >= 70) return 'Bueno'
  if (healthStatus >= 50) return 'Regular'
  if (healthStatus >= 30) return 'En tratamiento'
  return 'Necesidades especiales'
}

// Obtener el color del nivel de salud
const getHealthColor = (healthStatus) => {
  if (healthStatus >= 90) return 'bg-green-500'
  if (healthStatus >= 70) return 'bg-green-400'
  if (healthStatus >= 50) return 'bg-yellow-400'
  if (healthStatus >= 30) return 'bg-amber-500'
  return 'bg-red-500'
}

// Formatear método de contacto preferido
const formatPreferredMethod = (method) => {
  switch (method) {
    case 'phone':
      return 'Teléfono'
    case 'email':
      return 'Correo electrónico'
    default:
      return method
  }
}


</script>
