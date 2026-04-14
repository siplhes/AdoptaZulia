import { useImageOptimizer } from '~/composables/useImageOptimizer'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadOptions {
  /** Whether to run the image optimizer before uploading. Default: true */
  optimize?: boolean
  /** Convert to WebP before uploading. Default: true (requires optimize: true) */
  convertToWebP?: boolean
  /** Max size in MB after optimization. Default: 1 */
  maxSizeMB?: number
  /** Max width or height in pixels. Default: 1920 */
  maxWidthOrHeight?: number
  /** WebP quality 0–1. Default: 0.82 */
  quality?: number
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Replace or append the WebP extension on a filename */
function toWebPName(name: string): string {
  const dot = name.lastIndexOf('.')
  const base = dot !== -1 ? name.slice(0, dot) : name
  return `${base}.webp`
}

// ─── Composable ───────────────────────────────────────────────────────────────

export const useS3 = () => {
  const { optimizeImage } = useImageOptimizer()

  /**
   * Optimize (and convert to WebP by default) an image File, then POST it
   * to the server upload endpoint which streams it to AWS S3.
   *
   * Returns the public S3 URL.
   */
  const uploadFile = async (
    file: File,
    folder: string,
    fileName: string,
    options?: UploadOptions
  ): Promise<string> => {
    try {
      const shouldOptimize = options?.optimize !== false
      const shouldWebP = options?.convertToWebP !== false
      let fileToUpload = file
      let uploadName = fileName

      console.log('🖼️ [S3] Archivo original:', {
        name: file.name,
        size: formatBytes(file.size),
        type: file.type,
      })

      if (shouldOptimize && file.type.startsWith('image/')) {
        const optimizationOptions = {
          maxSizeMB: options?.maxSizeMB ?? 1,
          maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
          quality: options?.quality ?? 0.82,
          useWebWorker: true,
          fileType: shouldWebP ? ('image/webp' as const) : undefined,
        }

        const result = await optimizeImage(file, optimizationOptions)

        fileToUpload = result.file

        // Rename to .webp so Content-Type and filename are consistent
        if (shouldWebP) {
          uploadName = toWebPName(fileName)
        }

        console.log('✨ [S3] Imagen optimizada:', {
          original: formatBytes(result.originalSize),
          optimizada: formatBytes(result.compressedSize),
          ahorro: `${result.savingsPercent}%`,
          formato: fileToUpload.type,
          nombre: uploadName,
        })
      }

      // Build FormData
      const formData = new FormData()
      formData.append('file', fileToUpload, uploadName)
      formData.append('folder', folder)
      formData.append('fileName', uploadName)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al subir el archivo')
      }

      const data = await response.json()
      return data.fileUrl
    } catch (error) {
      console.error('[S3] Error al subir archivo:', error)
      throw error
    }
  }

  /**
   * Same as uploadFile but reports upload progress (0–100) via the onProgress
   * callback using XHR. Optimization happens before the XHR transfer starts.
   */
  const uploadFileWithProgress = async (
    file: File,
    folder: string,
    fileName: string,
    onProgress: ((p: number) => void) | null,
    options?: UploadOptions
  ): Promise<string> => {
    const shouldOptimize = options?.optimize !== false
    const shouldWebP = options?.convertToWebP !== false
    let fileToUpload: File = file
    let uploadName = fileName

    if (shouldOptimize && file.type.startsWith('image/')) {
      const optimizationOptions = {
        maxSizeMB: options?.maxSizeMB ?? 1,
        maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
        quality: options?.quality ?? 0.82,
        useWebWorker: true,
        fileType: shouldWebP ? ('image/webp' as const) : undefined,
      }

      const result = await optimizeImage(file, optimizationOptions)
      fileToUpload = result.file

      if (shouldWebP) {
        uploadName = toWebPName(fileName)
      }

      console.log('✨ [S3] Imagen optimizada (con progreso):', {
        original: formatBytes(result.originalSize),
        optimizada: formatBytes(result.compressedSize),
        ahorro: `${result.savingsPercent}%`,
        formato: fileToUpload.type,
        nombre: uploadName,
      })
    }

    // Report 0 % while optimization was happening
    onProgress?.(0)

    return new Promise((resolve, reject) => {
      try {
        const formData = new FormData()
        formData.append('file', fileToUpload, uploadName)
        formData.append('folder', folder)
        formData.append('fileName', uploadName)

        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload')

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const percent = Math.round((ev.loaded / ev.total) * 100)
            try { onProgress?.(percent) } catch { /* ignore */ }
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resp = JSON.parse(xhr.responseText)
              resolve(resp.fileUrl)
            } catch {
              reject(new Error('Respuesta inválida del servidor de carga'))
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Error de red durante la subida'))
        xhr.send(formData)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Delete a file from S3 by its public URL.
   */
  const deleteFile = async (fileUrl: string): Promise<void> => {
    try {
      const response = await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al eliminar el archivo')
      }
    } catch (error) {
      console.error('[S3] Error al eliminar archivo:', error)
      throw error
    }
  }

  return {
    uploadFile,
    uploadFileWithProgress,
    deleteFile,
  }
}

// ─── Formatting helper (local) ────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
