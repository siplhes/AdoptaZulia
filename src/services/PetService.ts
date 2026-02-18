import {
  ref as dbRef,
  push,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  limitToLast,
} from 'firebase/database'
import { getDb } from '@/config/firebase'
import type { Pet, PetFilters } from '@/models/Pet'

export class PetService {
  private db = getDb()
  private petsRef = dbRef(this.db, 'pets')

  /**
   * Crea una nueva mascota en la base de datos
   */
  async createPet(pet: Pet): Promise<string> {
    const newPetRef = push(this.petsRef)
    const petId = newPetRef.key!

    // Añadir el ID a la mascota
    const petWithId = { ...pet, id: petId }

    // Guardar en la base de datos
    await set(newPetRef, petWithId)

    return petId
  }

  /**
   * Obtiene una mascota por su ID
   */
  async getPetById(id: string): Promise<Pet | null> {
    const petRef = dbRef(this.db, `pets/${id}`)
    const snapshot = await get(petRef)

    if (snapshot.exists()) {
      return snapshot.val() as Pet
    }

    return null
  }

  /**
   * Actualiza una mascota existente
   */
  async updatePet(id: string, updates: Partial<Pet>): Promise<void> {
    // Check protection
    const pet = await this.getPetById(id)
    if (pet && (pet as any).isTest) {
      console.warn('Editando mascota de prueba...')
    }

    const petRef = dbRef(this.db, `pets/${id}`)
    await update(petRef, updates)
  }

  /**
   * Elimina una mascota
   */
  async deletePet(id: string): Promise<void> {
    // Check protection
    const pet = await this.getPetById(id)
    if (pet && (pet as any).isTest) {
      console.warn('Eliminando mascota de prueba...')
    }

    // Cascade Delete Logic
    try {
      // 1. Delete Adoptions
      // Dynamic import to avoid circular dependency if any
      const { AdoptionService } = await import('@/services/AdoptionService')
      const adoptionService = new AdoptionService()
      const adoptions = await adoptionService.deleteAdoptionsByPetId(id)

      // 2. Delete Notifications
      // We need to find notifications related to this pet for users
      const usersToCheck = new Set<string>()
      if (pet?.userId) usersToCheck.add(pet.userId)
      adoptions.forEach((a) => usersToCheck.add(a.userId))

      if (usersToCheck.size > 0) {
        const updates: Record<string, null> = {}
        for (const uid of usersToCheck) {
          const notifRef = dbRef(this.db, `notifications/${uid}`)
          const snapshot = await get(notifRef)
          if (snapshot.exists()) {
            snapshot.forEach((child) => {
              const val = child.val()
              if (val.data?.petId === id || adoptions.some((a) => a.id === val.data?.adoptionId)) {
                updates[`notifications/${uid}/${child.key}`] = null
              }
            })
          }
        }
        if (Object.keys(updates).length > 0) {
          await update(dbRef(this.db), updates)
        }
      }
    } catch (e) {
      console.warn('Error en borrado en cascada (continuando con borrado de mascota):', e)
    }

    const petRef = dbRef(this.db, `pets/${id}`)
    await remove(petRef)
  }

  /**
   * Obtiene todas las mascotas (excluye datos de prueba para vistas públicas)
   */
  async getAllPets(): Promise<Pet[]> {
    const snapshot = await get(this.petsRef)

    if (snapshot.exists()) {
      const pets: Pet[] = []
      snapshot.forEach((childSnapshot) => {
        const val = childSnapshot.val()
        const pet = { id: childSnapshot.key, ...val } as Pet
        // Filter out test data for public views
        if (!(pet as any).isTest) {
          pets.push(pet)
        }
      })
      return pets
    }

    return []
  }

  /**
   * Obtiene TODAS las mascotas (incluyendo datos de prueba - para admin)
   */
  async getAllPetsRaw(): Promise<Pet[]> {
    const snapshot = await get(this.petsRef)

    if (snapshot.exists()) {
      const pets: Pet[] = []
      snapshot.forEach((childSnapshot) => {
        pets.push({ id: childSnapshot.key, ...childSnapshot.val() } as Pet)
      })
      return pets
    }

    return []
  }

  /**
   * Obtiene las mascotas más recientes
   */
  async getRecentPets(limit: number): Promise<Pet[]> {
    try {
      // Intentar ordenar por fecha de creación si existe el índice
      const petsQuery = query(this.petsRef, orderByChild('createdAt'), limitToLast(limit))
      const snapshot = await get(petsQuery)

      if (snapshot.exists()) {
        const pets: Pet[] = []
        snapshot.forEach((childSnapshot) => {
          pets.push({ id: childSnapshot.key, ...childSnapshot.val() } as Pet)
        })
        return pets.reverse()
      }
      return []
    } catch (error) {
      console.warn('Error al obtener mascotas recientes con query, usando fallback:', error)
      const all = await this.getAllPets()
      return all
        .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
        .slice(0, limit)
    }
  }

