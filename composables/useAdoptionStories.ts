import { ref, computed } from 'vue'
import {
  getDatabase,
  ref as dbRef,
  get,
  set,
  update,
  remove,
  push,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import type { AdoptionStory } from '@/models/AdoptionStory'

export function useAdoptionStories() {
  const stories = ref<AdoptionStory[]>([])
  const featuredStories = ref<AdoptionStory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtiene todas las historias de adopción
   */
  async function fetchAllStories(): Promise<AdoptionStory[]> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storiesRef = dbRef(db, 'adoptionStories')

      // Obtenemos las historias ordenadas por fecha de creación (más recientes primero)
      const storiesQuery = query(storiesRef, orderByChild('createdAt'))
      const snapshot = await get(storiesQuery)

      if (snapshot.exists()) {
        const storiesData: AdoptionStory[] = []
        const rawData = snapshot.val()

        // Convertimos los datos en un array y añadimos el ID
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
      console.error('Error al obtener historias de adopción:', err)
      error.value = 'Error al cargar historias. Por favor, intenta de nuevo.'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene las historias de adopción destacadas
   */
  async function fetchFeaturedStories(limit: number = 3): Promise<AdoptionStory[]> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storiesRef = dbRef(db, 'adoptionStories')

      // Obtenemos todas las historias
      const snapshot = await get(storiesRef)

      if (snapshot.exists()) {
        const storiesData: AdoptionStory[] = []
        const rawData = snapshot.val()

        // Convertimos los datos en un array y añadimos el ID
        for (const [id, data] of Object.entries(rawData)) {
          const storyData = data as any
          if (storyData.featured) {
            storiesData.push({
              id,
              petId: storyData.petId,
              userId: storyData.userId,
              title: storyData.title || '',
              content: storyData.content || '',
              images: storyData.images || [],
              featured: true,
              likes: storyData.likes || 0,
              createdAt: storyData.createdAt || Date.now(),
              updatedAt: storyData.updatedAt || storyData.createdAt || Date.now(),
            })
          }
        }

        // Enriquecemos los datos con información de mascotas y usuarios
        await enrichStoriesData(storiesData)

        // Ordenamos por fecha de creación (más recientes primero) y limitamos
        storiesData.sort((a, b) => b.createdAt - a.createdAt)
        const limitedStories = storiesData.slice(0, limit)

        featuredStories.value = limitedStories
        return limitedStories
      } else {
        featuredStories.value = []
        return []
      }
    } catch (err: any) {
      console.error('Error al obtener historias destacadas:', err)
      error.value = 'Error al cargar historias destacadas. Por favor, intenta de nuevo.'
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

    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)

    // Recopilamos IDs únicos de mascotas y usuarios
    const petIds = [...new Set(storiesData.map((s) => s.petId))]
    const userIds = [...new Set(storiesData.map((s) => s.userId))]

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

    // Enriquecemos los datos de historias
    for (const story of storiesData) {
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
      const storyRef = dbRef(db, `adoptionStories/${storyId}`)

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
      console.error(`Error al obtener historia (${storyId}):`, err)
      error.value = 'Error al cargar la historia. Por favor, intenta de nuevo.'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva historia de adopción
   */
  async function createStory(storyData: Partial<AdoptionStory>): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storiesRef = dbRef(db, 'adoptionStories')

      // Generamos un ID único para la nueva historia
      const newStoryRef = push(storiesRef)

      // Datos mínimos requeridos
      const newStory = {
        petId: storyData.petId,
        userId: storyData.userId,
        title: storyData.title || '',
        content: storyData.content || '',
        images: storyData.images || [],
        featured: storyData.featured || false,
        likes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Guardamos en la base de datos
      await set(newStoryRef, newStory)

      // Extraemos el ID generado
      const storyId = newStoryRef.key

      return storyId
    } catch (err: any) {
      console.error('Error al crear historia de adopción:', err)
      error.value = 'Error al crear la historia. Por favor, intenta de nuevo.'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza una historia de adopción existente
   */
  async function updateStory(storyId: string, updates: Partial<AdoptionStory>): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storyRef = dbRef(db, `adoptionStories/${storyId}`)

      // Preparamos los datos a actualizar
      const updateData: any = {
        updatedAt: Date.now(),
      }

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.content !== undefined) updateData.content = updates.content
      if (updates.images !== undefined) updateData.images = updates.images
      if (updates.featured !== undefined) updateData.featured = updates.featured

      // Actualizamos en la base de datos
      await update(storyRef, updateData)

      // Actualizamos también el estado local
      const index = stories.value.findIndex((s) => s.id === storyId)
      if (index !== -1) {
        stories.value[index] = {
          ...stories.value[index],
          ...updateData,
        }
      }

      return true
    } catch (err: any) {
      console.error(`Error al actualizar historia (${storyId}):`, err)
      error.value = 'Error al actualizar la historia. Por favor, intenta de nuevo.'
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
      const storyRef = dbRef(db, `adoptionStories/${storyId}`)

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
      console.error(`Error al dar like a historia (${storyId}):`, err)
      error.value = 'Error al dar like. Por favor, intenta de nuevo.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una historia de adopción
   */
  async function deleteStory(storyId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storyRef = dbRef(db, `adoptionStories/${storyId}`)

      // Eliminamos de la base de datos
      await remove(storyRef)

      // Eliminamos también del estado local
      stories.value = stories.value.filter((s) => s.id !== storyId)
      featuredStories.value = featuredStories.value.filter((s) => s.id !== storyId)

      return true
    } catch (err: any) {
      console.error(`Error al eliminar historia (${storyId}):`, err)
      error.value = 'Error al eliminar la historia. Por favor, intenta de nuevo.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene las historias de adopción de un usuario específico
   */
  async function fetchUserStories(userId: string): Promise<AdoptionStory[]> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storiesRef = dbRef(db, 'adoptionStories')

      // Obtenemos todas las historias
      const snapshot = await get(storiesRef)

      if (snapshot.exists()) {
        const storiesData: AdoptionStory[] = []
        const rawData = snapshot.val()

        // Filtramos por el ID de usuario
        for (const [id, data] of Object.entries(rawData)) {
          const storyData = data as any
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
      console.error(`Error al obtener historias del usuario (${userId}):`, err)
      error.value = 'Error al cargar las historias. Por favor, intenta de nuevo.'
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
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const storiesRef = dbRef(db, 'adoptionStories')

      // Obtenemos todas las historias
      const snapshot = await get(storiesRef)

      if (snapshot.exists()) {
        const storiesData: AdoptionStory[] = []
        const rawData = snapshot.val()

        // Filtramos por el ID de mascota
        for (const [id, data] of Object.entries(rawData)) {
          const storyData = data as any
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
      console.error(`Error al obtener historias de la mascota (${petId}):`, err)
      error.value = 'Error al cargar las historias. Por favor, intenta de nuevo.'
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
