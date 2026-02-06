<template>
  <div class="min-h-screen bg-amber-50 pb-24 md:pb-12 pt-6">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Back Navigation -->
      <button
        class="mb-6 inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        @click="goBack"
      >
        <Icon name="heroicons:arrow-left" class="mr-1 h-5 w-5" />
        <span>Volver</span>
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
        <div class="flex">
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-500 mr-3" />
          <p class="text-red-700 font-medium">{{ error }}</p>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else-if="!pet" class="mb-6 rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-4 shadow-sm">
        <div class="flex">
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-yellow-500 mr-3" />
          <p class="text-yellow-700 font-medium">No se ha encontrado la mascota</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Gallery & Details -->
        <div class="lg:col-span-2 space-y-8">
            
            <!-- Mobile Gallery (Swipeable) -->
            <div class="lg:hidden -mx-4">
                <div class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-1 px-4 pb-4">
                    <div v-for="(photo, index) in (pet.photos && pet.photos.length > 0 ? pet.photos : [pet.image])" :key="index" class="snap-center shrink-0 w-[90vw] h-80 rounded-2xl overflow-hidden shadow-sm relative">
                        <NuxtImg
                            :src="photo"
                            :alt="pet.name"
                            class="h-full w-full object-cover"
                            @click="openImageModal(photo)"
                        />
                         <span class="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                            {{ index + 1 }} / {{ (pet.photos && pet.photos.length > 0 ? pet.photos.length : 1) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Desktop Gallery -->
            <div class="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-2">
                <div class="h-[500px] w-full rounded-xl overflow-hidden mb-2 relative cursor-zoom-in group" @click="openImageModal(currentPhoto || pet.image)">
                    <NuxtImg
                        :src="currentPhoto || pet.image"
                        :alt="pet.name"
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Icon name="heroicons:magnifying-glass-plus" class="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                </div>
                <div v-if="pet.photos && pet.photos.length > 1" class="grid grid-cols-6 gap-2 px-1 pb-1">
                    <button
                        v-for="(photo, index) in pet.photos"
                        :key="index"
                        class="h-20 rounded-lg overflow-hidden border-2 transition-all"
                        :class="currentPhoto === photo ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent hover:border-gray-200'"
                        @click="currentPhoto = photo"
                    >
                        <NuxtImg :src="photo" class="h-full w-full object-cover" />
                    </button>
                </div>
            </div>

            <!-- Header Info (Mobile & Desktop) -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                 <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{{ pet.name }}</h1>
                        <div class="flex items-center text-gray-500 text-sm md:text-base">
                            <Icon name="heroicons:map-pin" class="mr-1 h-5 w-5 text-emerald-600" />
                            <span class="mr-4">{{ pet.location }}</span>
                            <Icon name="heroicons:calendar" class="mr-1 h-5 w-5 text-emerald-600" />
                            <span>{{ formatDate(pet.createdAt) }}</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                         <span v-if="pet.urgent" class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold flex items-center animate-pulse">
                            <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 mr-1" />
                            Urgente
                         </span>
                         <span 
                            class="px-3 py-1 rounded-full text-sm font-bold flex items-center"
                            :class="pet.gender === 'macho' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'"
                         >
                            <Icon :name="pet.gender === 'macho' ? 'mdi:gender-male' : 'mdi:gender-female'" class="w-4 h-4 mr-1" />
                            {{ pet.gender === 'macho' ? 'Macho' : 'Hembra' }}
                         </span>
                    </div>
                 </div>

                 <!-- Attributes Grid -->
                 <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100">
                    <div class="text-center p-3 bg-amber-50/50 rounded-xl">
                        <span class="block text-xs uppercase tracking-wider text-gray-500 mb-1">Especie</span>
                        <span class="font-bold text-gray-900">{{ formatType(pet.type) }}</span>
                    </div>
                    <div class="text-center p-3 bg-amber-50/50 rounded-xl">
                        <span class="block text-xs uppercase tracking-wider text-gray-500 mb-1">Raza</span>
                        <span class="font-bold text-gray-900">{{ pet.breed || 'Mestizo' }}</span>
                    </div>
                    <div class="text-center p-3 bg-amber-50/50 rounded-xl">
                        <span class="block text-xs uppercase tracking-wider text-gray-500 mb-1">Edad</span>
                        <span class="font-bold text-gray-900">{{ pet.age }}</span>
                    </div>
                    <div class="text-center p-3 bg-amber-50/50 rounded-xl">
                        <span class="block text-xs uppercase tracking-wider text-gray-500 mb-1">Tamaño</span>
                        <span class="font-bold text-gray-900">{{ formatSize(pet.size) }}</span>
                    </div>
                 </div>

                 <!-- Description -->
                 <div class="mt-8">
                    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Icon name="heroicons:sparkles" class="w-6 h-6 mr-2 text-emerald-500" />
                        Conoce a {{ pet.name }}
                    </h2>
                    <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ pet.description }}</p>
                 </div>

                 <!-- Health -->
                 <div v-if="pet.healthDescription || pet.healthStatus" class="mt-8">
                    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Icon name="heroicons:heart" class="w-6 h-6 mr-2 text-rose-500" />
                        Salud
                    </h2>
                    
                     <div v-if="pet.healthStatus" class="mb-4">
                        <div class="flex justify-between text-sm font-medium mb-1">
                            <span>Estado General</span>
                            <span :class="getHealthColorText(pet.healthStatus)">{{ getHealthLabel(pet.healthStatus) }}</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2.5">
                            <div class="h-2.5 rounded-full transition-all duration-1000" :class="getHealthColor(pet.healthStatus)" :style="{ width: `${pet.healthStatus}%` }" />
                        </div>
                    </div>

                    <p class="text-gray-700 bg-rose-50 p-4 rounded-xl border border-rose-100">{{ pet.healthDescription }}</p>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                         <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Icon :name="pet.vaccinated ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-5 h-5 mr-3" :class="pet.vaccinated ? 'text-green-500' : 'text-gray-400'" />
                            <div>
                                <span class="block text-sm font-medium text-gray-900">Vacunado</span>
                                <span v-if="pet.vaccineInfo" class="text-xs text-gray-500">{{ pet.vaccineInfo }}</span>
                            </div>
                         </div>
                         <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Icon :name="pet.neutered ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-5 h-5 mr-3" :class="pet.neutered ? 'text-green-500' : 'text-gray-400'" />
                            <div>
                                <span class="block text-sm font-medium text-gray-900">Esterilizado</span>
                                <span v-if="pet.neuterDate" class="text-xs text-gray-500">{{ pet.neuterDate }}</span>
                            </div>
                        </div>
                    </div>
                 </div>

                 <!-- Adoption Requirements (Desktop View mainly, but inline for all) -->
                 <div v-if="hasAdoptionRequirements" class="mt-8 border-t border-gray-100 pt-8">
                      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Icon name="heroicons:clipboard-document-check" class="w-6 h-6 mr-2 text-amber-500" />
                        Requisitos
                    </h2>
                    <ul class="space-y-3">
                         <li v-if="pet.adoptionRequirements" class="flex items-start">
                            <Icon name="heroicons:check" class="w-5 h-5 text-emerald-500 mr-2 mt-0.5" />
                            <span class="text-gray-700">{{ pet.adoptionRequirements }}</span>
                        </li>
                        <li v-if="pet.requiresContract" class="flex items-center">
                            <Icon name="heroicons:document-text" class="w-5 h-5 text-gray-400 mr-2" />
                            <span class="text-gray-700">Contrato de adopción requerido</span>
                        </li>
                         <li v-if="pet.adoptionFee && pet.adoptionFee > 0" class="flex items-center">
                            <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-gray-400 mr-2" />
                            <span class="text-gray-700">Tasa de adopción: <strong>${{ pet.adoptionFee }}</strong></span>
                        </li>
                    </ul>
                 </div>
            </div>
        </div>

        <!-- Right Column: Actions & Status (Sticky on Desktop) -->
        <div class="lg:col-span-1">
            <div class="sticky top-6 space-y-6">
                
                <!-- Adoption Status Card -->
                <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                    <div class="text-center mb-6">
                         <div v-if="pet.status === 'adopted'" class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                            <Icon name="heroicons:home" class="w-8 h-8" />
                         </div>
                         <div v-else class="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-full mb-3">
                            <Icon name="heroicons:heart" class="w-8 h-8" />
                         </div>
                         
                         <h3 class="text-xl font-bold text-gray-900">
                             {{ pet.status === 'adopted' ? '¡Adoptado!' : (pet.urgent ? 'Adopción Urgente' : 'En Adopción') }}
                         </h3>
                         <p class="text-gray-500 text-sm mt-1">
                             {{ pet.status === 'adopted' ? 'Esta mascota ya tiene un hogar feliz.' : '¿Te gustaría darle un hogar?' }}
                         </p>
                    </div>

                    <!-- Application Status Block -->
                    <div 
                        v-if="hasApplied" 
                        class="mb-6 rounded-xl p-4 border-l-4" 
                        :class="{
                            'bg-yellow-50 border-yellow-400': adoptionStatus === 'pending',
                            'bg-emerald-50 border-emerald-500': adoptionStatus === 'approved',
                            'bg-red-50 border-red-500': adoptionStatus === 'rejected',
                        }"
                    >
                         <h4 
                            class="font-bold text-sm mb-1"
                            :class="{
                                'text-yellow-800': adoptionStatus === 'pending',
                                'text-emerald-800': adoptionStatus === 'approved',
                                'text-red-800': adoptionStatus === 'rejected',
                            }"
                         >
                            {{ adoptionStatus === 'pending' ? 'Solicitud en Revisión' : (adoptionStatus === 'approved' ? 'Solicitud Aprobada' : 'Solicitud Rechazada') }}
                         </h4>
                         <p class="text-xs text-gray-600">
                             {{ adoptionStatus === 'pending' ? 'El dueño está revisando tu perfil.' : (adoptionStatus === 'approved' ? '¡Contacta al dueño para coordinar!' : 'Lo sentimos, no fue aceptada.') }}
                         </p>
                    </div>

                    <!-- Desktop Actions -->
                    <div class="hidden lg:flex flex-col gap-3">
                         <template v-if="!isOwner">
                            <button
                                v-if="canAdopt && !hasApplied && pet.status !== 'adopted'"
                                class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-emerald-200"
                                @click="openAdoptionModal"
                            >
                                Solicitar Adopción
                            </button>
                            
                            <template v-if="adoptionStatus === 'approved'">
                                 <button class="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2" @click="contactWhatsapp">
                                     <Icon name="heroicons:chat-bubble-oval-left" class="w-5 h-5" />
                                     WhatsApp
                                 </button>
                                 <button class="w-full py-3 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold" @click="contactOwner">
                                     Ver Contacto
                                 </button>
                            </template>
                         </template>
                         
                         <!-- Owner Actions -->
                         <template v-if="isOwner">
                             <NuxtLink to="/mis-publicaciones" class="w-full py-3 bg-emerald-100 text-emerald-800 text-center rounded-xl font-semibold hover:bg-emerald-200">
                                Gestionar mis posts
                             </NuxtLink>
                             <div class="grid grid-cols-2 gap-2">
                                 <button class="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm" @click="editPet">Editar</button>
                                 <button class="py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm" @click="deletePet">Eliminar</button>
                             </div>
                         </template>

                        <div class="flex gap-2 pt-4 border-t border-gray-100">
                            <button class="flex-1 py-2 flex items-center justify-center gap-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" :class="isFavorite ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-500'" @click="toggleFavorite">
                                <Icon :name="isFavorite ? 'heroicons:heart-solid' : 'heroicons:heart'" class="w-5 h-5" />
                                {{ isFavorite ? 'Favorito' : 'Guardar' }}
                            </button>
                            <button class="flex-1 py-2 flex items-center justify-center gap-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500" @click="sharePet">
                                <Icon name="heroicons:share" class="w-5 h-5" />
                                Compartir
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Contact Info Card (Desktop Sticky) -->
                <div v-if="shouldShowContact" class="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="font-bold text-gray-900 mb-4 flex items-center">
                        <Icon name="heroicons:user-circle" class="w-5 h-5 mr-2 text-emerald-600" />
                        Contacto
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-center p-3 bg-gray-50 rounded-xl">
                            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mr-3">
                                {{ pet.contact.name.charAt(0) }}
                            </div>
                            <div>
                                <p class="font-bold text-gray-900 text-sm">{{ pet.contact.name }}</p>
                                <p class="text-xs text-gray-500">{{ formatContactType(pet.contact.type) }}</p>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <a :href="`tel:${pet.contact.phone}`" class="flex items-center text-sm text-gray-600 hover:text-emerald-600">
                                <Icon name="heroicons:phone" class="w-4 h-4 mr-3 text-gray-400" />
                                {{ pet.contact.phone }}
                            </a>
                             <a :href="`mailto:${pet.contact.email}`" class="flex items-center text-sm text-gray-600 hover:text-emerald-600">
                                <Icon name="heroicons:envelope" class="w-4 h-4 mr-3 text-gray-400" />
                                {{ pet.contact.email }}
                            </a>
                        </div>
                    </div>
                </div>

                 <!-- Owner Dashboard (Desktop) -->
                 <div v-if="isOwner && ownerAdoptions.length > 0" class="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                     <h3 class="font-bold text-gray-900 mb-4">Solicitudes ({{ ownerAdoptionCount }})</h3>
                     <button class="w-full py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100" @click="viewAdoptionRequests">
                         Ver todas las solicitudes
                     </button>
                 </div>

            </div>
        </div>

      </div>
    </div>

    <!-- Mobile Sticky Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 lg:hidden z-40 flex items-center gap-3 backdrop-blur-md bg-white/95">
        <button class="p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors" @click="toggleFavorite">
            <Icon :name="isFavorite ? 'heroicons:heart-solid' : 'heroicons:heart'" class="w-6 h-6" :class="{'text-red-500': isFavorite}" />
        </button>
        
        <template v-if="!isOwner">
             <button
                v-if="canAdopt && !hasApplied && pet?.status !== 'adopted'"
                class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 text-sm"
                @click="openAdoptionModal"
            >
                Solicitar Adopción
            </button>
            <button
                v-else-if="adoptionStatus === 'approved'"
                class="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-200 text-sm flex items-center justify-center gap-2"
                @click="contactWhatsapp"
            >
                <Icon name="heroicons:chat-bubble-oval-left" class="w-5 h-5" />
                Contactar WhatsApp
            </button>
             <button
                v-else-if="pet?.status === 'adopted'"
                disabled
                class="flex-1 py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm"
            >
                Ya Adoptado
            </button>
             <button
                v-else
                class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 text-sm"
                @click="viewUserAdoption"
            >
                Ver Mi Solicitud
            </button>
        </template>
        
         <template v-if="isOwner">
            <button class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm" @click="viewAdoptionRequests">
                Solicitudes ({{ ownerAdoptionCount }})
            </button>
         </template>
    </div>

    <!-- Modals (Image, Adoption, etc.) - Preserving existing functionality -->
    <!-- Adoption Modal -->
    <div v-if="showAdoptionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div class="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                <h3 class="text-lg font-bold text-white flex items-center">
                    <Icon name="heroicons:home-modern" class="w-6 h-6 mr-2" />
                    Solicitar Adopción
                </h3>
                <button class="text-white/80 hover:text-white transition-colors" @click="closeAdoptionModal">
                    <Icon name="heroicons:x-mark" class="w-6 h-6" />
                </button>
            </div>
            
            <div class="p-6">
                <div class="mb-4 bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100 flex items-start">
                    <Icon name="heroicons:information-circle" class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>Estás enviando una solicitud para adoptar a <strong>{{ pet.name }}</strong>. El dueño recibirá tu perfil y contactará contigo si es compatible.</p>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mensaje para el dueño</label>
                        <textarea 
                            v-model="adoptionMessage" 
                            rows="4" 
                            class="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 placeholder-gray-400"
                            placeholder="Cuéntale por qué quieres adoptar a esta mascota, tu experiencia previa, dónde vivirá, etc."
                        />
                    </div>
                </div>

                <div class="mt-6 flex gap-3 justify-end">
                    <button class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors" @click="closeAdoptionModal">
                        Cancelar
                    </button>
                    <button class="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200 transition-transform active:scale-95 flex items-center" @click="submitAdoption">
                        <Icon name="heroicons:paper-airplane" class="w-5 h-5 mr-2" />
                        Enviar Solicitud
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" @click="closeImageModal">
        <button class="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
        <img :src="modalImage" class="max-w-full max-h-[85vh] object-contain rounded-lg" @click.stop >
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdoptions } from '~/composables/useAdoptions'

