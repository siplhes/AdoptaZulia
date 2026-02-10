import { ref } from 'vue'
import { getAuth } from 'firebase/auth'
import type {
  LostPet,
  CreateLostPetPayload,
  UpdateLostPetPayload,
  ReportSightingPayload,
  LostPetStatus,
} from '~/models/LostPet'
import {
  fetchCollection,
  fetchDataWithId,
  updateData,
  pushData,
  deleteData,
  getDbRef,
} from '~/utils/firebase'
import { get, update } from 'firebase/database'
import { handleFirebaseError, logError } from '~/utils/errorHandler'

export function useLostPets() {
  const lostPets = ref<LostPet[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all lost pets with optional archived filter
   */
  async function fetchLostPets(includeArchived = false): Promise<LostPet[]> {
    loading.value = true
    error.value = null

    try {
      let arr = await fetchCollection<LostPet>('lost_pets')

      // Filter out archived unless explicitly requested
      if (!includeArchived) {
        arr = arr.filter((p: LostPet) => p.status !== 'archived')
      }

      // Sort by createdAt desc
      arr.sort((a: LostPet, b: LostPet) => (b.createdAt || 0) - (a.createdAt || 0))

      lostPets.value = arr
      return arr
    } catch (e) {
      const errorMsg = handleFirebaseError(e)
      logError('fetchLostPets', e)
      error.value = errorMsg
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch lost pets for a specific user
   */
  async function fetchUserLostPets(userId: string): Promise<LostPet[]> {
    loading.value = true
    error.value = null

    try {
      const allPets = await fetchCollection<LostPet>('lost_pets')
      const userPets = allPets.filter((p: LostPet) => p.ownerId === userId)

      // Sort by status priority (active first), then by date
      userPets.sort((a: LostPet, b: LostPet) => {
        if (a.status === 'active' && b.status !== 'active') return -1
        if (a.status !== 'active' && b.status === 'active') return 1
        return (b.createdAt || 0) - (a.createdAt || 0)
      })

      lostPets.value = userPets
      return userPets
    } catch (e) {
      const errorMsg = handleFirebaseError(e)
      logError('fetchUserLostPets', e, { userId })
      error.value = errorMsg
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a single lost pet by ID
   */
  async function getLostPetById(id: string): Promise<LostPet | null> {
    loading.value = true
    error.value = null

    try {
      const pet = await fetchDataWithId<LostPet>(`lost_pets/${id}`)
      return pet
    } catch (e) {
      const errorMsg = handleFirebaseError(e)
      logError('getLostPetById', e, { id })
      error.value = errorMsg
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new lost pet report
   */
  async function createLostPet(payload: CreateLostPetPayload): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      // Defensive check: ensure user is authenticated
      const auth = getAuth()
      const current = auth.currentUser
      if (!current) {
        error.value = 'Debes iniciar sesión para crear un reporte.'
        return null
      }
      if (!payload.ownerId || payload.ownerId !== current.uid) {
        error.value = 'El ownerId no coincide con el usuario autenticado.'
        return null
      }

      const item: Partial<LostPet> = {
        ownerId: payload.ownerId,
        ownerName: payload.ownerName,
        petId: payload.petId || null,
        name: payload.name,
        species: payload.species,
        breed: payload.breed,
        color: payload.color,
        size: payload.size,
        age: payload.age,
        sex: payload.sex,
        description: payload.description || '',
        identificationMarks: payload.identificationMarks || [],
        microchip: payload.microchip,
        collar: payload.collar,
        lastSeenLocation: payload.lastSeenLocation,
        lastSeenDate: payload.lastSeenDate,
        contact: payload.contact,
        contactPreference: payload.contactPreference || 'phone',
        reward: payload.reward,
        images: payload.images || [],
        status: 'active',
        urgencyLevel: payload.urgencyLevel || 'medium',
        views: 0,
        shares: 0,
        sightingCount: 0,
      }

      const newId = await pushData('lost_pets', item)
      return newId
    } catch (e) {
      const errorMsg = handleFirebaseError(e)
      logError('createLostPet', e, { payload })
      error.value = errorMsg
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing lost pet report
   */
  async function updateLostPet(id: string, updates: UpdateLostPetPayload): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const success = await updateData(`lost_pets/${id}`, updates)
      return success
    } catch (e) {
      const errorMsg = handleFirebaseError(e)
      logError('updateLostPet', e, { id, updates })
      error.value = errorMsg
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Archive a lost pet report
   */
  async function archiveLostPet(id: string): Promise<boolean> {
    return await updateLostPet(id, { status: 'archived' } as UpdateLostPetPayload)
  }

  /**
   * Mark a lost pet as found
   */
  async function markAsFound(id: string, foundDetails?: string): Promise<boolean> {
    return await updateLostPet(id, {
      status: 'found',
      foundDetails,
    } as UpdateLostPetPayload)
  }

  /**
   * Update status of a lost pet
   */
  async function updateStatus(id: string, status: LostPetStatus): Promise<boolean> {
    return await updateLostPet(id, { status } as UpdateLostPetPayload)
  }

  /**
   * Delete a lost pet report
   */
  async function deleteLostPet(id: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      // Delete associated sightings first
      await deleteData(`lost_pet_sightings/${id}`)
      // Then delete the pet
      const success = await deleteData(`lost_pets/${id}`)
      return success
    } catch (e) {
      const errorMsg = handleFirebaseError(e)
      logError('deleteLostPet', e, { id })
      error.value = errorMsg
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Report a sighting of a lost pet
   */
  async function reportSighting(payload: ReportSightingPayload): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const sightingData = {
        reportedBy: payload.reportedBy,
        reporterName: payload.reporterName,
        reporterContact: payload.reporterContact,
        location: payload.location,
        description: payload.description,
        photos: payload.photos || [],
        timestamp: Date.now(),
      }

      // Add sighting to sightings collection
      const sightingId = await pushData(`lost_pet_sightings/${payload.petId}`, sightingData)

      if (!sightingId) {
        error.value = 'Error al guardar el avistamiento'
        return false
      }

      // Update sighting count on the lost pet using direct Firebase for atomic update
      const petRef = getDbRef(`lost_pets/${payload.petId}`)
      const snapshot = await get(petRef)

      if (snapshot.exists()) {
        const currentCount = (snapshot.val().sightingCount || 0) as number
        await update(petRef, {
          sightingCount: currentCount + 1,
          updatedAt: Date.now(),
        })
      }

      return true
    } catch (e) {
      const errorMsg = handleFirebaseError(e)
      logError('reportSighting', e, { payload })
      error.value = errorMsg
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Increment view counter for a lost pet
   */
  async function incrementViews(id: string): Promise<void> {
    try {
      // Optimistic update without loading state
      const pet = await fetchDataWithId<LostPet>(`lost_pets/${id}`)
      if (pet) {
        await updateData(`lost_pets/${id}`, {
          views: (pet.views || 0) + 1,
        })
      }
    } catch (e) {
      // Silent fail for stats
      logError('incrementViews', e, { id })
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
    archiveLostPet,
    markAsFound,
    updateStatus,
    deleteLostPet,
    reportSighting,
    incrementViews,
  }
}
