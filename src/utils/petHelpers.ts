/**
 * Pet Helpers Utility
 *
 * Centralized business logic for pet-related operations
 */

import type { Pet } from '@/models/Pet'
import type { LostPet } from '@/models/LostPet'

/**
 * Pet status types
 */
export type PetStatus = 'available' | 'adopted' | 'pending' | 'unavailable'
export type LostPetStatus = 'lost' | 'found' | 'reunited'

/**
 * Calculate pet age from birth date
 *
 * @param birthDate - Birth date timestamp
 * @returns Age object with years and months
 */
export function calculatePetAge(birthDate: number): {
  years: number
  months: number
  total: number
} {
  const now = Date.now()
  const ageMs = now - birthDate
  const ageYears = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000))
  const ageMonths = Math.floor(
    (ageMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000)
  )

  return {
    years: ageYears,
    months: ageMonths,
    total: ageYears + ageMonths / 12,
  }
}

/**
 * Format pet age for display
 *
 * @param birthDate - Birth date timestamp
 * @returns Formatted age string (e.g., "2 años", "6 meses", "2 años y 3 meses")
 */
export function formatPetAge(birthDate: number | null | undefined): string {
  if (!birthDate) return 'Edad desconocida'

  const { years, months } = calculatePetAge(birthDate)

  if (years === 0 && months === 0) {
    return 'Menos de 1 mes'
  } else if (years === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  } else if (months === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`
  } else {
    return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`
  }
}

/**
 * Determine if pet is a puppy/kitten (< 1 year)
 */
export function isPetYoung(birthDate: number): boolean {
  const { total } = calculatePetAge(birthDate)
  return total < 1
}

/**
 * Determine if pet is senior (> 7 years)
 */
export function isPetSenior(birthDate: number): boolean {
  const { years } = calculatePetAge(birthDate)
  return years >= 7
}

/**
 * Get pet status display text in Spanish
 */
export function getPetStatusText(status: PetStatus): string {
  const statusMap: Record<PetStatus, string> = {
    available: 'Disponible para adopción',
    adopted: 'Adoptado',
    pending: 'Adopción pendiente',
    unavailable: 'No disponible',
  }
  return statusMap[status] || 'Estado desconocido'
}

/**
 * Get lost pet status display text in Spanish
 */
export function getLostPetStatusText(status: LostPetStatus): string {
  const statusMap: Record<LostPetStatus, string> = {
    lost: 'Perdido',
    found: 'Encontrado',
    reunited: 'Reunido con dueño',
  }
  return statusMap[status] || 'Estado desconocido'
}

/**
 * Get pet status badge color
 */
export function getPetStatusColor(status: PetStatus): string {
  const colorMap: Record<PetStatus, string> = {
    available: 'green',
    adopted: 'blue',
    pending: 'yellow',
    unavailable: 'gray',
  }
  return colorMap[status] || 'gray'
}

/**
 * Get lost pet status badge color
 */
export function getLostPetStatusColor(status: LostPetStatus): string {
  const colorMap: Record<LostPetStatus, string> = {
    lost: 'red',
    found: 'yellow',
    reunited: 'green',
  }
  return colorMap[status] || 'gray'
}

/**
 * Normalize pet type (handle variations and typos)
 */
export function normalizePetType(type: string): string {
  const normalized = type.toLowerCase().trim()

  const typeMap: Record<string, string> = {
    perro: 'perro',
    dog: 'perro',
    perros: 'perro',
    gato: 'gato',
    cat: 'gato',
    gatos: 'gato',
    ave: 'ave',
    bird: 'ave',
    aves: 'ave',
    pajaro: 'ave',
    conejo: 'conejo',
    rabbit: 'conejo',
    conejos: 'conejo',
  }

  return typeMap[normalized] || type
}

/**
 * Get pet type icon (for UI display)
 */
export function getPetTypeIcon(type: string): string {
  const normalized = normalizePetType(type)

  const iconMap: Record<string, string> = {
    perro: '🐕',
    gato: '🐈',
    ave: '🐦',
    conejo: '🐇',
  }

  return iconMap[normalized] || '🐾'
}

