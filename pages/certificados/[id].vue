<template>
  <div class="min-h-screen bg-amber-50 py-8 md:py-12">
    <div class="container mx-auto px-4">
      <!-- Opciones para compartir/imprimir -->
      <div class="mb-6 flex justify-between">
        <button
          class="inline-flex items-center text-emerald-600 hover:text-emerald-700"
          @click="goBack"
        >
          <Icon name="heroicons:arrow-left" class="mr-1 h-4 w-4" />
          <span>Volver</span>
        </button>
        
        <div class="flex space-x-3">
          <button
            class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300"
            @click="printCertificate"
          >
            <Icon name="heroicons:printer" class="mr-2 h-4 w-4" />
            Imprimir
          </button>
          
          <button
            class="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            @click="shareCertificate"
          >
            <Icon name="heroicons:share" class="mr-2 h-4 w-4" />
            Compartir
          </button>
        </div>
      </div>

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

      <div v-else-if="!certificateData" class="mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-yellow-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">No se ha encontrado el certificado de adopción</p>
          </div>
        </div>
      </div>

      <!-- Certificado -->
      <div v-else ref="certificateRef" class="bg-white border-8 border-double border-amber-200 p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <div class="mb-6 flex justify-center">
            <img src="/logo.svg" alt="AdoptaZulia" class="h-16 md:h-20" >
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">Certificado de Adopción</h1>
          <p class="text-gray-600 text-lg">Este documento certifica oficialmente la adopción de una mascota</p>
        </div>
        
        <div class="border-t border-b border-amber-200 py-6 my-6 text-center">
          <p class="text-lg text-gray-700">
            Este certificado confirma que
            <span class="font-bold text-emerald-700">{{ certificateData.adopter?.name || 'El adoptante' }}</span>
            ha adoptado oficialmente a
            <span class="font-bold text-emerald-700">{{ certificateData.pet?.name || 'la mascota' }}</span>
            como un nuevo miembro de su familia el día
            <span class="font-bold text-emerald-700">{{ formatDate(certificateData.adoptionDate) }}</span>
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Datos de la mascota -->
          <div class="bg-amber-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-amber-800 mb-4 flex items-center">
              <Icon name="heroicons:paw-print" class="mr-2 h-5 w-5" />
              Mascota Adoptada
            </h2>
            
            <div class="flex flex-col items-center mb-4">
              <div class="h-32 w-32 overflow-hidden rounded-full mb-3 border-4 border-white shadow-md">
                <img 
                  v-if="certificateData.pet?.imageUrl" 
                  :src="certificateData.pet.imageUrl" 
                  :alt="certificateData.pet?.name" 
                  class="h-full w-full object-cover"
                  @error="handleImageError"
                >
                <div v-else class="h-full w-full flex items-center justify-center bg-gray-200">
                  <Icon name="heroicons:paw-print" class="h-10 w-10 text-gray-400" />
                </div>
              </div>
              
              <h3 class="text-lg font-bold text-gray-800">{{ certificateData.pet?.name }}</h3>
            </div>
            
            <ul class="space-y-2">
              <li class="flex items-start">
                <span class="text-amber-700 font-medium w-24">Especie:</span>
                <span class="text-gray-700">{{ certificateData.pet?.species || 'No especificado' }}</span>
              </li>
              <li class="flex items-start">
                <span class="text-amber-700 font-medium w-24">Raza:</span>
                <span class="text-gray-700">{{ certificateData.pet?.breed || 'No especificado' }}</span>
              </li>
              <li class="flex items-start">
                <span class="text-amber-700 font-medium w-24">Edad:</span>
                <span class="text-gray-700">{{ certificateData.pet?.age || 'No especificado' }}</span>
              </li>
              <li class="flex items-start">
                <span class="text-amber-700 font-medium w-24">Color:</span>
                <span class="text-gray-700">{{ certificateData.pet?.color || 'No especificado' }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Datos del adoptante -->
          <div class="bg-emerald-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
              <Icon name="heroicons:user" class="mr-2 h-5 w-5" />
              Adoptante
            </h2>
            
            <div class="flex flex-col items-center mb-4">
              <div class="h-32 w-32 overflow-hidden rounded-full mb-3 bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center">
                <img 
                  v-if="certificateData.adopter?.photoURL" 
                  :src="certificateData.adopter.photoURL" 
                  :alt="certificateData.adopter?.name" 
                  class="h-full w-full object-cover"
                >
                <span v-else class="text-3xl font-bold text-emerald-600">
                  {{ getInitials(certificateData.adopter?.name || 'Usuario') }}
                </span>
              </div>
              
              <h3 class="text-lg font-bold text-gray-800">{{ certificateData.adopter?.name }}</h3>
            </div>
            
            <p class="text-gray-600 text-sm mb-4 text-center">
              Al adoptar una mascota, me comprometo a brindarle un hogar lleno de amor, cuidados adecuados
              y atención responsable durante toda su vida.
            </p>
            
            <div class="border-t border-emerald-200 pt-4 mt-4">
              <p class="text-emerald-700 text-sm text-center">
                Esta adopción ha sido registrada oficialmente en la plataforma AdoptaZulia, 
                trabajando por encontrar hogares amorosos para mascotas en Venezuela.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Sello y firma -->
        <div class="text-center mb-6">
          <div class="inline-block mx-auto relative">
            <div class="w-32 h-32 border-4 border-amber-300 rounded-full flex items-center justify-center overflow-hidden mx-auto relative opacity-90">
              <img src="/logo.svg" alt="Sello" class="absolute inset-0 w-full h-full p-6 opacity-30" >
              <div class="z-10 font-bold text-emerald-700 text-xs">
                <div>CERTIFICADO</div>
                <div>OFICIAL</div>
                <div class="text-xxxs">ADOPTAZULIA</div>
              </div>
            </div>
            
            <div class="mt-4 border-t border-gray-300 pt-3 max-w-xs mx-auto">
              <p class="text-sm text-gray-600">Director de AdoptaZulia</p>
              <p class="font-cursive text-lg text-gray-700 font-medium">Firma Autorizada</p>
            </div>
          </div>
        </div>
        
        <!-- Número de certificado y fecha -->
        <div class="bg-amber-50 rounded-md p-3 text-center text-sm text-amber-800">
          <p>
            <span class="font-medium">Certificado No:</span> 
            <span class="font-mono">{{ generateCertificateId(certificateData.id) }}</span>
            <span class="mx-2">•</span>
            <span class="font-medium">Fecha de emisión:</span> 
            <span>{{ formatDate(Date.now()) }}</span>
          </p>
          <p class="mt-1 text-xs text-amber-600">
            Este certificado puede ser verificado en 
            <span class="font-medium">adoptazulia.com/verificar</span>
          </p>
          <div v-if="verificationId" class="mt-2 text-xs">
            <p class="text-gray-700">Verificación: <span class="font-mono">{{ verificationId }}</span></p>
            <div class="mt-1 flex items-center justify-center gap-2">
              <NuxtLink :to="`/verificar?vid=${verificationId}`" class="text-amber-800 underline">Verificar públicamente</NuxtLink>
              <button class="rounded bg-white px-2 py-1 text-sm border" @click="copyVerificationLink">Copiar enlace</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Historia de adopción -->
      <div v-if="certificateData && !hasAdoptionStory" class="mt-8 max-w-2xl mx-auto bg-emerald-50 p-6 rounded-lg border border-emerald-100">
        <h2 class="text-xl font-semibold text-emerald-800 mb-3 flex items-center">
          <Icon name="heroicons:heart" class="mr-2 h-5 w-5" />
          Comparte tu historia de adopción
        </h2>
        
        <p class="text-gray-600 mb-4">
          ¡Nos encantaría conocer cómo va la vida con tu nueva mascota! Comparte tu experiencia 
          y ayuda a inspirar a más personas a adoptar.
        </p>
        
        <NuxtLink 
          :to="`/historias/crear?petId=${certificateData.petId}&adoptionId=${certificateData.id}`"
          class="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <Icon name="heroicons:pencil-square" class="mr-2 h-4 w-4" />
          Crear historia de adopción
        </NuxtLink>
      </div>
      
      <!-- Enlace a historia de adopción si existe -->
      <div v-if="certificateData && hasAdoptionStory" class="mt-8 max-w-2xl mx-auto bg-emerald-50 p-6 rounded-lg border border-emerald-100">
        <h2 class="text-xl font-semibold text-emerald-800 mb-3 flex items-center">
          <Icon name="heroicons:heart" class="mr-2 h-5 w-5" />
          Historia de adopción
        </h2>
        
        <p class="text-gray-600 mb-4">
          Has compartido tu historia de adopción con la comunidad. ¡Gracias por inspirar a otros!
        </p>
        
        <NuxtLink 
          :to="`/historias/${adoptionStoryId}`"
          class="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <Icon name="heroicons:book-open" class="mr-2 h-4 w-4" />
          Ver historia de adopción
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebaseApp } from 'vuefire'
import { getDatabase, ref as dbRef, get } from 'firebase/database'
import { useAuth } from '~/composables/useAuth'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Obtener parámetros de ruta
const route = useRoute()
const router = useRouter()
const adoptionId = route.params.id

