<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto max-w-6xl px-4">
      
      <!-- Loading & Error States -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>

      <div v-else-if="error || !userProfile" class="flex flex-col items-center justify-center py-20 text-center">
         <Icon name="heroicons:user-minus" class="w-16 h-16 text-gray-300 mb-4" />
         <h2 class="text-xl font-bold text-gray-900">Usuario no encontrado</h2>
         <p class="text-gray-500 mb-6">El perfil que buscas no existe o ha sido desactivado.</p>
         <NuxtLink to="/" class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Volver al inicio</NuxtLink>
      </div>

      <div v-else>
         <!-- Profile Header Card -->
         <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <!-- Cover Photo (Placeholder pattern or custom if we had it) -->
            <div class="h-48 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
                <div v-if="isOwnProfile" class="absolute top-4 right-4">
                    <NuxtLink to="/perfil/configuracion" class="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium text-sm transition-colors border border-white/30">
                        <Icon name="heroicons:pencil-square" class="w-4 h-4 mr-2" />
                        Editar Perfil
                    </NuxtLink>
                </div>
            </div>

            <div class="px-8 pb-8 relative">
                <!-- Avatar -->
                <div class="absolute -top-16 left-8 md:left-12">
                     <div class="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center bg-gray-50">
                        <NuxtImg 
                          v-if="userProfile.photoURL" 
                          :src="userProfile.photoURL" 
                          class="w-full h-full object-cover"
                        />
                        <span v-else class="text-4xl font-bold text-emerald-600">
                           {{ userProfile.displayName?.charAt(0).toUpperCase() || 'U' }}
                        </span>
                     </div>
                </div>

                <!-- Info Grid -->
                <div class="mt-20 md:mt-4 md:ml-40 flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">{{ userProfile.displayName }}</h1>
                        <p class="text-emerald-600 font-medium">@{{ username }}</p>
                        
                        <div v-if="userProfile.bio" class="mt-4 max-w-2xl">
                             <p class="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{{ userProfile.bio }}</p>
                        </div>
                        
                        <div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                             <div class="flex items-center">
                                 <Icon name="heroicons:calendar" class="w-4 h-4 mr-1.5 text-gray-400" />
                                 Se unió en {{ formatDate(userProfile.createdAt) }}
                             </div>
                             <!-- Only show contact info if strictly necessary or requested, privacy first -->
                             <div v-if="userProfile.phoneNumber && isOwnProfile" class="flex items-center">
                                 <Icon name="heroicons:phone" class="w-4 h-4 mr-1.5 text-gray-400" />
                                 {{ userProfile.phoneNumber }}
                             </div>
                        </div>
                    </div>

                    <!-- Stats Box -->
                    <div class="flex gap-4 md:gap-8 bg-gray-50 p-4 rounded-xl border border-gray-100 h-fit self-start md:self-center">
                          <div class="text-center px-2">
                              <span class="block text-xl font-bold text-gray-900">{{ userPets.length }}</span>
                              <span class="text-xs text-gray-500 font-medium uppercase">Mascotas</span>
                          </div>
                          <div class="w-px bg-gray-200" />
                          <div class="text-center px-2">
                              <span class="block text-xl font-bold text-gray-900">{{ verifiedCount }}</span>
                              <span class="text-xs text-gray-500 font-medium uppercase">Adopciones</span>
                          </div>
                          <div class="w-px bg-gray-200" />
                          <div class="text-center px-2">
                              <span class="block text-xl font-bold text-gray-900">{{ userStories.length }}</span>
                              <span class="text-xs text-gray-500 font-medium uppercase">Historias</span>
                          </div>
                    </div>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="px-8 border-t border-gray-100 flex overflow-x-auto gap-6 hide-scrollbar">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  class="py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                  :class="activeTab === tab.id ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  @click="activeTab = tab.id"
                >
                   {{ tab.label }}
                   <span class="ml-1.5 px-2 py-0.5 rounded-full text-xs" :class="activeTab === tab.id ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'">
                      {{ getTabCount(tab.id) }}
                   </span>
                </button>
            </div>
         </div>

         <!-- Tab Content -->
         <div class="min-h-[300px]">
             
             <!-- Adoptions -->
             <div v-if="activeTab === 'pets'">
                 <div v-if="userPets.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <PetCard v-for="pet in userPets" :key="pet.id" :pet="pet" />
                 </div>
                 <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
                      <Icon name="heroicons:home-modern" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p class="text-gray-500">Este usuario no tiene mascotas publicadas actualmente.</p>
                 </div>
             </div>

             <!-- Lost Pets -->
             <div v-else-if="activeTab === 'lost'">
                 <div v-if="userLostReports.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <PetCard v-for="pet in mappedUserLost" :key="pet.id" :pet="pet" />
                 </div>
                  <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
                      <Icon name="heroicons:megaphone" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p class="text-gray-500">No hay reportes de mascotas perdidas.</p>
                 </div>
             </div>

             <!-- Stories -->
             <div v-else-if="activeTab === 'stories'">
                 <div v-if="userStories.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <AdoptionStoryCard v-for="story in userStories" :key="story.id" :story="story" />
                 </div>
                  <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
                      <Icon name="heroicons:book-open" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p class="text-gray-500">Aún no ha compartido historias.</p>
                 </div>
             </div>
             
             <!-- Verified Adoptions (Only visible if > 0 or own profile) -->
              <div v-else-if="activeTab === 'adopted'">
                 <div v-if="verifiedAdoptions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div v-for="ver in verifiedAdoptions" :key="ver.id" class="bg-white rounded-xl shadow-sm overflow-hidden border border-emerald-100 group hover:shadow-md transition-shadow">
                           <div class="h-48 overflow-hidden bg-gray-100 relative">
                                <img :src="ver.pet?.imageUrl || '/placeholder.webp'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" >
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                     <span class="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">Adoptad@</span>
                                </div>
                           </div>
                           <div class="p-4">
                                <h3 class="font-bold text-gray-900 text-lg">{{ ver.pet?.name }}</h3>
                                <p class="text-sm text-gray-500 mb-3">{{ formatDateFull(ver.adoptionDate) }}</p>
                                <NuxtLink :to="`/certificados/${ver.adoptionId}`" class="block w-full text-center py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100">
                                   Ver Certificado
                                </NuxtLink>
                           </div>
                      </div>
                 </div>
                  <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
                      <Icon name="heroicons:heart" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p class="text-gray-500">No hay adopciones verificadas.</p>
                 </div>
             </div>

         </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { usePets } from '~/composables/usePets'