/**
 * Determine if pet requires special care based on age
 */
export function requiresSpecialCare(birthDate: number): { required: boolean; reason?: string } {
  if (isPetYoung(birthDate)) {
    return {
      required: true,
      reason: 'Cachorro/gatito requiere cuidados especiales de alimentación y vacunación',
    }
  }

  if (isPetSenior(birthDate)) {
    return {
      required: true,
      reason: 'Mascota senior puede requerir cuidados veterinarios especiales',
    }
  }

  return { required: false }
}

/**
 * Validate pet data for forms
 */
export function validatePetData(petData: Partial<Pet | LostPet>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!petData.name || petData.name.trim() === '') {
    errors.push('El nombre es requerido')
  }

  const type = 'type' in petData ? petData.type : 'species' in petData ? petData.species : undefined
  if (!type || type.trim() === '') {
    errors.push('El tipo de mascota es requerido')
  }

  if (petData.name && petData.name.length > 50) {
    errors.push('El nombre es demasiado largo (máximo 50 caracteres)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate pet description summary
 */
export function generatePetSummary(pet: Partial<Pet | LostPet>): string {
  const parts: string[] = []

  if (pet.name) parts.push(pet.name)
  
  const type = 'type' in pet ? pet.type : 'species' in pet ? pet.species : undefined
  if (type) parts.push(normalizePetType(type))
  
  if (pet.breed) parts.push(pet.breed)
  // if (pet.color) parts.push(pet.color) // Error: Property 'color' does not exist on type 'Pet | LostPet'

  return parts.join(' - ')
}

/**
 * Check if pet has complete profile data
 */
export function hasCompleteProfile(pet: Partial<Pet>): boolean {
  const requiredFields = ['name', 'type', 'breed', 'age', 'description', 'image']
  return requiredFields.every((field) => {
    const value = pet[field as keyof Pet]
    return value !== null && value !== undefined && value !== ''
  })
}

/**
 * Get pet adoption eligibility
 */
export function getAdoptionEligibility(status: PetStatus): { eligible: boolean; reason?: string } {
  if (status === 'available') {
    return { eligible: true }
  }

  if (status === 'adopted') {
    return { eligible: false, reason: 'Esta mascota ya ha sido adoptada' }
  }

  if (status === 'pending') {
    return { eligible: false, reason: 'Esta mascota tiene una solicitud de adopción pendiente' }
  }

  return { eligible: false, reason: 'Esta mascota no está disponible para adopción' }
}

/**
 * Sort pets by priority (urgent first, then by date)
 */
export function sortPetsByPriority(pets: Array<Pet | LostPet>): Array<Pet | LostPet> {
  return pets.sort((a, b) => {
    // Urgent pets first
    const aUrgent = 'urgent' in a ? a.urgent : false
    const bUrgent = 'urgent' in b ? b.urgent : false

    if (aUrgent && !bUrgent) return -1
    if (!aUrgent && bUrgent) return 1

    // Then by date (most recent first)
    const aDate = (a.createdAt as number) || 0
    const bDate = (b.createdAt as number) || 0
    return bDate - aDate
  })
}

/**
 * Filter pets by search term
 */
export function filterPetsBySearch(
  pets: Array<Pet | LostPet>,
  searchTerm: string
): Array<Pet | LostPet> {
  if (!searchTerm || searchTerm.trim() === '') {
    return pets
  }

  const term = searchTerm.toLowerCase().trim()

  return pets.filter((pet) => {
    const name = pet.name?.toLowerCase() || ''
    const type = ('type' in pet ? pet.type : 'species' in pet ? pet.species : '')?.toLowerCase() || ''
    const breed = pet.breed?.toLowerCase() || ''
    const description = pet.description?.toLowerCase() || ''
    const location = 'location' in pet ? pet.location?.toLowerCase() || '' : ''

    return (
      name.includes(term) ||
      type.includes(term) ||
      breed.includes(term) ||
      description.includes(term) ||
      location.includes(term)
    )
  })
}