// Autenticación
const { isAuthenticated, user } = useAuth()

// Referencias
const certificateRef = ref(null)

// Estado
const loading = ref(true)
const error = ref(null)
const certificateData = ref(null)
const hasAdoptionStory = ref(false)
const adoptionStoryId = ref(null)
const verificationId = ref(null)

// Cargar datos del certificado
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    await loadCertificateData()
    await checkForAdoptionStory()
    if (adoptionId) {
      await loadVerification(adoptionId)
    }
  } catch (err) {
    console.error('Error al cargar el certificado:', err)
    error.value = 'Error al cargar el certificado. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

// Cargar datos del certificado
const loadCertificateData = async () => {
  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)
    
    // Cargar la solicitud de adopción
    const adoptionRef = dbRef(db, `adoptions/${adoptionId}`)
    const adoptionSnapshot = await get(adoptionRef)
    
    if (!adoptionSnapshot.exists()) {
      error.value = 'No se ha encontrado la solicitud de adopción'
      return
    }
    
    const adoptionData = adoptionSnapshot.val()
    
    // Verificar que la adopción está completada
    if (adoptionData.status !== 'completed') {
      error.value = 'Esta adopción aún no ha sido completada'
      return
    }
    
    // Cargar datos de la mascota
    const petRef = dbRef(db, `pets/${adoptionData.petId}`)
    const petSnapshot = await get(petRef)
    
    if (!petSnapshot.exists()) {
      error.value = 'No se ha encontrado la mascota asociada a esta adopción'
      return
    }
    
    const petData = petSnapshot.val()
    
    // Cargar datos del adoptante
    const adopterRef = dbRef(db, `users/${adoptionData.userId}`)
    const adopterSnapshot = await get(adopterRef)
    
    if (!adopterSnapshot.exists()) {
      error.value = 'No se ha encontrado el adoptante asociado a esta adopción'
      return
    }
    
    const adopterData = adopterSnapshot.val()
    
    // Verificar si el usuario actual es el adoptante o el propietario original
    const isUserInvolved = 
      user.value.uid === adoptionData.userId || // Es el adoptante
      user.value.uid === petData.userId // Es el propietario original
    
    if (!isUserInvolved) {
      error.value = 'No tienes permisos para ver este certificado'
      return
    }
    
    // Armar los datos del certificado
    certificateData.value = {
      id: adoptionId,
      petId: adoptionData.petId,
      adopterId: adoptionData.userId,
      ownerId: petData.userId,
      adoptionDate: petData.adoptionDate || adoptionData.updatedAt || Date.now(),
      createdAt: Date.now(),
      
      pet: {
        name: petData.name || 'Sin nombre',
        species: petData.type || 'No especificado',
        breed: petData.breed || 'No especificado',
        age: petData.age || 'No especificado',
        color: petData.color || 'No especificado',
        imageUrl: petData.image || null
      },
      
      adopter: {
        name: adopterData.displayName || adopterData.email || 'Usuario',
        email: adopterData.email || 'No disponible',
        phone: adopterData.phoneNumber || 'No disponible',
        photoURL: adopterData.photoURL || null
      }
    }
  } catch (err) {
    console.error('Error al cargar datos del certificado:', err)
    error.value = 'Error al cargar los datos del certificado. Por favor, intenta de nuevo.'
  }
}

