import { ref } from 'vue'
import {
  getDatabase,
  ref as dbRef,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
} from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import type { PetComment } from '@/models/PetComment'

export function usePetComments() {
  const comments = ref<PetComment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtiene todos los comentarios de una mascota
   */
  async function fetchPetComments(petId: string): Promise<PetComment[]> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const commentsRef = dbRef(db, 'petComments')

      // Obtenemos todos los comentarios
      const snapshot = await get(commentsRef)

      if (snapshot.exists()) {
        const commentsData: PetComment[] = []
        const rawData = snapshot.val()

        // Filtramos por el ID de la mascota y convertimos a array
        for (const [id, data] of Object.entries(rawData)) {
          const commentData = data as any
          if (commentData.petId === petId) {
            commentsData.push({
              id,
              petId: commentData.petId,
              userId: commentData.userId,
              content: commentData.content || '',
              rating: commentData.rating || 0,
              createdAt: commentData.createdAt || Date.now(),
              updatedAt: commentData.updatedAt || commentData.createdAt || Date.now(),
            })
          }
        }

        // Enriquecemos los datos con información de usuarios
        await enrichCommentsData(commentsData)

        // Ordenamos por fecha de creación (más recientes primero)
        commentsData.sort((a, b) => b.createdAt - a.createdAt)

        comments.value = commentsData
        return commentsData
      } else {
        comments.value = []
        return []
      }
    } catch (err: any) {
      console.error(`Error al obtener comentarios de la mascota (${petId}):`, err)
      error.value = 'Error al cargar comentarios. Por favor, intenta de nuevo.'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Enriquecer datos de comentarios con información de usuarios
   */
  async function enrichCommentsData(commentsData: PetComment[]): Promise<void> {
    if (commentsData.length === 0) return

    const firebaseApp = useFirebaseApp()
    const db = getDatabase(firebaseApp)

    // Recopilamos IDs únicos de usuarios
    const userIds = [...new Set(commentsData.map((c) => c.userId))]

    // Obtenemos datos de usuarios
    const userPromises = userIds.map(async (userId) => {
      const userRef = dbRef(db, `users/${userId}`)
      const snapshot = await get(userRef)
      return { id: userId, data: snapshot.exists() ? snapshot.val() : null }
    })

    // Esperamos a que se resuelvan todas las promesas
    const usersResults = await Promise.all(userPromises)

    // Creamos mapa para acceso rápido
    const usersMap = new Map(usersResults.map((u) => [u.id, u.data]))

    // Enriquecemos los datos de comentarios
    for (const comment of commentsData) {
      const userData = usersMap.get(comment.userId)

      if (userData) {
        comment.user = {
          id: comment.userId,
          displayName: userData.displayName || 'Usuario',
          photoURL: userData.photoURL || '',
        }
      }
    }
  }

  /**
   * Crea un nuevo comentario
   */
  async function createComment(commentData: Partial<PetComment>): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const commentsRef = dbRef(db, 'petComments')

      // Generamos un ID único para el nuevo comentario
      const newCommentRef = push(commentsRef)

      // Datos mínimos requeridos
      const newComment = {
        petId: commentData.petId,
        userId: commentData.userId,
        content: commentData.content || '',
        rating: commentData.rating || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Guardamos en la base de datos
      await set(newCommentRef, newComment)

      // Extraemos el ID generado
      const commentId = newCommentRef.key

      return commentId
    } catch (err: any) {
      console.error('Error al crear comentario:', err)
      error.value = 'Error al publicar el comentario. Por favor, intenta de nuevo.'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza un comentario existente
   */
  async function updateComment(commentId: string, updates: Partial<PetComment>): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const commentRef = dbRef(db, `petComments/${commentId}`)

      // Preparamos los datos a actualizar
      const updateData: any = {
        updatedAt: Date.now(),
      }

      if (updates.content !== undefined) updateData.content = updates.content
      if (updates.rating !== undefined) updateData.rating = updates.rating

      // Actualizamos en la base de datos
      await update(commentRef, updateData)

      // Actualizamos también el estado local
      const index = comments.value.findIndex((c) => c.id === commentId)
      if (index !== -1) {
        comments.value[index] = {
          ...comments.value[index],
          ...updateData,
        }
      }

      return true
    } catch (err: any) {
      console.error(`Error al actualizar comentario (${commentId}):`, err)
      error.value = 'Error al actualizar el comentario. Por favor, intenta de nuevo.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un comentario
   */
  async function deleteComment(commentId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const commentRef = dbRef(db, `petComments/${commentId}`)

      // Eliminamos de la base de datos
      await remove(commentRef)

      // Eliminamos también del estado local
      comments.value = comments.value.filter((c) => c.id !== commentId)

      return true
    } catch (err: any) {
      console.error(`Error al eliminar comentario (${commentId}):`, err)
      error.value = 'Error al eliminar el comentario. Por favor, intenta de nuevo.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene la calificación promedio de una mascota
   */
  async function getPetAverageRating(petId: string): Promise<number> {
    try {
      // Si ya tenemos los comentarios cargados
      if (comments.value.length > 0 && comments.value[0].petId === petId) {
        const ratings = comments.value
          .filter((c) => c.rating && c.rating > 0)
          .map((c) => c.rating as number)

        if (ratings.length === 0) return 0

        return Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      }

      // Si no, los cargamos
      const petComments = await fetchPetComments(petId)
      const ratings = petComments
        .filter((c) => c.rating && c.rating > 0)
        .map((c) => c.rating as number)

      if (ratings.length === 0) return 0

      return Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
    } catch (err) {
      console.error(`Error al calcular calificación promedio (${petId}):`, err)
      return 0
    }
  }

  /**
   * Obtiene todos los comentarios de un usuario
   */
  async function fetchUserComments(userId: string): Promise<PetComment[]> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const commentsRef = dbRef(db, 'petComments')

      // Obtenemos todos los comentarios
      const snapshot = await get(commentsRef)

      if (snapshot.exists()) {
        const commentsData: PetComment[] = []
        const rawData = snapshot.val()

        // Filtramos por el ID de usuario
        for (const [id, data] of Object.entries(rawData)) {
          const commentData = data as any
          if (commentData.userId === userId) {
            commentsData.push({
              id,
              petId: commentData.petId,
              userId: commentData.userId,
              content: commentData.content || '',
              rating: commentData.rating || 0,
              createdAt: commentData.createdAt || Date.now(),
              updatedAt: commentData.updatedAt || commentData.createdAt || Date.now(),
            })
          }
        }

        // Enriquecemos los datos con información de usuarios
        await enrichCommentsData(commentsData)

        // Ordenamos por fecha de creación (más recientes primero)
        commentsData.sort((a, b) => b.createdAt - a.createdAt)

        return commentsData
      } else {
        return []
      }
    } catch (err: any) {
      console.error(`Error al obtener comentarios del usuario (${userId}):`, err)
      error.value = 'Error al cargar comentarios. Por favor, intenta de nuevo.'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    comments,
    loading,
    error,
    fetchPetComments,
    createComment,
    updateComment,
    deleteComment,
    getPetAverageRating,
    fetchUserComments,
  }
}
