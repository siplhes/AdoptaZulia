/**
 * Image Uploader Utility
 *
 * Centralized image upload and management for the application
 */

import { validateFile, fileToBase64 } from './formHelpers'

/**
 * Upload result interface
 */
export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Image upload options
 */
export interface ImageUploadOptions {
  maxSize?: number // in bytes (default: 5MB)
  allowedTypes?: string[] // MIME types
  quality?: number // 0-1 for JPEG compression
  maxWidth?: number // resize if larger
  maxHeight?: number // resize if larger
}

const DEFAULT_OPTIONS: ImageUploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1920,
}

/**
 * Validate image file
 */
export function validateImage(
  file: File,
  options: ImageUploadOptions = {}
): { valid: boolean; error?: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const validation = validateFile(file, {
    maxSize: opts.maxSize,
    allowedTypes: opts.allowedTypes,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  })

  if (!validation.valid) {
    return {
      valid: false,
      error: validation.errors[0]?.message || 'Archivo inválido',
    }
  }

  return { valid: true }
}

/**
 * Resize image if needed
 */
export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('No se pudo convertir la imagen'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Generate image preview URL
 */
export function generatePreviewURL(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke preview URL (cleanup)
 */
export function revokePreviewURL(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Convert image to WebP format (better compression)
 */
export async function convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'))
          return
        }

        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('No se pudo convertir a WebP'))
            }
          },
          'image/webp',
          quality
        )
      }

      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Upload image to Firebase Storage (requires Firebase setup)
 * This is a placeholder - you'll need to implement actual Firebase Storage upload
 */
export async function uploadToStorage(
  file: File,
  path: string,
  options: ImageUploadOptions = {}
): Promise<UploadResult> {
  try {
    // Validate
    const validation = validateImage(file, options)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Resize if needed
    const opts = { ...DEFAULT_OPTIONS, ...options }
    let processedFile: File | Blob = file

    if (opts.maxWidth && opts.maxHeight) {
      processedFile = await resizeImage(file, opts.maxWidth, opts.maxHeight, opts.quality || 0.8)
    }

    // TODO: Implement actual Firebase Storage upload
    // For now, return a placeholder
    console.warn('Firebase Storage upload not implemented yet')

    // Placeholder - convert to base64 for now
    const base64 = await fileToBase64(file)

    return {
      success: true,
      url: base64, // In production, this would be the Firebase Storage URL
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al subir la imagen',
    }
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  basePath: string,
  options: ImageUploadOptions = {}
): Promise<UploadResult[]> {
  const uploads = files.map((file, index) => {
    const path = `${basePath}/${Date.now()}_${index}_${file.name}`
    return uploadToStorage(file, path, options)
  })

  return Promise.all(uploads)
}

/**
 * Delete image from storage
 * This is a placeholder - implement actual Firebase Storage deletion
 */
export async function deleteFromStorage(url: string): Promise<boolean> {
  try {
    // TODO: Implement actual Firebase Storage deletion
    console.warn('Firebase Storage deletion not implemented yet')
    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        })
      }

      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('No se puedo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Check if file is an image
 */
export function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(file: File, size: number = 200): Promise<Blob> {
  return resizeImage(file, size, size, 0.7)
}

/**
 * Batch upload with progress tracking
 */
export async function uploadWithProgress(
  files: File[],
  basePath: string,
  onProgress: (completed: number, total: number) => void,
  options: ImageUploadOptions = {}
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const path = `${basePath}/${Date.now()}_${i}_${file.name}`
    const result = await uploadToStorage(file, path, options)
    results.push(result)
    onProgress(i + 1, total)
  }

  return results
}
