/**
 * Pet utility functions
 */

/**
 * Get the primary image URL for a pet
 * @param pet - Pet object with image or images array
 * @returns Image URL or placeholder
 */
export function getPetImage(pet: any): string {
  if (!pet) return '/placeholder.webp'
  
  // Try different image properties
  if (pet.image) return pet.image
  if (pet.images && Array.isArray(pet.images) && pet.images.length > 0) {
    return pet.images[0]
  }
  if (pet.photo) return pet.photo
  if (pet.photos && Array.isArray(pet.photos) && pet.photos.length > 0) {
    return pet.photos[0]
  }
  
  return '/placeholder.webp'
}

/**
 * Get pet display name
 * @param pet - Pet object
 * @returns Pet name or fallback
 */
export function getPetName(pet: any): string {
  if (!pet) return 'Mascota'
  return pet.name || pet.nombre || 'Mascota'
}

/**
 * Get pet type with proper formatting
 * @param pet - Pet object
 * @returns Formatted pet type
 */
export function getPetType(pet: any): string {
  if (!pet) return 'Desconocido'
  
  const type = pet.type || pet.tipo || 'unknown'
  switch (type.toLowerCase()) {
    case 'dog':
    case 'perro':
      return 'Perro'
    case 'cat':
    case 'gato':
      return 'Gato'
    case 'other':
    case 'otro':
      return 'Otro'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}
