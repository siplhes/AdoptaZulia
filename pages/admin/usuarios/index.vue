<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-emerald-800">Gestión de Usuarios</h1>
          <p class="text-gray-600">Administrar usuarios y permisos de la plataforma</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin"
            class="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Volver al panel
          </NuxtLink>
        </div>
      </div>

      <!-- Filters & Search -->
      <div
        class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-md lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div class="flex-1">
            <label class="mb-1 block text-sm font-medium text-gray-700">Buscar</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre, email..."
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              @input="applyFilters"
            >
          </div>

          <div class="w-40">
            <label class="mb-1 block text-sm font-medium text-gray-700">Rol</label>
            <select
              v-model="filters.role"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              @change="applyFilters"
            >
              <option value="">Todos</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
              <option value="volunteer">Voluntario</option>
              <option value="shelter">Refugio</option>
            </select>
          </div>

          <div class="w-40">
            <label class="mb-1 block text-sm font-medium text-gray-700">Estado</label>
            <select
              v-model="filters.status"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              @change="applyFilters"
            >
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="resetFilters"
          >
            <RefreshCwIcon class="mr-2 h-4 w-4" />
            Restablecer
          </button>
          <button
            class="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            @click="openCreateUserModal"
          >
            <PlusIcon class="mr-2 h-4 w-4" />
            Añadir usuario
          </button>
        </div>
      </div>

      <!-- Users List -->
      <div class="overflow-hidden rounded-lg bg-white shadow-md">
        <div v-if="loading" class="flex justify-center py-8">
          <div
            class="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600"
          />
        </div>

        <div v-else-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al cargar los usuarios</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
          <p class="text-gray-500">No se encontraron usuarios con los filtros actuales.</p>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Usuario
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Rol
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Fecha de registro
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Publicaciones
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div
                      v-if="user.photoURL"
                      class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full"
                    >
                      <NuxtImg
                        :src="user.photoURL"
                        alt="Foto de perfil"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div
                      v-else
                      class="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-emerald-500"
                    >
                      {{ getInitials(user.displayName || user.email) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.displayName || 'Sin nombre' }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span
                    :class="[
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'volunteer'
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 'shelter'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{
                      user.role === 'admin'
                        ? 'Administrador'
                        : user.role === 'volunteer'
                          ? 'Voluntario'
                          : user.role === 'shelter'
                            ? 'Refugio'
                            : 'Usuario'
                    }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span
                    :class="[
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{
                      user.status === 'active'
                        ? 'Activo'
                        : user.status === 'inactive'
                          ? 'Inactivo'
                          : 'Suspendido'
                    }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {{ user.postCount || 0 }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    class="mr-2 text-emerald-600 hover:text-emerald-900"
                    @click="editUser(user)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="user.status !== 'suspended'"
                    class="mr-2 text-amber-600 hover:text-amber-900"
                    @click="confirmSuspendUser(user)"
                  >
                    Suspender
                  </button>
                  <button
                    v-if="user.status === 'suspended'"
                    class="mr-2 text-blue-600 hover:text-blue-900"
                    @click="reactivateUser(user)"
                  >
                    Reactivar
                  </button>
                  <button class="text-red-600 hover:text-red-900" @click="confirmDeleteUser(user)">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div
            class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
          >
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Mostrando
                  <span class="font-medium">{{ paginationStart + 1 }}</span>
                  a
                  <span class="font-medium">{{ paginationEnd }}</span>
                  de
                  <span class="font-medium">{{ filteredUsers.length }}</span>
                  usuarios
                </p>
              </div>
              <div>
                <nav
                  class="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    :disabled="currentPage === 1"
                    :class="[
                      'relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700',
                      currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50',
                    ]"
                    @click="prevPage"
                  >
                    <ChevronLeftIcon class="h-5 w-5" />
                  </button>
                  <button
                    :disabled="currentPage === totalPages"
                    :class="[
                      'relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700',
                      currentPage === totalPages
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-gray-50',
                    ]"
                    @click="nextPage"
                  >
                    <ChevronRightIcon class="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ selectedUser ? 'Editar usuario' : 'Añadir usuario' }}
            </h3>
            <button class="text-gray-400 hover:text-gray-500" @click="closeEditModal">
              <XIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                v-model="userForm.displayName"
                type="text"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Nombre completo"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="userForm.email"
                type="email"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="correo@example.com"
                :disabled="!!selectedUser"
              >
            </div>

            <div v-if="!selectedUser">
              <label class="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                v-model="userForm.password"
                type="password"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Contraseña"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Rol</label>
              <select
                v-model="userForm.role"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="user">Usuario</option>
                <option value="volunteer">Voluntario</option>
                <option value="shelter">Refugio</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <select
                v-model="userForm.status"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                v-model="userForm.phone"
                type="tel"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Número de teléfono"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Dirección</label>
              <textarea
                v-model="userForm.address"
                rows="2"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Dirección"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="closeEditModal"
            >
              Cancelar
            </button>
            <button
              class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              @click="saveUser"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div
        v-if="showConfirmationModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div class="mb-4 text-center">
            <div
              class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
            >
              <AlertTriangleIcon class="h-6 w-6 text-red-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">{{ confirmationTitle }}</h3>
            <p class="mt-2 text-sm text-gray-500">{{ confirmationMessage }}</p>
          </div>

          <div class="mt-6 flex justify-center space-x-3">
            <button
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="cancelConfirmation"
            >
              Cancelar
            </button>
            <button
              :class="[
                'rounded-md px-4 py-2 text-sm font-medium text-white',
                confirmationType === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : confirmationType === 'suspend'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700',
              ]"
              @click="confirmAction"
            >
              {{ confirmationButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  RefreshCwIcon,
  XIcon,
} from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useUsers } from '~/composables/useUsers'

