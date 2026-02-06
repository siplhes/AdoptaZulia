<template>
  <div class="min-h-screen bg-amber-50 py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 class="text-2xl font-bold text-emerald-800 mb-4">Verificar Certificado</h1>

        <div v-if="loading" class="text-center py-8">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mx-auto" />
          <p class="mt-2 text-gray-600">Buscando verificación...</p>
        </div>

        <div v-else-if="!verification" class="text-center py-8">
          <Icon name="heroicons:exclamation-triangle" class="h-12 w-12 mx-auto text-yellow-500" />
          <h2 class="mt-4 text-lg font-semibold text-gray-800">Verificación no encontrada</h2>
          <p class="mt-2 text-sm text-gray-600">El identificador proporcionado no corresponde a una verificación válida.</p>
        </div>

        <div v-else class="space-y-4">
          <div class="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <p class="text-sm text-gray-700">Verificación: <span class="font-mono">{{ vid }}</span></p>
            <p class="text-sm text-gray-700">Fecha de verificación: <strong>{{ formatDate(verification.verifiedAt) }}</strong></p>
          </div>

          <div class="bg-white rounded-lg border p-4">
            <h3 class="text-lg font-semibold text-gray-800">Mascota</h3>
            <div class="mt-2 flex items-center">
              <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                <img v-if="pet?.image" :src="pet.image" class="h-full w-full object-cover" >
                <div v-else class="flex h-full w-full items-center justify-center">
                  <Icon name="heroicons:paw-print" class="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div class="ml-4">
                <p class="font-medium text-gray-900">{{ pet?.name || 'No disponible' }}</p>
                <p class="text-sm text-gray-500">{{ pet?.species || '' }} {{ pet?.breed ? '- ' + pet.breed : '' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border p-4">
            <h3 class="text-lg font-semibold text-gray-800">Adoptante</h3>
            <div class="mt-2">
              <p class="font-medium text-gray-900">{{ adopter?.displayName || adopter?.email || 'No disponible' }}</p>
              <p class="text-sm text-gray-500">{{ adopter?.email || '' }}</p>
            </div>
          </div>

          <div class="bg-white rounded-lg border p-4">
            <h3 class="text-lg font-semibold text-gray-800">Detalles de la verificación</h3>
            <p class="mt-2 text-sm text-gray-700">{{ verification.note || 'Sin notas' }}</p>
            <div class="mt-4">
              <NuxtLink v-if="certificateLink" :to="certificateLink" class="text-amber-800 underline">Ver certificado asociado</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdoptions } from '~/composables/useAdoptions'
import { usePets } from '~/composables/usePets'
import { useUsers } from '~/composables/useUsers'

const route = useRoute()
const vid = route.query.vid || route.params.vid || null

const loading = ref(true)
const verification = ref(null)
const pet = ref(null)
const adopter = ref(null)
const certificateLink = ref(null)

const { fetchVerification } = useAdoptions()
const { fetchPetById } = usePets()
const { fetchUserById } = useUsers()

onMounted(async () => {
  try {
    if (!vid) {
      loading.value = false
      return
    }

    // 1. Obtener verificación
    verification.value = await fetchVerification(vid)
    
    if (!verification.value) {
      loading.value = false
      return
    }

    // 2. Cargar mascota y adoptante en paralelo
    const promises = []
    
    if (verification.value.petId) {
      promises.push(fetchPetById(verification.value.petId).then(p => pet.value = p))
    }
    
    if (verification.value.adopterId) {
      promises.push(fetchUserById(verification.value.adopterId).then(u => adopter.value = u))
    }

    await Promise.allSettled(promises)

    // 3. Configurar enlace
    if (verification.value.adoptionId) {
      certificateLink.value = `/certificados/${verification.value.adoptionId}`
    }
  } catch (e) {
    console.error('Error loading verification:', e)
  } finally {
    loading.value = false
  }
})

function formatDate(ts) {
  if (!ts) return 'Fecha desconocida'
  const d = new Date(ts)
  return d.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>
