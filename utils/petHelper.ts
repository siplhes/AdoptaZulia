/**
 * Pet Helper Utilities
 */

import type { Pet } from '~/models/Pet'
import type { LostPet } from '~/models/LostPet'

/**
 * Returns the primary image URL for a pet, checking multiple possible field names
 * to ensure compatibility with different data structures (seeded, user-created, lost pets, etc.)
 * 
 * @param pet The pet object (Pet or LostPet)
 * @returns The image URL or a default placeholder
 */
export function getPetImage(pet: any): string {
  if (!pet) return '/placeholder.webp'
  
  // Try fields in order of preference
  if (pet.image) return pet.image
  if (pet.imageUrl) return pet.imageUrl
  
  // Try arrays
  if (pet.images && Array.isArray(pet.images) && pet.images.length > 0) {
    return pet.images[0]
  }
  
  if (pet.photos && Array.isArray(pet.photos) && pet.photos.length > 0) {
    return pet.photos[0]
  }

  // Legacy field
  if (pet.photoURL) return pet.photoURL
  
  return '/placeholder.webp'
}

/**
 * Returns a readable string for the pet breed
 * 
 * @param pet The pet object
 * @returns The breed name or 'Raza desconocida'
 */
export function getPetBreed(pet: any): string {
  if (!pet) return 'Raza desconocida'
  return pet.breed || pet.raza || 'Raza desconocida'
}
