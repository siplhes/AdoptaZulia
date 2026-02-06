import {
  getDatabase,
  ref as dbRef,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
  push,
  equalTo,
  limitToFirst,
  startAfter,
  limitToLast
} from 'firebase/database'

// Interfaz para una solicitud de adopción (Moved from composable)
export interface Adoption {
  id: string
  petId: string
  userId: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  message?: string
  notes?: string
  createdAt: number
  updatedAt?: number
  // Expanded data
  pet?: any
  user?: {
    id: string
    name?: string
    email?: string
    phone?: string
    address?: string
    photoURL?: string
  }
}

export class AdoptionService {
  private db = getDatabase()
  private adoptionsRef = dbRef(this.db, 'adoptions')

  /**
   * Obtiene todas las solicitudes de adopción (con paginación)
   */
  async getAllAdoptions(page = 1, pageSize = 20, lastId?: string): Promise<Adoption[]> {
    let adoptionsQuery
    
    // Si tenemos lastId, usamos startAfter para paginación
    if (lastId && page > 1) {
       // Nota: Firebase Realtime Database no tiene paginación simple por página/tamaño sin un cursor
       // Esta es una implementación aproximada basada en la lógica original
       adoptionsQuery = query(
        this.adoptionsRef, 
        orderByChild('createdAt'), 
        limitToLast(pageSize) // Usamos limitToLast para obtener los más recientes
      )
    } else {
      adoptionsQuery = query(
        this.adoptionsRef, 
        orderByChild('createdAt'), 
        limitToLast(pageSize)
      )
    }

    const snapshot = await get(adoptionsQuery)
    if (snapshot.exists()) {
      const adoptions: Adoption[] = []
      snapshot.forEach((childSnapshot) => {
        adoptions.push({ id: childSnapshot.key, ...childSnapshot.val() } as Adoption)
      })
      // Firebase devuelve en orden ascendente (más viejo a más nuevo), invertimos
      return adoptions.reverse()
    }
    return []
  }

  /**
   * Obtiene solicitudes por estado
   */
  async getAdoptionsByStatus(
    status: 'pending' | 'approved' | 'rejected' | 'completed',
    pageSize = 20
  ): Promise<Adoption[]> {
    const adoptionsQuery = query(
      this.adoptionsRef,
      orderByChild('status'),
      equalTo(status),
      limitToFirst(pageSize) // En este caso limitToFirst porque el índice es status
    )
    
    // Nota: Para ordenar por fecha DENTRO del estado, se requeriría un índice compuesto 'status_createdAt'
    // Por ahora mantenemos la lógica simple
    
    const snapshot = await get(adoptionsQuery)
    if (snapshot.exists()) {
      const adoptions: Adoption[] = []
      snapshot.forEach((childSnapshot) => {
        adoptions.push({ id: childSnapshot.key, ...childSnapshot.val() } as Adoption)
      })
      return adoptions.sort((a, b) => b.createdAt - a.createdAt)
    }
    return []
  }

  /**
   * Obtiene solicitudes para un dueño de mascota específico (propietario)
   * Nota: Esto requiere iterar o un índice compuesto 'petOwnerId' en la adopción si existiera.
   * La implementación original hace fetch de las mascotas del dueño y luego busca adopciones para esas mascotas.
   * Moveremos esa lógica de "negocio" al composable o mantendremos una helper aquí.
   * Esta función asume que recibimos los petIds del dueño.
   */
  async getAdoptionsForPets(petIds: string[]): Promise<Adoption[]> {
    // Esto no es eficiente en Firebase RTDB si son muchas mascotas
    // Una mejor estructura sería tener `adoptionsByOwner/{ownerId}/{adoptionId}`
    // Pero basándonos en la estructura actual:
    
    // Opción A: Consultar todas y filtrar (lento)
    // Opción B: Consultar por petId para cada mascota (N consultas)
    
    const promises = petIds.map(petId => 
      get(query(this.adoptionsRef, orderByChild('petId'), equalTo(petId)))
    )
    
    const snapshots = await Promise.all(promises)
    const adoptions: Adoption[] = []
    
    snapshots.forEach(snapshot => {
      if (snapshot.exists()) {
        snapshot.forEach(child => {
           adoptions.push({ id: child.key, ...child.val() } as Adoption)
        })
      }
    })
    
    return adoptions.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Obtiene solicitudes hechas POR un usuario
   */
  async getUserAdoptions(userId: string): Promise<Adoption[]> {
    const adoptionsQuery = query(
      this.adoptionsRef,
      orderByChild('userId'),
      equalTo(userId)
    )
    
    const snapshot = await get(adoptionsQuery)
    if (snapshot.exists()) {
      const adoptions: Adoption[] = []
      snapshot.forEach((childSnapshot) => {
        adoptions.push({ id: childSnapshot.key, ...childSnapshot.val() } as Adoption)
      })
      return adoptions.sort((a, b) => b.createdAt - a.createdAt)
    }
    return []
  }

  /**
   * Obtiene una adopción por ID
   */
  async getAdoptionById(adoptionId: string): Promise<Adoption | null> {
    const snapshot = await get(dbRef(this.db, `adoptions/${adoptionId}`))
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() } as Adoption
    }
    return null
  }

  /**
   * Crea una nueva solicitud
   */
  async createAdoption(adoption: Omit<Adoption, 'id'>): Promise<string> {
    const newRef = push(this.adoptionsRef)
    await set(newRef, adoption)
    return newRef.key as string
  }

  /**
   * Actualiza el estado de una adopción
   */
  async updateStatus(adoptionId: string, status: string, notes?: string): Promise<void> {
    const updates: any = { status, updatedAt: Date.now() }
    if (notes) updates.notes = notes
    
    await update(dbRef(this.db, `adoptions/${adoptionId}`), updates)
  }

  /**
   * Actualiza notas
   */
  async updateNotes(adoptionId: string, notes: string): Promise<void> {
    await update(dbRef(this.db, `adoptions/${adoptionId}`), { 
      notes, 
      updatedAt: Date.now() 
    })
  }

  /**
   * Elimina una solicitud
   */
  async deleteAdoption(adoptionId: string): Promise<void> {
    await remove(dbRef(this.db, `adoptions/${adoptionId}`))
  }

  /**
   * Busca adopciones por Pet ID
   */
  async getAdoptionsByPetId(petId: string): Promise<Adoption[]> {
     const q = query(this.adoptionsRef, orderByChild('petId'), equalTo(petId))
     const snapshot = await get(q)
     
     if (snapshot.exists()) {
      const adoptions: Adoption[] = []
      snapshot.forEach((childSnapshot) => {
        adoptions.push({ id: childSnapshot.key, ...childSnapshot.val() } as Adoption)
      })
      return adoptions
    }
    return []
  }

  /**
   * Verifica existencia de solicitud usuario/mascota
   */
  async checkExistingAdoption(userId: string, petId: string): Promise<Adoption | null> {
    // Firebase RTDB no soporta queries compuestos nativamente (where userId = X AND petId = Y)
    // Buscamos por userId (que suele tener menos registros que petId en total) y filtramos
    const userAdoptions = await this.getUserAdoptions(userId)
    return userAdoptions.find(a => a.petId === petId) || null
  }
}
