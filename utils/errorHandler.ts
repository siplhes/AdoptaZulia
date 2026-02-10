/**
 * Error Handling Utilities
 * Centralized error handling and user feedback
 */

import type { FirebaseError } from 'firebase/app'

/**
 * Firebase error codes to user-friendly Spanish messages
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'auth/email-already-in-use': 'Este correo ya está registrado',
  'auth/invalid-email': 'Correo electrónico inválido',
  'auth/operation-not-allowed': 'Operación no permitida',
  'auth/weak-password': 'La contraseña es muy débil',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-credential': 'Credenciales inválidas',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
  'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
  'auth/cancelled-popup-request': 'Operación cancelada',
  'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión',

  // Database errors
  'permission-denied': 'No tienes permiso para realizar esta acción',
  unavailable: 'Servicio temporalmente no disponible',
  'network-request-failed': 'Error de conexión',
}

/**
 * Handle Firebase errors and return user-friendly message
 * @param error - Firebase error object
 * @returns User-friendly error message in Spanish
 */
export function handleFirebaseError(error: any): string {
  if (!error) return 'Error desconocido'

  // Handle Firebase errors
  if (error.code && typeof error.code === 'string') {
    const message = FIREBASE_ERROR_MESSAGES[error.code]
    if (message) return message
  }

  // Handle generic errors
  if (error.message && typeof error.message === 'string') {
    // Don't expose technical details to users
    console.error('Firebase error:', error.message)
    return 'Ocurrió un error. Por favor, intenta nuevamente'
  }

  return 'Error desconocido. Contacta al soporte si persiste'
}

/**
 * Handle API errors and return user-friendly message
 * @param error - API error object
 * @returns User-friendly error message
 */
export function handleApiError(error: any): string {
  if (!error) return 'Error en la solicitud'

  // Handle HTTP status codes
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode

    switch (status) {
      case 400:
        return 'Datos inválidos. Verifica tu información'
      case 401:
        return 'No autorizado. Inicia sesión nuevamente'
      case 403:
        return 'No tienes permisos para esta acción'
      case 404:
        return 'Recurso no encontrado'
      case 429:
        return 'Demasiadas solicitudes. Espera un momento'
      case 500:
      case 502:
      case 503:
        return 'Error del servidor. Intenta más tarde'
      default:
        return `Error ${status}. Contacta al soporte`
    }
  }

  // Handle network errors
  if (error.message && error.message.includes('network')) {
    return 'Error de conexión. Verifica tu internet'
  }

  // Fallback
  return error.message || 'Error en la solicitud'
}

/**
 * Log error to console in development, send to monitoring in production
 * @param context - Where the error occurred
 * @param error - Error object
 * @param additionalData - Any additional context data
 */
export function logError(context: string, error: any, additionalData?: any): void {
  const timestamp = new Date().toISOString()

  console.error(`[${timestamp}] Error in ${context}:`, error)

  if (additionalData) {
    console.error('Additional context:', additionalData)
  }

  // In production, you could send to error tracking service
  // Example: Sentry.captureException(error, { context, additionalData })
}

/**
 * Show error toast notification (you'll need to implement the toast UI)
 * @param message - Error message to display
 * @param duration - Duration in milliseconds (default: 5000)
 */
export function showErrorToast(message: string, duration = 5000): void {
  // This is a placeholder - implement with your toast library
  console.error('ERROR:', message)

  // Example implementation with alert (replace with proper toast UI)
  if (typeof window !== 'undefined') {
    // You can integrate with libraries like vue-toastification later
    alert(`❌ ${message}`)
  }
}

/**
 * Show success toast notification
 * @param message - Success message to display
 * @param duration - Duration in milliseconds (default: 3000)
 */
export function showSuccessToast(message: string, duration = 3000): void {
  // This is a placeholder - implement with your toast library
  console.log('SUCCESS:', message)

  if (typeof window !== 'undefined') {
    // You can integrate with libraries like vue-toastification later
    alert(`✅ ${message}`)
  }
}

/**
 * Show info toast notification
 * @param message - Info message to display
 * @param duration - Duration in milliseconds (default: 3000)
 */
export function showInfoToast(message: string, duration = 3000): void {
  console.info('INFO:', message)

  if (typeof window !== 'undefined') {
    alert(`ℹ️ ${message}`)
  }
}

/**
 * Show warning toast notification
 * @param message - Warning message to display
 * @param duration - Duration in milliseconds (default: 4000)
 */
export function showWarningToast(message: string, duration = 4000): void {
  console.warn('WARNING:', message)

  if (typeof window !== 'undefined') {
    alert(`⚠️ ${message}`)
  }
}

/**
 * Handle async operation with consistent error handling
 * @param operation - Async function to execute
 * @param errorContext - Context for error logging
 * @param customErrorMessage - Custom error message for user
 * @returns Result or null on error
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorContext: string,
  customErrorMessage?: string
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    logError(errorContext, error)

    const message = customErrorMessage || handleFirebaseError(error)
    showErrorToast(message)

    return null
  }
}

/**
 * Create a safe async wrapper that won't throw
 * @param fn - Async function to wrap
 * @returns Wrapped function that returns [error, data]
 */
export function makeSafe<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<[Error | null, R | null]> {
  return async (...args: T): Promise<[Error | null, R | null]> => {
    try {
      const result = await fn(...args)
      return [null, result]
    } catch (error) {
      return [error as Error, null]
    }
  }
}

/**
 * Retry an operation with exponential backoff
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 * @returns Operation result
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Validate and handle form submission
 * @param submitFn - Async submit function
 * @param validationFn - Validation function that returns error message or empty string
 * @param successMessage - Message to show on success
 * @returns Success boolean
 */
export async function handleFormSubmit(
  submitFn: () => Promise<any>,
  validationFn?: () => string,
  successMessage = '¡Guardado exitosamente!'
): Promise<boolean> {
  // Validate first
  if (validationFn) {
    const validationError = validationFn()
    if (validationError) {
      showErrorToast(validationError)
      return false
    }
  }

  // Submit
  try {
    await submitFn()
    showSuccessToast(successMessage)
    return true
  } catch (error) {
    const errorMessage = handleFirebaseError(error)
    showErrorToast(errorMessage)
    logError('Form submission', error)
    return false
  }
}
