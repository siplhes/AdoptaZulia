import { ref } from 'vue'
import { AdoptionService, type Adoption } from '~/services/AdoptionService'
import { useNotifications } from './useNotifications'
import { useSecureLogger } from './useSecureLogger'
import { useAuth } from './useAuth'
import { getAdoptionUpdateEmail, getNewRequestEmail } from '~/utils/emailTemplates'
import { fetchData } from '~/utils/firebase'
import { handleFirebaseError } from '~/utils/errorHandler'

// Re-export type for consumers
export type { Adoption }

// Caché para los datos de mascotas y usuarios
interface DataCache {
  pets: Map<string, any>
  users: Map<string, any>
  adoptions: Map<string, Adoption>
  lastFetch: {
    all: number | null
    byOwner: Record<string, number>
    byStatus: Record<string, number>
  }
  pendingRequests: Set<string>
}

export function useAdoptions() {
  const adoptions = ref<Adoption[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Dependencies
  const { createNotification } = useNotifications()
  const { error: logError, warn } = useSecureLogger()
  const adoptionService = new AdoptionService()

  // Sistema de caché
  const CACHE_TTL = 5 * 60 * 1000
  const cache: DataCache = {
    pets: new Map(),
    users: new Map(),
    adoptions: new Map(),
    lastFetch: {
      all: null,
      byOwner: {},
      byStatus: {},
    },
    pendingRequests: new Set(),
  }

  const isCacheExpired = (timestamp: number | null): boolean => {
    if (!timestamp) return true
    return Date.now() - timestamp > CACHE_TTL
  }

  // --- Helper Methods (Data Enrichment) ---

  async function prefetchRelatedData(petIds: string[] = [], userIds: string[] = []): Promise<void> {
    if (petIds.length === 0 && userIds.length === 0) return

    const uniquePetIds = Array.from(new Set(petIds)).filter((id) => !cache.pets.has(id))
    const uniqueUserIds = Array.from(new Set(userIds)).filter((id) => !cache.users.has(id))

    if (uniquePetIds.length === 0 && uniqueUserIds.length === 0) return

    const promises: Promise<any>[] = []

    // Batch requests using centralized Firebase utility

    // Pets
    for (let i = 0; i < uniquePetIds.length; i += 10) {
      const batch = uniquePetIds.slice(i, i + 10)
      promises.push(
        ...batch.map(async (petId) => {
          if (cache.pendingRequests.has(`pet-${petId}`)) return
          cache.pendingRequests.add(`pet-${petId}`)
          try {
            const petData = await fetchData(`pets/${petId}`)
            if (petData) cache.pets.set(petId, petData)
          } catch (err) {
            logError('Error fetching pet data:', err)
          } finally {
            cache.pendingRequests.delete(`pet-${petId}`)
          }
        })
      )
    }

    // Users
    for (let i = 0; i < uniqueUserIds.length; i += 10) {
      const batch = uniqueUserIds.slice(i, i + 10)
      promises.push(
        ...batch.map(async (userId) => {
          if (cache.pendingRequests.has(`user-${userId}`)) return
          cache.pendingRequests.add(`user-${userId}`)
          try {
            const userData = await fetchData(`users/${userId}`)
            if (userData) cache.users.set(userId, userData)
          } catch (err) {
            logError('Error fetching user data:', err)
          } finally {
            cache.pendingRequests.delete(`user-${userId}`)
          }
        })
      )
    }

    if (promises.length > 0) await Promise.allSettled(promises)
  }

  async function enrichAdoptionsData(adoptionsData: Adoption[]): Promise<void> {
    if (adoptionsData.length === 0) return

    const petIds = adoptionsData.map((a) => a.petId)
    const userIds = adoptionsData.map((a) => a.userId)

    await prefetchRelatedData(petIds, userIds)

    for (const adoption of adoptionsData) {
      const petData = cache.pets.get(adoption.petId)

      // Debug logging for missing pets
      if (!petData && adoption.petId) {
        console.warn(
          `[enrichAdoptionsData] Missing pet data for ID: ${adoption.petId}. In Cache? ${cache.pets.has(adoption.petId)}`
        )
      }

      const userData = cache.users.get(adoption.userId)

      if (petData) {
        adoption.pet = { ...petData, id: adoption.petId }
      }
      if (userData) {
        adoption.user = {
          id: adoption.userId,
          name: userData.displayName || userData.name || userData.userName || '',
          email: userData.email || '',
          phone: userData.phoneNumber || userData.phone || '',
          address: userData.address || '',
          photoURL: userData.photoURL || '',
        }
      }
    }
  }

  // --- Main Actions ---

  async function fetchAllAdoptions(page = 1, pageSize = 20): Promise<Adoption[]> {
    loading.value = true
    error.value = null
    try {
      // Simple Cache Check
      if (!isCacheExpired(cache.lastFetch.all) && adoptions.value.length > 0) {
        return adoptions.value.slice((page - 1) * pageSize, page * pageSize)
      }

      const results = await adoptionService.getAllAdoptions(page, pageSize)

      // Update Cache
      results.forEach((a: Adoption) => cache.adoptions.set(a.id, a))
      cache.lastFetch.all = Date.now()

      // Enrich
      await enrichAdoptionsData(results)

      adoptions.value = results
      return results
    } catch (err: any) {
      logError('Error fetching adoptions:', err)
      error.value = 'Error al cargar adopciones.'
      return []
      loading.value = false
    }
  }

  async function fetchAllAdoptionsRaw(page = 1, pageSize = 20): Promise<Adoption[]> {
    loading.value = true
    error.value = null
    try {
      const results = await adoptionService.getAllAdoptionsRaw(page, pageSize)

      // Enrich
      await enrichAdoptionsData(results)

      // Update main list or keep separate?
      // Usually Admin view uses 'adoptions' ref.
      adoptions.value = results
      return results
    } catch (err: any) {
      logError('Error fetching raw adoptions:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchAdoptionsForOwner(
    ownerId: string,
    page = 1,
    pageSize = 20
  ): Promise<Adoption[]> {
    loading.value = true
    try {
      const { PetService } = await import('~/services/PetService')
      const petService = new PetService()
      const pets = await petService.getPetsByUserId(ownerId)
      const petIds = pets.map((p: any) => p.id)

      const results = await adoptionService.getAdoptionsForPets(petIds)

      const paginated = results.slice((page - 1) * pageSize, page * pageSize)
      await enrichAdoptionsData(paginated)
      return paginated
    } catch (err: any) {
      logError('Error fetching owner adoptions', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchAdoptionsByStatus(
    status: 'pending' | 'approved' | 'rejected' | 'completed',
    page = 1,
    pageSize = 20
  ) {
    loading.value = true
    try {
      const results = await adoptionService.getAdoptionsByStatus(status, pageSize)
      await enrichAdoptionsData(results)
      return results
    } catch (err: any) {
      logError('Error fetching by status', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function updateAdoptionStatus(id: string, status: string, notes?: string) {
    loading.value = true
    try {
      await adoptionService.updateStatus(id, status, notes)

      // Refetch or get from cache to have fresh data for notification
      let adoption = cache.adoptions.get(id)
      if (!adoption || !adoption.user) {
        adoption = await adoptionService.getAdoptionById(id)
        if (adoption) await enrichAdoptionsData([adoption])
      }

      if (adoption) {
        const statsMsg: Record<string, string> = {
          approved: 'Tu solicitud ha sido aprobada. ¡Felicidades!',
          rejected: 'Tu solicitud ha sido rechazada.',
          completed: 'Adopción marcada como completada.',
          pending: 'Solicitud pendiente.',
        }

        const message = statsMsg[status] || `El estado de tu solicitud ha cambiado a: ${status}`

        // 1. In-App Notification
        await createNotification(adoption.userId, {
          type:
            status === 'approved'
              ? 'adoption_approved'
              : status === 'rejected'
                ? 'adoption_rejected'
                : 'system',
          title: `Solicitud de Adopción ${status === 'approved' ? 'Aprobada' : 'Actualizada'}`,
          message: message,
          data: { adoptionId: id, petId: adoption.petId },
          actionLink: `/mi-solicitud/${id}`,
          actionText: 'Ver detalles',
          read: false,
          createdAt: Date.now(),
        })

        // 2. Email Notification
        if (adoption.user?.email) {
          const { sendEmail } = useNotifications() // Get fresh instance helper
          const emailHtml = getAdoptionUpdateEmail(
            adoption.pet?.name || 'la mascota',
            status,
            notes,
            `${useRuntimeConfig().public.baseUrl}/mi-solicitud/${id}`
          )
          await sendEmail(
            adoption.user.email,
            `Actualización de Adopción - Adopta Zulia`,
            emailHtml
          )
        }
      }
      return true
    } catch (err: any) {
      logError('Update status failed', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function createAdoptionRequest(petId: string, userId: string, message: string) {
    loading.value = true
    try {
      const existing = await adoptionService.checkExistingAdoption(userId, petId)
      if (existing) throw new Error('Ya existe una solicitud pendiente o activa')

      const id = await adoptionService.createAdoption({
        petId,
        userId,
        status: 'pending',
        message,
        createdAt: Date.now(),
      })

      // Notify Owner
      try {
        const db = getDatabase(useFirebaseApp())
        const petSnap = await get(dbRef(db, `pets/${petId}`))
        if (petSnap.exists()) {
          const pet = petSnap.val()
          if (pet.userId) {
            // Owner ID
            // 1. In-App
            await createNotification(pet.userId, {
              type: 'adoption_request',
              title: 'Nueva Solicitud de Adopción',
              message: `Alguien quiere adoptar a ${pet.name}!`,
              data: { adoptionId: id, petId },
              actionLink: `/admin/adopciones?id=${id}`, // Assuming owner manages here or separate dashboard
              actionText: 'Revisar',
              createdAt: Date.now(),
              read: false,
            })

            // 2. Email to Owner
            const ownerSnap = await get(dbRef(db, `users/${pet.userId}`))
            if (ownerSnap.exists()) {
              const owner = ownerSnap.val()
              if (owner.email) {
                const { sendEmail } = useNotifications()
                const emailHtml = getNewRequestEmail(
                  pet.name,
                  message,
                  `${useRuntimeConfig().public.baseUrl}/admin/adopciones`
                )
                await sendEmail(
                  owner.email,
                  'Nueva Solicitud de Adopción - Adopta Zulia',
                  emailHtml
                )
              }
            }
          }
        }
      } catch (notifyErr) {
        warn('Failed to notify owner', notifyErr)
        // Don't fail the request just because notification failed
      }

      return id
    } catch (err: any) {
      logError('Create request failed', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Forwarding simple calls
  async function getAdoptionById(id: string) {
    const res = await adoptionService.getAdoptionById(id)
    if (res) await enrichAdoptionsData([res])
    return res
  }

  async function deleteAdoptionRequest(id: string) {
    try {
      await adoptionService.deleteAdoption(id)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Obtiene una adopción por petId y userId (para verificar si el usuario ya aplicó)
   */
  async function getAdoptionByPetAndUser(petId: string, userId: string): Promise<Adoption | null> {
    try {
      // Fetch user's adoptions and find one matching this pet
      const userAdoptions = await adoptionService.getUserAdoptions(userId)
      const adoption = userAdoptions.find((a: Adoption) => a.petId === petId)
      return adoption || null
    } catch (err) {
      logError('Error checking adoption status', err)
      return null
    }
  }

  /**
   * Actualiza notas de la adopción
   */
  async function updateAdoptionNotes(id: string, notes: string): Promise<boolean> {
    try {
      await adoptionService.updateNotes(id, notes)
      return true
    } catch (e) {
      logError('Error updating notes', e)
      return false
    }
  }

  /**
   * Confirma la adopción y genera registro de verificación (Server-Side)
   */
  async function confirmAdoptionAndVerify(
    adoptionId: string,
    verificationData: any,
    isDigital: boolean
  ): Promise<string | null> {
    loading.value = true
    try {
      const { user } = useAuth()
      if (!user.value?.uid) throw new Error('Usuario no autenticado')
      const userId = user.value.uid

      const response = await $fetch('/api/adoptions/confirm', {
        method: 'POST',
        body: {
          adoptionId,
          verificationData,
          isDigital,
          userId,
        },
      })

      return (response as any).verificationId
    } catch (err: any) {
      logError('Error confirming adoption:', err)
      error.value = err.data?.message || 'Error al completar la adopción'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    adoptions,
    loading,
    error,
    fetchAllAdoptions,
    fetchAllAdoptionsRaw,
    fetchAdoptionsForOwner,
    fetchAdoptionsByStatus,
    updateAdoptionStatus,
    updateAdoptionNotes,
    createAdoptionRequest,
    getAdoptionById,
    getAdoptionByPetAndUser,
    deleteAdoptionRequest,
    confirmAdoptionAndVerify,
    fetchUserAdoptions: async (userId: string) => {
      loading.value = true
      try {
        const results = await adoptionService.getUserAdoptions(userId)
        await enrichAdoptionsData(results)
        return results
      } catch (e) {
        logError('Error fetching user adoptions', e)
        return []
      } finally {
        loading.value = false
      }
    },
  }
}
