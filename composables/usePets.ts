import { ref } from 'vue'
import { PetService } from '~/services/PetService'
import type { Pet, PetFilters } from '~/models/Pet'

export function usePets() {
  const petService = new PetService()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Referencias reactivas para almacenar datos
  const pets = ref<Pet[]>([])
  const pet = ref<Pet | null>(null)

  /**
   * Obtiene todas las mascotas
   */
  async function fetchAllPets() {
    loading.value = true
    error.value = null

    try {
      pets.value = await petService.getAllPets()
      return pets.value
    } catch (err: any) {
      console.error('Error al obtener mascotas:', err)
      error.value = 'Error al obtener las mascotas'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene una mascota por su ID
   */
  async function fetchPetById(id: string) {
    loading.value = true
    error.value = null

    try {
      pet.value = await petService.getPetById(id)
      return pet.value
    } catch (err: any) {
      console.error(`Error al obtener la mascota ${id}:`, err)
      error.value = 'Error al obtener la información de la mascota'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva mascota
   */
  async function createPet(newPet: Pet): Promise<string> {
    loading.value = true
    error.value = null

    try {
      const petId = await petService.createPet(newPet)
      return petId
    } catch (err: any) {
      console.error('Error al crear mascota:', err)
      error.value = 'Error al publicar la mascota'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza una mascota existente
   */
  async function updatePet(id: string, updates: Partial<Pet>): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await petService.updatePet(id, updates)
      // Si la mascota actual es la que estamos actualizando, actualizarla también
      if (pet.value && pet.value.id === id) {
        pet.value = { ...pet.value, ...updates }
      }

      // Actualizar también en la lista de mascotas si existe
      const index = pets.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        pets.value[index] = { ...pets.value[index], ...updates }
      }

      return true
    } catch (err: any) {
      console.error(`Error al actualizar la mascota ${id}:`, err)
      error.value = 'Error al actualizar la información de la mascota'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una mascota
   */
  async function deletePet(id: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await petService.deletePet(id)

      // Eliminar de la lista de mascotas si existe
      pets.value = pets.value.filter((p) => p.id !== id)

      // Si la mascota actual es la que estamos eliminando, limpiarla
      if (pet.value && pet.value.id === id) {
        pet.value = null
      }

      return true
    } catch (err: any) {
      console.error(`Error al eliminar la mascota ${id}:`, err)
      error.value = 'Error al eliminar la mascota'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca mascotas por texto
   */
  async function searchPets(searchText: string): Promise<Pet[]> {
    loading.value = true
    error.value = null

    try {
      const results = await petService.searchPets(searchText)
      pets.value = results
      return results
    } catch (err: any) {
      console.error('Error al buscar mascotas:', err)
      error.value = 'Error al buscar mascotas'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Filtra mascotas según criterios
   */
  async function filterPets(filters: PetFilters): Promise<Pet[]> {
    loading.value = true
    error.value = null

    try {
      const results = await petService.filterPets(filters)
      pets.value = results
      return results
    } catch (err: any) {
      console.error('Error al filtrar mascotas:', err)
      error.value = 'Error al filtrar mascotas'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene mascotas similares
   */
  async function fetchSimilarPets(basePet: Pet, limit: number = 3): Promise<Pet[]> {
    try {
      return await petService.getSimilarPets(basePet, limit)
    } catch (err: any) {
      console.error('Error al obtener mascotas similares:', err)
      return []
    }
  }

  /**
   * Obtiene las mascotas de un usuario
   */
  async function fetchUserPets(userId: string): Promise<Pet[]> {
    loading.value = true
    error.value = null

    try {
      const userPets = await petService.getPetsByUserId(userId)
      return userPets
    } catch (err: any) {
      console.error(`Error al obtener mascotas del usuario ${userId}:`, err)
      error.value = 'Error al obtener tus mascotas'
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchTotalPetsByCategory(category: string): Promise<Pet[]> {
    try {
      // Obtener todas las mascotas del tipo específico
      const petsOfType = await petService.getPetsByType(category)

      // Filtrar para devolver solo las mascotas disponibles para adopción
      // Incluir mascotas sin estado definido (null/undefined) o con estado "available"
      const availablePets = petsOfType.filter(
        (pet) =>
          !pet.status ||
          pet.status === 'available' ||
          pet.status === 'lost' ||
          pet.status === 'found'
      )

      return availablePets
    } catch (err: any) {
      console.error(`Error al obtener mascotas de tipo ${category}:`, err)
      return []
    }
  }

  /**
   * Obtiene las mascotas destacadas (urgentes y más antiguas)
   */
  async function fetchFeaturedPets(limit: number = 3): Promise<Pet[]> {
    loading.value = true
    error.value = null

    try {
      // Obtener todas las mascotas
      const allPets = await petService.getAllPets()

      // Filtrar por urgentes primero, luego por fecha de creación (más antiguas)
      const urgentPets = allPets
        .filter((pet) => pet.urgent && pet.status === 'available')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      // Si no hay suficientes urgentes, completar con otras mascotas ordenadas por fecha
      if (urgentPets.length < limit) {
        const nonUrgentPets = allPets
          .filter((pet) => !pet.urgent && pet.status === 'available')
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        return [...urgentPets, ...nonUrgentPets].slice(0, limit)
      }

      return urgentPets.slice(0, limit)
    } catch (err: any) {
      console.error('Error al obtener mascotas destacadas:', err)
      error.value = 'Error al obtener las mascotas destacadas'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene mascotas por sus IDs
   */
  async function fetchPetsByIds(petIds: string[]): Promise<Pet[]> {
    loading.value = true
    error.value = null

    try {
      if (!petIds || petIds.length === 0) {
        return []
      }
      
      const petPromises = petIds.map(id => petService.getPetById(id))
      const petsResults = await Promise.all(petPromises)
      
      // Filtrar los resultados nulos (mascotas no encontradas)
      return petsResults.filter(pet => pet !== null) as Pet[]
    } catch (err: any) {
      console.error('Error al obtener mascotas por IDs:', err)
      error.value = 'Error al obtener las mascotas favoritas'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene historias de adopción exitosas
   */
  async function fetchAdoptionStories(limit: number = 3): Promise<any[]> {
    loading.value = true
    error.value = null

    try {
      // En un escenario real, estas historias vendrían de una colección específica en la base de datos
      // Por ahora, simulamos este comportamiento con datos estáticos
      const stories = [
        {
          id: 1,
          name: 'María García',
          location: 'Maracaibo',
          image: '/placeholder.webp?height=100&width=100',
          quote:
            'Adoptar a Rocky fue la mejor decisión que tomamos como familia. El proceso fue sencillo y el equipo de AdoptaZulia nos apoyó en cada paso.',
          petName: 'Rocky',
          petImage: '/placeholder.webp?height=100&width=100',
        },
        {
          id: 2,
          name: 'Carlos Rodríguez',
          location: 'San Francisco',
          image: '/placeholder.webp?height=100&width=100',
          quote:
            'Después de perder a mi gato de 15 años, pensé que nunca volvería a tener una mascota. Gracias a AdoptaZulia, encontré a Milo y ha llenado mi vida de alegría.',
          petName: 'Milo',
          petImage: '/placeholder.webp?height=100&width=100',
        },
        {
          id: 3,
          name: 'Laura Martínez',
          location: 'Cabimas',
          image: '/placeholder.webp?height=100&width=100',
          quote:
            'El proceso de adopción fue muy profesional. Me encantó que hicieran un seguimiento después para asegurarse de que Luna se estaba adaptando bien.',
          petName: 'Luna',
          petImage: '/placeholder.webp?height=100&width=100',
        },
      ]

      return stories.slice(0, limit)
    } catch (err: any) {
      console.error('Error al obtener historias de adopción:', err)
      error.value = 'Error al obtener historias de adopción'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    pets,
    pet,
    loading,
    error,
    fetchAllPets,
    fetchPetById,
    fetchPetsByIds,
    createPet,
    updatePet,
    deletePet,
    searchPets,
    filterPets,
    fetchSimilarPets,
    fetchUserPets,
    fetchTotalPetsByCategory,
    fetchFeaturedPets,
    fetchAdoptionStories,
  }
}
