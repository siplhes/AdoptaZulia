/**
 * Date Formatting Utilities
 * Centralized date formatting to follow DRY principle
 */

export interface DateFormatOptions {
  includeTime?: boolean
  shortMonth?: boolean
  includeYear?: boolean
}

/**
 * Format timestamp to human-readable date in Spanish
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Optional formatting options
 * @returns Formatted date string or fallback message
 */
export function formatDate(
  timestamp: number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!timestamp || timestamp === 0) {
    return 'Fecha no disponible'
  }

  try {
    const date = new Date(timestamp)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options,
    }

    return date.toLocaleDateString('es-ES', defaultOptions)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Error en fecha'
  }
}

/**
 * Format timestamp to short date format (DD/MM/YYYY)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Short formatted date string
 */
export function formatShortDate(timestamp: number | null | undefined): string {
  if (!timestamp) return '--/--/----'

  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return '--/--/----'

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '--/--/----'
  }
}

/**
 * Format timestamp to relative time (e.g., "hace 2 días")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string in Spanish
 */
export function formatRelativeTime(timestamp: number | null | undefined): string {
  if (!timestamp) return 'Fecha desconocida'

  try {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (seconds < 60) return 'Hace un momento'
    if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
    if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
    if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
    if (weeks < 4) return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
    if (months < 12) return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`
    return `Hace ${years} ${years === 1 ? 'año' : 'años'}`
  } catch {
    return 'Fecha desconocida'
  }
}

/**
 * Check if a timestamp is within the last N days
 * @param timestamp - Unix timestamp in milliseconds
 * @param days - Number of days to check (default: 7)
 * @returns True if timestamp is within the last N days
 */
export function isRecent(timestamp: number | null | undefined, days = 7): boolean {
  if (!timestamp) return false

  try {
    const now = Date.now()
    const diff = now - timestamp
    const daysDiff = diff / (1000 * 60 * 60 * 24)
    return daysDiff <= days
  } catch {
    return false
  }
}

/**
 * Format timestamp to time only (HH:MM)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Time string in 24h format
 */
export function formatTime(timestamp: number | null | undefined): string {
  if (!timestamp) return '--:--'

  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return '--:--'

    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return '--:--'
  }
}

/**
 * Format timestamp to full datetime
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Full datetime string
 */
export function formatDateTime(timestamp: number | null | undefined): string {
  if (!timestamp) return 'Fecha y hora no disponible'

  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Fecha y hora inválida'

    const dateStr = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const timeStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return `${dateStr} a las ${timeStr}`
  } catch {
    return 'Error en fecha y hora'
  }
}

/**
 * Get age from birthdate timestamp
 * @param birthdate - Unix timestamp of birthdate
 * @returns Age in years or formatted string
 */
export function getAge(birthdate: number | null | undefined): string {
  if (!birthdate) return 'Edad desconocida'

  try {
    const now = Date.now()
    const diff = now - birthdate
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))

    if (years < 1) {
      const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
      return `${months} ${months === 1 ? 'mes' : 'meses'}`
    }

    return `${years} ${years === 1 ? 'año' : 'años'}`
  } catch {
    return 'Edad desconocida'
  }
}

/**
 * Convert date string (YYYY-MM-DD) to timestamp
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Unix timestamp in milliseconds
 */
export function dateStringToTimestamp(dateString: string): number {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string')
    }
    return date.getTime()
  } catch (error) {
    console.error('Error converting date string:', error)
    return Date.now()
  }
}

/**
 * Convert timestamp to date string (YYYY-MM-DD)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Date string in YYYY-MM-DD format
 */
export function timestampToDateString(timestamp: number | null | undefined): string {
  if (!timestamp) return ''

  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}
