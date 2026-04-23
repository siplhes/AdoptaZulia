/**
 * Normaliza un número de teléfono, eliminando caracteres no numéricos
 * y asegurando el código de país correcto (especialmente para Venezuela).
 * 
 * @param phone El número de teléfono a normalizar
 * @param defaultCountryCode El código de país por defecto (por defecto '58' para Venezuela)
 * @returns El número normalizado listo para links de WhatsApp o llamadas
 */
export function normalizePhoneNumber(phone: string | undefined, defaultCountryCode = '58'): string {
  if (!phone) return ''

  // Eliminar todo lo que no sea dígito
  let cleaned = phone.replace(/\D/g, '')

  if (!cleaned) return ''

  // Lógica específica para Venezuela
  if (defaultCountryCode === '58') {
    // Si comienza con 04..., 02..., etc., quitar el 0 inicial
    if (cleaned.startsWith('0') && cleaned.length >= 10) {
      cleaned = cleaned.substring(1)
    }

    // Si tiene 10 dígitos (ej. 4121234567), es un número local de Venezuela sin código
    if (cleaned.length === 10 && (cleaned.startsWith('4') || cleaned.startsWith('2'))) {
      cleaned = '58' + cleaned
    }
    
    // Si no tiene el código de Venezuela y parece ser uno local corto (ej. 4121234567)
    // O si ya tiene 10 dígitos pero le falta el 58
  }

  // Si después de limpiar no tiene código de país (asumiendo que los códigos tienen 1-3 dígitos)
  // y el número es corto, le ponemos el código por defecto
  if (cleaned.length <= 10 && !cleaned.startsWith(defaultCountryCode)) {
    cleaned = defaultCountryCode + cleaned
  }

  return cleaned
}

/**
 * Formatea un número de teléfono para visualización humana.
 * Ej: +58 412 123 4567
 */
export function formatPhoneForDisplay(phone: string | undefined): string {
  const normalized = normalizePhoneNumber(phone)
  if (!normalized) return 'No disponible'

  if (normalized.startsWith('58') && normalized.length === 12) {
    return `+58 ${normalized.substring(2, 5)} ${normalized.substring(5, 8)} ${normalized.substring(8)}`
  }

  return `+${normalized}`
}
