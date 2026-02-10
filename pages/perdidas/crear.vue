<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto max-w-5xl px-4">
      <h1 class="mb-2 text-3xl font-bold text-emerald-800">Reportar mascota perdida</h1>
      <p class="mb-6 text-gray-600">Ayúdanos a encontrar tu mascota proporcionando los detalles.</p>

      <form
        class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        @submit.prevent="openConfirm"
      >
        <!-- Progress Bar -->
        <div class="border-b border-emerald-100 bg-emerald-50 px-6 py-4">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="font-medium text-emerald-800">
              Paso {{ currentStep }} de {{ totalSteps }}
            </span>
            <span class="font-bold text-emerald-600">{{ currentStepTitle }}</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-emerald-200">
            <div
              class="h-full bg-emerald-500 transition-all duration-300 ease-out"
              :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="p-6">
          <!-- Step 1: Basic Info -->
          <div v-show="currentStep === 1" class="animate-fadeIn">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:identification" class="h-6 w-6 text-emerald-500" />
              ¿Quién se perdió?
            </h2>

            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Nombre de la mascota
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Ej: Max, Luna..."
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  autofocus
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Descripción detallada
                  <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  placeholder="Raza, color, collar, rasgos distintivos..."
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                ></textarea>
                <p class="mt-1 text-right text-xs text-gray-500">
                  {{ form.description.length }} caracteres
                </p>
              </div>

              <!-- Admin/Edit Fields -->
              <div
                v-if="isEdit && canModifyCurrent"
                class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <h3 class="text-sm font-semibold text-gray-900">Administrar publicación</h3>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                    <select
                      v-model="form.status"
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="perdido">Perdido</option>
                      <option value="encontrado">Encontrado</option>
                    </select>
                  </div>
                  <div class="flex items-center pt-6">
                    <input
                      id="archived"
                      type="checkbox"
                      v-model="form.archived"
                      class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label for="archived" class="ml-2 block text-sm text-gray-900">
                      Archivar publicación
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Where & When -->
          <div v-show="currentStep === 2" class="animate-fadeIn">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:map-pin" class="h-6 w-6 text-emerald-500" />
              ¿Dónde y Cuándo?
            </h2>

            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Última vez vista (fecha)
                  <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  v-model="form.lastSeenAt"
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Ubicación
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <Icon
                    name="heroicons:map-pin"
                    class="absolute left-3 top-3 h-5 w-5 text-gray-400"
                  />
                  <input
                    v-model="form.location"
                    type="text"
                    placeholder="Ej: Parque Urdaneta, Av. 5 de Julio..."
                    class="w-full rounded-lg border-gray-300 py-2.5 pl-10 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500">Intenta ser lo más específico posible.</p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Recompensa (Opcional)
                </label>
                <div class="relative">
                  <span
                    class="absolute inset-y-0 left-0 flex items-center pl-3 font-bold text-gray-500"
                  >
                    $
                  </span>
                  <input
                    v-model.number="form.reward"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full rounded-lg border-gray-300 py-2.5 pl-8 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <p
                  class="mt-1 flex items-center gap-1 text-xs text-emerald-600"
                  v-if="form.reward > 0"
                >
                  <Icon name="heroicons:check-circle" class="h-3 w-3" />
                  Una recompensa puede incentivar la búsqueda.
                </p>
              </div>
            </div>
          </div>

          <!-- Step 3: Photos -->
          <div v-show="currentStep === 3" class="animate-fadeIn">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:camera" class="h-6 w-6 text-emerald-500" />
              Fotos
            </h2>

            <div
              class="group relative cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50"
              :class="{ 'pointer-events-none opacity-50': loading }"
              @drop.prevent="onDrop"
              @dragover.prevent="onDragOver"
              @click="openFileDialog"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="onFileChange"
              />

              <div class="pointer-events-none flex flex-col items-center justify-center">
                <div
                  class="mb-3 rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110"
                >
                  <Icon name="heroicons:cloud-arrow-up" class="h-8 w-8 text-emerald-500" />
                </div>
                <h3 class="text-lg font-medium text-gray-900">Sube fotos de tu mascota</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Arrastra y suelta o haz click para explorar
                </p>
                <p class="mt-2 rounded border bg-white px-2 py-1 text-xs text-gray-400">
                  Máx {{ maxFiles }} fotos ({{ maxSizeMB }}MB c/u)
                </p>
              </div>
            </div>

            <!-- Preview Grid -->
            <div v-if="previews.length > 0" class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div
                v-for="(p, i) in previews"
                :key="i"
                class="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                draggable="true"
                @dragstart="handleDragStart(i)"
                @dragover.prevent="handleDragOver(i)"
                @drop.prevent="handleDrop(i)"
              >
                <img :src="p" :alt="`Foto ${i + 1}`" class="h-full w-full object-cover" />

                <!-- Overlay Gradient -->
                <div
                  class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                ></div>

                <button
                  type="button"
                  class="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-500 shadow-sm transition-all hover:scale-110 hover:bg-red-50"
                  @click="removeImage(i)"
                  title="Eliminar foto"
                >
                  <Icon name="heroicons:trash" class="h-4 w-4" />
                </button>

                <!-- Loading Overlay -->
                <div
                  v-if="previewProgress(i) !== undefined && previewProgress(i) < 100"
                  class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4"
                >
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-600">
                    <div
                      :style="{ width: previewProgress(i) + '%' }"
                      class="h-full bg-emerald-500 transition-all"
                    ></div>
                  </div>
                  <span class="mt-2 text-xs font-medium text-white">
                    {{ Math.round(previewProgress(i)) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Contact & Review -->
          <div v-show="currentStep === 4" class="animate-fadeIn">
            <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Icon name="heroicons:phone" class="h-6 w-6 text-emerald-500" />
              Contacto
            </h2>

            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">
                  Información de contacto
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.contact"
                  type="text"
                  placeholder="Teléfono, Email, Instagram..."
                  class="w-full rounded-lg border-gray-300 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  ¿Cómo pueden contactarte las personas si ven a tu mascota?
                </p>
              </div>

              <!-- Summary Card -->
              <div class="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <h3 class="mb-2 font-semibold text-emerald-900">Resumen de publicación</h3>
                <ul class="space-y-1 text-sm text-emerald-800">
                  <li>
                    <strong>Nombre:</strong>
                    {{ form.name }}
                  </li>
                  <li>
                    <strong>Ubicación:</strong>
                    {{ form.location }}
                  </li>
                  <li>
                    <strong>Fecha:</strong>
                    {{ form.lastSeenAt }}
                  </li>
                  <li>
                    <strong>Fotos:</strong>
                    {{ previews.length }} seleccionadas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4"
        >
          <!-- Left: Back/Cancel -->
          <div v-if="currentStep === 1">
            <NuxtLink
              to="/perdidas"
              class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </NuxtLink>
          </div>
          <button
            v-else
            type="button"
            @click="prevStep"
            class="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Icon name="heroicons:arrow-left" class="h-4 w-4" />
            Atrás
          </button>

          <!-- Right: Next/Submit -->
          <div class="flex items-center gap-3">
            <div v-if="!rewardValid" class="mr-2 text-xs font-medium text-red-600">
              Recompensa inválida
            </div>

            <button
              v-if="currentStep < totalSteps"
              type="button"
              @click="nextStep"
              :disabled="!isStepValid"
              class="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
              <Icon name="heroicons:arrow-right" class="h-4 w-4" />
            </button>

            <LoadingButton
              v-else
              type="submit"
              :loading="loading"
              variant="primary"
              :disabled="loading || !isFormValid"
              class="px-8 py-2.5"
            >
              {{ isEdit ? 'Actualizar' : 'Publicar' }}
            </LoadingButton>
          </div>
        </div>
      </form>

      <!-- Delete Button (Edit Mode Only) -->
      <div v-if="isEdit && canModifyCurrent" class="mt-6 flex justify-center">
        <button
          type="button"
          @click="onDeleteCurrent"
          class="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <Icon name="heroicons:trash" class="h-4 w-4" />
          Eliminar esta publicación
        </button>
      </div>

      <ModalAlert
        :show="showConfirm"
        type="info"
        title="Confirmar publicación"
        message="Vas a publicar este reporte de mascota perdida. ¿Deseas continuar?"
        confirmButtonText="Publicar"
        @confirm="onConfirmPublish"
        @close="showConfirm = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLostPets } from '~/composables/useLostPets'
import { useAuth } from '~/composables/useAuth'
import { useRouter, useRoute } from 'vue-router'
import LoadingButton from '~/components/ui/LoadingButton.vue'
import { useToast } from '~/composables/useToast'
import { useS3 } from '~/composables/useS3'
import ModalAlert from '~/components/common/ModalAlert.vue'

// -- Composables --
const { createLostPet, updateLostPet, getLostPetById, deleteLostPet } = useLostPets()
const { user, isAuthenticated, isAdmin } = useAuth()
const router = useRouter()
const route = useRoute()
const { success: toastSuccess, error: toastError } = useToast()
const { uploadFileWithProgress } = useS3()

// -- State --
const loading = ref(false)
const currentStep = ref(1)
const totalSteps = 4
const titles = {
  1: 'Información Básica',
  2: 'Ubicación y Tiempo',
  3: 'Fotografías',
  4: 'Contacto',
}
const currentStepTitle = computed(() => titles[currentStep.value])

// -- Form Data --
const form = ref({
  name: '',
  description: '',
  lastSeenAt: '',
  location: '',
  contact: '',
  reward: null,
  status: 'perdido',
  archived: false,
})

// -- Validation --
const rewardValid = computed(() => {
  if (form.value.reward == null || form.value.reward === '') return true
  const n = Number(form.value.reward)
  return !isNaN(n) && n >= 0 && n <= 5000 // Max reward logic inline
})

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.value.name.trim().length > 0 && form.value.description.trim().length > 0
    case 2:
      return form.value.lastSeenAt && form.value.location.trim().length > 0 && rewardValid.value
    case 3:
      return true // Photos are optional but recommended
    case 4:
      return form.value.contact.trim().length > 0
    default:
      return false
  }
})

