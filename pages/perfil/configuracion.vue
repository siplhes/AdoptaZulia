<template>
  <div class="min-h-screen bg-amber-50 py-12">
    <div class="container mx-auto max-w-4xl px-4">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
           <h1 class="text-3xl font-bold text-emerald-800">Configuración de Perfil</h1>
           <p class="text-gray-600 mt-1">Administra tu información personal y preferencias.</p>
        </div>
        <NuxtLink to="/perfil" class="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
            <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-1" />
            Volver
        </NuxtLink>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <!-- Loading State -->
        <div v-if="loading" class="p-12 flex justify-center">
           <div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>

        <div v-else class="flex flex-col md:flex-row">
            <!-- Sidebar / Photo Section -->
            <div class="md:w-1/3 border-r border-gray-100 bg-gray-50 p-6 md:p-8 flex flex-col items-center">
                <div class="relative group mb-6">
                    <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-emerald-100 flex items-center justify-center">
                         <NuxtImg
                            v-if="photoPreview || profileData.photoURL"
                            :src="photoPreview || profileData.photoURL"
                            class="w-full h-full object-cover"
                            fit="cover"
                         />
                         <span v-else class="text-4xl text-emerald-600 font-bold">
                            {{ profileData.displayName?.charAt(0).toUpperCase() || 'U' }}
                         </span>
                    </div>
                    
                    <!-- Edit Overlay -->
                    <label class="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Icon name="heroicons:camera" class="w-8 h-8" />
                        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handlePhotoChange" />
                    </label>
                </div>
                
                <h2 class="text-lg font-bold text-gray-900 text-center">{{ profileData.displayName || 'Usuario' }}</h2>
                <p class="text-sm text-gray-500 mb-6">@{{ profileData.userName || 'username' }}</p>

                <div class="w-full space-y-3">
                   <button 
                     @click="$refs.fileInput.click()"
                     type="button" 
                     class="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                   >
                     Cambiar foto
                   </button>
                   <button 
                     v-if="profileData.photoURL || photoPreview"
                     @click="removePhoto"
                     type="button" 
                     class="w-full py-2 px-4 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                   >
                     Eliminar foto
                   </button>
                </div>

                 <p v-if="photoError" class="mt-3 text-xs text-red-600 text-center">{{ photoError }}</p>
                 <p class="mt-2 text-xs text-center text-gray-400">JPG, PNG máx 2MB</p>

            </div>

            <!-- Main Form Section -->
            <div class="md:w-2/3 p-6 md:p-8">
               <form @submit.prevent="saveChanges" class="space-y-6">
                  
                  <!-- Success Banner -->
                   <div v-if="successMessage" class="bg-green-50 text-green-700 p-4 rounded-lg flex items-center text-sm border border-green-100">
                      <Icon name="heroicons:check-circle" class="w-5 h-5 mr-2 text-green-500" />
                      {{ successMessage }}
                   </div>
                   <!-- Error Banner -->
                   <div v-if="error" class="bg-red-50 text-red-700 p-4 rounded-lg flex items-center text-sm border border-red-100">
                      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 mr-2 text-red-500" />
                      {{ error }}
                   </div>

                   <!-- Basic Info Grid -->
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div class="col-span-2 md:col-span-2">
                           <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                           <input 
                             v-model="profileData.displayName"
                             type="text" 
                             class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                             placeholder="Tu nombre legal"
                           />
                       </div>

                       <div>
                           <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                           <div class="relative">
                               <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">@</span>
                               <input 
                                 v-model="profileData.userName"
                                 type="text" 
                                 class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5 pl-8"
                                 placeholder="username"
                               />
                           </div>
                       </div>
                       
                        <div>
                           <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                           <input 
                             v-model="profileData.phoneNumber"
                             type="tel" 
                             class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                             placeholder="+58 412 1234567"
                           />
                       </div>

                       <div class="col-span-2">
                           <label class="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                           <textarea 
                             v-model="profileData.bio"
                             rows="3" 
                             class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                             placeholder="Cuenta algo sobre ti y tus mascotas..."
                           ></textarea>
                           <p class="text-xs text-gray-500 text-right mt-1">{{ profileData.bio ? profileData.bio.length : 0 }}/500</p>
                       </div>

                       <div class="col-span-2">
                           <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-xs font-normal text-gray-500">(No modificable)</span></label>
                           <input 
                             :value="profileData.email"
                             type="email" 
                             disabled
                             class="w-full rounded-lg border-gray-200 bg-gray-50 text-gray-500 shadow-sm py-2.5 cursor-not-allowed"
                           />
                       </div>
                   </div>

                   <hr class="border-gray-100" />

                   <!-- Notifications -->
                   <div>
                       <h3 class="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
                       <div class="space-y-3">
                           <label class="flex items-center space-x-3 cursor-pointer">
                               <input v-model="profileData.preferences.emailNotifications" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                               <span class="text-gray-700">Recibir correos electrónicos</span>
                           </label>
                           <label class="flex items-center space-x-3 cursor-pointer">
                               <input v-model="profileData.preferences.newPets" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                               <span class="text-gray-700">Avisos de nuevas mascotas</span>
                           </label>
                           <label class="flex items-center space-x-3 cursor-pointer">
                               <input v-model="profileData.preferences.adoptionUpdates" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                               <span class="text-gray-700">Actualizaciones de mis adopciones</span>
                           </label>
                       </div>
                   </div>

                   <div class="pt-4 flex items-center justify-end space-x-4">
                       <button type="button" @click="cancel" class="text-gray-600 hover:text-gray-900 font-medium px-4">Cancelar</button>
                       <LoadingButton 
                         type="submit" 
                         variant="primary" 
                         :loading="isSaving" 
                         loadingLabel="Guardando..."
                         class="px-8"
                       >
                         Guardar Cambios
                       </LoadingButton>
                   </div>

               </form>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useS3 } from '~/composables/useS3'
