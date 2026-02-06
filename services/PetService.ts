import {
  getDatabase,
  ref,
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
import type { Pet, PetFilters } from '~/models/Pet'

export class PetService {
  private db = getDatabase()
  private petsRef = ref(this.db, 'pets')

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
    const petRef = ref(this.db, `pets/${id}`)
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
    const petRef = ref(this.db, `pets/${id}`)
    await update(petRef, updates)
  }

  /**
   * Elimina una mascota
   */
  async deletePet(id: string): Promise<void> {
    const petRef = ref(this.db, `pets/${id}`)
    await remove(petRef)
  }

  /**
   * Obtiene todas las mascotas
   */
  async getAllPets(): Promise<Pet[]> {
    const snapshot = await get(this.petsRef)

    if (snapshot.exists()) {
      const pets: Pet[] = []
      snapshot.forEach((childSnapshot) => {
        pets.push(childSnapshot.val() as Pet)
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
          pets.push(childSnapshot.val() as Pet)
        })
        // Firebase devuelve orden ascendente (más antiguo a más nuevo con limitToLast), 
        // así que invertimos para tener el más nuevo primero
        return pets.reverse()
      }
      return []
    } catch (error) {
       console.warn('Error al obtener mascotas recientes con query, usando fallback:', error)
       // Fallback: Obtener todas y cortar (no óptimo pero funciona sin índices)
       const all = await this.getAllPets()
       return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit)
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
          pets.push(childSnapshot.val() as Pet)
        })
        return pets
      }

      return []
    } catch (error: any) {
      console.error(`Error al obtener mascotas de tipo ${type}:`, error.message)
      // Si el error es sobre índices, proporcionar instrucciones más claras
      if (error.message && error.message.includes('Index not defined')) {
        console.warn("Es necesario configurar el índice 'typeValue' en las reglas de Firebase")
        console.warn(
          'Reglas sugeridas: { "rules": { ".read": true, ".write": true, "pets": { ".indexOn": ["typeValue", "userId"] } } }'
        )
      }
      // Como solución alternativa, si falla la consulta indexada, intentamos obtener todas las mascotas y filtrarlas manualmente
      try {
        console.warn('Intentando método alternativo: filtrado manual')
        const allPets = await this.getAllPets()
        return allPets.filter((pet) => pet.typeValue === type)
      } catch (fallbackError) {
        console.error('También falló el método alternativo:', fallbackError)
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
        pets.push(childSnapshot.val() as Pet)
      })
      return pets
    }

    return []
  }

  /**
   * Buscar mascotas por texto
   */
  async searchPets(searchText: string): Promise<Pet[]> {
    // Primero obtenemos todas las mascotas
    const allPets = await this.getAllPets()

    // Filtrar por texto de búsqueda
    if (!searchText) return allPets

    const searchTerms = searchText.toLowerCase().split(' ')

    return allPets.filter((pet) => {
      const petName = pet.name.toLowerCase()
      const petBreed = pet.breed.toLowerCase()
      const petLocation = pet.location.toLowerCase()
      const petDescription = pet.description.toLowerCase()

      // Verificar si algún término de búsqueda coincide con los campos de la mascota
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
    // Primero obtenemos todas las mascotas
    const allPets = await this.getAllPets()

    // Aplicar filtros
    return allPets.filter((pet) => {
      // Filtro por tipos
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(pet.typeValue)) {
          return false
        }
      }

      // Filtro por edades
      if (filters.ages && filters.ages.length > 0) {
        if (!filters.ages.includes(pet.ageValue)) {
          return false
        }
      }

      // Filtro por tamaños
      if (filters.sizes && filters.sizes.length > 0) {
        if (!filters.sizes.includes(pet.sizeValue)) {
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

      // Si pasa todos los filtros, la mascota cumple los criterios
      return true
    })
  }

  /**
   * Obtener mascotas similares basadas en una mascota dada
   */
  async getSimilarPets(pet: Pet, limit: number = 3): Promise<Pet[]> {
    // Primero obtener mascotas del mismo tipo
    const petsOfSameType = await this.getPetsByType(pet.typeValue)

    // Filtrar la mascota actual y ordenar por similitud
    const similarPets = petsOfSameType
      .filter((p) => p.id !== pet.id)
      .sort((a, b) => this.calculateSimilarity(pet, b) - this.calculateSimilarity(pet, a))
      .slice(0, limit)

    return similarPets
  }

  /**
   * Calcula un puntaje de similitud entre dos mascotas (mayor es más similar)
   */
  private calculateSimilarity(petA: Pet, petB: Pet): number {
    let score = 0

    // Mismo tipo (ya filtrado, pero suma puntos)
    if (petA.typeValue === petB.typeValue) score += 5

    // Misma raza
    if (petA.breed === petB.breed) score += 10

    // Rango de edad similar
    if (petA.ageValue === petB.ageValue) score += 3

    // Mismo tamaño
    if (petA.sizeValue === petB.sizeValue) score += 3

    // Mismo género
    if (petA.gender === petB.gender) score += 2

    // Ubicación cercana (simplificado, solo coincidencia exacta)
    if (petA.location === petB.location) score += 5

    return score
  }
}
