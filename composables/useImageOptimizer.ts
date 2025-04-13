import imageCompression from 'browser-image-compression'

export const useImageOptimizer = () => {
  /**
   * Optimiza una imagen antes de subirla
   * @param imageFile - El archivo de imagen a optimizar
   * @param options - Opciones de optimización (opcionales)
   * @returns Promesa que resuelve con el archivo de imagen optimizado
   */
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

      console.log('🖼️ Optimizando imagen:', imageFile.name)
      console.log('📊 Tamaño original:', (imageFile.size / 1024 / 1024).toFixed(2), 'MB')
      
      const compressedFile = await imageCompression(imageFile, compressionOptions)
      
      console.log('📊 Tamaño comprimido:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
      console.log('✅ Optimización completada')
      
      return compressedFile
    } catch (error) {
      console.error('Error al optimizar imagen:', error)
      // Si ocurre un error en la optimización, devolver la imagen original
      return imageFile
    }
  }

  /**
   * Optimiza múltiples imágenes a la vez
   * @param imageFiles - Array de archivos de imagen a optimizar
   * @param options - Opciones de optimización (opcionales)
   * @returns Promesa que resuelve con un array de archivos de imagen optimizados
   */
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
      // Si ocurre un error en la optimización, devolver las imágenes originales
      return imageFiles
    }
  }

  return {
    optimizeImage,
    optimizeImages
  }
}