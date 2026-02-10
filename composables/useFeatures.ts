import { ref, readonly } from 'vue'
import type { FeatureConfig } from '../models/FeatureConfig'
import { DEFAULT_FEATURES } from '../models/FeatureConfig'

// Global reactive state (shared across all components)
const features = ref<FeatureConfig>({ ...DEFAULT_FEATURES })
const loading = ref(false)
const error = ref<string | null>(null)
const initialized = ref(false)

export function useFeatures() {
  /**
   * Fetch features from server API (uses Firebase Admin, bypasses security rules)
   */
  async function fetchFeatures(): Promise<FeatureConfig> {
    // Skip if already loading
    if (loading.value) {
      return features.value
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; features: FeatureConfig }>('/api/features')

      if (response.success && response.features) {
        features.value = {
          ...DEFAULT_FEATURES,
          ...response.features,
        }
        initialized.value = true
      }

      return features.value
    } catch (err: any) {
      console.error('Error fetching features:', err)
      error.value = err.data?.message || err.message || 'Error loading features'
      // Use defaults on error
      features.value = { ...DEFAULT_FEATURES }
      return features.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Update features via server API
   */
  async function updateFeatures(updates: Partial<FeatureConfig>): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; features: FeatureConfig }>(
        '/api/features/update',
        {
          method: 'POST',
          body: updates,
        }
      )

      if (response.success && response.features) {
        features.value = {
          ...DEFAULT_FEATURES,
          ...response.features,
        }
        return true
      }

      return false
    } catch (err: any) {
      console.error('Error updating features:', err)
      error.value = err.data?.message || err.message || 'Error updating features'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if a specific feature is enabled
   */
  function isFeatureEnabled(featureName: keyof FeatureConfig): boolean {
    // Ensure we return a boolean
    const value = features.value[featureName]
    return value === true
  }

  /**
   * Initialize features if not already done
   */
  async function ensureInitialized(): Promise<void> {
    if (!initialized.value && !loading.value) {
      await fetchFeatures()
    }
  }

  return {
    // State (readonly to prevent external mutations)
    features: readonly(features),
    loading: readonly(loading),
    error: readonly(error),
    initialized: readonly(initialized),

    // Actions
    fetchFeatures,
    updateFeatures,
    isFeatureEnabled,
    ensureInitialized,
  }
}

// Named export for direct feature checking (useful in templates)
export function isFeatureEnabled(featureName: keyof FeatureConfig): boolean {
  return features.value[featureName] === true
}

// Export raw features ref for advanced usage
export { features as rawFeatures }
