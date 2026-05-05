<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Nueva Organización</h1>
          <p class="text-gray-600">Crear una nueva organización en el sistema</p>
        </div>
        <NuxtLink
          to="/admin/organizaciones"
          class="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-gray-600 transition-colors hover:bg-white hover:text-emerald-600"
        >
          <Icon name="heroicons:arrow-left" class="h-5 w-5" />
          Volver
        </NuxtLink>
      </div>

      <div class="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
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

          <div class="flex justify-end gap-3 pt-4">
            <NuxtLink
              to="/admin/organizaciones"
              class="rounded-xl border border-gray-200 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </NuxtLink>
            <button
              type="submit"
              :disabled="uploading"
              class="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {{ uploading ? 'Guardando...' : 'Crear Organización' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { OrganizationService } from '~/services/OrganizationService'
import type { Organization } from '~/models/Organization'
import MapComponent from '~/components/common/MapComponent.vue'
import { useAuth } from '~/composables/useAuth'

const organizationService = new OrganizationService()
const { user } = useAuth()

const formData = ref<Partial<Organization>>({
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
  ownerId: user.value?.uid,
  admins: [],
  members: [],
  donationLinks: [],
})

// File upload refs
const logoInput = ref<HTMLInputElement | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

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
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('folder', 'organizations/logos')
    formDataUpload.append('fileName', file.name)

    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
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
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('folder', 'organizations/covers')
    formDataUpload.append('fileName', file.name)

    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
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
    uploading.value = true
    if (!formData.value.ownerId && user.value) {
      formData.value.ownerId = user.value.uid
    }
    await organizationService.createOrganization(formData.value as Organization)
    await navigateTo('/admin/organizaciones')
  } catch (err) {
    console.error('Error al guardar organización:', err)
    alert('Error al guardar la organización')
  } finally {
    uploading.value = false
  }
}
</script>