// Props & Route
const route = useRoute()
const router = useRouter()
const petId = route.params.id

// Composables
const { fetchPetById, isPetFavorite, addFavorite, removeFavorite } = usePets()
const { getAdoptionByPetAndUser, fetchAdoptionsForOwner, createAdoptionRequest } = useAdoptions()
const { user, isAuthenticated } = useAuth()
const { isFeatureEnabled } = useFeatures()

// State
const pet = ref(null)
const loading = ref(true)
const error = ref(null)
const currentPhoto = ref(null)
const showImageModal = ref(false)
const modalImage = ref('')
const adoptionStatus = ref(null) // 'pending', 'approved', 'rejected', 'none'
const isFavorite = ref(false)
const ownerAdoptions = ref([])
const loadingOwnerAdoptions = ref(false)
const showAdoptionModal = ref(false)
const adoptionMessage = ref('')

// Features
const favoritesEnabled = isFeatureEnabled('favorites')
const adoptionEnabled = isFeatureEnabled('adoption')

// Computed
const isOwner = computed(() => {
    return isAuthenticated.value && user.value && pet.value && pet.value.userId === user.value.uid
})

const canAdopt = computed(() => {
    return isAuthenticated.value && !isOwner.value && adoptionEnabled
})

const hasApplied = computed(() => {
    return adoptionStatus.value && adoptionStatus.value !== 'none'
})

