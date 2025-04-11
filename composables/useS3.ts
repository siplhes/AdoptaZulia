import { S3Service } from '~/services/S3Service'

export const useS3 = () => {
  const config = useRuntimeConfig()

  const uploadFile = async (file: File, folder: string, fileName: string): Promise<string> => {
    // Crear un FormData para enviar el archivo
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('fileName', fileName)

    try {
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