import { useAdoptionStories } from '~/composables/useAdoptionStories'
import { useLostPets } from '~/composables/useLostPets'
import { getDatabase, ref as dbRef, get } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'

const route = useRoute()
const username = route.params.username
const { getUserByUsername, user, isAuthenticated } = useAuth()
const { fetchUserPets } = usePets()
const { fetchUserStories } = useAdoptionStories()
const { fetchUserLostPets } = useLostPets()

// State
const loading = ref(true)
const error = ref(null)
const userProfile = ref(null)
const userPets = ref([])
const userLostReports = ref([])
const userStories = ref([])
const verifiedAdoptions = ref([])
const activeTab = ref('pets')

// Computed
const isOwnProfile = computed(() => isAuthenticated.value && user.value?.uid === userProfile.value?.uid)
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
const tabs = computed(() => [
    { id: 'pets', label: 'En Adopción' },
    { id: 'lost', label: 'Reportes Perdidos' },
    { id: 'stories', label: 'Historias' },
    { id: 'adopted', label: 'Adoptados' },
])

const getTabCount = (id) => {
    switch(id) {
        case 'pets': return userPets.value.length
        case 'lost': return userLostReports.value.length
        case 'stories': return userStories.value.length
        case 'adopted': return verifiedAdoptions.value.length
        default: return 0
    }
}

// Helpers
const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : ''
const formatDateFull = (ts) => ts ? new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

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
            // Parallel fetch for efficiency
            const [pets, lost, stories] = await Promise.all([
                fetchUserPets(uid),
                fetchUserLostPets(uid),
                fetchUserStories(uid)
            ])
            
            userPets.value = pets || []
            userLostReports.value = lost || []
            userStories.value = stories || []
            
            // Should add a function to fetch verified adoptions for public profile
            // For now, mocking empty or implementing simple logic
             const db = getDatabase(useFirebaseApp())
             const userVerSnap = await get(dbRef(db, `users/${uid}/verifiedAdoptions`))
             if (userVerSnap.exists()) {
                 const vIds = Object.keys(userVerSnap.val())
                 // Fetch details... simplified
             }
        }
        
    } catch (e) {
        console.error(e)
        error.value = e.message
    } finally {
        loading.value = false
    }
})

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
