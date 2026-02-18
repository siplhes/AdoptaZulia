/**
 * Composable para logging seguro
 * Solo registra en consola cuando está en modo debug
 */

import { secureLogger, sanitizeForLogging } from '@/utils/debug'

export const useSecureLogger = () => {
  return {
    log: (...args: any[]) => secureLogger.log(...args),
    warn: (...args: any[]) => secureLogger.warn(...args),
    error: (...args: any[]) => secureLogger.error(...args),
    debug: (...args: any[]) => secureLogger.debug(...args),
    info: (...args: any[]) => secureLogger.info(...args),
    sanitize: (obj: any, sensitiveKeys?: string[]) => sanitizeForLogging(obj, sensitiveKeys),
  }
}
