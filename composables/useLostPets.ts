import { ref } from 'vue'
import { useFirebaseApp } from 'vuefire'
import { getDatabase, ref as dbRef, get, push, set, update, remove, query, orderByChild } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export function useLostPets() {
  const lostPets = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchLostPets() {
    loading.value = true
    error.value = null
    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const refNode = dbRef(db, 'lost_pets')
      const snap = await get(refNode)
      if (!snap.exists()) {
        lostPets.value = []
        return []
      }
      const data = snap.val()
      const arr = Object.entries(data).map(([id, v]) => ({ id, ...v }))
      // order by createdAt desc
      arr.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
      lostPets.value = arr
      return arr
    } catch (e) {
      console.error('Error fetching lost pets', e)
      error.value = 'Error al cargar mascotas perdidas'
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchUserLostPets(userId: string) {
    loading.value = true
    error.value = null
    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const refNode = dbRef(db, 'lost_pets')
      const snap = await get(refNode)
      if (!snap.exists()) return []
      const data = snap.val()
      const arr = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .filter((p: any) => p.ownerId === userId)
      lostPets.value = arr
      return arr
    } catch (e) {
      console.error('Error fetching user lost pets', e)
      error.value = 'Error al cargar tus reportes'
      return []
    } finally {
      loading.value = false
    }
  }

  async function getLostPetById(id: string) {
    loading.value = true
    error.value = null
    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const snap = await get(dbRef(db, `lost_pets/${id}`))
      if (!snap.exists()) return null
      return snap.val()
    } catch (e) {
      console.error('Error get lost pet', e)
      error.value = 'Error al obtener el reporte'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createLostPet(payload: any) {
    loading.value = true
    error.value = null
    try {
      // Defensive check: ensure user is authenticated and ownerId matches auth.uid
      const auth = getAuth()
      const current = auth.currentUser
      if (!current) {
        throw new Error('USER_NOT_AUTHENTICATED')
      }
      if (!payload.ownerId || payload.ownerId !== current.uid) {
        throw new Error('OWNER_MISMATCH')
      }
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const node = dbRef(db, 'lost_pets')
      const newRef = push(node)
      const item = {
        ownerId: payload.ownerId,
        petId: payload.petId || null,
        name: payload.name || null,
        description: payload.description || '',
        lastSeenAt: payload.lastSeenAt || null,
        location: payload.location || null,
        reward: payload.reward || null,
        contact: payload.contact || null,
        images: payload.images || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      console.log('[useLostPets] createLostPet: creating item', {
        ownerId: payload.ownerId,
        authUid: current ? current.uid : null,
        newRef: newRef.toString ? newRef.toString() : newRef.key,
      })

      await set(newRef, item)
      return newRef.key
    } catch (e) {
      console.error('Error creating lost pet', e)
      // Map some common errors to friendlier messages
      if (e && (e as any).message === 'USER_NOT_AUTHENTICATED') {
        error.value = 'Debes iniciar sesión para crear un reporte.'
      } else if (e && (e as any).message === 'OWNER_MISMATCH') {
        error.value = 'El ownerId no coincide con el usuario autenticado.'
      } else if (e && (e as any).code === 'PERMISSION_DENIED') {
        error.value = 'Permisos insuficientes para crear el reporte (reglas DB).'
      } else {
        error.value = 'Error al crear el reporte'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateLostPet(id: string, updates: any) {
    loading.value = true
    error.value = null
    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const refNode = dbRef(db, `lost_pets/${id}`)
      await update(refNode, { ...updates, updatedAt: Date.now() })
      return true
    } catch (e) {
      console.error('Error updating lost pet', e)
      error.value = 'Error al actualizar el reporte'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteLostPet(id: string) {
    loading.value = true
    error.value = null
    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      await remove(dbRef(db, `lost_pets/${id}`))
      return true
    } catch (e) {
      console.error('Error deleting lost pet', e)
      error.value = 'Error al eliminar el reporte'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    lostPets,
    loading,
    error,
    fetchLostPets,
    fetchUserLostPets,
    getLostPetById,
    createLostPet,
    updateLostPet,
    deleteLostPet,
  }
}
