<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <h1 class="text-2xl font-bold text-emerald-800 mb-4">Reportar mascota perdida</h1>

      <form @submit.prevent="openConfirm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Nombre de la mascota</label>
          <input v-model="form.name" class="w-full rounded-md border-gray-300 px-3 py-2" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Recompensa (opcional)</label>
          <div class="relative max-w-sm">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
            <input v-model.number="form.reward" type="number" min="0" step="0.01" class="w-full rounded-md border-gray-300 px-10 py-2" placeholder="Ej: 20.00" />
          </div>
          <p class="mt-1 text-xs text-gray-400">Agregar una recompensa puede ayudar a recuperar la mascota más rápido.</p>
        </div>

        <!-- Edit-only controls: status and archive -->
        <div v-if="isEdit && canModifyCurrent" class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Estado</label>
            <select v-model="form.status" class="w-full rounded-md border-gray-300 px-3 py-2">
              <option value="perdido">Perdido</option>
              <option value="encontrado">Encontrado</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <input id="archived" type="checkbox" v-model="form.archived" class="h-4 w-4" />
            <label for="archived" class="text-sm text-gray-700">Archivar publicación</label>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea v-model="form.description" rows="4" class="w-full rounded-md border-gray-300 px-3 py-2"></textarea>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">Última vez vista (fecha)</label>
            <input type="date" v-model="form.lastSeenAt" class="w-full rounded-md border-gray-300 px-3 py-2" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Ubicación</label>
            <input v-model="form.location" class="w-full rounded-md border-gray-300 px-3 py-2" />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Contacto</label>
            <input v-model="form.contact" class="w-full rounded-md border-gray-300 px-3 py-2" />
          </div>
        </div>

        <!-- Imágenes: drag & drop + preview -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Fotos (opcional)</label>
          <div
            class="group relative rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 text-center hover:border-emerald-500"
            :class="{ 'opacity-80': loading }
            "
            @drop.prevent="onDrop"
            @dragover.prevent="onDragOver"
            role="button"
            tabindex="0"
            aria-label="Área para subir imágenes de la mascota perdida. Arrastra o haz click para seleccionar archivos."
            @click="openFileDialog"
            @keyup.enter="openFileDialog"
          >
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />

            <div class="flex flex-col items-center justify-center">
              <Icon name="heroicons:cloud-arrow-up" class="h-8 w-8 text-emerald-500" />
              <p class="mt-2 text-sm text-gray-600">Arrastra imágenes aquí o haz click para seleccionar</p>
              <p class="mt-1 text-xs text-gray-400">PNG/JPG. Hasta {{ maxFiles }} imágenes. Máx {{ maxSizeMB }}MB por imagen.</p>
            </div>
          </div>

          <!-- Previews -->
            <div v-if="previews.length > 0" class="mt-3 grid grid-cols-3 gap-3">
              <div
                v-for="(p, i) in previews"
                :key="i"
                class="relative h-28 w-full overflow-hidden rounded-lg border bg-gray-50"
                draggable="true"
                @dragstart.prevent="handleDragStart(i)"
                @dragover.prevent="handleDragOver(i)"
                @drop.prevent="handleDrop(i)"
              >
                <img :src="p" :alt="`Foto ${i + 1}`" class="h-full w-full object-cover" />
                <button type="button" class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow" @click="removeImage(i)" :aria-label="`Eliminar imagen ${i + 1}`">
                  <Icon name="heroicons:x-mark" class="h-4 w-4" />
                </button>

                <!-- progress bar overlay -->
                <div v-if="previewProgress(i) !== undefined && previewProgress(i) < 100" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 p-1">
                  <div class="h-2 w-full rounded-full bg-gray-300">
                    <div :style="{ width: previewProgress(i) + '%' }" class="h-2 rounded-full bg-emerald-500 transition-all" />
                  </div>
                  <div class="mt-1 text-xs text-white text-center">Subiendo {{ previewProgress(i) }}%</div>
                </div>
              </div>
            </div>
        </div>

        <div class="flex justify-end gap-3">
          <NuxtLink to="/perdidas" class="rounded-md border border-gray-300 bg-white px-4 py-2">Cancelar</NuxtLink>
          <div class="flex items-center gap-3">
            <div v-if="!rewardValid" class="text-sm text-red-600">La recompensa debe ser un número entre 0 y {{ maxReward }}</div>
            <LoadingButton type="submit" :loading="loading" variant="primary" :disabled="loading || !isFormValid">Publicar</LoadingButton>
          </div>
        </div>
      </form>
      <ModalAlert
        :show="showConfirm"
        type="info"
        title="Confirmar publicación"
        message="Vas a publicar este reporte de mascota perdida. ¿Deseas continuar?"
        confirmButtonText="Publicar"
        @confirm="onConfirmPublish"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLostPets } from '~/composables/useLostPets'
import { useAuth } from '~/composables/useAuth'
import { useRouter, useRoute } from 'vue-router'
import LoadingButton from '~/components/LoadingButton.vue'
import { useToast } from '~/composables/useToast'
import { useS3 } from '~/composables/useS3'
import ModalAlert from '~/components/common/ModalAlert.vue'

const { createLostPet, updateLostPet, getLostPetById, deleteLostPet } = useLostPets()
const { user, isAuthenticated, isAdmin } = useAuth()
const router = useRouter()
const route = useRoute()

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

const loading = ref(false)
const { success: toastSuccess, error: toastError } = useToast()
const { uploadFile, uploadFileWithProgress } = useS3()

  // Image upload state
const fileInput = ref(null)
const files = ref([])
const previews = ref([])
const existingImages = ref([]) // URLs already stored in DB
const progress = ref([]) // 0-100 per file
const maxFiles = 6
const maxSizeMB = 5
const maxReward = 5000

