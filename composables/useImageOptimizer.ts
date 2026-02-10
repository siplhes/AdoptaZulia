import { ref } from 'vue'
import imageCompression from 'browser-image-compression'

// Types
interface OptimizationOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  quality?: number
  fileType?: 'image/webp' | 'image/jpeg' | 'image/png'
  preserveExif?: boolean
}

interface OptimizationResult {
  file: File
  originalSize: number
  compressedSize: number
  savings: number
  savingsPercent: number
}

// Default optimization presets
const PRESETS = {
  thumbnail: { maxSizeMB: 0.1, maxWidthOrHeight: 400, quality: 0.7 },
  preview: { maxSizeMB: 0.3, maxWidthOrHeight: 800, quality: 0.75 },
  standard: { maxSizeMB: 1, maxWidthOrHeight: 1920, quality: 0.8 },
  high: { maxSizeMB: 2, maxWidthOrHeight: 2560, quality: 0.85 },
  original: { maxSizeMB: 5, maxWidthOrHeight: 4096, quality: 0.9 },
} as const

export type PresetName = keyof typeof PRESETS

export function useImageOptimizer() {
  const optimizing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  /**
   * Optimize a single image with detailed result
   */
  async function optimizeImage(
    imageFile: File,
    options?: OptimizationOptions
  ): Promise<OptimizationResult> {
    optimizing.value = true
    error.value = null
    progress.value = 0

    try {
      const originalSize = imageFile.size

      const compressionOptions = {
        maxSizeMB: options?.maxSizeMB ?? 1,
        maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
        useWebWorker: options?.useWebWorker !== false,
        fileType: options?.fileType,
        preserveExif: options?.preserveExif ?? false,
        onProgress: (p: number) => {
          progress.value = Math.round(p)
        },
      }

      const compressedFile = await imageCompression(imageFile, compressionOptions)
      const compressedSize = compressedFile.size
      const savings = originalSize - compressedSize
      const savingsPercent = Math.round((savings / originalSize) * 100)

      progress.value = 100
      optimizing.value = false

      return {
        file: compressedFile,
        originalSize,
        compressedSize,
        savings,
        savingsPercent,
      }
    } catch (err) {
      console.error('Error optimizing image:', err)
      error.value = err instanceof Error ? err.message : 'Optimization failed'
      optimizing.value = false
      progress.value = 0

      // Return original file on error
      return {
        file: imageFile,
        originalSize: imageFile.size,
        compressedSize: imageFile.size,
        savings: 0,
        savingsPercent: 0,
      }
    }
  }

  /**
   * Optimize using a preset
   */
  async function optimizeWithPreset(
    imageFile: File,
    preset: PresetName
  ): Promise<OptimizationResult> {
    return optimizeImage(imageFile, PRESETS[preset])
  }

  /**
   * Optimize multiple images in parallel
   */
  async function optimizeImages(
    imageFiles: File[],
    options?: OptimizationOptions
  ): Promise<OptimizationResult[]> {
    optimizing.value = true
    error.value = null

    const results: OptimizationResult[] = []
    const total = imageFiles.length

    try {
      for (let i = 0; i < total; i++) {
        const result = await optimizeImage(imageFiles[i], {
          ...options,
          useWebWorker: true,
        })
        results.push(result)
        progress.value = Math.round(((i + 1) / total) * 100)
      }

      optimizing.value = false
      return results
    } catch (err) {
      console.error('Error optimizing multiple images:', err)
      error.value = 'Failed to optimize some images'
      optimizing.value = false
      return results
    }
  }

  /**
   * Convert image to WebP format
   */
  async function convertToWebP(
    imageFile: File,
    quality: number = 0.8
  ): Promise<OptimizationResult> {
    return optimizeImage(imageFile, {
      fileType: 'image/webp',
      quality,
      maxSizeMB: 10, // Allow larger size, focus on format conversion
      maxWidthOrHeight: 4096,
    })
  }

  /**
   * Get image dimensions
   */
  function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Validate image file
   */
  function validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 25 * 1024 * 1024 // 25MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Unsupported file type. Use JPEG, PNG, WebP or GIF.' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 25MB.' }
    }

    return { valid: true }
  }

  /**
   * Format bytes to human readable string
   */
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return {
    // Core functions
    optimizeImage,
    optimizeImages,
    optimizeWithPreset,
    convertToWebP,

    // Utilities
    getImageDimensions,
    validateImage,
    formatBytes,

    // State
    optimizing,
    progress,
    error,

    // Constants
    PRESETS,
  }
}