const shouldShowContact = computed(() => {
    return (
        isOwner.value || 
        pet.value?.status === 'adopted' || 
        adoptionStatus.value === 'approved' // Removed pending per typical privacy rules
    )
})

const hasAdoptionRequirements = computed(() => {
    return pet.value && (pet.value.adoptionRequirements || pet.value.requiresContract || pet.value.adoptionFee > 0)
})

const ownerAdoptionCount = computed(() => ownerAdoptions.value.length)

// Life Cycle
onMounted(async () => {
    try {
        const fetchedPet = await fetchPetById(petId)
        if (!fetchedPet) {
            error.value = 'Mascota no encontrada'
            return
        }
        pet.value = fetchedPet
        
        // Check favorite
        if (isAuthenticated.value) {
            isFavorite.value = await isPetFavorite(petId, user.value.uid)
            
            // Check application status
            if (!isOwner.value) {
                const adoption = await getAdoptionByPetAndUser(petId, user.value.uid)
                adoptionStatus.value = adoption ? adoption.status : 'none'
            } else {
                // Load owner adoptions
                loadingOwnerAdoptions.value = true
                ownerAdoptions.value = await fetchAdoptionsForOwner(user.value.uid)
                // Filter specifically for this pet if the API returns all
                ownerAdoptions.value = ownerAdoptions.value.filter(a => a.petId === petId)
                loadingOwnerAdoptions.value = false
            }
        }
    } catch (e) {
        console.error(e)
        error.value = 'Error cargando la mascota: ' + e.message
    } finally {
        loading.value = false
    }
})

