/**
 * Input Validation Utilities
 * Centralized validation logic to follow DRY principle
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate Venezuelan phone number
 * @param phone - Phone string to validate
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false

  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // Venezuelan phone: 04XX-XXXXXXX or 02XX-XXXXXXX (11 digits with area code)
  const phoneRegex = /^(0?4(12|14|16|24|26)|0?2(12|41|43|51|61|71|81))\d{7}$/

  return phoneRegex.test(cleaned)
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns True if valid username (alphanumeric, underscore, 3-20 chars)
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Sanitize user input to prevent XSS
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid boolean and reason string
 */
export function validatePassword(password: string): { isValid: boolean; reason: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, reason: 'La contraseña es requerida' }
  }

  if (password.length < 8) {
    return { isValid: false, reason: 'La contraseña debe tener al menos 8 caracteres' }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, reason: 'La contraseña debe contener al menos una letra minúscula' }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, reason: 'La contraseña debe contener al menos una letra mayúscula' }
  }

  if (!/\d/.test(password)) {
    return { isValid: false, reason: 'La contraseña debe contener al menos un número' }
  }

  return { isValid: true, reason: 'Contraseña válida' }
}

/**
 * Validate required field
 * @param value - Value to check
 * @param fieldName - Name of field for error message
 * @returns Error message or empty string if valid
 */
export function validateRequired(value: any, fieldName: string): string {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} es requerido`
  }

  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} no puede estar vacío`
  }

  return ''
}

/**
 * Validate minimum length
 * @param value - String to validate
 * @param minLength - Minimum length required
 * @param fieldName - Name of field for error message
 * @returns Error message or empty string if valid
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): string {
  if (!value || typeof value !== 'string') {
    return `${fieldName} es requerido`
  }

  if (value.trim().length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`
  }

  return ''
}

/**
 * Validate maximum length
 * @param value - String to validate
 * @param maxLength - Maximum length allowed
 * @param fieldName - Name of field for error message
 * @returns Error message or empty string if valid
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): string {
  if (!value || typeof value !== 'string') return ''

  if (value.length > maxLength) {
    return `${fieldName} no puede exceder ${maxLength} caracteres`
  }

  return ''
}

/**
 * Validate number range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Name of field for error message
 * @returns Error message or empty string if valid
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${fieldName} debe ser un número válido`
  }

  if (value < min) {
    return `${fieldName} no puede ser menor que ${min}`
  }

  if (value > max) {
    return `${fieldName} no puede ser mayor que ${max}`
  }

  return ''
}

/**
 * Validate file size
 * @param file - File object to validate
 * @param maxSizeMB - Maximum size in megabytes
 * @returns Error message or empty string if valid
 */
export function validateFileSize(file: File, maxSizeMB: number): string {
  if (!file) {
    return 'Archivo es requerido'
  }

  const maxBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxBytes) {
    return `El archivo no puede exceder ${maxSizeMB} MB`
  }

  return ''
}

/**
 * Validate file type
 * @param file - File object to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Error message or empty string if valid
 */
export function validateFileType(file: File, allowedTypes: string[]): string {
  if (!file) {
    return 'Archivo es requerido'
  }

  if (!allowedTypes.includes(file.type)) {
    return `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`
  }

  return ''
}

/**
 * Validate image file (common image types)
 * @param file - File object to validate
 * @param maxSizeMB - Maximum size in megabytes (default: 5MB)
 * @returns Error message or empty string if valid
 */
export function validateImageFile(file: File, maxSizeMB = 5): string {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  const typeError = validateFileType(file, allowedTypes)
  if (typeError) return typeError

  const sizeError = validateFileSize(file, maxSizeMB)
  if (sizeError) return sizeError

  return ''
}
