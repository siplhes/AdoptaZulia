import { ref, computed } from 'vue'
import type { AdoptionStory } from '../models/AdoptionStory'
import { useSecureLogger } from '~/composables/useSecureLogger'
import { fetchData, updateData, deleteData, pushData, setData } from '~/utils/firebase'
import { handleFirebaseError } from '~/utils/errorHandler'

export function useAdoptionStories() {
  const stories = ref<AdoptionStory[]>([])
  const featuredStories = ref<AdoptionStory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { error: logError } = useSecureLogger()

  /**
   * Obtiene todas las historias de adopción
   */
  async function fetchAllStories(): Promise<AdoptionStory[]> {
    loading.value = true
    error.value = null

    try {
      const rawData = await fetchData<Record<string, any>>('adoption_stories')

      if (rawData) {
        const storiesData: AdoptionStory[] = []

        // Convertimos los datos en un array y añadimos el ID
        for (const [id, storyData] of Object.entries(rawData)) {
          if (!storyData.isTest) {
            storiesData.push({
              id,
              petId: storyData.petId,
              userId: storyData.userId,
              title: storyData.title || '',
              content: storyData.content || '',
              images: storyData.images || [],
              featured: storyData.featured || false,
              likes: storyData.likes || 0,
              createdAt: storyData.createdAt || Date.now(),
              updatedAt: storyData.updatedAt || storyData.createdAt || Date.now(),
            })
          }
        }

        // Enriquecemos los datos con información de mascotas y usuarios
        await enrichStoriesData(storiesData)

        // Ordenamos por fecha de creación (más recientes primero)
        storiesData.sort((a, b) => b.createdAt - a.createdAt)

        stories.value = storiesData
        return storiesData
      } else {
        stories.value = []
        return []
      }
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError('Error al obtener historias de adopción:', err)
      error.value = errorMsg || 'Error al cargar historias'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene las historias de adopción destacadas
   * Si no hay suficientes historias destacadas, se completan con las más recientes
   */
  async function fetchFeaturedStories(limit: number = 3): Promise<AdoptionStory[]> {
    loading.value = true
    error.value = null

    try {
      const rawData = await fetchData<Record<string, any>>('adoption_stories')

      if (rawData) {
        const featuredStoriesData: AdoptionStory[] = []
        const regularStoriesData: AdoptionStory[] = []

        // Clasificamos las historias en destacadas y regulares
        for (const [id, storyData] of Object.entries(rawData)) {
          const storyObj = {
            id,
            petId: storyData.petId,
            userId: storyData.userId,
            title: storyData.title || '',
            content: storyData.content || '',
            images: storyData.images || [],
            featured: storyData.featured || false,
            likes: storyData.likes || 0,
            createdAt: storyData.createdAt || Date.now(),
            updatedAt: storyData.updatedAt || storyData.createdAt || Date.now(),
          }

          if (storyData.featured) {
            featuredStoriesData.push(storyObj)
          } else {
            regularStoriesData.push(storyObj)
          }
        }

        // Ordenamos ambas listas por fecha (más recientes primero)
        featuredStoriesData.sort((a, b) => b.createdAt - a.createdAt)
        regularStoriesData.sort((a, b) => b.createdAt - a.createdAt)

        // Si no hay suficientes historias destacadas, añadimos las más recientes
        let resultStories = [...featuredStoriesData]
        if (resultStories.length < limit) {
          resultStories = [
            ...resultStories,
            ...regularStoriesData.slice(0, limit - resultStories.length),
          ]
        } else {
          // Si hay más destacadas que el límite, tomamos solo las más recientes
          resultStories = resultStories.slice(0, limit)
        }

        // Enriquecemos los datos con información de mascotas y usuarios
        await enrichStoriesData(resultStories)

        featuredStories.value = resultStories
        return resultStories
      } else {
        featuredStories.value = []
        return []
      }
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError('Error al obtener historias destacadas:', err)
      error.value = errorMsg || 'Error al cargar historias destacadas'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Enriquecer datos de historias con información de mascotas y usuarios
   */
  async function enrichStoriesData(storiesData: AdoptionStory[]): Promise<void> {
    if (storiesData.length === 0) return

    // Recopilamos IDs únicos de mascotas y usuarios
    const petIds = [...new Set(storiesData.map((s) => s.petId))]
    const userIds = [...new Set(storiesData.map((s) => s.userId))]

    // Obtenemos datos de mascotas y usuarios en paralelo
    const petPromises = petIds.map(async (petId) => {
      const data = await fetchData<any>(`pets/${petId}`)
      return { id: petId, data }
    })

    const userPromises = userIds.map(async (userId) => {
      const data = await fetchData<any>(`users/${userId}`)
      return { id: userId, data }
    })

    // Esperamos a que se resuelvan todas las promesas
    const [petsResults, usersResults] = await Promise.all([
      Promise.all(petPromises),
      Promise.all(userPromises),
    ])

    // Creamos mapas para acceso rápido
    const petsMap = new Map(petsResults.map((p) => [p.id, p.data]))
    const usersMap = new Map(usersResults.map((u) => [u.id, u.data]))

    // Enriquecemos los datos de historias
    for (const story of storiesData) {
      if (!story.petId) continue

      const petData = petsMap.get(story.petId)
      const userData = usersMap.get(story.userId)

      if (petData) {
        story.pet = {
          id: story.petId,
          name: petData.name || 'Sin nombre',
          type: petData.type || 'No especificado',
          breed: petData.breed || 'No especificado',
          image: petData.image || '',
        }
      }

      if (userData) {
        story.user = {
          id: story.userId,
          displayName: userData.displayName || 'Usuario',
          photoURL: userData.photoURL || '',
        }
      }
    }
  }

  /**
   * Obtiene una historia de adopción por su ID
   */
  async function fetchStoryById(storyId: string): Promise<AdoptionStory | null> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storyRef = dbRef(db, `adoption_stories/${storyId}`)

      const snapshot = await get(storyRef)

      if (snapshot.exists()) {
        const storyData = snapshot.val()

        const story: AdoptionStory = {
          id: storyId,
          petId: storyData.petId,
          userId: storyData.userId,
          title: storyData.title || '',
          content: storyData.content || '',
          images: storyData.images || [],
          featured: storyData.featured || false,
          likes: storyData.likes || 0,
          createdAt: storyData.createdAt || Date.now(),
          updatedAt: storyData.updatedAt || storyData.createdAt || Date.now(),
        }

        // Enriquecemos con datos de mascota y usuario
        await enrichStoriesData([story])

        return story
      } else {
        error.value = 'Historia no encontrada'
        return null
      }
    } catch (err: any) {
      logError(`Error al obtener historia (${storyId}):`, err)
      error.value = 'Error al cargar la historia. Por favor, intenta de nuevo.'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva historia de adopción
   */
  /**
   * Crea una nueva historia de adopción (Server-Side)
   */
  async function createStory(storyData: Partial<AdoptionStory>): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/stories/create', {
        method: 'POST',
        body: { storyData },
      })

      return (response as any).storyId
    } catch (err: any) {
      logError('Error creating story:', err)
      error.value = err.data?.message || 'Error al crear la historia. Por favor, intenta de nuevo.'
      return null
    } finally {
      loading.value = false
    }
  }

  // Old implementation commented out or removed
  /*
  async function createStoryOriginal(storyData: Partial<AdoptionStory>): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storiesRef = dbRef(db, 'adoption_stories')


      const petId = storyData.petId
      if (!petId) {
        error.value = 'La historia debe estar asociada a una mascota (petId)'
        return null
      }

      // Verificamos si ya existe una historia para esta mascota (usando el índice petStories)
      const petStoriesRef = dbRef(db, `petStories/${petId}`)
      const petStorySnap = await get(petStoriesRef)
      if (petStorySnap.exists()) {
        error.value = 'Ya existe una historia para esta mascota'
        return null
      }

      // Generamos un ID único para la nueva historia
      const newStoryRef = push(storiesRef)
      const storyId = newStoryRef.key

      // Datos mínimos requeridos
      const newStory = {
        petId: petId,
        adoptionId: storyData.adoptionId || null,
        userId: storyData.userId,
        title: storyData.title || '',
        content: storyData.content || '',
        images: storyData.images || [],
        featured: storyData.featured || false,
        verified: storyData.verified || false,
        verificationId: storyData.verificationId || null,
        likes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Guardamos usando una escritura multi-path para garantizar la única referencia en petStories
      const updates: Record<string, any> = {}
      updates[`/adoption_stories/${storyId}`] = newStory
      updates[`/petStories/${petId}`] = storyId

      await update(dbRef(db, '/'), updates)

      return storyId
    } catch (err: any) {
      logError('Error al crear historia de adopción:', err)
      error.value = 'Error al crear la historia. Por favor, intenta de nuevo.'
      return null
    } finally {
      loading.value = false
    }
  }
  */

  /**
   * Actualiza una historia de adopción existente (Server-Side)
   */
  async function updateStory(storyId: string, updates: Partial<AdoptionStory>): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      if (!updates.userId) throw new Error('UserId is required for updates')

      await $fetch('/api/stories/update', {
        method: 'POST',
        body: {
          storyData: { ...updates, id: storyId },
        },
      })

      return true
    } catch (err: any) {
      logError(`Error al actualizar historia (${storyId}):`, err)
      error.value = err.data?.message || 'Error al actualizar la historia.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una historia de adopción (Server-Side)
   */
  async function deleteStory(storyId: string, userId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await $fetch('/api/stories/delete', {
        method: 'POST',
        body: { storyId, userId },
      })

      // Update local state if needed
      stories.value = stories.value.filter((s) => s.id !== storyId)
      featuredStories.value = featuredStories.value.filter((s) => s.id !== storyId)

      return true
    } catch (err: any) {
      logError(`Error al eliminar historia (${storyId}):`, err)
      error.value = err.data?.message || 'Error al eliminar la historia.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Aumenta el contador de likes de una historia
   */
  async function likeStory(storyId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storyRef = dbRef(db, `adoption_stories/${storyId}`)

      // Obtenemos los datos actuales
      const snapshot = await get(storyRef)

      if (snapshot.exists()) {
        const currentLikes = snapshot.val().likes || 0

        // Incrementamos y actualizamos
        await update(storyRef, {
          likes: currentLikes + 1,
          updatedAt: Date.now(),
        })

        // Actualizamos también el estado local
        const index = stories.value.findIndex((s) => s.id === storyId)
        if (index !== -1) {
          stories.value[index].likes = currentLikes + 1
          stories.value[index].updatedAt = Date.now()
        }

        return true
      } else {
        error.value = 'Historia no encontrada'
        return false
      }
    } catch (err: any) {
      logError(`Error al dar like a historia (${storyId}):`, err)
      error.value = 'Error al dar like. Por favor, intenta de nuevo.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una historia de adopción
   */

  /**
   * Obtiene las historias de adopción de un usuario específico
   */
  async function fetchUserStories(userId: string): Promise<AdoptionStory[]> {
    loading.value = true
    error.value = null

    try {
      const rawData = await fetchData<Record<string, any>>('adoption_stories')

      if (rawData) {
        const storiesData: AdoptionStory[] = []

        // Filtramos por el ID de usuario
        for (const [id, storyData] of Object.entries(rawData)) {
          if (storyData.userId === userId) {
            storiesData.push({
              id,
              petId: storyData.petId,
              userId: storyData.userId,
              title: storyData.title || '',
              content: storyData.content || '',
              images: storyData.images || [],
              featured: storyData.featured || false,
              likes: storyData.likes || 0,
              createdAt: storyData.createdAt || Date.now(),
              updatedAt: storyData.updatedAt || storyData.createdAt || Date.now(),
            })
          }
        }

        // Enriquecemos los datos con información de mascotas y usuarios
        await enrichStoriesData(storiesData)

        // Ordenamos por fecha de creación (más recientes primero)
        storiesData.sort((a, b) => b.createdAt - a.createdAt)

        return storiesData
      } else {
        return []
      }
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError(`Error al obtener historias del usuario (${userId}):`, err)
      error.value = errorMsg || 'Error al cargar historias del usuario'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene las historias de adopción de una mascota específica
   */
  async function fetchPetStories(petId: string): Promise<AdoptionStory[]> {
    loading.value = true
    error.value = null

    try {
      const rawData = await fetchData<Record<string, any>>('adoption_stories')

      if (rawData) {
        const storiesData: AdoptionStory[] = []

        // Filtramos por el ID de mascota
        for (const [id, storyData] of Object.entries(rawData)) {
          if (storyData.petId === petId) {
            storiesData.push({
              id,
              petId: storyData.petId,
              userId: storyData.userId,
              title: storyData.title || '',
              content: storyData.content || '',
              images: storyData.images || [],
              featured: storyData.featured || false,
              likes: storyData.likes || 0,
              createdAt: storyData.createdAt || Date.now(),
              updatedAt: storyData.updatedAt || storyData.createdAt || Date.now(),
            })
          }
        }

        // Enriquecemos los datos con información de mascotas y usuarios
        await enrichStoriesData(storiesData)

        // Ordenamos por fecha de creación (más recientes primero)
        storiesData.sort((a, b) => b.createdAt - a.createdAt)

        return storiesData
      } else {
        return []
      }
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError(`Error al obtener historias de la mascota (${petId}):`, err)
      error.value = errorMsg || 'Error al cargar historias de la mascota'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene todas las historias incluyendo datos de prueba (para Admin)
   */
  async function fetchAllStoriesRaw(): Promise<AdoptionStory[]> {
    loading.value = true
    error.value = null
    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storiesRef = dbRef(db, 'adoption_stories')
      const storiesQuery = query(storiesRef, orderByChild('createdAt'))
      const snapshot = await get(storiesQuery)

      if (snapshot.exists()) {
        const storiesData: AdoptionStory[] = []
        const rawData = snapshot.val()

        for (const [id, data] of Object.entries(rawData)) {
          const storyData = data as any
          storiesData.push({
            id,
            petId: storyData.petId,
            userId: storyData.userId,
            title: storyData.title || '',
            content: storyData.content || '',
            images: storyData.images || [],
            featured: storyData.featured || false,
            likes: storyData.likes || 0,
            createdAt: storyData.createdAt || Date.now(),
            updatedAt: storyData.updatedAt || storyData.createdAt || Date.now(),
          })
        }

        await enrichStoriesData(storiesData)
        storiesData.sort((a, b) => b.createdAt - a.createdAt)
        stories.value = storiesData
        return storiesData
      } else {
        stories.value = []
        return []
      }
    } catch (err: any) {
      logError('Error al obtener historias de adopción (raw):', err)
      error.value = 'Error al cargar historias.'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    stories,
    featuredStories,
    loading,
    error,
    fetchAllStories,
    fetchAllStoriesRaw,
    fetchFeaturedStories,
    fetchStoryById,
    createStory,
    updateStory,
    likeStory,
    deleteStory,
    fetchUserStories,
    fetchPetStories,
  }
}