// Actions & Helpers
const goBack = () => router.back()
const openImageModal = (img) => {
    modalImage.value = img
    showImageModal.value = true
}
const closeImageModal = () => showImageModal.value = false

const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('es-ES') : ''
const formatType = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1) : ''
const formatSize = (s) => s // Map if needed
const getHealthLabel = (val) => {
    if(val > 80) return 'Excelente'
    if(val > 50) return 'Bueno'
    return 'Requiere Atención'
}
const getHealthColor = (val) => {
    if(val > 80) return 'bg-green-500'
    if(val > 50) return 'bg-yellow-500'
    return 'bg-red-500'
}
const getHealthColorText = (val) => {
    if(val > 80) return 'text-green-600'
    if(val > 50) return 'text-yellow-600'
    return 'text-red-600'
}
const formatContactType = (t) => t === 'organization' ? 'Organización / Refugio' : 'Particular'

// Action Buttons
const openAdoptionModal = () => {
    if (!isAuthenticated.value) {
        router.push('/login?redirect=' + route.fullPath)
        return
    }
    showAdoptionModal.value = true
}

const closeAdoptionModal = () => {
    showAdoptionModal.value = false
    adoptionMessage.value = ''
}

const submitAdoption = async () => {
    if (!adoptionMessage.value.trim()) {
        alert('Por favor escribe un mensaje para el dueño')
        return
    }
    
    try {
        const success = await createAdoptionRequest(petId, user.value.uid, adoptionMessage.value)
        if (success) {
            adoptionStatus.value = 'pending'
            closeAdoptionModal()
            // Show success toast or alert
            alert('¡Solicitud enviada con éxito!')
        }
    } catch (e) {
        console.error(e)
        alert('Error al enviar la solicitud')
    }
}

