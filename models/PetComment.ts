/**
 * Interface que define la estructura de un comentario para mascotas
 */
export interface PetComment {
  id?: string
  petId: string
  userId: string
  content: string
  rating?: number // Puntuación opcional (1-5)
  createdAt: number
  updatedAt?: number

  // Datos enriquecidos
  user?: {
    id: string
    displayName: string
    photoURL?: string
  }
}
