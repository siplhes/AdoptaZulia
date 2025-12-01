<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="mx-auto px-4 max-w-5xl">
      <div v-if="loading" class="text-center py-8">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mx-auto" />
      </div>

      <div v-else-if="!report" class="rounded-lg bg-white p-6 text-center">
        <p class="text-gray-600">Reporte no encontrado</p>
      </div>

      <div v-else class="py-6">
        <LostPoster
          :name="report.name"
          :images="report.images"
          :description="report.description"
          :location="report.location"
          :lastSeenAt="report.lastSeenAt"
          :contact="report.contact"
          :reward="report.reward"
          :createdAt="report.createdAt"
        />

        <div class="mt-6 flex justify-center">
          <NuxtLink to="/perdidas" class="rounded-md border border-gray-300 bg-white px-4 py-2 mr-2">Volver</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLostPets } from '~/composables/useLostPets'
import LostPoster from '~/components/LostPoster.vue'

const route = useRoute()
const { getLostPetById } = useLostPets()

const report = ref(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id
  loading.value = true
  report.value = await getLostPetById(id)
  loading.value = false
})

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatShortDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('es-ES')
}
</script>
