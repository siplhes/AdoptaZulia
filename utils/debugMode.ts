/**
 * Archivo de configuración para habilitar/deshabilitar modo debug
 * 
 * En navegadores: ejecuta en consola:
 * - localStorage.setItem('ADOPTA_DEBUG', 'true')  // Habilitar debug
 * - localStorage.removeItem('ADOPTA_DEBUG')       // Deshabilitar debug
 */

export const initializeDebugMode = () => {
  if (typeof window !== 'undefined') {
    // Verificar si el usuario ha habilitado debug mode
    const debugEnabled = localStorage.getItem('ADOPTA_DEBUG') === 'true'
    
    // Exponer flag globalmente para desarrollo (solo si DEBUG está activo)
    if (debugEnabled) {
      (window as any).__DEBUG__ = true
      console.log('%c🔧 DEBUG MODE ENABLED', 'color: yellow; font-weight: bold')
    }
  }
}

export const enableDebugMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ADOPTA_DEBUG', 'true')
    (window as any).__DEBUG__ = true
    console.log('%c✅ Debug mode enabled. Refresca la página.', 'color: green; font-weight: bold')
  }
}

export const disableDebugMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ADOPTA_DEBUG')
    delete (window as any).__DEBUG__
    console.log('%c❌ Debug mode disabled. Refresca la página.', 'color: red; font-weight: bold')
  }
}

export const isDebugMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return (window as any).__DEBUG__ === true
  }
  return false
}
