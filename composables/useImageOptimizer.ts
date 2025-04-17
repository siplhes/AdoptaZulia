import imageCompression from 'browser-image-compression'

export const useImageOptimizer = () => {
  const optimizeImage = async (
    imageFile: File,
    options?: {
      maxSizeMB?: number
      maxWidthOrHeight?: number
      useWebWorker?: boolean
      quality?: number
    }
  ): Promise<File> => {
    try {
      const compressionOptions = {
        maxSizeMB: options?.maxSizeMB || 1,
        maxWidthOrHeight: options?.maxWidthOrHeight || 1920,
        useWebWorker: options?.useWebWorker !== false,
        quality: options?.quality || 0.8,
      }
      const compressedFile = await imageCompression(imageFile, compressionOptions)
      return compressedFile
    } catch (error) {
      console.error('Error al optimizar imagen:', error)
      return imageFile
    }
  }
  const optimizeImages = async (
    imageFiles: File[],
    options?: {
      maxSizeMB?: number
      maxWidthOrHeight?: number
      useWebWorker?: boolean
      quality?: number
    }
  ): Promise<File[]> => {
    try {
      const optimizationPromises = imageFiles.map(file => optimizeImage(file, options))
      return await Promise.all(optimizationPromises)
    } catch (error) {
      console.error('Error al optimizar múltiples imágenes:', error)
      return imageFiles
    }
  }

  return {
    optimizeImage,
    optimizeImages
  }
}