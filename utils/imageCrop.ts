/**
 * Utilidades para recortar imágenes a un aspect ratio específico usando Canvas.
 */

export interface CropOptions {
  /** Ratio ancho/alto deseado, ej: 4/3 = 1.33, 1200/630 = 1.91 */
  aspectRatio: number
  /** Formato de salida */
  mimeType?: string
  /** Calidad 0-1 (para JPEG/WebP) */
  quality?: number
}

/**
 * Recorta un File de imagen al aspect ratio deseado (centrado).
 * Devuelve un nuevo File con el nombre indicado.
 */
export function cropImageToAspectRatio(
  file: File,
  options: CropOptions
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const { width: origW, height: origH } = img
      const targetRatio = options.aspectRatio
      const currentRatio = origW / origH

      let cropW = origW
      let cropH = origH
      let offsetX = 0
      let offsetY = 0

      if (currentRatio > targetRatio) {
        // Imagen más ancha que el target => recortar ancho
        cropW = origH * targetRatio
        offsetX = (origW - cropW) / 2
      } else {
        // Imagen más alta que el target => recortar alto
        cropH = origW / targetRatio
        offsetY = (origH - cropH) / 2
      }

      const canvas = document.createElement('canvas')
      canvas.width = cropW
      canvas.height = cropH
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo obtener contexto 2D del canvas'))
        return
      }

      ctx.drawImage(img, offsetX, offsetY, cropW, cropH, 0, 0, cropW, cropH)

      const mime = options.mimeType || file.type || 'image/jpeg'
      const quality = options.quality ?? 0.92

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob devolvió null'))
            return
          }
          // Preservar extensión original o usar la del mime
          const ext = mime.split('/')[1] || 'jpg'
          const name = file.name.replace(/\.[^.]+$/, '') + `-cropped.${ext}`
          const croppedFile = new File([blob], name, { type: mime, lastModified: Date.now() })
          resolve(croppedFile)
        },
        mime,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Error cargando imagen para recorte'))
    }

    img.src = url
  })
}

/**
 * Recorta y redimensiona un File a dimensiones exactas.
 * Útil para generar la imagen OpenGraph (1200x630).
 */
export function resizeImageToExactSize(
  file: File,
  targetWidth: number,
  targetHeight: number,
  options?: { mimeType?: string; quality?: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo obtener contexto 2D del canvas'))
        return
      }

      // Cover strategy: rellena todo el canvas manteniendo proporción y centrando
      const imgRatio = img.width / img.height
      const targetRatio = targetWidth / targetHeight

      let drawW: number
      let drawH: number
      let drawX: number
      let drawY: number

      if (imgRatio > targetRatio) {
        drawH = targetHeight
        drawW = img.width * (targetHeight / img.height)
        drawX = (targetWidth - drawW) / 2
        drawY = 0
      } else {
        drawW = targetWidth
        drawH = img.height * (targetWidth / img.width)
        drawX = 0
        drawY = (targetHeight - drawH) / 2
      }

      // Fondo blanco para evitar transparencias en formatos sin alpha
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetWidth, targetHeight)
      ctx.drawImage(img, drawX, drawY, drawW, drawH)

      const mime = options?.mimeType || 'image/jpeg'
      const quality = options?.quality ?? 0.92

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob devolvió null'))
            return
          }
          const ext = mime.split('/')[1] || 'jpg'
          const name = file.name.replace(/\.[^.]+$/, '') + `-${targetWidth}x${targetHeight}.${ext}`
          const resizedFile = new File([blob], name, { type: mime, lastModified: Date.now() })
          resolve(resizedFile)
        },
        mime,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Error cargando imagen para redimensionar'))
    }

    img.src = url
  })
}
