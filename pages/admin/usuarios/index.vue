<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Gestión de Usuarios</h1>
          <p class="text-slate-600">Administra usuarios, permisos y roles de la plataforma</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin"
            class="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition-colors hover:bg-white hover:text-emerald-600"
          >
            Volver al panel
          </NuxtLink>
          <button
            class="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white transition-colors hover:bg-emerald-700 shadow-sm"
            @click="openCreateUserModal"
          >
            <Icon name="heroicons:plus" class="h-5 w-5" />
            Añadir Usuario
          </button>
        </div>
      </div>

      <!-- Filters & Stats -->
      <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
         <!-- Search -->
        <div class="lg:col-span-2">
            <div class="relative">
                <Icon
                    name="heroicons:magnifying-glass"
                    class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                >
            </div>
        </div>
        
        <!-- Role Filter -->
         <div>
            <select
              v-model="filters.role"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            >
              <option value="">Todos los Roles</option>
              <option value="admin">🛡️ Administrador</option>
              <option value="user">👤 Usuario</option>
              <option value="volunteer">🤝 Voluntario</option>
              <option value="shelter">🏠 Refugio</option>
            </select>
         </div>

         <!-- Status Filter -->
         <div>
            <select
              v-model="filters.status"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            >
              <option value="">Todos los Estados</option>
              <option value="active">✅ Activo</option>
              <option value="inactive">💤 Inactivo</option>
              <option value="suspended">🚫 Suspendido</option>
            </select>
         </div>
      </div>

      <!-- Loading & Error States -->
      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
             <Icon name="heroicons:exclamation-circle" class="mx-auto h-12 w-12 text-red-400 mb-2" />
             <h3 class="text-lg font-bold text-red-900">Error al cargar usuarios</h3>
             <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredUsers.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm border border-slate-100"
      >
        <div class="mb-4 rounded-full bg-slate-50 p-4">
            <Icon name="heroicons:users" class="h-10 w-10 text-slate-400" />
        </div>
        <h3 class="text-lg font-medium text-slate-800">No hay usuarios</h3>
        <p class="mt-1 text-slate-500">No se encontraron resultados con los filtros actuales.</p>
        <button
            class="mt-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200"
            @click="resetFilters"
        >
            Limpiar filtros
        </button>
      </div>

      <!-- Users Grid -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
            v-for="user in paginatedUsers"
            :key="user.id"
            class="group relative flex flex-col rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md"
        >
            <!-- User Header -->
            <div class="mb-4 flex items-center gap-4">
                <div class="relative h-14 w-14 flex-shrink-0">
                    <NuxtImg
                        v-if="user.photoURL"
                        :src="user.photoURL"
                        class="h-14 w-14 rounded-full object-cover shadow-sm"
                        alt="Avatar"
                        @error="handleImageError"
                    />
                     <div
                        v-else
                        class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500"
                    >
                        {{ getInitials(user.displayName || user.email) }}
                    </div>
                     <!-- Status Dot -->
                    <span 
                        :class="[
                            'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white',
                            user.status === 'active' ? 'bg-green-500' : user.status === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
                        ]"
                    />
                </div>
                <div class="min-w-0 flex-1">
                    <h3 class="truncate text-base font-bold text-slate-900">{{ user.displayName || 'Sin Nombre' }}</h3>
                    <p class="truncate text-xs text-slate-500">{{ user.email }}</p>
                </div>
            </div>

            <!-- Role Badge & Info -->
            <div class="mb-4 flex items-center justify-between">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-bold border', getRoleClass(user.role)]">
                    {{ getRoleLabel(user.role) }}
                </span>
                <span class="text-xs text-slate-400">
                     {{ formatDate(user.createdAt) }}
                </span>
            </div>
            
            <div class="my-auto"></div> <!-- Spacer to push actions down -->

            <!-- Actions -->
             <div class="mt-4 flex gap-2 border-t border-slate-50 pt-4">
                <button 
                    @click="editUser(user)"
                    class="flex-1 rounded-lg bg-slate-50 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                    Editar
                </button>
             </div>
              <!-- Alternative Actions Layout -->
             <div class="mt-2 grid grid-cols-2 gap-2">
                 <button 
                    v-if="user.status !== 'suspended'"
                    @click="confirmSuspendUser(user)"
                    class="rounded-lg border border-amber-100 bg-amber-50 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                 >
                    Suspender
                 </button>
                  <button 
                    v-else
                    @click="reactivateUser(user)"
                    class="rounded-lg border border-blue-100 bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                 >
                    Reactivar
                 </button>
                 
                 <button 
                    @click="confirmDeleteUser(user)"
                    class="rounded-lg border border-red-100 bg-red-50 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                 >
                    Eliminar
                 </button>
             </div>
        </div>
      </div>

       <!-- Pagination -->
       <div v-if="filteredUsers.length > 0" class="mt-8 flex justify-center">
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                 <button
                    :disabled="currentPage === 1"
                    :class="[
                      'relative inline-flex items-center rounded-l-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50',
                      currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                    ]"
                    @click="prevPage"
                  >
                    <Icon name="heroicons:chevron-left" class="h-5 w-5" />
                  </button>
                  <span class="relative inline-flex items-center border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    {{ currentPage }} / {{ totalPages }}
                  </span>
                   <button
                    :disabled="currentPage === totalPages"
                    :class="[
                      'relative inline-flex items-center rounded-r-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50',
                      currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
                    ]"
                    @click="nextPage"
                  >
                    <Icon name="heroicons:chevron-right" class="h-5 w-5" />
                  </button>
            </nav>
       </div>

      <!-- Edit User Modal -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm transition-opacity"
        @click.self="closeEditModal"
      >
        <div class="h-full w-full max-w-md bg-white p-6 shadow-2xl transition-transform sm:border-l sm:border-slate-100 overflow-y-auto">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-800">
              {{ selectedUser ? 'Editar Perfil' : 'Nuevo Usuario' }}
            </h3>
            <button class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" @click="closeEditModal">
              <Icon name="heroicons:x-mark" class="h-6 w-6" />
            </button>
          </div>

          <div class="space-y-4">
             <!-- Form Fields with better styling -->
            <div>
              <label class="mb-1 block text-sm font-bold text-slate-700">Nombre Completo</label>
              <input
                v-model="userForm.displayName"
                type="text"
                class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-all font-medium"
                placeholder="Ej. Juan Pérez"
              >
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-slate-700">Correo Electrónico</label>
              <input
                v-model="userForm.email"
                type="email"
                class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-all font-medium disabled:opacity-60"
                placeholder="correo@ejemplo.com"
                :disabled="!!selectedUser"
              >
            </div>
            
             <div v-if="!selectedUser">
              <label class="mb-1 block text-sm font-bold text-slate-700">Contraseña</label>
              <input
                v-model="userForm.password"
                type="password"
                class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-all font-medium"
                placeholder="••••••••"
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1 block text-sm font-bold text-slate-700">Rol</label>
                    <select
                        v-model="userForm.role"
                         class="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-3 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-all font-medium text-sm"
                    >
                        <option value="user">Usuario</option>
                        <option value="volunteer">Voluntario</option>
                        <option value="shelter">Refugio</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                 <div>
                    <label class="mb-1 block text-sm font-bold text-slate-700">Estado</label>
                    <select
                        v-model="userForm.status"
                         class="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-3 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-all font-medium text-sm"
                    >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="suspended">Suspendido</option>
                    </select>
                </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-slate-700">Teléfono</label>
              <input
                v-model="userForm.phone"
                type="tel"
                class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-all font-medium"
                placeholder="+58 414 ..."
              >
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-slate-700">Dirección</label>
              <textarea
                v-model="userForm.address"
                rows="3"
                class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 transition-all font-medium"
                placeholder="Ciudad, Estado..."
              />
            </div>
          </div>

          <div class="mt-8 flex justify-end space-x-3 border-t border-slate-100 pt-6">
            <button
              class="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              @click="closeEditModal"
            >
              Cancelar
            </button>
            <button
              class="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition-colors"
              @click="saveUser"
            >
              Guardar usuario
            </button>
          </div>
        </div>
      </div>

       <!-- Modal Alert reused -->
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
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useUsers } from '~/composables/useUsers'
import ModalAlert from '~/components/common/ModalAlert.vue'

