import { ref, computed } from 'vue'
import { PetService } from '@/services/PetService'
import type { Pet, PetFilters } from '@/models/Pet'
import { useSecureLogger } from '@/composables/useSecureLogger'

export function usePets() {
  const petService = new PetService()
  const { error: logError } = useSecureLogger()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Referencias reactivas para almacenar datos (Compat Web)
  const pets = ref<Pet[]>([])
  const pet = ref<Pet | null>(null) // currentPet

  // Compat App
  const filters = ref<PetFilters>({})
  
  // Computed property for filtered pets (App Logic)
  const filteredPets = computed(() => {
    let result = pets.value.filter((p) => p.status === 'available' || !p.status)

    if (filters.value.type) {
      result = result.filter((p) => p.type === filters.value.type || p.typeValue === filters.value.type)
    }
    return result
  })

  // Computed for featured (App Logic) - derived from pets to ensure reactivity without extra fetches
  const featuredPets = computed(() => {
    const availablePets = pets.value.filter((pet) => pet.status === 'available' || !pet.status)
    const urgentPets = availablePets.filter((pet) => pet.urgent).sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
    const nonUrgentPets = availablePets.filter((pet) => !pet.urgent).sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
    
    let result = [...urgentPets]
    if (result.length < 6) {
       result = [...result, ...nonUrgentPets.slice(0, 6 - result.length)]
    } else {
       result = result.slice(0, 6)
    }
    return result
  })

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
      logError('Error al obtener mascotas:', err)
      error.value = 'Error al obtener las mascotas'
      return []
    } finally {
      loading.value = false
    }
  }

  // Alias for compatibility
  const loadPets = fetchAllPets

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
      logError(`Error al obtener la mascota ${id}:`, err)
      error.value = 'Error al obtener la información de la mascota'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Alias
  const loadPet = fetchPetById

  /**
   * Crea una nueva mascota
   */
  async function createPet(newPet: Pet): Promise<string> {
    loading.value = true
    error.value = null

    try {
      const petId = await petService.createPet(newPet)
      // Update local state lightly if desired, though usually we reload or redirect
      return petId
    } catch (err: any) {
      logError('Error al crear mascota:', err)
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
      logError(`Error al actualizar la mascota ${id}:`, err)
      error.value = 'Error al actualizar la información de la mascota'
      return false
    } finally {
      loading.value = false
    }
  }
  
  // Alias
  const editPet = updatePet

  /**
   * Actualiza el estado de una mascota
   */
  async function updatePetStatus(
    petId: string,
    status: 'available' | 'adopted' | 'lost' | 'found',
    adoptedBy?: string
  ): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const updates: Partial<Pet> = { status }

      if (status === 'adopted' && adoptedBy) {
        updates.adoptionDate = new Date().toISOString()
      }

      const success = await updatePet(petId, updates)
      return success
    } catch (err: any) {
      logError(`Error al actualizar el estado de la mascota ${petId}:`, err)
      error.value = 'Error al actualizar el estado de la mascota'
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

      pets.value = pets.value.filter((p) => p.id !== id)

      if (pet.value && pet.value.id === id) {
        pet.value = null
      }

      return true
    } catch (err: any) {
      logError(`Error al eliminar la mascota ${id}:`, err)
      error.value = 'Error al eliminar la mascota'
      return false
    } finally {
      loading.value = false
    }
  }
  
  // Alias
  const removePet = deletePet

  async function searchPets(searchText: string): Promise<Pet[]> {
    loading.value = true
    error.value = null
    try {
      const results = await petService.searchPets(searchText)
      pets.value = results
      return results
    } catch (err: any) {
      logError('Error al buscar mascotas:', err)
      error.value = 'Error al buscar mascotas'
      return []
    } finally {
      loading.value = false
    }
  }

  async function filterPets(filterParams: PetFilters): Promise<Pet[]> {
    loading.value = true
    error.value = null
    try {
      const results = await petService.filterPets(filterParams)
      pets.value = results
      return results
    } catch (err: any) {
      logError('Error al filtrar mascotas:', err)
      error.value = 'Error al filtrar mascotas'
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchSimilarPets(basePet: Pet, limit: number = 3): Promise<Pet[]> {
    try {
      return await petService.getSimilarPets(basePet, limit)
    } catch (err: any) {
      logError('Error al obtener mascotas similares:', err)
      return []
    }
  }

  async function fetchUserPets(userId: string): Promise<Pet[]> {
    loading.value = true
    error.value = null
    try {
      const userPets = await petService.getPetsByUserId(userId)
      return userPets
    } catch (err: any) {
      logError(`Error al obtener mascotas del usuario ${userId}:`, err)
      error.value = 'Error al obtener tus mascotas'
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Helper for App compatibility
  function setFilter(key: keyof PetFilters, value: any) {
     filters.value = { ...filters.value, [key]: value || undefined }
  }
  function clearFilters() {
    filters.value = {}
  }
  
  // Web API fetchFeaturedPets (using computed value if available, or fetch)
  async function fetchFeaturedPets(limit: number = 3) {
      if (pets.value.length === 0) {
        await fetchAllPets()
      }
      return featuredPets.value.slice(0, limit)
  }
  
  // Stubs for other Web functions
  async function fetchAdoptionStories() { return [] }
  async function isPetFavorite() { return false }
  async function addFavorite() { return true }
  async function removeFavorite() { return true }
  async function fetchTotalPetsByCategory(cat:string) { return 0 }
  async function fetchRecentPets() { return fetchAllPets() } // Approx
  async function fetchAllPetsRaw() { return petService.getAllPetsRaw() }
  async function fetchPetsByIds(ids: string[]) { return [] }

  return {
    pets,
    pet,
    currentPet: pet, // Alias
    loading,
    error,
    filters,
    filteredPets, // Legacy App support
    featuredPets, // Legacy App support
    
    // Web API
    fetchAllPets,
    fetchPetById,
    createPet,
    updatePet,
    updatePetStatus,
    deletePet,
    searchPets,
    filterPets,
    fetchSimilarPets,
    fetchUserPets,
    fetchTotalPetsByCategory,
    fetchFeaturedPets,
    fetchRecentPets,
    fetchAdoptionStories,
    isPetFavorite,
    addFavorite,
    removeFavorite,
    fetchAllPetsRaw,
    fetchPetsByIds,
    
    // App API Aliases
    loadPets,
    loadPet,
    editPet,
    removePet,
    setFilter,
    clearFilters
  }
}