function bytesToMB(bytes) {
  return bytes / (1024 * 1024)
}

function addFiles(newFiles) {
  for (const file of Array.from(newFiles)) {
    if (!file.type.startsWith('image/')) {
      toastError('Archivo inválido', 'Solo se permiten imágenes (PNG/JPG).')
      continue
    }

    if (files.value.length >= maxFiles) {
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
  if (fileInput.value && fileInput.value.click) fileInput.value.click()
}

function onFileChange(e) {
  const inputFiles = e.target.files
  if (!inputFiles) return
  addFiles(inputFiles)
  // reset input so same file can be selected again if removed
  e.target.value = null
}

function onDrop(e) {
  const dt = e.dataTransfer
  if (!dt) return
  addFiles(dt.files)
}

function onDragOver(e) {
  e.dataTransfer.dropEffect = 'copy'
}

function removeImage(index) {
  // If editing and there are existing images, removal must consider existingImages
  if (isEdit.value && existingImages.value.length > 0) {
    if (index < existingImages.value.length) {
      existingImages.value.splice(index, 1)
      previews.value.splice(index, 1)
      return
    }
    // adjust index for files
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

const rewardValid = computed(() => {
  if (form.value.reward == null || form.value.reward === '') return true
  const n = Number(form.value.reward)
  return !isNaN(n) && n >= 0 && n <= maxReward
})

const isFormValid = computed(() => {
  return form.value.name.trim() &&
    form.value.contact.trim() &&
    form.value.location.trim() &&
    rewardValid.value
})

// Reordering helpers (drag & drop)
const draggedIndex = ref(null)
function handleDragStart(i) { draggedIndex.value = i }
// This noop function is required to enable drop events on image previews.
// Without it, the drop event will not fire in some browsers.
function handleDragOver(i) { /* noop to allow drop */ }
function handleDrop(targetIndex) {
  const from = draggedIndex.value
  const to = targetIndex
  if (from === null || from === to) return
  // Do not allow reorder when editing existing images (complex state)
  if (isEdit.value && existingImages.value.length > 0) return
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

const isEdit = computed(() => !!route.query.edit)
const editingId = computed(() => route.query.edit || null)
const canModifyCurrent = ref(false)



onMounted(async () => {
  if (isEdit.value && editingId.value) {
    const data = await getLostPetById(String(editingId.value))
    if (!data) {
      // Not found or error
      return
    }
    // Permission check
    const ownerMatch = user.value ? data.ownerId === user.value.uid : false
    if (!ownerMatch && !isAdmin.value) {
      alert('No tienes permiso para editar esta publicación')
      router.push('/perdidas')
      return
    }
    canModifyCurrent.value = ownerMatch || isAdmin.value
    // Prefill form
    form.value.name = data.name || ''
    form.value.description = data.description || ''
    form.value.lastSeenAt = data.lastSeenAt ? new Date(data.lastSeenAt).toISOString().substr(0,10) : ''
    form.value.location = data.location || ''
    form.value.contact = data.contact || (user.value && user.value.email) || ''
    form.value.reward = data.reward != null ? data.reward : null
    form.value.status = data.status || 'perdido'
    form.value.archived = !!data.archived
    existingImages.value = Array.isArray(data.images) ? data.images.slice() : []
    // Set previews to include existing images first
    previews.value = existingImages.value.slice()
  }
})
 

// Confirm modal
const showConfirm = ref(false)

function openConfirm(e) {
  e && e.preventDefault()
  showConfirm.value = true
}

function onConfirmPublish() {
function openConfirm() {
  showConfirm.value = true
}
async function submitConfirmed() {
  if (!user.value) return
  loading.value = true

  try {
    // Upload images first (if any) with progress
    const imageUrls = []
    // Keep existing images first
    imageUrls.push(...existingImages.value)
    if (files.value.length > 0) {
      for (let i = 0; i < files.value.length; i++) {
        const file = files.value[i]
        const extMatch = file.name.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
        const ext = extMatch ? extMatch[1] : 'jpg'
        const fileName = `${user.value.uid}-${Date.now()}-${i}.${ext}`
        try {
          const url = await uploadFileWithProgress(file, 'lost-pets', fileName, (p) => {
            progress.value[i] = p
          }, { optimize: true, maxSizeMB: 1, quality: 0.8 })
          progress.value[i] = 100
          imageUrls.push(url)
        } catch (uploadErr) {
          console.error('Error subiendo imagen:', uploadErr)
          toastError('Error', 'No se pudieron subir algunas imágenes. Intenta de nuevo.')
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
        toastSuccess('Actualizado', 'La publicación fue actualizada')
        router.push(`/perdidas/${editingId.value}`)
      } else {
        toastError('Error', 'No se pudo actualizar la publicación')
      }
    } else {
      const id = await createLostPet(payload)
      if (id) {
        toastSuccess('Reporte creado', 'Tu reporte de mascota perdida fue publicado')
        router.push(`/perdidas/${id}`)
      } else {
        toastError('Error', 'No se pudo crear el reporte. Intenta de nuevo.')
      }
    }
  } catch (err) {
    console.error('Error creando reporte de perdido:', err)
    toastError('Error', 'Ocurrió un error al publicar el reporte')
  } finally {
    loading.value = false
  }
async function onDeleteCurrent() {
  if (!editingId.value) return
  const ok = confirm('¿Eliminar definitivamente esta publicación? Esta acción no se puede deshacer.')
  if (!ok) return
  const res = await deleteLostPet(String(editingId.value))
  if (res) {
    toastSuccess('Eliminado', 'La publicación fue eliminada')
    router.push('/perdidas')
  } else {
    toastError('Error', 'No se pudo eliminar la publicación')
  }
}
  }
}
</script>
