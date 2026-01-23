import { ref } from 'vue'
import { getDatabase, ref as dbRef, get, set } from 'firebase/database'
import type { FeatureConfig } from '../models/FeatureConfig'
import { DEFAULT_FEATURES } from '../models/FeatureConfig'
import { useFirebaseApp } from 'vuefire'

export function useFeatures() {
  const features = ref<FeatureConfig>(DEFAULT_FEATURES)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtiene la configuración de features
   */
  async function fetchFeatures(): Promise<FeatureConfig> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      if (!firebaseApp) {
        throw new Error('Firebase no está inicializado')
      }
      
      const db = getDatabase(firebaseApp)
      const featuresRef = dbRef(db, 'config/features')

      const snapshot = await get(featuresRef)

      if (snapshot.exists()) {
        const data = snapshot.val() as FeatureConfig
        features.value = {
          ...DEFAULT_FEATURES,
          ...data,
        }
      } else {
        // Si no existe, crear la configuración por defecto
        await set(featuresRef, DEFAULT_FEATURES)
        features.value = DEFAULT_FEATURES
      }

      return features.value
    } catch (err: any) {
      console.error('Error al obtener configuración de features:', err)
      error.value = err.message || 'Error al cargar la configuración'
      // Retornar valores por defecto en caso de error
      features.value = DEFAULT_FEATURES
      return DEFAULT_FEATURES
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza la configuración de features
   */
  async function updateFeatures(newFeatures: Partial<FeatureConfig>): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      if (!firebaseApp) {
        throw new Error('Firebase no está inicializado')
      }
      
      const db = getDatabase(firebaseApp)
      const featuresRef = dbRef(db, 'config/features')

      const updatedFeatures: FeatureConfig = {
        ...features.value,
        ...newFeatures,
        updatedAt: Date.now(),
      }

      await set(featuresRef, updatedFeatures)
      features.value = updatedFeatures

      return true
    } catch (err: any) {
      console.error('Error al actualizar configuración de features:', err)
      error.value = err.message || 'Error al guardar la configuración'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene el estado de una feature específica
   */
  function isFeatureEnabled(featureName: keyof FeatureConfig): boolean {
    return features.value[featureName] === true
  }

  return {
    features,
    loading,
    error,
    fetchFeatures,
    updateFeatures,
    isFeatureEnabled,
  }
}