async function loadVerification(adoptionId) {
  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)
    const snap = await get(dbRef(db, `adoptionVerifications`))
    if (!snap.exists()) return
    const data = snap.val()
    for (const key of Object.keys(data)) {
      const v = data[key]
      if (v && v.adoptionId === adoptionId) {
        verificationId.value = key
        return
      }
    }
  } catch (e) {
    console.error('Error loading verification:', e)
  }
}

function copyVerificationLink() {
  if (!verificationId.value) return
  const url = `${window.location.origin}/verificar?vid=${verificationId.value}`
  navigator.clipboard?.writeText(url).then(() => {
    alert('Enlace de verificación copiado al portapapeles')
  })
}

// Verificar si existe una historia de adopción
const checkForAdoptionStory = async () => {
  if (!certificateData.value || !certificateData.value.petId) return
  
  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)
    
    // Buscar historias por mascota y adoptante
    const storiesRef = dbRef(db, 'adoption_stories')
    const snapshot = await get(storiesRef)
    
    if (snapshot.exists()) {
      const stories = snapshot.val()
      
      // Buscar una historia para esta adopción
      for (const [id, story] of Object.entries(stories)) {
        if (
          story.petId === certificateData.value.petId && 
          story.userId === certificateData.value.adopterId &&
          story.adoptionId === adoptionId
        ) {
          hasAdoptionStory.value = true
          adoptionStoryId.value = id
          break
        }
      }
    }
  } catch (err) {
    console.error('Error al verificar historias de adopción:', err)
    // No establecer error, ya que esto no es crítico
  }
}

