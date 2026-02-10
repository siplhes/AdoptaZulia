import { ref } from 'vue'
import type { PetComment } from '@/models/PetComment'
import { useSecureLogger } from '~/composables/useSecureLogger'
import { fetchData, updateData, deleteData, pushData, setData } from '~/utils/firebase'
import { handleFirebaseError, logError as utilLogError } from '~/utils/errorHandler'

export function usePetComments() {
  const comments = ref<PetComment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { error: logError } = useSecureLogger()

  /**
   * Obtiene todos los comentarios de una mascota
   */
  async function fetchPetComments(petId: string): Promise<PetComment[]> {
    loading.value = true
    error.value = null

    try {
      const allComments = await fetchData<Record<string, any>>('petComments')

      if (allComments) {
        const commentsData: PetComment[] = []

        // Filter by petId and map to array
        for (const [id, data] of Object.entries(allComments)) {
          if (data.petId === petId) {
            commentsData.push({
              id,
              petId: data.petId,
              userId: data.userId,
              content: data.content || '',
              rating: data.rating || 0,
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt || data.createdAt || Date.now(),
            })
          }
        }

        // Enrich with user data
        await enrichCommentsData(commentsData)

        // Sort by date (newest first)
        commentsData.sort((a, b) => b.createdAt - a.createdAt)

        comments.value = commentsData
        return commentsData
      } else {
        comments.value = []
        return []
      }
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      utilLogError('fetchPetComments', err, { petId })
      error.value = errorMsg || 'Error al cargar comentarios'
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

    // Collect unique user IDs
    const userIds = [...new Set(commentsData.map((c) => c.userId))]

    // Fetch user data
    const userPromises = userIds.map(async (userId) => {
      const userData = await fetchData(`users/${userId}`)
      return { id: userId, data: userData }
    })

    const usersResults = await Promise.all(userPromises)

    // Create map for fast access
    const usersMap = new Map(usersResults.map((u) => [u.id, u.data]))

    // Enrich comments with user data
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
      const newComment = {
        petId: commentData.petId,
        userId: commentData.userId,
        content: commentData.content || '',
        rating: commentData.rating || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const commentId = await pushData('petComments', newComment)
      return commentId
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      utilLogError('createComment', err, { commentData })
      error.value = errorMsg || 'Error al publicar el comentario'
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
      const updatePayload: any = {
        updatedAt: Date.now(),
      }

      if (updates.content !== undefined) updatePayload.content = updates.content
      if (updates.rating !== undefined) updatePayload.rating = updates.rating

      await updateData(`petComments/${commentId}`, updatePayload)

      // Update local state
      const index = comments.value.findIndex((c) => c.id === commentId)
      if (index !== -1) {
        comments.value[index] = {
          ...comments.value[index],
          ...updatePayload,
        }
      }

      return true
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      utilLogError('updateComment', err, { commentId, updates })
      error.value = errorMsg || 'Error al actualizar el comentario'
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
      await deleteData(`petComments/${commentId}`)

      // Remove from local state
      comments.value = comments.value.filter((c) => c.id !== commentId)

      return true
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      utilLogError('deleteComment', err, { commentId })
      error.value = errorMsg || 'Error al eliminar el comentario'
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
      logError(`Error al calcular calificación promedio (${petId}):`, err)
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
      const allComments = await fetchData<Record<string, any>>('petComments')

      if (allComments) {
        const commentsData: PetComment[] = []

        // Filter by userId
        for (const [id, data] of Object.entries(allComments)) {
          if (data.userId === userId) {
            commentsData.push({
              id,
              petId: data.petId,
              userId: data.userId,
              content: data.content || '',
              rating: data.rating || 0,
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt || data.createdAt || Date.now(),
            })
          }
        }

        // Enrich with user data
        await enrichCommentsData(commentsData)

        // Sort by date (newest first)
        commentsData.sort((a, b) => b.createdAt - a.createdAt)

        return commentsData
      } else {
        return []
      }
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      utilLogError('fetchUserComments', err, { userId })
      error.value = errorMsg || 'Error al cargar comentarios'
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