const isFormValid = computed(() => {
  return (
    form.value.name.trim() &&
    form.value.description.trim() &&
    form.value.lastSeenAt &&
    form.value.location.trim() &&
    form.value.contact.trim() &&
    rewardValid.value
  )
})

// -- Navigation --
function nextStep() {
  if (currentStep.value < totalSteps && isStepValid.value) {
    currentStep.value++
  }
}
function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// -- Image Upload Logic --
const fileInput = ref(null)
const files = ref([])
const previews = ref([])
const existingImages = ref([])
const progress = ref([])
const maxFiles = 6
const maxSizeMB = 5

function bytesToMB(bytes) {
  return bytes / (1024 * 1024)
}

function addFiles(newFiles) {
  for (const file of Array.from(newFiles)) {
    if (!file.type.startsWith('image/')) {
      toastError('Archivo inválido', 'Solo se permiten imágenes (PNG/JPG).')
      continue
    }
    if (files.value.length + existingImages.value.length >= maxFiles) {
      toastError('Límite alcanzado', `Solo puedes subir hasta ${maxFiles} imágenes.`)
      break
    }
    if (bytesToMB(file.size) > maxSizeMB) {
      toastError('Archivo muy grande', `La imagen excede el límite de ${maxSizeMB}MB.`)
      continue
    }
    files.value.push(file)
    progress.value.push(0)
    const reader = new FileReader()
    reader.onload = (e) => previews.value.push(e.target.result)
    reader.readAsDataURL(file)
  }
}

