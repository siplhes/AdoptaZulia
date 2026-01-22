/**
 * Configuración de Debug y Logging Seguro
 * Solo registra mensajes en consola si está en modo debug
 */

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development'
}

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production'
}

export const shouldLog = (): boolean => {
  // En desarrollo, siempre registra
  // En producción, solo si DEBUG flag está activo
  if (isDevelopment()) return true
  if (typeof window !== 'undefined' && (window as any).__DEBUG__) return true
  return false
}

/**
 * Logger seguro que solo registra en modo debug
 */
export const secureLogger = {
  log: (...args: any[]) => {
    if (shouldLog()) {
      console.log(...args)
    }
  },

  warn: (...args: any[]) => {
    if (shouldLog()) {
      console.warn(...args)
    }
  },

  error: (...args: any[]) => {
    // Los errores siempre se registran en desarrollo
    if (isDevelopment()) {
      console.error(...args)
    } else if (isProduction() && shouldLog()) {
      // En producción solo si está habilitado debug
      console.error(...args)
    }
  },

  debug: (...args: any[]) => {
    if (shouldLog()) {
      console.debug(...args)
    }
  },

  info: (...args: any[]) => {
    if (shouldLog()) {
      console.info(...args)
    }
  },
}

/**
 * Sanitiza información sensible antes de logging
 */
export const sanitizeForLogging = (obj: any, sensitiveKeys: string[] = []): any => {
  const defaultSensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'accessKey',
    'secretKey',
    'authorization',
    'credit_card',
    'ssn',
    'email',
    'phone',
    'uid',
    'userId',
  ]

  const allSensitiveKeys = [...new Set([...defaultSensitiveKeys, ...sensitiveKeys])]

  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj }

  for (const key of allSensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]'
    }
  }

  return sanitized
}
