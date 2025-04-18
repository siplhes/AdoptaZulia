<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePets } from '~/composables/usePets'
import { useStats } from '~/composables/useStats'

// Referencias para almacenar datos
const recentPets = ref([])
const siteStats = ref({
  totalPets: 0,
  totalAdoptions: 0,
  totalUsers: 0
})
const currentYear = new Date().getFullYear()

// Obtener mascotas recientes al montar el componente
onMounted(async () => {
  try {
    // Obtener mascotas recientes
    const { fetchAllPets } = usePets()
    const allPets = await fetchAllPets()
    // Ordenar por fecha de creación (más recientes primero) y tomar las 6 primeras
    recentPets.value = allPets
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)

    // Obtener estadísticas
    const { fetchPublicStats, stats } = useStats()
    await fetchPublicStats()
    siteStats.value = {
      totalPets: stats.value.totalPets,
      totalAdoptions: stats.value.totalAdoptions,
      totalUsers: stats.value.totalUsers
    }
  } catch (error) {
    console.error('Error al cargar datos para el footer:', error)
  }
})

function handleImageError(event:any) {
  event.target.src = '/placeholder.webp?height=150&width=150'
}
</script>
<template>
  <footer class="bg-emerald-700 pt-12 text-[#FEFFFA]">
    <div class="container mx-auto px-4 sm:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <!-- Columna 1: Información de contacto -->
        <div class="flex flex-col items-center lg:items-start">
          <NuxtLink to="/" class="mb-4 inline-flex items-center text-3xl font-bold">
            Adopta Zulia
          </NuxtLink>
          <p class="mb-6 text-center lg:text-left">
            Dedicados a rescatar a los animales que más nos necesitan
          </p>
          
          <!-- Redes sociales -->
          <div class="mb-6 flex flex-wrap gap-4">
            <NuxtLink 
              href="https://www.facebook.com/profile.php?id=61574778734797" 
              aria-label="facebook" 
              external 
              target="_blank"
              class="rounded-full bg-emerald-600 p-2 transition-colors hover:bg-emerald-500 flex items-center justify-center"
            >
              <Icon name="mdi:facebook" size="24px" />
            </NuxtLink>
            <NuxtLink 
              href="https://x.com/AdoptaZulia" 
              aria-label="twitter" 
              external 
              target="_blank"
              class="rounded-full bg-emerald-600 p-2 transition-colors hover:bg-emerald-500 flex items-center justify-center"
             >
              <Icon name="mdi:twitter" size="24px" />
            </NuxtLink>
            <NuxtLink 
              href="https://instagram.com/adopta.zulia" 
              aria-label="instagram" 
              external 
              target="_blank"
               class="rounded-full bg-emerald-600 p-2 transition-colors hover:bg-emerald-500 flex items-center justify-center"
             >
              <Icon name="mdi:instagram" size="24px" />
            </NuxtLink>
                      <NuxtLink 
              href="https://wa.me/584146646526" 
              aria-label="instagram" 
              external 
              target="_blank"
               class="rounded-full bg-emerald-600 p-2 transition-colors hover:bg-emerald-500 flex items-center justify-center"
             >
              <Icon name="mdi:whatsapp" size="24px" />
            </NuxtLink>
          </div>
          
          <!-- Información de contacto -->
          <div class="text-center lg:text-left">
            <p class="mb-2 flex items-center justify-center lg:justify-start">
              <Icon name="mdi:phone" class="mr-2" size="20px" />
              <NuxtLink to="https://wa.me/584146646526" target="_blank" >+58 414 664 6526</NuxtLink>
            </p>
            <p class="flex items-center justify-center lg:justify-start">
              <Icon name="mdi:email" class="mr-2" size="20px" />
              <a href="mailto:adoptazulia@gmail.com">adoptazulia@gmail.com</a>
            </p>
          </div>
        </div>

        <!-- Columna 2: Enlaces útiles -->
        <div class="mx-auto flex flex-col items-center lg:items-start">
          <h2 class="mb-4 text-xl font-bold mx-auto">Enlaces útiles</h2>
          <ul class="space-y-3 text-center lg:text-left">
            <li>
              <NuxtLink to="/mascotas" class="transition-colors hover:text-emerald-300 text-center">
                Adopta una mascota
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/publicar" class="transition-colors hover:text-emerald-300 text-center">
                Publicar en adopción
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/donaciones" class="transition-colors hover:text-emerald-300 text-center">
                Haz una donación
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/historias" class="transition-colors hover:text-emerald-300 text-center">
                Historias de adopción
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/nosotros" class="transition-colors hover:text-emerald-300 text-center">
                Sobre nosotros
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Estadísticas -->
        <div class="mx-auto flex flex-col items-center lg:items-start">
          <h2 class="mb-6 text-xl font-bold text-center ">Nuestro impacto</h2>
          <div class="space-y-6">
            <div class="flex items-center">
              <div class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
                <Icon name="mdi:paw" class="h-6 w-6" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ siteStats.totalPets || 1240 }}</p>
                <p class="text-sm text-emerald-200">Mascotas registradas</p>
              </div>
            </div>
            
            <div class="flex items-center">
              <div class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
                <Icon name="mdi:heart" class="h-6 w-6" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ siteStats.totalAdoptions || 0 }}</p>
                <p class="text-sm text-emerald-200">Adopciones exitosas</p>
              </div>
            </div>
            
            <div class="flex items-center">
              <div class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
                <Icon name="mdi:account-group" class="h-6 w-6" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ siteStats.totalUsers || 3500 }}</p>
                <p class="text-sm text-emerald-200">Usuarios registrados</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna 4: Mascotas recientes -->
        <div>
          <h2 class="mb-4 text-xl font-bold">Mascotas recientes</h2>
          <div class="grid grid-cols-3 gap-2">
            <NuxtLink 
              v-for="pet in recentPets" 
              :key="pet.id" 
              :to="`/mascotas/${pet.id}`"
              class="block overflow-hidden rounded-lg transition-transform hover:scale-105"
            >
              <NuxtImg 
                :src="pet.photos && pet.photos[0] ? pet.photos[0] : '/placeholder.webp'" 
                :alt="pet.name" 
                class="h-20 w-full object-cover"
                loading="lazy"
                @error="handleImageError"
              />
            </NuxtLink>
            
            <!-- Mostrar imágenes de placeholder si no hay suficientes mascotas -->
            <NuxtLink 
              v-for="index in Math.max(0, 6 - recentPets.length)" 
              :key="`placeholder-${index}`" 
              to="/mascotas"
              class="block overflow-hidden rounded-lg transition-transform hover:scale-105"
            >
              <NuxtImg 
                src="/placeholder.webp" 
                alt="Adopta una mascota" 
                class="h-20 w-full object-cover"
                loading="lazy"
              />
            </NuxtLink>
          </div>
          <div class="mt-4 text-center">
            <NuxtLink 
              to="/mascotas" 
              class="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-emerald-500"
            >
              Ver todas las mascotas
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Copyright y términos -->
      <div class="mt-10 border-t border-emerald-600 py-6">
        <div class="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p>
            &copy; {{ currentYear }} Adopta Zulia. Todos los derechos reservados.
          </p>
          <div class="flex gap-4">
            <NuxtLink to="/terminos" class="text-sm transition-colors hover:text-emerald-300">
              Términos de uso
            </NuxtLink>
            <NuxtLink to="/privacidad" class="text-sm transition-colors hover:text-emerald-300">
              Política de privacidad
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Podemos agregar estilos específicos si es necesario */
</style>
