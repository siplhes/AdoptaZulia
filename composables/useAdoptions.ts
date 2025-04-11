import { ref, computed } from 'vue'
import {
  getDatabase,
  ref as dbRef,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
} from 'firebase/database'
import { useFirebaseApp } from 'vuefire'

// Interfaz para una solicitud de adopción
export interface Adoption {
  id: string
  petId: string
  userId: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  message: string
  notes?: string
  createdAt: number
  updatedAt?: number
  pet?: {
    id: string
    name: string
    species?: string
    breed?: string
    age?: string
    gender?: string
    size?: string
    description?: string
    imageUrl?: string
  }
  user?: {
    id: string
    name?: string
    email?: string
    phone?: string
    address?: string
  }
}

export function useAdoptions() {
  const adoptions = ref<Adoption[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtiene todas las solicitudes de adopción
   */
  async function fetchAllAdoptions(): Promise<Adoption[]> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const adoptionsRef = dbRef(db, 'adoptions')

      // Obtenemos las adopciones
      const snapshot = await get(adoptionsRef)

      if (snapshot.exists()) {
        const adoptionsData: Adoption[] = []
        const rawData = snapshot.val()

        // Convertimos los datos en un array y añadimos el ID
        for (const [id, data] of Object.entries(rawData)) {
          const adoptionData = data as any
          adoptionsData.push({
            id,
            petId: adoptionData.petId,
            userId: adoptionData.userId,
            status: adoptionData.status || 'pending',
            message: adoptionData.message || '',
            notes: adoptionData.notes || '',
            createdAt: adoptionData.createdAt || Date.now(),
            updatedAt: adoptionData.updatedAt || adoptionData.createdAt || Date.now(),
          })
        }

        // Enriquecemos los datos con información de mascotas y usuarios
        await enrichAdoptionsData(adoptionsData)

        adoptions.value = adoptionsData
        return adoptionsData
      } else {
        adoptions.value = []
        return []
      }
    } catch (err: any) {
      console.error('Error al obtener adopciones:', err)
      error.value = 'Error al cargar adopciones. Por favor, intenta de nuevo.'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Enriquecer datos de adopciones con información de mascotas y usuarios
   */
  async function enrichAdoptionsData(adoptionsData: Adoption[]): Promise<void> {
    if (adoptionsData.length === 0) return

    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)

    // Recopilamos IDs únicos de mascotas y usuarios
    const petIds = [...new Set(adoptionsData.map((a) => a.petId))]
    const userIds = [...new Set(adoptionsData.map((a) => a.userId))]

    // Obtenemos datos de mascotas
    const petPromises = petIds.map(async (petId) => {
      const petRef = dbRef(db, `pets/${petId}`)
      const snapshot = await get(petRef)
      return { id: petId, data: snapshot.exists() ? snapshot.val() : null }
    })

    // Obtenemos datos de usuarios
    const userPromises = userIds.map(async (userId) => {
      const userRef = dbRef(db, `users/${userId}`)
      const snapshot = await get(userRef)
      return { id: userId, data: snapshot.exists() ? snapshot.val() : null }
    })

    // Esperamos a que se resuelvan todas las promesas
    const [petsResults, usersResults] = await Promise.all([
      Promise.all(petPromises),
      Promise.all(userPromises),
    ])

    // Creamos mapas para acceso rápido
    const petsMap = new Map(petsResults.map((p) => [p.id, p.data]))
    const usersMap = new Map(usersResults.map((u) => [u.id, u.data]))

    // Enriquecemos los datos de adopciones
    for (const adoption of adoptionsData) {
      const petData = petsMap.get(adoption.petId)
      const userData = usersMap.get(adoption.userId)

      if (petData) {
        adoption.pet = {
          id: adoption.petId,
          name: petData.name || 'Sin nombre',
          species: petData.type || 'No especificado',
          breed: petData.breed || 'No especificado',
          age: petData.age || 'No especificado',
          gender: petData.gender || 'No especificado',
          size: petData.size || 'No especificado',
          description: petData.description || '',
          imageUrl: petData.image || '',
        }
      }

      if (userData) {
        adoption.user = {
          id: adoption.userId,
          name: userData.displayName || '',
          email: userData.email || '',
          phone: userData.phoneNumber || '',
          address: userData.address || '',
        }
      }
    }
  }

  /**
   * Actualiza el estado de una adopción
   */
  async function updateAdoptionStatus(
    adoptionId: string,
    status: 'pending' | 'approved' | 'rejected' | 'completed'
  ): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const adoptionRef = dbRef(db, `adoptions/${adoptionId}`)

      // Actualizamos el estado y fecha de actualización
      await update(adoptionRef, {
        status,
        updatedAt: Date.now(),
      })

      // Actualizamos también el estado local
      const index = adoptions.value.findIndex((a) => a.id === adoptionId)
      if (index !== -1) {
        adoptions.value[index].status = status
        adoptions.value[index].updatedAt = Date.now()
      }

      return true
    } catch (err: any) {
      console.error(`Error al actualizar estado de adopción (${adoptionId}):`, err)
      error.value = 'Error al actualizar estado. Por favor, intenta de nuevo.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza las notas administrativas de una adopción
   */
  async function updateAdoptionNotes(adoptionId: string, notes: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const adoptionRef = dbRef(db, `adoptions/${adoptionId}`)

      // Actualizamos las notas y fecha de actualización
      await update(adoptionRef, {
        notes,
        updatedAt: Date.now(),
      })

      // Actualizamos también las notas locales
      const index = adoptions.value.findIndex((a) => a.id === adoptionId)
      if (index !== -1) {
        adoptions.value[index].notes = notes
        adoptions.value[index].updatedAt = Date.now()
      }

      return true
    } catch (err: any) {
      console.error(`Error al actualizar notas de adopción (${adoptionId}):`, err)
      error.value = 'Error al guardar las notas. Por favor, intenta de nuevo.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva solicitud de adopción
   */
  async function createAdoption(adoptionData: Partial<Adoption>): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const adoptionsRef = dbRef(db, 'adoptions')

      // Generamos un ID único para la nueva adopción
      const newAdoptionRef = dbRef(db, 'adoptions/' + Date.now().toString())

      // Datos mínimos requeridos
      const newAdoption = {
        petId: adoptionData.petId,
        userId: adoptionData.userId,
        status: 'pending',
        message: adoptionData.message || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Guardamos en la base de datos
      await set(newAdoptionRef, newAdoption)

      // Extraemos el ID generado
      const adoptionId = newAdoptionRef.key

      return adoptionId
    } catch (err: any) {
      console.error('Error al crear solicitud de adopción:', err)
      error.value = 'Error al crear la solicitud. Por favor, intenta de nuevo.'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una solicitud de adopción
   */
  async function deleteAdoption(adoptionId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const adoptionRef = dbRef(db, `adoptions/${adoptionId}`)

      // Eliminamos de la base de datos
      await remove(adoptionRef)

      // Eliminamos también del estado local
      adoptions.value = adoptions.value.filter((a) => a.id !== adoptionId)

      return true
    } catch (err: any) {
      console.error(`Error al eliminar adopción (${adoptionId}):`, err)
      error.value = 'Error al eliminar la solicitud. Por favor, intenta de nuevo.'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    adoptions,
    loading,
    error,
    fetchAllAdoptions,
    updateAdoptionStatus,
    updateAdoptionNotes,
    createAdoption,
    deleteAdoption,
  }
}