  /**
   * Obtiene mascotas por tipo
   */
  async getPetsByType(type: string): Promise<Pet[]> {
    try {
      const petsQuery = query(this.petsRef, orderByChild('typeValue'), equalTo(type))
      const snapshot = await get(petsQuery)

      if (snapshot.exists()) {
        const pets: Pet[] = []
        snapshot.forEach((childSnapshot) => {
          pets.push({ id: childSnapshot.key, ...childSnapshot.val() } as Pet)
        })
        return pets
      }

      return []
    } catch (error: any) {
      console.warn(`Error al obtener mascotas de tipo ${type}, usando fallback.`, error.message)
      // Fallback
      try {
        const allPets = await this.getAllPets()
        return allPets.filter((pet) => pet.typeValue === type)
      } catch (fallbackError) {
        return []
      }
    }
  }

  /**
   * Obtiene las mascotas de un usuario
   */
  async getPetsByUserId(userId: string): Promise<Pet[]> {
    const petsQuery = query(this.petsRef, orderByChild('userId'), equalTo(userId))
    const snapshot = await get(petsQuery)

    if (snapshot.exists()) {
      const pets: Pet[] = []
      snapshot.forEach((childSnapshot) => {
        pets.push({ id: childSnapshot.key, ...childSnapshot.val() } as Pet)
      })
      return pets
    }

    return []
  }

  /**
   * Buscar mascotas por texto
   */
  async searchPets(searchText: string): Promise<Pet[]> {
    const allPets = await this.getAllPets()

    if (!searchText) return allPets

    const searchTerms = searchText.toLowerCase().split(' ')

    return allPets.filter((pet) => {
      const petName = pet.name.toLowerCase()
      const petBreed = pet.breed?.toLowerCase() || ''
      const petLocation = pet.location?.toLowerCase() || ''
      const petDescription = pet.description?.toLowerCase() || ''

      return searchTerms.some(
        (term) =>
          petName.includes(term) ||
          petBreed.includes(term) ||
          petLocation.includes(term) ||
          petDescription.includes(term)
      )
    })
  }

  /**
   * Filtrar mascotas según criterios
   */
  async filterPets(filters: PetFilters): Promise<Pet[]> {
    const allPets = await this.getAllPets()

    return allPets.filter((pet) => {
      // Filtro por tipos
      if (filters.types && filters.types.length > 0) {
        if (!pet.typeValue || !filters.types.includes(pet.typeValue)) {
          return false
        }
      }

      // Filtro por edades
      if (filters.ages && filters.ages.length > 0) {
        if (!pet.ageValue || !filters.ages.includes(pet.ageValue)) {
          return false
        }
      }

      // Filtro por tamaños
      if (filters.sizes && filters.sizes.length > 0) {
        if (!pet.sizeValue || !filters.sizes.includes(pet.sizeValue)) {
          return false
        }
      }

      // Filtro por género
      if (filters.gender && pet.gender !== filters.gender) {
        return false
      }

      // Filtro por vacunación
      if (filters.vaccinated && !pet.vaccinated) {
        return false
      }

      // Filtro por esterilización
      if (filters.neutered && !pet.neutered) {
        return false
      }

      // Filtro por urgencia
      if (filters.urgent && !pet.urgent) {
        return false
      }

      // Filtro por ubicación
      if (filters.location && pet.location !== filters.location) {
        return false
      }

      return true
    })
  }

  /**
   * Obtener mascotas similares basadas en una mascota dada
   */
  async getSimilarPets(pet: Pet, limit: number = 3): Promise<Pet[]> {
    if (!pet.typeValue) return []
    const petsOfSameType = await this.getPetsByType(pet.typeValue)

    const similarPets = petsOfSameType
      .filter((p) => p.id !== pet.id)
      .sort((a, b) => this.calculateSimilarity(pet, b) - this.calculateSimilarity(pet, a))
      .slice(0, limit)

    return similarPets
  }

  /**
   * Calcula un puntaje de similitud entre dos mascotas
   */
  private calculateSimilarity(petA: Pet, petB: Pet): number {
    let score = 0
    if (petA.typeValue === petB.typeValue) score += 5
    if (petA.breed === petB.breed) score += 10
    if (petA.ageValue === petB.ageValue) score += 3
    if (petA.sizeValue === petB.sizeValue) score += 3
    if (petA.gender === petB.gender) score += 2
    if (petA.location === petB.location) score += 5
    return score
  }
}
