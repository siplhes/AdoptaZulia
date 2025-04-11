import { readMultipartFormData } from 'h3'
import { S3Service } from '~/services/S3Service'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const s3Service = new S3Service({
      region: config.public.awsRegion,
      credentials: {
        accessKeyId: config.public.awsAccessKey,
        secretAccessKey: config.awsSecretKey,
      },
      bucketName: config.public.awsS3BucketName,
    })
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No se encontró ningún archivo en la solicitud',
      })
    }

    const fileField = formData.find((field) => field.name === 'file')
    const folderField = formData.find((field) => field.name === 'folder')
    const fileNameField = formData.find((field) => field.name === 'fileName')

    if (!fileField || !fileField.data) {
      throw createError({
        statusCode: 400,
        message: 'No se encontró el archivo en la solicitud',
      })
    }
    const file = fileField
    const folder = folderField?.data ? new TextDecoder().decode(folderField.data) : 'uploads'
    const fileName = fileNameField?.data
      ? new TextDecoder().decode(fileNameField.data)
      : file.filename || 'file'

    const fileUrl = await s3Service.uploadFile(file, folder, fileName)

    return { fileUrl }
  } catch (error: any) {
    console.error('Error en el endpoint de carga:', error)

    throw createError({
      statusCode: 500,
      message: `Error al subir archivo: ${error.message}`,
    })
  }
})
