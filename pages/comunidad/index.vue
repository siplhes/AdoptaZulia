<template>
  <div class="min-h-screen bg-page py-12">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Comunidad y Novedades</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Mantente al día con las últimas noticias de nuestros refugios y participa en nuestros próximos eventos.
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center mb-10">
        <div class="inline-flex bg-white rounded-full p-1 border border-gray-200 shadow-sm">
          <button
            @click="activeTab = 'noticias'"
            :class="['px-6 py-2.5 rounded-full text-sm font-bold transition-colors', activeTab === 'noticias' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50']"
          >
            Noticias
          </button>
          <button
            @click="activeTab = 'eventos'"
            :class="['px-6 py-2.5 rounded-full text-sm font-bold transition-colors', activeTab === 'eventos' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50']"
          >
            Eventos
          </button>
          <button
            @click="activeTab = 'organizaciones'"
            :class="['px-6 py-2.5 rounded-full text-sm font-bold transition-colors', activeTab === 'organizaciones' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50']"
          >
            Organizaciones
          </button>
        </div>
      </div>

      <!-- Content: Noticias -->
      <div v-show="activeTab === 'noticias'">
        <div v-if="loading" class="flex justify-center py-20">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
        </div>
        <div v-else-if="noticias.length === 0" class="text-center py-20">
          <Icon name="ph:newspaper-duotone" class="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg">Aún no hay noticias publicadas.</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TablonNewsCard v-for="noticia in noticias" :key="noticia.id" :noticia="noticia" />
        </div>
      </div>

      <!-- Content: Eventos -->
      <div v-show="activeTab === 'eventos'">
        <div v-if="loading" class="flex justify-center py-20">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"></div>
        </div>
        <div v-else-if="eventos.length === 0" class="text-center py-20">
          <Icon name="ph:calendar-x-duotone" class="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg">No hay eventos próximos agendados.</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TablonEventCard v-for="evento in eventos" :key="evento.id" :evento="evento" />
        </div>
      </div>

      <!-- Content: Organizaciones -->
      <div v-show="activeTab === 'organizaciones'">
        <div v-if="orgsLoading" class="flex justify-center py-20">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        </div>
        <div v-else-if="organizations.length === 0" class="text-center py-20">
          <Icon name="ph:buildings" class="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg">Aún no hay organizaciones registradas.</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="org in organizations"
            :key="org.id"
            :to="`/org/${org.slug}`"
            class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="h-16 w-16 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <img
                  v-if="org.logo"
                  :src="org.logo"
                  :alt="org.name"
                  class="h-12 w-12 rounded-lg object-cover"
                />
                <Icon v-else name="ph:paw-print-fill" class="h-8 w-8 text-emerald-600" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 truncate">{{ org.name }}</h3>
                <p class="text-sm text-gray-500">{{ org.city }}, {{ org.state }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2 mb-4">{{ org.description || 'Sin descripción' }}</p>
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-1 rounded-full text-xs font-bold uppercase"
                :class="getTypeClass(org.type)"
              >
                {{ org.type }}
              </span>
              <span
                v-if="org.verified"
                class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
              >
                ✓ Verificada
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TablonNewsCard from '~/components/tablon/NewsCard.vue'
import TablonEventCard from '~/components/tablon/EventCard.vue'
import { OrganizationService } from '~/services/OrganizationService'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Comunidad | Adopta Zulia',
})

const activeTab = ref('noticias')
const organizationService = new OrganizationService()

const { data: noticiasResponse, pending: noticiasPending } = useAsyncData('tablon-noticias', () => $fetch('/api/tablon/noticias'))
const { data: eventosResponse, pending: eventosPending } = useAsyncData('tablon-eventos', () => $fetch('/api/tablon/eventos'))
const { data: organizationsResponse, pending: orgsPending } = useAsyncData('organizations', () => organizationService.getAllOrganizationsRaw())

const noticias = computed(() => noticiasResponse.value?.noticias ?? [])
const eventos = computed(() => eventosResponse.value?.eventos ?? [])
const organizations = computed(() => organizationsResponse.value ?? [])
const loading = computed(() => noticiasPending.value || eventosPending.value)
const orgsLoading = computed(() => orgsPending.value)

function getTypeClass(type: string): string {
  const classes: Record<string, string> = {
    protectora: 'bg-purple-100 text-purple-700',
    refugio: 'bg-blue-100 text-blue-700',
    fundacion: 'bg-amber-100 text-amber-700',
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}
</script>
