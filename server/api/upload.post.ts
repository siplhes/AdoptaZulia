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

    const fileField    = formData.find((f) => f.name === 'file')
    const folderField  = formData.find((f) => f.name === 'folder')
    const fileNameField = formData.find((f) => f.name === 'fileName')

    if (!fileField || !fileField.data) {
      throw createError({
        statusCode: 400,
        message: 'No se encontró el archivo en la solicitud',
      })
    }

    const folder   = folderField?.data   ? new TextDecoder().decode(folderField.data)   : 'uploads'
    const fileName = fileNameField?.data ? new TextDecoder().decode(fileNameField.data) : (fileField.filename || 'file')

    // Preserve the MIME type sent by the client (important for WebP files)
    const file = {
      ...fileField,
      type: fileField.type || deriveContentType(fileName),
    }

    console.log('📤 [upload] Subiendo a S3:', { folder, fileName, type: file.type, bytes: file.data.length })

    const fileUrl = await s3Service.uploadFile(file, folder, fileName)

    return { fileUrl }
  } catch (error: any) {
    console.error('[upload] Error:', error)
    throw createError({
      statusCode: 500,
      message: `Error al subir archivo: ${error.message}`,
    })
  }
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function deriveContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    webp: 'image/webp',
    jpg:  'image/jpeg',
    jpeg: 'image/jpeg',
    png:  'image/png',
    gif:  'image/gif',
    avif: 'image/avif',
    svg:  'image/svg+xml',
    pdf:  'application/pdf',
    mp4:  'video/mp4',
    webm: 'video/webm',
  }
  return map[ext] ?? 'application/octet-stream'
}