function openFileDialog() {
  if (fileInput.value) fileInput.value.click()
}
function onFileChange(e) {
  if (e.target.files) addFiles(e.target.files)
  e.target.value = null
}
function onDrop(e) {
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}
function onDragOver(e) {
  e.dataTransfer.dropEffect = 'copy'
}
function removeImage(index) {
  if (isEdit.value && existingImages.value.length > 0) {
    if (index < existingImages.value.length) {
      existingImages.value.splice(index, 1)
      previews.value.splice(index, 1)
      return
    }
    const fileIdx = index - existingImages.value.length
    files.value.splice(fileIdx, 1)
    previews.value.splice(index, 1)
    progress.value.splice(fileIdx, 1)
    return
  }
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
  progress.value.splice(index, 1)
}

// Drag & Drop Sorting
const draggedIndex = ref(null)
function handleDragStart(i) {
  draggedIndex.value = i
}
function handleDrop(targetIndex) {
  const from = draggedIndex.value
  const to = targetIndex
  if (from === null || from === to) return
  if (isEdit.value && existingImages.value.length > 0) return // Simplify edit logic by disabling reorder if existing images

  const f = files.value.splice(from, 1)[0]
  const p = previews.value.splice(from, 1)[0]
  const pr = progress.value.splice(from, 1)[0]
  files.value.splice(to, 0, f)
  previews.value.splice(to, 0, p)
  progress.value.splice(to, 0, pr)
  draggedIndex.value = null
}