import LoadingButton from '~/components/ui/LoadingButton.vue'

const router = useRouter()
const { user, userProfile, updateProfile, isAuthenticated } = useAuth()
const { uploadFile } = useS3()

// State
const loading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const successMessage = ref(null)
const photoPreview = ref(null)
const photoError = ref(null)
const fileInput = ref(null)
const photoFile = ref(null)

const profileData = reactive({
  displayName: '',
  userName: '',
  email: '',
  phoneNumber: '',
  bio: '',
  photoURL: '',
  preferences: {
    emailNotifications: true,
    newPets: true,
    adoptionUpdates: true,
  },
})

// Initialize
onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  try {
     if (userProfile.value) {
        Object.assign(profileData, {
           displayName: userProfile.value.displayName || '',
           userName: userProfile.value.userName || '',
           email: userProfile.value.email || '',
           phoneNumber: userProfile.value.phoneNumber || '',
           bio: userProfile.value.bio || '',
           photoURL: userProfile.value.photoURL || '',
           preferences: { ...profileData.preferences, ...(userProfile.value.preferences || {}) }
        })
     }
  } catch (e) {
     error.value = 'Error cargando datos del perfil.'
  } finally {
     loading.value = false
  }
})

// Photo Logic
const handlePhotoChange = (e) => {
   const file = e.target.files[0]
   if (!file) return
   
   if (!['image/jpeg', 'image/png'].includes(file.type)) {
      photoError.value = 'Formato no válido (Solo JPG/PNG)'
      return
   }
   if (file.size > 2 * 1024 * 1024) {
      photoError.value = 'La imagen excede 2MB'
      return
   }
   
   photoError.value = null
   photoFile.value = file
   
   const reader = new FileReader()
   reader.onload = (ev) => photoPreview.value = ev.target.result
   reader.readAsDataURL(file)
}

const removePhoto = () => {
    photoPreview.value = null
    photoFile.value = null
    profileData.photoURL = ''
    if(fileInput.value) fileInput.value.value = ''
}

// Actions
const cancel = () => router.back()

const saveChanges = async () => {
    isSaving.value = true
    error.value = null
    successMessage.value = null
    
    try {
        let currentPhotoURL = profileData.photoURL
        
        if (photoFile.value) {
            currentPhotoURL = await uploadFile(photoFile.value, 'profile-photos', `profile_${user.value.uid}_${Date.now()}.jpg`)
        }
        
        await updateProfile(
            profileData.displayName,
            currentPhotoURL,
            profileData.bio,
            profileData.phoneNumber,
            profileData.userName
        )
        
        // Update local state if needed for immediate feedback logic
        profileData.photoURL = currentPhotoURL
        photoFile.value = null
        photoPreview.value = null
        
        successMessage.value = '¡Perfil actualizado correctamente!'
        
    } catch (e) {
        console.error(e)
        error.value = 'No se pudieron guardar los cambios.'
    } finally {
        isSaving.value = false
    }
}
</script>