definePageMeta({
  middleware: ['admin'],
  layout: 'default'
})

const {
  users: allUsers,
  loading,
  error,
  fetchAllUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} = useUsers()

const searchQuery = ref('')
const filters = ref({
  role: '',
  status: '',
})

const currentPage = ref(1)
const pageSize = 12

const showEditModal = ref(false)
const selectedUser = ref(null)
const userForm = ref({
  displayName: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
  phone: '',
  address: '',
})

const showModal = ref(false)
const modalType = ref('')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('')
let confirmAction = () => {}

const loadUsers = async () => {
  try {
    await fetchAllUsers()
  } catch (err) {
    console.error('Error loading users:', err)
  }
}

const filteredUsers = computed(() => {
  if (!allUsers.value) return []
  
  return allUsers.value.filter((user) => {
    const searchMatch = searchQuery.value
      ? user.displayName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true

    const roleMatch = filters.value.role ? user.role === filters.value.role : true
    const statusMatch = filters.value.status ? user.status === filters.value.status : true

    return searchMatch && roleMatch && statusMatch
  })
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize)
const paginationEnd = computed(() => Math.min(paginationStart.value + pageSize, filteredUsers.value.length))
const paginatedUsers = computed(() => filteredUsers.value.slice(paginationStart.value, paginationEnd.value))

const resetFilters = () => {
  searchQuery.value = ''
  filters.value = { role: '', status: '' }
  currentPage.value = 1
}

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

const openCreateUserModal = () => {
  selectedUser.value = null
  userForm.value = { displayName: '', email: '', password: '', role: 'user', status: 'active', phone: '', address: '' }
  showEditModal.value = true
}

const editUser = (user) => {
  selectedUser.value = user
  userForm.value = {
    displayName: user.displayName || '',
    email: user.email || '',
    role: user.role || 'user',
    status: user.status || 'active',
    phone: user.phone || '',
    address: user.address || '',
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedUser.value = null
}

const saveUser = async () => {
  try {
    if (selectedUser.value) {
      await updateUser(selectedUser.value.id, userForm.value)
    } else {
      if (!userForm.value.email || !userForm.value.password) {
        error.value = 'Email y contraseña son obligatorios' // Should use proper error handling
        return
      }
      await createUser({ ...userForm.value })
    }
    closeEditModal()
    await loadUsers() // Refresh list
  } catch (err) {
    console.error('Error saving user:', err)
  }
}

const confirmSuspendUser = (user) => {
  modalType.value = 'confirm'
  modalTitle.value = 'Suspender usuario'
  modalMessage.value = `¿Suspender a ${user.displayName || user.email}?`
  modalConfirmText.value = 'Suspender'
  confirmAction = async () => {
    showModal.value = false
    try { await updateUserStatus(user.id, 'suspended'); await loadUsers(); } catch (err) { console.error(err) }
  }
  showModal.value = true
}

const confirmDeleteUser = (user) => {
  modalType.value = 'delete'
  modalTitle.value = 'Eliminar usuario'
  modalMessage.value = `¿Eliminar a ${user.displayName || user.email}?`
  modalConfirmText.value = 'Eliminar'
  confirmAction = async () => {
    showModal.value = false
    try { await deleteUser(user.id); await loadUsers(); } catch (err) { console.error(err) }
  }
  showModal.value = true
}

const reactivateUser = async (user) => {
  modalType.value = 'confirm'
  modalTitle.value = 'Reactivar usuario'
  modalMessage.value = `¿Reactivar a ${user.displayName || user.email}?`
  modalConfirmText.value = 'Reactivar'
  confirmAction = async () => {
    showModal.value = false
    try { await updateUserStatus(user.id, 'active'); await loadUsers(); } catch (err) { console.error(err) }
  }
  showModal.value = true
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const getRoleClass = (role) => {
    const map = {
        admin: 'bg-purple-100 text-purple-800 border-purple-200',
        volunteer: 'bg-blue-100 text-blue-800 border-blue-200',
        shelter: 'bg-amber-100 text-amber-800 border-amber-200',
        user: 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return map[role] || map.user
}

const getRoleLabel = (role) => {
    const map = {
        admin: 'Admin',
        volunteer: 'Voluntario',
        shelter: 'Refugio',
        user: 'Usuario'
    }
    return map[role] || 'Usuario'
}

const handleImageError = (e) => {
    e.target.src = '/img/placeholder-user.webp' // Ensure this exists or use a generic fallback
    e.target.onerror = null // Prevent infinite loop
}

onMounted(loadUsers)
</script>
