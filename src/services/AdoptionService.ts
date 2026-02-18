import {
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
  limitToLast,
} from 'firebase/database'
import { getDb } from '@/config/firebase'

// Interfaz para una solicitud de adopción
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
  private db = getDb()
  private adoptionsRef = dbRef(this.db, 'adoptions')

  /**
   * Obtiene todas las solicitudes de adopción (con paginación)
   */
  async getAllAdoptions(page = 1, pageSize = 20, lastId?: string): Promise<Adoption[]> {
    let adoptionsQuery

    // Si tenemos lastId, usamos startAfter para paginación
    if (lastId && page > 1) {
      adoptionsQuery = query(
        this.adoptionsRef,
        orderByChild('createdAt'),
        limitToLast(pageSize)
      )
    } else {
      adoptionsQuery = query(this.adoptionsRef, orderByChild('createdAt'), limitToLast(pageSize))
    }

    const snapshot = await get(adoptionsQuery)
    if (snapshot.exists()) {
      const adoptions: Adoption[] = []
      snapshot.forEach((childSnapshot) => {
        const val = childSnapshot.val()
        if (!val.isTest) {
          const adoption = { id: childSnapshot.key, ...val } as Adoption
          adoptions.push(adoption)
        }
      })
      return adoptions.reverse()
    }
    return []
  }

  /**
   * Obtiene TODAS las adopciones (incluyendo test) - Para uso interno/admin
   */
  async getAllAdoptionsRaw(page = 1, pageSize = 20): Promise<Adoption[]> {
    const adoptionsQuery = query(
      this.adoptionsRef,
      orderByChild('createdAt'),
      limitToLast(pageSize)
    )
    const snapshot = await get(adoptionsQuery)
    if (snapshot.exists()) {
      const adoptions: Adoption[] = []
      snapshot.forEach((child) => {
        adoptions.push({ id: child.key, ...child.val() } as Adoption)
      })
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
      limitToFirst(pageSize)
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
   * Obtiene solicitudes para un dueño de mascota específico
   */
  async getAdoptionsForPets(petIds: string[]): Promise<Adoption[]> {
    const promises = petIds.map((petId) =>
      get(query(this.adoptionsRef, orderByChild('petId'), equalTo(petId)))
    )

    const snapshots = await Promise.all(promises)
    const adoptions: Adoption[] = []

    snapshots.forEach((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
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
    const adoptionsQuery = query(this.adoptionsRef, orderByChild('userId'), equalTo(userId))

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
      updatedAt: Date.now(),
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
    const userAdoptions = await this.getUserAdoptions(userId)
    return userAdoptions.find((a) => a.petId === petId) || null
  }

  /**
   * Elimina solicitudes por Pet ID y retorna las eliminadas
   */
  async deleteAdoptionsByPetId(petId: string): Promise<Adoption[]> {
    const adoptionsQuery = query(this.adoptionsRef, orderByChild('petId'), equalTo(petId))

    const snapshot = await get(adoptionsQuery)
    const deletedAdoptions: Adoption[] = []

    if (snapshot.exists()) {
      const updates: Record<string, null> = {}
      snapshot.forEach((child) => {
        deletedAdoptions.push({ id: child.key, ...child.val() } as Adoption)
        updates[child.key!] = null
      })
      await update(this.adoptionsRef, updates)
    }
    return deletedAdoptions
  }
}
