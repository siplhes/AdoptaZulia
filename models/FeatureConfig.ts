/**
 * Configuración de características del sistema
 * Permite activar/desactivar funcionalidades específicas
 */
export interface FeatureConfig {
  id?: string
  favorites: boolean
  comments: boolean
  imageGeneration: boolean
  adoption: boolean
  createdAt?: number
  updatedAt?: number
}

export const DEFAULT_FEATURES: FeatureConfig = {
  favorites: false,
  comments: false,
  imageGeneration: true,
  adoption: true,
}
