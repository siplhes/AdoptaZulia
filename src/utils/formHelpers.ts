/**
 * Form Helpers Utility
 *
 * Common form operations, validation, and state management utilities
 */

/**
 * Form field error state
 */
export interface FieldError {
  field: string
  message: string
}

/**
 * Form validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: FieldError[]
}

/**
 * Trim all string values in an object
 */
export function trimFormData<T extends Record<string, any>>(data: T): T {
  const trimmed = { ...data }

  for (const key in trimmed) {
    if (typeof trimmed[key] === 'string') {
      trimmed[key] = trimmed[key].trim() as any
    }
  }

  return trimmed
}

/**
 * Remove empty fields from form data
 */
export function removeEmptyFields<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {}

  for (const key in data) {
    const value = data[key]
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value
    }
  }

  return cleaned
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  required: string[]
): ValidationResult {
  const errors: FieldError[] = []

  for (const field of required) {
    const value = data[field]
    if (value === null || value === undefined || value === '') {
      errors.push({
        field,
        message: `El campo ${field} es requerido`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Venezuelan format)
 */
export function validateVenezuelanPhone(phone: string): boolean {
  // Formato: 0414-1234567 o 04141234567
  const phoneRegex = /^0(4(1[246]|2[46]))\d{7}$/
  const cleaned = phone.replace(/[-\s]/g, '')
  return phoneRegex.test(cleaned)
}

/**
 * Format phone number to Venezuelan standard
 */
export function formatVenezuelanPhone(phone: string): string {
  const cleaned = phone.replace(/[-\s]/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
  }
  return phone
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate text length
 */
export function validateLength(text: string, min?: number, max?: number): ValidationResult {
  const errors: FieldError[] = []

  if (min !== undefined && text.length < min) {
    errors.push({
      field: 'text',
      message: `El texto debe tener al menos ${min} caracteres`,
    })
  }

  if (max !== undefined && text.length > max) {
    errors.push({
      field: 'text',
      message: `El texto no puede exceder ${max} caracteres`,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitize HTML input (basic XSS prevention)
 */
export function sanitizeHTML(input: string): string {
  const map: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return input.replace(/[<>"'/]/g, (char) => map[char] || char)
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim()
}

/**
 * Parse form data into specific types
 */
export function parseFormValue(value: any, type: 'string' | 'number' | 'boolean'): any {
  if (type === 'number') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  if (type === 'boolean') {
    return value === 'true' || value === true || value === 1
  }

  return String(value)
}

/**
 * Create form error message map
 */
export function createErrorMap(errors: FieldError[]): Record<string, string> {
  const map: Record<string, string> = {}

  for (const error of errors) {
    map[error.field] = error.message
  }

  return map
}

/**
 * Check if form has errors
 */
export function hasErrors(errors: FieldError[] | ValidationResult): boolean {
  if (Array.isArray(errors)) {
    return errors.length > 0
  }
  return !errors.valid
}

/**
 * Merge validation results
 */
export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors: FieldError[] = []

  for (const result of results) {
    allErrors.push(...result.errors)
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  }
}

/**
 * Debounce function for form inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * File validation
 */
export interface FileValidationOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[] // MIME types
  allowedExtensions?: string[]
}

export function validateFile(file: File, options: FileValidationOptions): ValidationResult {
  const errors: FieldError[] = []

  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(2)
    errors.push({
      field: 'file',
      message: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`,
    })
  }

  // Check MIME type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      message: `Tipo de archivo no permitido. Tipos permitidos: ${options.allowedTypes.join(', ')}`,
    })
  }

  // Check extension
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push({
        field: 'file',
        message: `Extensión de archivo no permitida. Extensiones permitidas: ${options.allowedExtensions.join(', ')}`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Convert File to Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
