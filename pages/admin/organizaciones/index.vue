<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Gestión de Organizaciones</h1>
          <p class="text-gray-600">Administra protectoras, refugios y fundaciones</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin"
            class="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-gray-600 transition-colors hover:bg-white hover:text-emerald-600"
          >
            Volver al panel
          </NuxtLink>
          <NuxtLink
            to="/admin/organizaciones/crear"
            class="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <Icon name="heroicons:plus" class="h-5 w-5" />
            Nueva Organización
          </NuxtLink>
        </div>
      </div>

      <!-- Stats / Tabs Header -->
      <div
        class="mb-6 flex space-x-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm"
      >
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          :class="[
            'flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all sm:flex-none',
            filters.status === filter.value
              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
          ]"
          @click="filters.status = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Search & Type Filter -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="md:col-span-2">
          <div class="relative">
            <Icon
              name="heroicons:magnifying-glass"
              class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre, ciudad o descripción..."
              class="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            />
          </div>
        </div>
        <div>
          <select
            v-model="filters.type"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
          >
            <option value="">Todos los tipos</option>
            <option value="protectora">🏠 Protectoras</option>
            <option value="refugio">🐕 Refugios</option>
            <option value="fundacion">💚 Fundaciones</option>
          </select>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <Icon name="heroicons:exclamation-circle" class="mx-auto mb-2 h-12 w-12 text-red-400" />
        <h3 class="text-lg font-bold text-red-900">Error al cargar</h3>
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- No results -->
      <div
        v-else-if="filteredOrganizations.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm"
      >
        <div class="mb-4 rounded-full bg-amber-50 p-4">
          <Icon name="ph:buildings" class="h-10 w-10 text-amber-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-800">No hay organizaciones</h3>
        <p class="mt-1 text-gray-500">No hay coincidencias con los filtros actuales.</p>
        <button
          class="mt-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200"
          @click="resetFilters"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Organizations Grid -->
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="org in filteredOrganizations"
          :key="org.id"
          class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div class="mb-4 flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <img
                  v-if="org.logo"
                  :src="org.logo"
                  :alt="org.name"
                  class="h-10 w-10 rounded-lg object-cover"
                />
                <Icon v-else name="ph:paw-print-fill" class="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900">{{ org.name }}</h3>
                <p class="text-sm text-gray-500">{{ org.city }}, {{ org.state }}</p>
              </div>
            </div>
            <span
              class="px-2 py-1 rounded-full text-xs font-bold uppercase"
              :class="getTypeClass(org.type)"
            >
              {{ org.type }}
            </span>
          </div>

          <p class="mb-4 text-sm text-gray-600 line-clamp-2">
            {{ org.description || 'Sin descripción' }}
          </p>

          <div class="mb-4 flex gap-4 text-sm text-gray-500">
            <div class="flex items-center gap-1">
              <Icon name="ph:paw-print" class="h-4 w-4" />
              <span>{{ org.totalPets || 0 }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Icon name="ph:heart" class="h-4 w-4" />
              <span>{{ org.adoptedPets || 0 }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Icon name="ph:users" class="h-4 w-4" />
              <span>{{ org.activeVolunteers || 0 }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 mb-4">
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="org.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'"
            >
              {{ org.status === 'active' ? 'Activa' : 'Inactiva' }}
            </span>
            <span
              v-if="org.verified"
              class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
            >
              ✓ Verificada
            </span>
          </div>

          <div class="flex gap-2">
            <NuxtLink
              :to="`/org/${org.slug}`"
              class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Ver
            </NuxtLink>
            <button
              class="flex-1 rounded-lg border border-emerald-200 px-3 py-2 text-center text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
              @click="editOrganization(org)"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">
          Editar Organización
        </h2>

        <form @submit.prevent="saveOrganization" class="space-y-6">
          <!-- Images Section -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Logo</label>
              <div class="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-emerald-500">
                <img
                  v-if="formData.logo"
                  :src="formData.logo"
                  :alt="formData.name"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full flex-col items-center justify-center cursor-pointer"
                  @click="triggerLogoInput"
                >
                  <Icon name="lucide:image-plus" class="mb-2 h-10 w-10 text-gray-400" />
                  <span class="text-sm font-medium text-gray-500">Subir logo</span>
                </div>
                <button
                  v-if="formData.logo"
                  type="button"
                  class="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600"
                  @click="removeLogo"
                >
                  <Icon name="lucide:x" class="h-4 w-4" />
                </button>
                <div
                  v-if="!formData.logo"
                  class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                  @click="triggerLogoInput"
                >
                  <Icon name="lucide:camera" class="h-8 w-8 text-white" />
                </div>
              </div>
              <input
                ref="logoInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleLogoChange"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Imagen de portada</label>
              <div class="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-emerald-500">
                <img
                  v-if="formData.coverImage"
                  :src="formData.coverImage"
                  :alt="formData.name"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full flex-col items-center justify-center cursor-pointer"
                  @click="triggerCoverInput"
                >
                  <Icon name="lucide:image-plus" class="mb-2 h-10 w-10 text-gray-400" />
                  <span class="text-sm font-medium text-gray-500">Subir portada</span>
                </div>
                <button
                  v-if="formData.coverImage"
                  type="button"
                  class="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600"
                  @click="removeCover"
                >
                  <Icon name="lucide:x" class="h-4 w-4" />
                </button>
                <div
                  v-if="!formData.coverImage"
                  class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                  @click="triggerCoverInput"
                >
                  <Icon name="lucide:camera" class="h-8 w-8 text-white" />
                </div>
              </div>
              <input
                ref="coverInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleCoverChange"
              />
            </div>
          </div>

          <!-- Basic Info -->
          <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <h3 class="text-lg font-semibold text-gray-900">Información básica</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Slug *</label>
                <input
                  v-model="formData.slug"
                  type="text"
                  required
                  placeholder="nombre-organizacion"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Tipo *</label>
              <select
                v-model="formData.type"
                required
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="">Seleccionar tipo</option>
                <option value="protectora">Protectora</option>
                <option value="refugio">Refugio</option>
                <option value="fundacion">Fundación</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </div>
          </div>

          <!-- Location -->
          <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <h3 class="text-lg font-semibold text-gray-900">Ubicación</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  v-model="formData.city"
                  type="text"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                <input
                  v-model="formData.state"
                  type="text"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
              <input
                v-model="formData.address"
                type="text"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </div>

            <!-- Map for location selection -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Seleccionar ubicación en el mapa</label>
              <p class="mb-2 text-xs text-gray-500">Haz clic en el mapa para seleccionar la ubicación</p>
              <MapComponent
                :selectable="true"
                v-model="formData.coordinates"
                :center="formData.coordinates?.lng && formData.coordinates?.lat ? [formData.coordinates.lng, formData.coordinates.lat] : [-71.61875101348085, 10.663924191285304]"
                :zoom="formData.coordinates?.lng && formData.coordinates?.lat ? 16 : 12"
              />
            </div>

            <!-- Manual coordinates input -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Latitud</label>
                <input
                  v-model.number="formData.coordinates.lat"
                  type="number"
                  step="any"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Longitud</label>
                <input
                  v-model.number="formData.coordinates.lng"
                  type="number"
                  step="any"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <h3 class="text-lg font-semibold text-gray-900">Contacto</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
                <input
                  v-model="formData.whatsapp"
                  type="tel"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Sitio web</label>
                <input
                  v-model="formData.website"
                  type="url"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <h3 class="text-lg font-semibold text-gray-900">Estado</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                <select
                  v-model="formData.status"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                  <option value="suspended">Suspendida</option>
                </select>
              </div>
              <div class="flex items-center gap-2 pt-6">
                <input
                  v-model="formData.verified"
                  type="checkbox"
                  id="verified"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label for="verified" class="text-sm font-medium text-gray-700">Verificada</label>
              </div>
            </div>
          </div>

          <!-- Users -->
          <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <h3 class="text-lg font-semibold text-gray-900">Usuarios</h3>
            
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Owner (ID de usuario)</label>
              <input
                v-model="formData.ownerId"
                type="text"
                placeholder="UID del usuario dueño"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <p class="text-xs text-gray-500 mt-1">UID del usuario Firebase que será el dueño de la organización</p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Administradores (UIDs separados por coma)</label>
              <input
                v-model="adminsString"
                type="text"
                placeholder="uid1, uid2, uid3"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <p class="text-xs text-gray-500 mt-1">UIDs de usuarios con permisos de administración</p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Miembros (UIDs separados por coma)</label>
              <input
                v-model="membersString"
                type="text"
                placeholder="uid1, uid2, uid3"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <p class="text-xs text-gray-500 mt-1">UIDs de usuarios con permisos de miembro</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              class="rounded-xl border border-gray-200 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700"
            >
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { OrganizationService } from '~/services/OrganizationService'
import type { Organization } from '~/models/Organization'
import MapComponent from '~/components/common/MapComponent.vue'

const organizationService = new OrganizationService()

const organizations = ref<Organization[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const searchQuery = ref('')
const filters = ref({
  status: 'all',
  type: '',
})

const showEditModal = ref(false)
const editingOrganization = ref<Organization | null>(null)

// User management strings
const adminsString = ref('')
const membersString = ref('')

// File upload refs
const logoInput = ref<HTMLInputElement | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const formData = ref<Partial<Organization>>({
  name: '',
  slug: '',
  type: 'protectora',
  description: '',
  city: '',
  state: '',
  address: '',
  coordinates: { lat: 10.6, lng: -70.7 }, // Maracaibo coordinates
  email: '',
  phone: '',
  whatsapp: '',
  website: '',
  logo: '',
  coverImage: '',
  status: 'active',
  verified: false,
})

const statusFilters = [
  { label: 'Todas', value: 'all' },
  { label: 'Activas', value: 'active' },
  { label: 'Inactivas', value: 'inactive' },
  { label: 'Suspendidas', value: 'suspended' },
]

const filteredOrganizations = computed(() => {
  let filtered = organizations.value

  // Filter by status
  if (filters.value.status !== 'all') {
    filtered = filtered.filter((org) => org.status === filters.value.status)
  }

  // Filter by type
  if (filters.value.type) {
    filtered = filtered.filter((org) => org.type === filters.value.type)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (org) =>
        org.name.toLowerCase().includes(query) ||
        org.city?.toLowerCase().includes(query) ||
        org.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})

function getTypeClass(type: string): string {
  const classes: Record<string, string> = {
    protectora: 'bg-purple-100 text-purple-700',
    refugio: 'bg-blue-100 text-blue-700',
    fundacion: 'bg-amber-100 text-amber-700',
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

function resetFilters() {
  filters.value = {
    status: 'all',
    type: '',
  }
  searchQuery.value = ''
}

function closeModal() {
  showEditModal.value = false
  editingOrganization.value = null
  formData.value = {
    name: '',
    slug: '',
    type: 'protectora',
    description: '',
    city: '',
    state: '',
    address: '',
    coordinates: { lat: 10.663924191285304, lng: -71.61875101348085 }, // Maracaibo coordinates
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    logo: '',
    coverImage: '',
    status: 'active',
    verified: false,
    ownerId: '',
    admins: [],
    members: [],
  }
  adminsString.value = ''
  membersString.value = ''
}

function editOrganization(org: Organization) {
  editingOrganization.value = org
  formData.value = { ...org, coordinates: org.coordinates || { lat: 0, lng: 0 } }
  // Convert arrays to comma-separated strings
  adminsString.value = org.admins?.join(', ') || ''
  membersString.value = org.members?.join(', ') || ''
  showEditModal.value = true
}

// File upload functions
function triggerLogoInput() {
  logoInput.value?.click()
}

function triggerCoverInput() {
  coverInput.value?.click()
}

async function handleLogoChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'organizations/logos')
    formData.append('fileName', file.name)

    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    formData.value.logo = (response as any).fileUrl
  } catch (error) {
    console.error('Error uploading logo:', error)
    alert('Error al subir el logo')
  } finally {
    uploading.value = false
    if (logoInput.value) logoInput.value.value = ''
  }
}

async function handleCoverChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'organizations/covers')
    formData.append('fileName', file.name)

    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    formData.value.coverImage = (response as any).fileUrl
  } catch (error) {
    console.error('Error uploading cover:', error)
    alert('Error al subir la imagen de portada')
  } finally {
    uploading.value = false
    if (coverInput.value) coverInput.value.value = ''
  }
}

function removeLogo() {
  formData.value.logo = ''
}

function removeCover() {
  formData.value.coverImage = ''
}

async function saveOrganization() {
  try {
    if (editingOrganization.value?.id) {
      // Convert comma-separated strings back to arrays
      const updates = {
        ...formData.value,
        admins: adminsString.value.split(',').map(s => s.trim()).filter(Boolean),
        members: membersString.value.split(',').map(s => s.trim()).filter(Boolean),
      }
      await organizationService.updateOrganization(editingOrganization.value.id, updates)
    }
    closeModal()
    await loadOrganizations()
  } catch (err) {
    console.error('Error al guardar organización:', err)
    error.value = 'Error al guardar la organización'
  }
}

async function loadOrganizations() {
  try {
    loading.value = true
    error.value = null
    organizations.value = await organizationService.getAllOrganizationsRaw()
  } catch (err) {
    console.error('Error al cargar organizaciones:', err)
    error.value = 'Error al cargar las organizaciones'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrganizations()
})
</script>