const toggleFavorite = async () => {
    if(!isAuthenticated.value) return router.push('/login')
    
    try {
        if (isFavorite.value) {
            await removeFavorite(petId, user.value.uid)
            isFavorite.value = false
        } else {
            await addFavorite(petId, user.value.uid)
            isFavorite.value = true
        }
    } catch (e) {
        console.error(e)
    }
}

const sharePet = () => {
    if (navigator.share) {
        navigator.share({
            title: `Adopta a ${pet.value.name}`,
            text: `Mira esta mascota en AdoptaZulia: ${pet.value.name}`,
            url: window.location.href,
        })
    } else {
        navigator.clipboard.writeText(window.location.href)
        alert('Enlace copiado!')
    }
}

const contactWhatsapp = () => {
    const phone = pet.value.contact.phone.replace(/\D/g, '')
    const text = `Hola, estoy interesado en adoptar a ${pet.value.name} que vi en AdoptaZulia.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
}

const contactOwner = () => {
    // Logic to reveal contact or scroll to section
    const contactSection = document.querySelector('.sticky') || document.querySelector('.lg\\:col-span-1')
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
    }
}

const viewUserAdoption = () => {
    // View my application
    // Logic to find adoption ID and navigate? 
    // For now we assume we just show status
    alert('Ya has enviado una solicitud. Estado: ' + (adoptionStatus.value === 'pending' ? 'Pendiente' : adoptionStatus.value))
}

const viewAdoptionRequests = () => {
    router.push(`/adopciones/${petId}`)
}

const editPet = () => {
    router.push(`/publicar/editar/${petId}`)
}
const deletePet = async () => {
    if(!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return
    // Delete logic from usePets
    // await deletePet(petId)
    // router.push('/mascotas')
}

</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>