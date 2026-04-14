import { ref } from 'vue'
import imageCompression from 'browser-image-compression'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OptimizationOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  /** 0–1. Default 0.82 */
  quality?: number
  fileType?: 'image/webp' | 'image/jpeg' | 'image/png'
  preserveExif?: boolean
}

export interface OptimizationResult {
  file: File
  originalSize: number
  compressedSize: number
  savings: number
  savingsPercent: number
}

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS = {
  thumbnail: { maxSizeMB: 0.08,  maxWidthOrHeight: 400,  quality: 0.75 },
  preview:   { maxSizeMB: 0.25,  maxWidthOrHeight: 800,  quality: 0.80 },
  standard:  { maxSizeMB: 0.8,   maxWidthOrHeight: 1920, quality: 0.82 },
  high:      { maxSizeMB: 1.5,   maxWidthOrHeight: 2560, quality: 0.85 },
  original:  { maxSizeMB: 4,     maxWidthOrHeight: 4096, quality: 0.90 },
} as const

export type PresetName = keyof typeof PRESETS

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resize an image via Canvas and encode it to WebP (or another MIME type).
 * Returns a Blob with the chosen MIME type.
 */
function canvasConvert(
  src: string,
  maxDim: number,
  quality: number,
  mime: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img

      // Downscale proportionally if needed
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height / width) * maxDim)
          width = maxDim
        } else {
          width = Math.round((width / height) * maxDim)
          height = maxDim
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'))
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob returned null'))
        },
        mime,
        quality
      )

      URL.revokeObjectURL(src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(src)
      reject(new Error('Failed to load image for canvas conversion'))
    }
    img.src = src
  })
}

/** Replace the extension of a filename with a new one (without the dot). */
function replaceExtension(name: string, ext: string): string {
  const dot = name.lastIndexOf('.')
  const base = dot !== -1 ? name.slice(0, dot) : name
  return `${base}.${ext}`
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useImageOptimizer() {
  const optimizing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  /**
   * Full pipeline:
   * 1. Resize + initial compression via browser-image-compression (supports Web Worker)
   * 2. Re-encode via Canvas to guarantee the target MIME type (default: WebP)
   */
  async function optimizeImage(
    imageFile: File,
    options?: OptimizationOptions
  ): Promise<OptimizationResult> {
    optimizing.value = true
    error.value = null
    progress.value = 0

    const originalSize = imageFile.size
    const targetMime: string = options?.fileType ?? 'image/webp'
    const quality = options?.quality ?? 0.82
    const maxDim = options?.maxWidthOrHeight ?? 1920
    const maxSizeMB = options?.maxSizeMB ?? 1

    try {
      // Step 1 – resize / size-cap with browser-image-compression
      const step1Options = {
        maxSizeMB,
        maxWidthOrHeight: maxDim,
        useWebWorker: options?.useWebWorker !== false,
        preserveExif: options?.preserveExif ?? false,
        // Don't force fileType here; canvas step handles final encoding
        onProgress: (p: number) => {
          progress.value = Math.round(p * 0.7) // 0 → 70 %
        },
      }

      const resized = await imageCompression(imageFile, step1Options)
      progress.value = 70

      // Step 2 – re-encode to target MIME via Canvas
      const objectUrl = URL.createObjectURL(resized)
      const blob = await canvasConvert(objectUrl, maxDim, quality, targetMime)
      progress.value = 95

      // Build File with correct name + MIME
      const ext = targetMime === 'image/webp'
        ? 'webp'
        : targetMime === 'image/jpeg'
          ? 'jpg'
          : 'png'
      const newName = replaceExtension(imageFile.name, ext)
      const optimizedFile = new File([blob], newName, {
        type: targetMime,
        lastModified: Date.now(),
      })

      const compressedSize = optimizedFile.size
      const savings = originalSize - compressedSize
      const savingsPercent = Math.max(0, Math.round((savings / originalSize) * 100))

      progress.value = 100
      optimizing.value = false

      console.log(`✅ [ImageOptimizer] ${imageFile.name} → ${newName}`, {
        original: formatBytes(originalSize),
        optimized: formatBytes(compressedSize),
        savings: `${savingsPercent}%`,
        format: targetMime,
      })

      return { file: optimizedFile, originalSize, compressedSize, savings, savingsPercent }
    } catch (err) {
      console.error('[ImageOptimizer] Error:', err)
      error.value = err instanceof Error ? err.message : 'Optimization failed'
      optimizing.value = false
      progress.value = 0

      // Graceful fallback – return original file unchanged
      return {
        file: imageFile,
        originalSize,
        compressedSize: originalSize,
        savings: 0,
        savingsPercent: 0,
      }
    }
  }

  /** Apply a named quality preset */
  async function optimizeWithPreset(
    imageFile: File,
    preset: PresetName
  ): Promise<OptimizationResult> {
    return optimizeImage(imageFile, { ...PRESETS[preset], fileType: 'image/webp' })
  }

  /** Optimize multiple images sequentially */
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
      console.error('[ImageOptimizer] Batch error:', err)
      error.value = 'Failed to optimize some images'
      optimizing.value = false
      return results
    }
  }

  /**
   * Convert a single file to WebP with optional quality (0–1).
   * This is the canonical "squoosh-like" one-shot method.
   */
  async function convertToWebP(
    imageFile: File,
    quality: number = 0.82
  ): Promise<OptimizationResult> {
    return optimizeImage(imageFile, {
      fileType: 'image/webp',
      quality,
      maxSizeMB: 10,
      maxWidthOrHeight: 4096,
    })
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

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

  function validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    const maxSize = 25 * 1024 * 1024 // 25 MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Formato no soportado. Usa JPEG, PNG, WebP, AVIF o GIF.' }
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo es muy grande. Máximo 25 MB.' }
    }
    return { valid: true }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return {
    // Core
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
