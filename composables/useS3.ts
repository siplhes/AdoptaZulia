import { S3Service } from '~/services/S3Service'
import { useImageOptimizer } from '~/composables/useImageOptimizer'

export const useS3 = () => {
  const config = useRuntimeConfig()
  const { optimizeImage } = useImageOptimizer()

  const uploadFile = async (file: File, folder: string, fileName: string, options?: {
    optimize?: boolean,
    maxSizeMB?: number,
    maxWidthOrHeight?: number,
    quality?: number
  }): Promise<string> => {
    try {
      // Optimizar la imagen si la opción está habilitada (por defecto: true)
      const shouldOptimize = options?.optimize !== false
      let fileToUpload = file
      
      if (shouldOptimize && file.type.startsWith('image/')) {
        // Configurar opciones de optimización
        const optimizationOptions = {
          maxSizeMB: options?.maxSizeMB || 1, 
          maxWidthOrHeight: options?.maxWidthOrHeight || 1920,
          quality: options?.quality || 0.8,
          useWebWorker: true
        }
        
        // Optimizar la imagen antes de subirla
        fileToUpload = await optimizeImage(file, optimizationOptions)
      }
      
      // Crear un FormData para enviar el archivo
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('folder', folder)
      formData.append('fileName', fileName)

      // Llamar al endpoint del servidor para subir el archivo
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
      console.error('Error al subir archivo:', error)
      throw error
    }
  }

  const deleteFile = async (fileUrl: string): Promise<void> => {
    try {
      // Llamar al endpoint del servidor para eliminar el archivo
      const response = await fetch('/api/delete-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al eliminar el archivo')
      }
    } catch (error) {
      console.error('Error al eliminar archivo:', error)
      throw error
    }
  }

  return {
    uploadFile,
    deleteFile,
  }
}
