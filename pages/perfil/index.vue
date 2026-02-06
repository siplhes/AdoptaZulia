<template>
  <div class="min-h-screen bg-amber-50 py-12">
    <div class="container mx-auto max-w-6xl px-4">
      
      <!-- Welcome Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 class="text-3xl font-bold text-emerald-800">Mi Panel</h1>
           <p class="text-gray-600">Bienvenido de nuevo, {{ userProfile?.displayName || 'Usuario' }}</p>
        </div>
        <div class="flex gap-3">
            <NuxtLink to="/perfil/configuracion" class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
                <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 mr-2 text-gray-500" />
                Configuración
            </NuxtLink>
            <button @click="handleLogout" class="inline-flex items-center px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 shadow-sm transition-colors">
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 mr-2" />
                Salir
            </button>
        </div>
      </div>

      <div v-if="loading" class="py-20 flex justify-center">
          <div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <!-- Sidebar: Profile Summary & Stats -->
          <div class="lg:col-span-1 space-y-6">
              <!-- Profile Card -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                  <div class="w-24 h-24 rounded-full bg-emerald-100 mb-4 overflow-hidden border-4 border-emerald-50">
                      <NuxtImg 
                        v-if="userProfile?.photoURL" 
                        :src="userProfile.photoURL" 
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center text-emerald-600 text-3xl font-bold">
                          {{ userProfile?.displayName?.charAt(0).toUpperCase() || 'U' }}
                      </div>
                  </div>
                  <h2 class="text-xl font-bold text-gray-900 text-center">{{ userProfile?.displayName }}</h2>
                  <p class="text-sm text-gray-500 mb-4">{{ userProfile?.email }}</p>
                  
                  <div class="w-full border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
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
               <div class="bg-emerald-800 rounded-xl shadow-sm p-6 text-white">
                  <h3 class="font-semibold mb-4 opacity-90">Tu Impacto</h3>
                  <div class="space-y-4">
                      <div class="flex items-center justify-between">
                          <span class="text-emerald-100">Adopciones</span>
                          <span class="text-2xl font-bold">{{ verifiedAdoptions.length }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                          <span class="text-emerald-100">Mascotas Publicadas</span>
                          <span class="text-2xl font-bold">{{ petAdoptions.length }}</span> <!-- Adjusted logic for count -->
                      </div>
                  </div>
               </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3 space-y-8">
              
              <!-- Adoption Requests Section -->
              <section>
                  <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Icon name="heroicons:inbox-arrow-down" class="w-6 h-6 mr-2 text-emerald-600" />
                      Solicitudes Recibidas
                  </h3>
                  
                  <div v-if="loadingAdoptions" class="bg-white rounded-xl shadow-sm p-8 flex justify-center">
                      <span class="text-gray-500">Cargando solicitudes...</span>
                  </div>

                  <div v-else-if="petAdoptions.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Icon name="heroicons:inbox" class="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 class="text-gray-900 font-medium">No hay solicitudes pendientes</h4>
                      <p class="text-gray-500 text-sm mt-1">Cuando alguien quiera adoptar una de tus mascotas, aparecerá aquí.</p>
                  </div>

                  <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th class="px-6 py-4">Mascota</th>
                                    <th class="px-6 py-4">Solicitante</th>
                                    <th class="px-6 py-4">Fecha</th>
                                    <th class="px-6 py-4">Estado</th>
                                    <th class="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="adoption in petAdoptions" :key="adoption.id" class="hover:bg-gray-50/50">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center">
                                            <NuxtImg :src="adoption.pet?.imageUrl || '/placeholder.webp'" class="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-200" />
                                            <span class="font-medium text-gray-900">{{ adoption.pet?.name || 'Mascota' }}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex flex-col">
                                            <span class="text-gray-900">{{ adoption.user?.name || 'Usuario' }}</span>
                                            <span class="text-gray-500 text-xs">{{ adoption.user?.email }}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-gray-500">{{ formatDate(adoption.createdAt) }}</td>
                                    <td class="px-6 py-4">
                                        <span :class="statusBadge(adoption.status)">
                                            {{ statusLabel(adoption.status) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button @click="viewAdoptionDetails(adoption)" class="text-emerald-600 hover:text-emerald-800 font-medium text-sm">
                                            Gestionar
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                      </div>
                  </div>
              </section>

              <!-- My Lost Reports -->
              <section v-if="userLostReports.length > 0">
                  <div class="flex items-center justify-between mb-4">
                      <h3 class="text-xl font-bold text-gray-900 flex items-center">
                          <Icon name="heroicons:megaphone" class="w-6 h-6 mr-2 text-amber-600" />
                          Mis Reportes de Extravío
                      </h3>
                      <NuxtLink to="/perdidas/crear" class="text-emerald-600 text-sm font-medium hover:underline">Nuevo reporte</NuxtLink>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <PetCard v-for="pet in mappedUserLost" :key="pet.id" :pet="pet" />
                  </div>
              </section>

              <!-- Verified Adoptions (My Pets) -->
              <section v-if="verifiedAdoptions.length > 0">
                   <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Icon name="heroicons:heart" class="w-6 h-6 mr-2 text-rose-500" />
                      Mascotas Adoptadas
                  </h3>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div v-for="ver in verifiedAdoptions" :key="ver.id" class="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex items-center justify-between">
                           <div class="flex items-center">
                               <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mr-4">
                                  <Icon name="heroicons:check-badge" class="w-6 h-6" />
                               </div>
                               <div>
                                   <h4 class="font-bold text-gray-900">{{ ver.pet?.name || 'Mascota' }}</h4>
                                   <p class="text-xs text-emerald-600">Adopción Verificada</p>
                               </div>
                           </div>
                           <NuxtLink :to="`/certificados/${ver.adoptionId}`" class="text-gray-400 hover:text-emerald-600">
                               <Icon name="heroicons:document-text" class="w-6 h-6" />
                           </NuxtLink>
                       </div>
                   </div>
              </section>

          </div>
      </div>
      
       <!-- Adoption Detail Modal -->
       <div v-if="selectedAdoption" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-lg text-gray-900">Detalle de Solicitud</h3>
                <button @click="selectedAdoption = null" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <Icon name="heroicons:x-mark" class="w-6 h-6" />
                </button>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto">
                 <div class="flex gap-6 mb-6">
                     <div class="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                         <img :src="selectedAdoption.pet?.imageUrl" class="w-full h-full object-cover" />
                     </div>
                     <div>
                         <h4 class="text-xl font-bold text-gray-900">{{ selectedAdoption.pet?.name }}</h4>
                         <p class="text-gray-500 text-sm">{{ selectedAdoption.pet?.breed }}</p>
                         <div class="mt-2 text-sm px-2 py-1 bg-gray-100 rounded inline-block">
                             Solicitante: <span class="font-medium">{{ selectedAdoption.user?.name }}</span>
                         </div>
                     </div>
                 </div>

                 <div class="bg-gray-50 p-4 rounded-xl mb-6">
                     <h5 class="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Mensaje del Solicitante</h5>
                     <p class="text-gray-600 text-sm leading-relaxed">{{ selectedAdoption.message || 'Sin mensaje adjunto.' }}</p>
                 </div>
                 
                 <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                     <div class="p-3 border rounded-lg">
                         <span class="block text-gray-500 text-xs">Email</span>
                         <span class="font-medium">{{ selectedAdoption.user?.email }}</span>
                     </div>
                     <div class="p-3 border rounded-lg">
                         <span class="block text-gray-500 text-xs">Teléfono</span>
                         <span class="font-medium">{{ selectedAdoption.user?.phone || 'No especificado' }}</span>
                     </div>
                 </div>
                 
                 <!-- Notes Section -->
                 <div class="mt-4">
                     <label class="block text-sm font-medium text-gray-700 mb-2">Notas Privadas</label>
                     <textarea v-model="adminNotes" class="w-full rounded-lg border-gray-300 text-sm" rows="2" placeholder="Notas internas sobre esta solicitud..."></textarea>
                 </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <button @click="saveNotes" class="text-sm text-emerald-600 font-medium hover:underline">Guardar nota</button>
                
                <div class="flex gap-3" v-if="selectedAdoption.status === 'pending'">
                    <button @click="rejectAdoption(selectedAdoption)" class="px-4 py-2 text-red-600 bg-white border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50">
                        Rechazar
                    </button>
                    <button @click="approveAdoption(selectedAdoption)" class="px-4 py-2 text-white bg-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200">
                        Aprobar Solicitud
                    </button>
                </div>
                 <div v-else class="text-sm text-gray-500 italic">
                     Esta solicitud está <strong>{{ statusLabel(selectedAdoption.status) }}</strong>
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
import { getDatabase, ref as dbRef, get } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import PetCard from '~/components/PetCard.vue'

const router = useRouter()
const { user, userProfile, isAuthenticated, logout } = useAuth()
const { fetchUserLostPets } = useLostPets()

// State
const loading = ref(true)
const loadingAdoptions = ref(true)
const petAdoptions = ref([])
const verifiedAdoptions = ref([])
const userLostReports = ref([])
const selectedAdoption = ref(null)
const adminNotes = ref('')

// Helpers
const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('es-ES') : '—'

const statusBadge = (s) => {
    switch(s) {
        case 'pending': return 'bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold'
        case 'approved': return 'bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold'
        case 'rejected': return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold'
        default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold'
    }
}
const statusLabel = (s) => {
    const map = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada', completed: 'Completada' }
    return map[s] || s
}

// Data Fetching
onMounted(async () => {
    if (!isAuthenticated.value) {
        router.push('/login')
        return
    }

    const db = getDatabase(useFirebaseApp())
    
    try {
        // 1. Fetch User Lost Pets
        const lost = await fetchUserLostPets(user.value.uid)
        userLostReports.value = lost || []

        // 2. Fetch Verified Adoptions (simple mock logic based on previous code)
        // In a real app this would query specific verified adoptions
        // For now we skip extensive logic to keep it simple as per previous file
        
        // 3. Fetch Received Adoptions (Mock for UI if no backend, but preserved structure)
        // Here we would fetch adoptions WHERE petOwnerId == user.uid
        loadingAdoptions.value = false

    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
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
const saveNotes = () => { /* Logic to save notes to firebase */ selectedAdoption.value = null }
const approveAdoption = (a) => { /* Update status to approved */ a.status = 'approved'; selectedAdoption.value = null }
const rejectAdoption = (a) => { /* Update status to rejected */ a.status = 'rejected'; selectedAdoption.value = null }

</script>
