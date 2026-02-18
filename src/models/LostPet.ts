export type LostPetStatus = 'active' | 'found' | 'archived'
export type ContactPreference = 'phone' | 'whatsapp' | 'email'
export type UrgencyLevel = 'low' | 'medium' | 'high'

export interface LostPetSighting {
  id?: string
  reportedBy: string
  reporterName?: string
  reporterContact?: string
  location: string
  description: string
  photos?: string[]
  timestamp: number
  createdAt: number
}

export interface LostPet {
  id?: string
  ownerId: string
  ownerName?: string
  petId?: string | null
  name: string
  species?: 'dog' | 'cat' | 'other'
  breed?: string
  color?: string
  size?: 'small' | 'medium' | 'large'
  age?: string
  sex?: 'male' | 'female'
  description: string
  identificationMarks: string[]
  microchip?: string
  collar?: string
  lastSeenLocation: string
  lastSeenDate: number
  lastSeenAt?: string
  location?: string
  contact: Contact
  reward?: number
  images: string[]
  status: LostPetStatus
  urgencyLevel: UrgencyLevel
  archivedAt?: number
  foundAt?: number
  foundDetails?: string
  sightings?: Record<string, LostPetSighting>
  sightingCount?: number
  createdAt: number
  updatedAt: number
  views?: number
  shares?: number
}

export interface Contact {
  name?: string
  email?: string
  phone?: string
  preferredMethod?: ContactPreference | string
}

export interface CreateLostPetPayload {
  ownerId: string
  ownerName?: string
  petId?: string | null
  name: string
  species?: 'dog' | 'cat' | 'other'
  breed?: string
  color?: string
  size?: 'small' | 'medium' | 'large'
  age?: string
  sex?: 'male' | 'female'
  description: string
  identificationMarks?: string[]
  microchip?: string
  collar?: string
  lastSeenLocation: string
  lastSeenDate: number
  contact: Contact
  reward?: number
  images?: string[]
  urgencyLevel?: UrgencyLevel
}

export interface UpdateLostPetPayload {
  name?: string
  description?: string
  lastSeenLocation?: string
  lastSeenDate?: number
  contact?: Contact
  reward?: number
  images?: string[]
  identificationMarks?: string[]
  microchip?: string
  collar?: string
  urgencyLevel?: UrgencyLevel
  status?: LostPetStatus
  foundDetails?: string
}
