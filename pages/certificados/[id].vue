<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-6 md:py-12">
    <div class="container mx-auto max-w-5xl px-4">
      <!-- Info Helper Toast - Only for first-time viewers -->
      <div
        v-if="!hasSeenCertificate"
        class="animate-fade-in mb-6 flex items-start gap-3 rounded-xl border-l-4 border-blue-400 bg-blue-50 p-4"
      >
        <Icon
          name="heroicons:information-circle"
          class="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-500"
        />
        <div class="flex-1">
          <h3 class="mb-1 text-sm font-semibold text-blue-900">¿Qué es esto?</h3>
          <p class="text-sm text-blue-700">
            Este es tu certificado oficial de adopción. Puedes descargarlo, compartirlo, o
            imprimirlo como comprobante de que adoptaste a tu mascota.
          </p>
        </div>
        <button @click="dismissHelper" class="text-blue-400 hover:text-blue-600">
          <Icon name="heroicons:x-mark" class="h-5 w-5" />
        </button>
      </div>

      <!-- Action Buttons - Mobile Optimized -->
      <div class="mb-6 flex flex-col justify-between gap-3 sm:flex-row">
        <button
          class="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
          @click="goBack"
        >
          <Icon name="heroicons:arrow-left" class="h-5 w-5" />
          <span>Volver</span>
        </button>

        <div class="flex flex-col gap-2 sm:flex-row">
          <!-- Print Button with Tooltip -->
          <div class="group relative">
            <button
              class="btn-outline touch-action-none flex w-full items-center justify-center gap-2 sm:w-auto"
              @click="printCertificate"
            >
              <Icon name="heroicons:printer" class="h-5 w-5" />
              <span>Imprimir</span>
            </button>
            <div
              class="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 sm:block"
            >
              Descarga como PDF
              <div
                class="absolute left-1/2 top-full -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"
              ></div>
            </div>
          </div>

          <!-- Share Button with Tooltip -->
          <div class="group relative">
            <button
              class="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto"
              @click="shareCertificate"
            >
              <Icon name="heroicons:share" class="h-5 w-5" />
              <span>Compartir</span>
            </button>
            <div
              class="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 sm:block"
            >
              Comparte tu adopción 🎉
              <div
                class="absolute left-1/2 top-full -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-emerald-600" />
        <p class="animate-pulse text-gray-600">Cargando tu certificado...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card border-l-4 border-red-500 bg-red-50">
        <div class="flex gap-3">
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 flex-shrink-0 text-red-500" />
          <div>
            <h3 class="mb-1 font-semibold text-red-900">Error al cargar</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!certificateData" class="card border-l-4 border-yellow-500 bg-yellow-50">
        <div class="flex gap-3">
          <Icon
            name="heroicons:exclamation-triangle"
            class="h-6 w-6 flex-shrink-0 text-yellow-500"
          />
          <div>
            <h3 class="mb-1 font-semibold text-yellow-900">Certificado no encontrado</h3>
            <p class="text-sm text-yellow-700">No se ha encontrado este certificado de adopción</p>
          </div>
        </div>
      </div>

      <!-- Certificate Content -->
      <div
        v-else
        ref="certificateRef"
        class="overflow-hidden rounded-3xl border-4 border-double border-emerald-100 bg-white shadow-2xl"
      >
        <!-- Hero Section - Mobile First -->
        <div
          class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white md:py-16"
        >
          <!-- Decorative Elements -->
          <div class="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-white/10" />
          <div class="absolute bottom-0 left-0 -mb-24 -ml-24 h-48 w-48 rounded-full bg-white/10" />

          <div class="relative z-10">
            <div class="mb-6 flex justify-center">
              <div class="rounded-2xl bg-white p-4 shadow-xl">
                <img src="/logo.svg" alt="AdoptaZulia" class="h-12 md:h-16" />
              </div>
            </div>

            <div
              class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
            >
              <Icon name="heroicons:check-badge" class="h-5 w-5" />
              <span class="text-sm font-medium">Certificado Oficial</span>
            </div>

            <h1 class="mb-4 text-3xl font-bold md:text-5xl">¡Adopción Exitosa! 🎉</h1>

            <p class="mx-auto max-w-2xl text-lg text-emerald-50 md:text-xl">
              Certificado que acredita la adopción de
              <strong class="text-white">{{ certificateData.pet?.name }}</strong>
              por
              <strong class="text-white">{{ certificateData.adopter?.name }}</strong>
            </p>

            <div class="mt-6 inline-block rounded-xl bg-white/10 px-6 py-3 backdrop-blur-sm">
              <p class="mb-1 text-sm text-emerald-100">Fecha de Adopción</p>
              <p class="text-xl font-bold">{{ formatDate(certificateData.adoptionDate) }}</p>
            </div>
          </div>
        </div>

        <!-- Main Content - Two Column on Desktop, Stacked on Mobile -->
        <div class="px-6 py-8 md:p-12">
          <div class="mb-8 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
            <!-- Pet Information Card -->
            <div
              class="card border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50"
            >
              <div class="mb-6 flex items-center gap-3">
                <div class="rounded-xl bg-amber-500 p-2.5">
                  <Icon name="heroicons:heart" class="h-6 w-6 text-white" />
                </div>
                <h2 class="text-2xl font-bold text-amber-900">Tu Nueva Mascota</h2>
              </div>

              <!-- Pet Photo -->
              <div class="mb-6 flex justify-center">
                <div class="relative">
                  <div
                    class="h-32 w-32 overflow-hidden rounded-2xl shadow-xl ring-4 ring-white md:h-40 md:w-40"
                  >
                    <img
                      v-if="certificateData.pet?.imageUrl"
                      :src="certificateData.pet.imageUrl"
                      :alt="certificateData.pet?.name"
                      class="h-full w-full object-cover"
                      @error="handleImageError"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center bg-amber-200">
                      <Icon name="heroicons:heart" class="h-16 w-16 text-amber-400" />
                    </div>
                  </div>

                  <!-- Badge -->
                  <div
                    class="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg"
                  >
                    Adoptado ✓
                  </div>
                </div>
              </div>

              <h3 class="mb-6 text-center text-2xl font-bold text-gray-900">
                {{ certificateData.pet?.name }}
              </h3>

              <!-- Pet Details -->
              <div class="space-y-3">
                <div class="flex items-center gap-3 rounded-lg bg-white/60 px-4 py-3">
                  <Icon name="heroicons:tag" class="h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-medium text-amber-700">Especie</p>
                    <p class="truncate text-sm font-semibold text-gray-900">
                      {{ certificateData.pet?.species || 'No especificado' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3 rounded-lg bg-white/60 px-4 py-3">
                  <Icon name="heroicons:sparkles" class="h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-medium text-amber-700">Raza</p>
                    <p class="truncate text-sm font-semibold text-gray-900">
                      {{ certificateData.pet?.breed || 'No especificado' }}
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-3">
                    <Icon name="heroicons:cake" class="h-4 w-4 flex-shrink-0 text-amber-600" />
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-medium text-amber-700">Edad</p>
                      <p class="truncate text-xs font-semibold text-gray-900">
                        {{ certificateData.pet?.age || 'N/A' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-3">
                    <Icon name="heroicons:swatch" class="h-4 w-4 flex-shrink-0 text-amber-600" />
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-medium text-amber-700">Color</p>
                      <p class="truncate text-xs font-semibold text-gray-900">
                        {{ certificateData.pet?.color || 'N/A' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Adopter Information Card -->
            <div
              class="card border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50"
            >
              <div class="mb-6 flex items-center gap-3">
                <div class="rounded-xl bg-emerald-500 p-2.5">
                  <Icon name="heroicons:user" class="h-6 w-6 text-white" />
                </div>
                <h2 class="text-2xl font-bold text-emerald-900">Adoptante</h2>
              </div>

              <!-- Adopter Photo -->
              <div class="mb-6 flex justify-center">
                <div
                  class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 shadow-xl ring-4 ring-white md:h-40 md:w-40"
                >
                  <img
                    v-if="certificateData.adopter?.photoURL"
                    :src="certificateData.adopter.photoURL"
                    :alt="certificateData.adopter?.name"
                    class="h-full w-full object-cover"
                  />
                  <span v-else class="text-5xl font-bold text-emerald-600">
                    {{ getInitials(certificateData.adopter?.name || 'Usuario') }}
                  </span>
                </div>
              </div>

              <h3 class="mb-6 text-center text-2xl font-bold text-gray-900">
                {{ certificateData.adopter?.name }}
              </h3>

              <!-- Commitment -->
              <div class="mb-4 rounded-xl bg-white/60 p-5">
                <div class="flex items-start gap-3">
                  <Icon
                    name="heroicons:hand-raised"
                    class="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600"
                  />
                  <div>
                    <h4 class="mb-2 text-sm font-bold text-emerald-900">Compromiso de Adopción</h4>
                    <p class="text-xs leading-relaxed text-gray-700">
                      Me comprometo a brindarle un hogar lleno de amor, cuidados adecuados, atención
                      veterinaria y compañía responsable durante toda su vida.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Platform Badge -->
              <div
                class="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-center text-white"
              >
                <Icon name="heroicons:shield-check" class="mx-auto mb-2 h-8 w-8" />
                <p class="text-xs font-semibold">Adopción Certificada por</p>
                <p class="text-lg font-bold">AdoptaZulia</p>
                <p class="mt-1 text-xs opacity-90">Plataforma Oficial de Adopción</p>
              </div>
            </div>
          </div>

          <!-- Certificate Seal and Signature -->
          <div class="mb-8 border-t-2 border-dashed border-gray-200 pt-8">
            <div class="flex flex-col items-center justify-center gap-8 md:flex-row">
              <!-- Seal -->
              <div class="relative">
                <div
                  class="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-400 bg-white shadow-lg"
                >
                  <img
                    src="/logo.svg"
                    alt="Sello"
                    class="absolute inset-0 h-full w-full p-8 opacity-20"
                  />
                  <div class="z-10 text-center">
                    <p class="text-xs font-bold text-emerald-700">CERTIFICADO</p>
                    <p class="text-xs font-bold text-emerald-700">OFICIAL</p>
                    <p class="mt-1 text-[0.5rem] text-emerald-600">ADOPTAZULIA</p>
                  </div>
                </div>
              </div>

              <!-- Signature -->
              <div class="text-center md:text-left">
                <div class="min-w-[200px] border-t-2 border-gray-300 pt-3">
                  <p class="mb-1 text-sm text-gray-600">Autorizado por</p>
                  <p class="font-cursive text-2xl text-gray-800">AdoptaZulia</p>
                  <p class="text-xs text-gray-500">Director General</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Certificate Metadata -->
          <div
            class="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-emerald-50 p-6"
          >
            <div
              class="flex flex-col items-center justify-center gap-4 text-center md:flex-row md:gap-8"
            >
              <div>
                <p class="mb-1 text-xs text-gray-600">Número de Certificado</p>
                <p class="font-mono text-lg font-bold text-emerald-700">
                  {{ generateCertificateId(certificateData.id) }}
                </p>
              </div>

              <div class="hidden h-10 w-px bg-gray-300 md:block" />

              <div>
                <p class="mb-1 text-xs text-gray-600">Fecha de Emisión</p>
                <p class="font-semibold text-gray-800">{{ formatDate(Date.now()) }}</p>
              </div>
            </div>

            <!-- Verification Link -->
            <div v-if="verificationId" class="mt-6 border-t border-amber-200 pt-6">
              <p class="mb-3 text-center text-xs text-gray-600">
                Verifica la autenticidad de este certificado en línea
              </p>
              <div class="flex flex-col justify-center gap-2 sm:flex-row">
                <NuxtLink
                  :to="`/verificar?vid=${verificationId}`"
                  class="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-500 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  <Icon name="heroicons:shield-check" class="h-4 w-4" />
                  Verificar Certificado
                </NuxtLink>
                <button
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  @click="copyVerificationLink"
                >
                  <Icon name="heroicons:clipboard-document" class="h-4 w-4" />
                  Copiar Enlace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Adoption Story CTA -->
      <div
        v-if="certificateData && !hasAdoptionStory"
        class="card mt-8 border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50"
      >
        <div class="flex flex-col items-center gap-6 md:flex-row">
          <div class="flex-shrink-0">
            <div
              class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500"
            >
              <Icon name="heroicons:heart" class="h-10 w-10 text-white" />
            </div>
          </div>

          <div class="flex-1 text-center md:text-left">
            <h3 class="mb-2 text-xl font-bold text-gray-900">Comparte tu Historia de Adopción</h3>
            <p class="mb-4 text-sm text-gray-600">
              ¿Cómo ha sido la experiencia con tu nueva mascota? Comparte tu historia e inspira a
              más personas a adoptar. 💕
            </p>
            <NuxtLink
              :to="`/historias/crear?petId=${certificateData.petId}&adoptionId=${certificateData.id}`"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-pink-600 hover:to-purple-600 hover:shadow-xl"
            >
              <Icon name="heroicons:pencil-square" class="h-5 w-5" />
              Crear Historia
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Story Link if exists -->
      <div
        v-if="certificateData && hasAdoptionStory"
        class="card mt-8 border-2 border-emerald-200 bg-emerald-50"
      >
        <div class="flex items-center gap-4">
          <Icon name="heroicons:check-circle" class="h-12 w-12 flex-shrink-0 text-emerald-600" />
          <div class="flex-1">
            <h3 class="mb-1 font-bold text-emerald-900">¡Ya compartiste tu historia!</h3>
            <p class="text-sm text-emerald-700">Gracias por inspirar a otros adoptantes 💚</p>
          </div>
          <NuxtLink :to="`/historias/${adoptionStoryId}`" class="btn-primary whitespace-nowrap">
            Ver Historia
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebaseApp } from 'vuefire'
import { getDatabase, ref as dbRef, get } from 'firebase/database'
import { useAuth } from '~/composables/useAuth'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const route = useRoute()
const router = useRouter()
const adoptionId = route.params.id

const { isAuthenticated, user, waitForAuth } = useAuth()

const certificateRef = ref(null)
const loading = ref(true)
const error = ref(null)
const certificateData = ref(null)
const hasAdoptionStory = ref(false)
const adoptionStoryId = ref(null)
const verificationId = ref(null)
const hasSeenCertificate = ref(false)

onMounted(async () => {
  // Wait for auth to be ready
  await waitForAuth()

  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    await loadCertificateData()
    await checkForAdoptionStory()
    if (adoptionId) {
      await loadVerification(adoptionId)
    }

    // Check if user has seen certificate before
    const seenKey = `cert_seen_${adoptionId}`
    hasSeenCertificate.value = localStorage.getItem(seenKey) === 'true'
  } catch (err) {
    console.error('Error al cargar el certificado:', err)
    error.value = 'Error al cargar el certificado. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

const dismissHelper = () => {
  hasSeenCertificate.value = true
  const seenKey = `cert_seen_${adoptionId}`
  localStorage.setItem(seenKey, 'true')
}

const loadCertificateData = async () => {
  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)

    const adoptionRef = dbRef(db, `adoptions/${adoptionId}`)
    const adoptionSnapshot = await get(adoptionRef)

    if (!adoptionSnapshot.exists()) {
      error.value = 'No se ha encontrado la solicitud de adopción'
      return
    }

    const adoptionData = adoptionSnapshot.val()

    if (adoptionData.status !== 'completed') {
      error.value = 'Esta adopción aún no ha sido completada'
      return
    }

    const petRef = dbRef(db, `pets/${adoptionData.petId}`)
    const petSnapshot = await get(petRef)

    if (!petSnapshot.exists()) {
      error.value = 'No se ha encontrado la mascota asociada a esta adopción'
      return
    }

    const petData = petSnapshot.val()

    const adopterRef = dbRef(db, `users/${adoptionData.userId}`)
    const adopterSnapshot = await get(adopterRef)

    if (!adopterSnapshot.exists()) {
      error.value = 'No se ha encontrado el adoptante asociado a esta adopción'
      return
    }

    const adopterData = adopterSnapshot.val()

    const isUserInvolved =
      user.value.uid === adoptionData.userId || user.value.uid === petData.userId

    if (!isUserInvolved) {
      error.value = 'No tienes permisos para ver este certificado'
      return
    }

    certificateData.value = {
      id: adoptionId,
      petId: adoptionData.petId,
      adopterId: adoptionData.userId,
      ownerId: petData.userId,
      adoptionDate: petData.adoptionDate || adoptionData.updatedAt || Date.now(),
      createdAt: Date.now(),

      pet: {
        name: petData.name || 'Sin nombre',
        species: petData.type || 'No especificado',
        breed: petData.breed || 'No especificado',
        age: petData.age || 'No especificado',
        color: petData.color || 'No especificado',
        imageUrl: petData.image || null,
      },

      adopter: {
        name: adopterData.displayName || adopterData.email || 'Usuario',
        email: adopterData.email || 'No disponible',
        phone: adopterData.phoneNumber || 'No disponible',
        photoURL: adopterData.photoURL || null,
      },
    }
  } catch (err) {
    console.error('Error al cargar datos del certificado:', err)
    error.value = 'Error al cargar los datos del certificado. Por favor, intenta de nuevo.'
  }
}

async function loadVerification(adoptionId) {
  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)
    const snap = await get(dbRef(db, `adoptionVerifications`))
    if (!snap.exists()) return
    const data = snap.val()
    for (const key of Object.keys(data)) {
      const v = data[key]
      if (v && v.adoptionId === adoptionId) {
        verificationId.value = key
        return
      }
    }
  } catch (e) {
    console.error('Error loading verification:', e)
  }
}

function copyVerificationLink() {
  if (!verificationId.value) return
  const url = `${window.location.origin}/verificar?vid=${verificationId.value}`
  navigator.clipboard?.writeText(url).then(() => {
    alert('✅ Enlace de verificación copiado al portapapeles')
  })
}

const checkForAdoptionStory = async () => {
  if (!certificateData.value || !certificateData.value.petId) return

  try {
    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)

    const storiesRef = dbRef(db, 'adoption_stories')
    const snapshot = await get(storiesRef)

    if (snapshot.exists()) {
      const stories = snapshot.val()

      for (const [id, story] of Object.entries(stories)) {
        if (
          story.petId === certificateData.value.petId &&
          story.userId === certificateData.value.adopterId &&
          story.adoptionId === adoptionId
        ) {
          hasAdoptionStory.value = true
          adoptionStoryId.value = id
          break
        }
      }
    }
  } catch (err) {
    console.error('Error al verificar historias de adopción:', err)
  }
}

const generateCertificateId = (id) => {
  if (!id) return 'XXXXXX'
  const prefix = id.substring(0, 6).toUpperCase()
  return `AZ-${prefix}-${new Date().getFullYear()}`
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha desconocida'
  const date = new Date(timestamp)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const handleImageError = (event) => {
  event.target.src = '/placeholder.webp'
}

const printCertificate = async () => {
  try {
    const element = certificateRef.value
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.9)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width

    pdf.addImage(imgData, 'JPEG', 0, 0, width, height)

    pdf.save(`Certificado_Adopcion_${certificateData.value?.pet?.name || 'Mascota'}.pdf`)
  } catch (err) {
    console.error('Error al generar PDF:', err)
    alert('❌ Ha ocurrido un error al generar el certificado en PDF. Por favor, intenta de nuevo.')
  }
}

const shareCertificate = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: `Certificado de Adopción - ${certificateData.value?.pet?.name || 'Mascota'}`,
        text: `¡${certificateData.value?.adopter?.name || 'Alguien'} ha adoptado a ${certificateData.value?.pet?.name || 'una mascota'}! 🎉`,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('✅ ¡Enlace copiado al portapapeles! Puedes compartirlo donde quieras.')
    }
  } catch (err) {
    console.error('Error al compartir:', err)

    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('✅ ¡Enlace copiado al portapapeles! Puedes compartirlo donde quieras.')
    } catch (clipboardErr) {
      alert('No se pudo compartir automáticamente. Por favor, copia la URL de tu navegador.')
    }
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.font-cursive {
  font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

@media print {
  body * {
    visibility: hidden;
  }

  .certificate-ref,
  .certificate-ref * {
    visibility: visible;
  }

  .certificate-ref {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