function previewProgress(i) {
  if (isEdit.value && existingImages.value.length > 0) {
    if (i < existingImages.value.length) return undefined
    return progress.value[i - existingImages.value.length]
  }
  return progress.value[i]
}

// -- Initialization & Editing --
const isEdit = computed(() => !!route.query.edit)
const editingId = computed(() => route.query.edit || null)
const canModifyCurrent = ref(false)

onMounted(async () => {
  if (isEdit.value && editingId.value) {
    const data = await getLostPetById(String(editingId.value))
    if (!data) return

    // Permission
    const ownerMatch = user.value ? data.ownerId === user.value.uid : false
    if (!ownerMatch && !isAdmin.value) {
      alert('No tienes permiso para editar esta publicación')
      router.push('/perdidas')
      return
    }
    canModifyCurrent.value = ownerMatch || isAdmin.value

    // Prefill
    form.value.name = data.name || ''
    form.value.description = data.description || ''
    form.value.lastSeenAt = data.lastSeenAt
      ? new Date(data.lastSeenAt).toISOString().substr(0, 10)
      : ''
    form.value.location = data.location || ''
    form.value.contact = data.contact || user.value?.email || ''
    form.value.reward = data.reward != null ? data.reward : null
    form.value.status = data.status || 'perdido'
    form.value.archived = !!data.archived
    existingImages.value = Array.isArray(data.images) ? data.images.slice() : []
    previews.value = existingImages.value.slice()
  } else if (user.value?.email) {
    form.value.contact = user.value.email
  }
})

// -- Submission --
const showConfirm = ref(false)
function openConfirm() {
  showConfirm.value = true
}

async function onConfirmPublish() {
  showConfirm.value = false
  if (!user.value) return
  loading.value = true

  try {
    const imageUrls = [...existingImages.value]

    // Upload new files
    if (files.value.length > 0) {
      for (let i = 0; i < files.value.length; i++) {
        const file = files.value[i]
        const extMatch = file.name.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
        const ext = extMatch ? extMatch[1] : 'jpg'
        const fileName = `${user.value.uid}-${Date.now()}-${i}.${ext}`

        try {
          const url = await uploadFileWithProgress(
            file,
            'lost-pets',
            fileName,
            (p) => {
              // If we're editing and have existing images, offset the progress index
              // actually, progress array only tracks NEW files in this impl if we are careful
              progress.value[i] = p
            },
            { optimize: true, maxSizeMB: 1, quality: 0.8 }
          )
          progress.value[i] = 100
          imageUrls.push(url)
        } catch (uploadErr) {
          console.error('Error subiendo imagen:', uploadErr)
          toastError('Error', 'No se pudieron subir algunas imágenes.')
        }
      }
    }

    const payload = {
      ownerId: user.value.uid,
      name: form.value.name,
      description: form.value.description,
      lastSeenAt: form.value.lastSeenAt ? new Date(form.value.lastSeenAt).getTime() : null,
      location: form.value.location,
      contact: form.value.contact || user.value.email,
      reward: form.value.reward,
      images: imageUrls,
      status: form.value.status || 'perdido',
      archived: !!form.value.archived,
    }

    if (isEdit.value && editingId.value) {
      const ok = await updateLostPet(String(editingId.value), payload)
      if (ok) {
        toastSuccess('Actualizado', 'Publicación actualizada correctamente')
        router.push(`/perdidas/${editingId.value}`)
      } else {
        toastError('Error', 'No se pudo actualizar la publicación')
      }
    } else {
      const id = await createLostPet(payload)
      if (id) {
        toastSuccess('¡Publicado!', 'Tu reporte ha sido creado exitosamente')
        router.push(`/perdidas/${id}`)
      } else {
        toastError('Error', 'No se pudo crear el reporte')
      }
    }
  } catch (err) {
    console.error(err)
    toastError('Error', 'Ocurrió un error inesperado')
  } finally {
    loading.value = false
  }
}

async function onDeleteCurrent() {
  if (!editingId.value) return
  const ok = confirm('¿Eliminar esta publicación? No podrás deshacer esta acción.')
  if (!ok) return
  const res = await deleteLostPet(String(editingId.value))
  if (res) {
    toastSuccess('Eliminado', 'Publicación eliminada')
    router.push('/perdidas')
  } else {
    toastError('Error', 'No se pudo eliminar')
  }
}
</script>

<style scoped>
/* Keyframes for subtle fade-in animation between steps */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
