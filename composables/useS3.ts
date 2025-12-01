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

  // Upload with progress callback (onProgress receives 0-100)
  const uploadFileWithProgress = (file: File, folder: string, fileName: string, onProgress: (p: number) => void, options?: {
    optimize?: boolean,
    maxSizeMB?: number,
    maxWidthOrHeight?: number,
    quality?: number
  }): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Optimize if needed
        const shouldOptimize = options?.optimize !== false
        let fileToUpload: File = file
        if (shouldOptimize && file.type.startsWith('image/')) {
          const optimizationOptions = {
            maxSizeMB: options?.maxSizeMB || 1,
            maxWidthOrHeight: options?.maxWidthOrHeight || 1920,
            quality: options?.quality || 0.8,
            useWebWorker: true
          }
          fileToUpload = await optimizeImage(file, optimizationOptions)
        }

        const formData = new FormData()
        formData.append('file', fileToUpload)
        formData.append('folder', folder)
        formData.append('fileName', fileName)

        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload')
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const percent = Math.round((ev.loaded / ev.total) * 100)
            try { onProgress(percent) } catch (e) { /* ignore */ }
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resp = JSON.parse(xhr.responseText)
              resolve(resp.fileUrl)
            } catch (e) {
              reject(new Error('Invalid response from upload'))
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(formData)
      } catch (err) {
        reject(err)
      }
    })
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
    uploadFileWithProgress,
    deleteFile,
  }
}