// Verificar si el usuario es administrador
definePageMeta({
  middleware: ['admin'],
})

// Usar el composable de usuarios
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

// Estado para búsqueda y filtros
const searchQuery = ref('')
const filters = ref({
  role: '',
  status: '',
})

// Estado para paginación
const currentPage = ref(1)
const pageSize = 10

// Estado para modales
const showEditModal = ref(false)
const showConfirmationModal = ref(false)
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

// Estado para confirmación de acciones
const confirmationType = ref('')
const confirmationTitle = ref('')
const confirmationMessage = ref('')
const confirmationButtonText = ref('')
const confirmationCallback = ref(null)

// Cargar usuarios
const loadUsers = async () => {
  try {
    await fetchAllUsers()
  } catch (err) {
    console.error('Error loading users:', err)
  }
}

// Filtrar usuarios
const filteredUsers = computed(() => {
  return allUsers.value.filter((user) => {
    // Filtrar por búsqueda
    const searchMatch = searchQuery.value
      ? user.displayName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true

    // Filtrar por rol
    const roleMatch = filters.value.role ? user.role === filters.value.role : true

    // Filtrar por estado
    const statusMatch = filters.value.status ? user.status === filters.value.status : true

    return searchMatch && roleMatch && statusMatch
  })
})

// Paginación
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize)
})

const paginationStart = computed(() => {
  return (currentPage.value - 1) * pageSize
})

const paginationEnd = computed(() => {
  return Math.min(paginationStart.value + pageSize, filteredUsers.value.length)
})

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(paginationStart.value, paginationEnd.value)
})

// Métodos para controles
const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  filters.value = {
    role: '',
    status: '',
  }
  currentPage.value = 1
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Métodos para acciones de usuario
const openCreateUserModal = () => {
  selectedUser.value = null
  userForm.value = {
    displayName: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    phone: '',
    address: '',
  }
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
  userForm.value = {
    displayName: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    phone: '',
    address: '',
  }
}

const saveUser = async () => {
  try {
    if (selectedUser.value) {
      // Actualizar usuario existente
      await updateUser(selectedUser.value.id, userForm.value)
    } else {
      // Crear nuevo usuario
      if (!userForm.value.email || !userForm.value.password) {
        error.value = 'Email y contraseña son obligatorios'
        return
      }

      await createUser({
        ...userForm.value,
        // El composable createUser ya se encarga de añadir createdAt
      })
    }

    closeEditModal()
  } catch (err) {
    console.error('Error saving user:', err)
  }
}

// Métodos para confirmación
const confirmSuspendUser = (user) => {
  confirmationType.value = 'suspend'
  confirmationTitle.value = 'Suspender usuario'
  confirmationMessage.value = `¿Estás seguro de que deseas suspender al usuario ${user.displayName || user.email}? El usuario no podrá acceder a su cuenta mientras esté suspendido.`
  confirmationButtonText.value = 'Suspender'
  confirmationCallback.value = () => suspendUser(user)
  showConfirmationModal.value = true
}

const confirmDeleteUser = (user) => {
  confirmationType.value = 'delete'
  confirmationTitle.value = 'Eliminar usuario'
  confirmationMessage.value = `¿Estás seguro de que deseas eliminar al usuario ${user.displayName || user.email}? Esta acción no se puede deshacer.`
  confirmationButtonText.value = 'Eliminar'
  confirmationCallback.value = () => deleteUser(user.id)
  showConfirmationModal.value = true
}

const cancelConfirmation = () => {
  showConfirmationModal.value = false
  confirmationType.value = ''
  confirmationTitle.value = ''
  confirmationMessage.value = ''
  confirmationButtonText.value = ''
  confirmationCallback.value = null
}

const confirmAction = () => {
  if (confirmationCallback.value) {
    confirmationCallback.value()
  }
  cancelConfirmation()
}

// Acciones con usuarios
const suspendUser = async (user) => {
  try {
    await updateUserStatus(user.id, 'suspended')
  } catch (err) {
    console.error('Error suspending user:', err)
  }
}

const reactivateUser = async (user) => {
  try {
    await updateUserStatus(user.id, 'active')
  } catch (err) {
    console.error('Error reactivating user:', err)
  }
}

// Utilidades
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const d = new Date(timestamp)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Cargar usuarios al montar el componente
onMounted(loadUsers)
</script>
