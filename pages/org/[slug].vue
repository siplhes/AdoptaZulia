<template>
  <div v-if="organization" class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="relative h-64 md:h-80 overflow-hidden">
      <img
        v-if="organization.coverImage"
        :src="organization.coverImage"
        :alt="organization.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-700" />
      
      <div class="absolute inset-0 bg-black/40" />
      
      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div class="max-w-7xl mx-auto flex items-end gap-6">
          <div class="flex-shrink-0">
            <img
              v-if="organization.logo"
              :src="organization.logo"
              :alt="organization.name"
              class="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
            />
            <div
              v-else
              class="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg bg-emerald-100 flex items-center justify-center"
            >
              <Icon name="ph:paw-print-fill" class="w-12 h-12 md:w-16 md:h-16 text-emerald-600" />
            </div>
          </div>
          
          <div class="flex-1 text-white">
            <div class="flex items-center gap-2 mb-2">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                :class="getTypeClass(organization.type)"
              >
                {{ organization.type }}
              </span>
              <span
                v-if="organization.verified"
                class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white"
              >
                ✓ Verificada
              </span>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">{{ organization.name }}</h1>
            <p v-if="organization.city" class="text-white/90 text-sm md:text-base">
              <Icon name="ph:map-pin" class="inline mr-1" />
              {{ organization.city }}, {{ organization.state }}
            </p>
            <NuxtLink
              v-if="canManageOrganization"
              :to="`/org/${organization.slug}/manage`"
              class="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <Icon name="ph:gear" class="h-4 w-4" />
              Gestionar organización
            </NuxtLink>
            <p v-else-if="user" class="mt-2 text-xs text-white/70">
              No tienes permisos para gestionar esta organización
            </p>
            <p v-else class="mt-2 text-xs text-white/70">
              <NuxtLink to="/login" class="underline hover:text-white">Inicia sesión</NuxtLink> para gestionar
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Main Info -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Sobre nosotros</h2>
            <p v-if="organization.description" class="text-gray-600 leading-relaxed">
              {{ organization.description }}
            </p>
            <p v-else class="text-gray-400 italic">No hay descripción disponible.</p>
          </div>

          <!-- Mission & Vision -->
          <div v-if="organization.mission || organization.vision" class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Nuestra misión y visión</h2>
            <div v-if="organization.mission" class="mb-4">
              <h3 class="font-semibold text-gray-900 mb-2">Misión</h3>
              <p class="text-gray-600">{{ organization.mission }}</p>
            </div>
            <div v-if="organization.vision">
              <h3 class="font-semibold text-gray-900 mb-2">Visión</h3>
              <p class="text-gray-600">{{ organization.vision }}</p>
            </div>
          </div>

          <!-- Map -->
          <div v-if="organization.coordinates" class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Ubicación</h2>
            <div class="w-full h-96">
              <MapComponent
                :center="[organization.coordinates.lng, organization.coordinates.lat]"
                :zoom="14"
                :markers="[
                  {
                    lng: organization.coordinates.lng,
                    lat: organization.coordinates.lat,
                    title: organization.name,
                    description: organization.address || organization.city
                  }
                ]"
              />
            </div>
            <p v-if="organization.address" class="mt-4 text-gray-600 text-sm">
              <Icon name="ph:map-pin" class="inline mr-1" />
              {{ organization.address }}
            </p>
          </div>

          <!-- Statistics -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl p-4 text-center shadow-sm">
              <p class="text-2xl font-bold text-emerald-600">{{ organizationPets.length }}</p>
              <p class="text-sm text-gray-600">Mascotas</p>
            </div>
            <div class="bg-white rounded-xl p-4 text-center shadow-sm">
              <p class="text-2xl font-bold text-emerald-600">{{ organization.adoptedPets || 0 }}</p>
              <p class="text-sm text-gray-600">Adoptadas</p>
            </div>
            <div class="bg-white rounded-xl p-4 text-center shadow-sm">
              <p class="text-2xl font-bold text-emerald-600">{{ organization.volunteers?.filter(v => v.status === 'active').length || 0 }}</p>
              <p class="text-sm text-gray-600">Voluntarios</p>
            </div>
            <div v-if="organization.foundedYear" class="bg-white rounded-xl p-4 text-center shadow-sm">
              <p class="text-2xl font-bold text-emerald-600">{{ organization.foundedYear }}</p>
              <p class="text-sm text-gray-600">Fundada</p>
            </div>
          </div>

          <!-- Organization Pets -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Mascotas de la organización</h2>
              <NuxtLink
                v-if="organizationPets.length > 0"
                to="/mascotas"
                class="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Ver todas
              </NuxtLink>
            </div>
            <div v-if="loadingPets" class="flex justify-center py-8">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
            <div v-else-if="organizationPets.length === 0" class="text-center py-8">
              <Icon name="ph:paw-print" class="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p class="text-gray-500">Aún no hay mascotas vinculadas.</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <NuxtLink
                v-for="pet in organizationPets.slice(0, 6)"
                :key="pet.id"
                :to="`/mascotas/${pet.id}`"
                class="group"
              >
                <div class="rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-500 transition-colors">
                  <img
                    v-if="pet.image"
                    :src="pet.image"
                    :alt="pet.name"
                    class="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div v-else class="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Icon name="ph:paw-print" class="h-12 w-12 text-gray-400" />
                  </div>
                  <div class="p-4">
                    <h3 class="font-bold text-gray-900">{{ pet.name }}</h3>
                    <p class="text-sm text-gray-500">{{ pet.type }} - {{ pet.breed || 'Sin raza' }}</p>
                    <div class="mt-2 flex items-center gap-2">
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        :class="pet.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'"
                      >
                        {{ pet.status === 'available' ? 'Disponible' : pet.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Organization News -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Noticias de la organización</h2>
              <NuxtLink
                v-if="organizationNews.length > 0"
                to="/comunidad"
                class="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Ver todas
              </NuxtLink>
            </div>
            <div v-if="loadingNews" class="flex justify-center py-8">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
            <div v-else-if="organizationNews.length === 0" class="text-center py-8">
              <Icon name="ph:newspaper" class="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p class="text-gray-500">Aún no hay noticias publicadas.</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NuxtLink
                v-for="news in organizationNews.slice(0, 4)"
                :key="news.id"
                :to="`/comunidad/noticias/${news.id}`"
                class="group"
              >
                <div class="rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-500 transition-colors">
                  <img
                    v-if="news.imageUrl"
                    :src="news.imageUrl"
                    :alt="news.title"
                    class="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div v-else class="w-full h-40 bg-gray-100 flex items-center justify-center">
                    <Icon name="ph:newspaper" class="h-12 w-12 text-gray-400" />
                  </div>
                  <div class="p-4">
                    <h3 class="font-bold text-gray-900 line-clamp-2">{{ news.title }}</h3>
                    <p class="text-xs text-gray-500 mt-2">{{ formatDate(news.createdAt) }}</p>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Right Column - Contact & Actions -->
        <div class="space-y-6">
          <!-- Contact Card -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Contacto</h2>
            <div class="space-y-3">
              <a
                v-if="organization.email"
                :href="`mailto:${organization.email}`"
                class="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Icon name="ph:envelope" class="w-5 h-5" />
                <span>{{ organization.email }}</span>
              </a>
              <a
                v-if="organization.phone"
                :href="`tel:${organization.phone}`"
                class="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Icon name="ph:phone" class="w-5 h-5" />
                <span>{{ organization.phone }}</span>
              </a>
              <a
                v-if="organization.whatsapp"
                :href="`https://wa.me/${organization.whatsapp}`"
                target="_blank"
                class="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Icon name="ph:whatsapp-logo" class="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
              <a
                v-if="organization.website"
                :href="organization.website"
                target="_blank"
                class="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Icon name="ph:globe" class="w-5 h-5" />
                <span>Sitio web</span>
              </a>
            </div>
          </div>

          <!-- Social Media -->
          <div v-if="hasSocialMedia" class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Redes sociales</h2>
            <div class="flex gap-3">
              <a
                v-if="organization.instagram"
                :href="organization.instagram"
                target="_blank"
                class="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
              >
                <Icon name="ph:instagram-logo" class="w-5 h-5" />
              </a>
              <a
                v-if="organization.facebook"
                :href="organization.facebook"
                target="_blank"
                class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Icon name="ph:facebook-logo" class="w-5 h-5" />
              </a>
              <a
                v-if="organization.twitter"
                :href="organization.twitter"
                target="_blank"
                class="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
              >
                <Icon name="ph:x-logo" class="w-5 h-5" />
              </a>
            </div>
          </div>

          <!-- Donation Links -->
          <div v-if="organization.donationLinks && organization.donationLinks.length > 0" class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Donaciones</h2>
            <div class="space-y-3">
              <a
                v-for="(link, index) in organization.donationLinks.filter(l => l.active)"
                :key="index"
                :href="link.url"
                target="_blank"
                class="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-emerald-500 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Icon name="ph:heart" class="h-5 w-5" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ link.name }}</p>
                    <p v-if="link.description" class="text-sm text-gray-500">{{ link.description }}</p>
                  </div>
                </div>
                <Icon name="ph:arrow-up-right" class="h-5 w-5 text-gray-400" />
              </a>
            </div>
          </div>

          <!-- Donation Goals -->
          <div v-if="organization.donationGoals && organization.donationGoals.filter(g => g.active).length > 0" class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Metas de Recaudación</h2>
            <div class="space-y-4">
              <div
                v-for="(goal, index) in organization.donationGoals.filter(g => g.active)"
                :key="index"
                class="rounded-lg border border-gray-200 p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <p class="font-medium text-gray-900">{{ goal.title }}</p>
                  <span class="text-sm font-medium text-emerald-600">{{ goal.currency || '$' }}{{ goal.currentAmount.toLocaleString() }} / {{ goal.currency || '$' }}{{ goal.targetAmount.toLocaleString() }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="bg-emerald-600 h-3 rounded-full transition-all"
                    :style="{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-2">{{ Math.round((goal.currentAmount / goal.targetAmount) * 100) }}% completado</p>
                <p v-if="goal.description" class="text-sm text-gray-600 mt-2">{{ goal.description }}</p>
              </div>
            </div>
          </div>

          <!-- Reviews -->
          <div v-if="organization.reviews && organization.reviews.length > 0" class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Reseñas</h2>
            <div class="space-y-4">
              <div
                v-for="(review, index) in organization.reviews.slice(0, 3)"
                :key="index"
                class="rounded-lg border border-gray-200 p-4"
              >
                <div class="flex items-center gap-3 mb-2">
                  <div class="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Icon name="ph:user" class="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ review.userName }}</p>
                    <div class="flex gap-1">
                      <Icon
                        v-for="star in 5"
                        :key="star"
                        name="ph:star-fill"
                        :class="['h-4 w-4', star <= review.rating ? 'text-amber-400' : 'text-gray-300']"
                      />
                    </div>
                  </div>
                </div>
                <p class="text-gray-600">{{ review.comment }}</p>
              </div>
            </div>
            <p v-if="organization.reviews.length > 3" class="text-sm text-emerald-600 mt-4">
              Ver {{ organization.reviews.length }} reseñas
            </p>
          </div>

          <!-- Gallery -->
          <div v-if="organization.gallery && organization.gallery.length > 0" class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Galería</h2>
            <div class="grid grid-cols-2 gap-3">
              <img
                v-for="(image, index) in organization.gallery.slice(0, 4)"
                :key="index"
                :src="image"
                :alt="`${organization.name} ${index + 1}`"
                class="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
      <p class="text-gray-600">Cargando organización...</p>
    </div>
  </div>

  <!-- Not Found State -->
  <div v-else class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center p-8">
      <Icon name="ph:warning-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Organización no encontrada</h1>
      <p class="text-gray-600 mb-6">La organización que buscas no existe o ha sido eliminada.</p>
      <NuxtLink to="/" class="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
        Volver al inicio
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { OrganizationService } from '~/services/OrganizationService'
import { PetService } from '~/services/PetService'
import type { Organization } from '~/models/Organization'
import type { Pet } from '~/models/Pet'
import { useAuth } from '~/composables/useAuth'
import { useTablon, type TablonNoticia } from '~/composables/useTablon'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const route = useRoute()
const organizationService = new OrganizationService()
const petService = new PetService()
const { user } = useAuth()
const { fetchNoticias } = useTablon()

const organization = ref<Organization | null>(null)
const organizationPets = ref<Pet[]>([])
const organizationNews = ref<TablonNoticia[]>([])
const loading = ref(true)
const loadingPets = ref(false)
const loadingNews = ref(false)

const hasSocialMedia = computed(() => {
  return !!(
    organization.value?.instagram ||
    organization.value?.facebook ||
    organization.value?.twitter
  )
})

const canManageOrganization = computed(() => {
  if (!user.value || !organization.value) return false
  return organization.value.ownerId === user.value.uid ||
         (organization.value.admins && organization.value.admins.includes(user.value.uid))
})

function getTypeClass(type: string): string {
  const classes: Record<string, string> = {
    protectora: 'bg-purple-500 text-white',
    refugio: 'bg-blue-500 text-white',
    fundacion: 'bg-amber-500 text-white',
  }
  return classes[type] || 'bg-gray-500 text-white'
}

async function loadOrganizationPets(orgId: string) {
  loadingPets.value = true
  try {
    const allPets = await petService.getAllPets()
    // Filter pets that belong to this organization
    organizationPets.value = allPets.filter(pet => (pet as any).organizationId === orgId)
  } catch (error) {
    console.error('Error al cargar mascotas:', error)
  } finally {
    loadingPets.value = false
  }
}

async function loadOrganizationNews(orgId: string) {
  loadingNews.value = true
  try {
    const allNews = await fetchNoticias()
    // Filter news that belong to this organization (by organizationId or by authorId being owner/admin)
    const ownerIds = [organization.value?.ownerId, ...(organization.value?.admins || [])].filter(Boolean)
    organizationNews.value = allNews.filter(news => 
      (news as any).organizationId === orgId || 
      ownerIds.includes(news.authorId)
    )
  } catch (error) {
    console.error('Error al cargar noticias:', error)
  } finally {
    loadingNews.value = false
  }
}

function formatDate(date: number) {
  return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
}

onMounted(async () => {
  const slug = route.params.slug as string
  
  try {
    const org = await organizationService.getOrganizationBySlug(slug)
    organization.value = org
    
    if (org) {
      // Load organization pets
      await loadOrganizationPets(org.id!)
      // Load organization news
      await loadOrganizationNews(org.id!)
    }
  } catch (error) {
    console.error('Error al cargar organización:', error)
  } finally {
    loading.value = false
  }
})

useHead({
  title: computed(() => organization.value ? `${organization.value.name} | Adopta Zulia` : 'Organización | Adopta Zulia'),
  meta: computed(() => {
    if (!organization.value) return []

    const description = organization.value.description
      ? `${organization.value.description.substring(0, 160)}...`
      : `Conoce a ${organization.value.name}, una ${organization.value.type} dedicada al rescate y adopción de mascotas en ${organization.value.city}, ${organization.value.state}.`

    return [
      { name: 'description', content: description },
      { name: 'keywords', content: `${organization.value.name}, ${organization.value.type}, adopción de mascotas, rescate animal, ${organization.value.city}, ${organization.value.state}` },
      
      // Open Graph
      { property: 'og:title', content: `${organization.value.name} | Adopta Zulia` },
      { property: 'og:description', content: description },
      { property: 'og:image', content: organization.value.logo || organization.value.coverImage || '/og-default.jpg' },
      { property: 'og:image:alt', content: organization.value.name },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `https://adoptazulia.org.ve/org/${organization.value.slug}` },
      { property: 'og:site_name', content: 'Adopta Zulia' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${organization.value.name} | Adopta Zulia` },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: organization.value.logo || organization.value.coverImage || '/og-default.jpg' },
      
      // Additional SEO
      { name: 'robots', content: 'index, follow' },
      { property: 'article:author', content: organization.value.name },
      { property: 'article:publisher', content: 'https://adoptazulia.org.ve' },
    ]
  }),
  link: computed(() => {
    if (!organization.value) return []
    return [
      { rel: 'canonical', href: `https://adoptazulia.org.ve/org/${organization.value.slug}` }
    ]
  }),
})
</script>
