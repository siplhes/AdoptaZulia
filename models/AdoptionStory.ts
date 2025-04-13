export interface AdoptionStory {
  id?: string
  title: string
  content: string
  userId: string
  petId?: string
  images?: string[]
  createdAt: number
  updatedAt: number
  likes?: number
  featured?: boolean
  approved?: boolean
  tags?: string[]
  pet?: {
    id: string
    name: string
    type: string
    breed?: string
    image?: string
  }
  user?: {
    id: string
    displayName: string
    photoURL?: string
  }
}