// Generar ID único para el certificado
const generateCertificateId = (id) => {
  if (!id) return 'XXXXXX'
  
  // Tomar los primeros 6 caracteres y convertirlos a mayúsculas
  const prefix = id.substring(0, 6).toUpperCase()
  return `AZ-${prefix}-${new Date().getFullYear()}`
}

// Formatear fecha
const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha desconocida'
  
  const date = new Date(timestamp)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Obtener iniciales de un nombre
const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Manejar error de carga de imagen
const handleImageError = (event) => {
  event.target.src = '/placeholder.webp'
}

// Imprimir certificado
const printCertificate = async () => {
  try {
    // Usar html2canvas para capturar el certificado
    const element = certificateRef.value
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    })
    
    const imgData = canvas.toDataURL('image/jpeg', 0.8)
    
    // Crear PDF con jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width
    
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
    
    // Descargar el PDF
    pdf.save(`Certificado_Adopcion_${certificateData.value?.pet?.name || 'Mascota'}.pdf`)
  } catch (err) {
    console.error('Error al generar PDF:', err)
    alert('Ha ocurrido un error al generar el certificado en PDF. Por favor, intenta de nuevo.')
  }
}

// Compartir certificado
const shareCertificate = async () => {
  try {
    // Verificar si la API Web Share está disponible
    if (navigator.share) {
      await navigator.share({
        title: `Certificado de Adopción - ${certificateData.value?.pet?.name || 'Mascota'}`,
        text: `¡${certificateData.value?.adopter?.name || 'Alguien'} ha adoptado a ${certificateData.value?.pet?.name || 'una mascota'}! Mira el certificado de adopción.`,
        url: window.location.href
      })
    } else {
      // Si Web Share API no está disponible, copiar el enlace al portapapeles
      await navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado al portapapeles! Puedes compartirlo donde quieras.')
    }
  } catch (err) {
    console.error('Error al compartir:', err)
    
    // Intentar copiar al portapapeles como fallback
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado al portapapeles! Puedes compartirlo donde quieras.')
    } catch (clipboardErr) {
      alert('No se pudo compartir automáticamente. Por favor, copia la URL de tu navegador.')
    }
  }
}

// Volver atrás
const goBack = () => {
  router.back()
}
</script>

<style scoped>
/* Estilo para la fuente cursiva */
.font-cursive {
  font-family: 'Brush Script MT', cursive;
}

/* Tamaño extra pequeño para texto */
.text-xxxs {
  font-size: 0.5rem;
}

/* Impresión */
@media print {
  body * {
    visibility: hidden;
  }
  
  #certificateRef, #certificateRef * {
    visibility: visible;
  }
  
  #certificateRef {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>