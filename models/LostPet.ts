/**
 * Lost Pet Model
 * Representa una mascota perdida reportada por un usuario
 */

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

  // Información del dueño
  ownerId: string
  ownerName?: string

  // Información de la mascota
  petId?: string | null // Si la mascota estaba registrada en el sistema
  name: string
  species?: 'dog' | 'cat' | 'other'
  breed?: string
  color?: string
  size?: 'small' | 'medium' | 'large'
  age?: string
  sex?: 'male' | 'female'

  // Información crítica para recuperación
  description: string
  identificationMarks: string[] // Marcas distintivas
  microchip?: string // Número de microchip si tiene
  collar?: string // Descripción del collar

  // Ubicación y fecha
  lastSeenLocation: string // Ubicación exacta última vez vista
  lastSeenDate: number // Timestamp última vez vista
  lastSeenAt?: string // Legacy field (deprecated)
  location?: string // Legacy field (deprecated)

  // Contacto y recompensa
  contact: string // Información de contacto
  contactPreference: ContactPreference
  reward?: number // Recompensa (opcional)

  // Imágenes
  images: string[]

  // Estado y gestión
  status: LostPetStatus
  urgencyLevel: UrgencyLevel
  archivedAt?: number
  foundAt?: number
  foundDetails?: string

  // Sightings - reportes de avistamientos
  sightings?: Record<string, LostPetSighting>
  sightingCount?: number

  // Metadatos
  createdAt: number
  updatedAt: number
  views?: number
  shares?: number
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
  contact: string
  contactPreference?: ContactPreference
  reward?: number
  images?: string[]
  urgencyLevel?: UrgencyLevel
}

export interface UpdateLostPetPayload {
  name?: string
  description?: string
  lastSeenLocation?: string
  lastSeenDate?: number
  contact?: string
  contactPreference?: ContactPreference
  reward?: number
  images?: string[]
  identificationMarks?: string[]
  microchip?: string
  collar?: string
  urgencyLevel?: UrgencyLevel
  status?: LostPetStatus
  foundDetails?: string
}

export interface ReportSightingPayload {
  petId: string // ID del lost pet
  reportedBy: string // UID del usuario que reporta
  reporterName?: string
  reporterContact?: string
  location: string
  description: string
  photos?: string[]
}
