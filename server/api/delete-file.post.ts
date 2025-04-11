import { S3Service } from '~/services/S3Service'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.fileUrl) {
      throw createError({
        statusCode: 400,
        message: 'No se proporcionó la URL del archivo a eliminar',
      })
    }
    const config = useRuntimeConfig()

    const s3Service = new S3Service({
      region: config.public.awsRegion,
      credentials: {
        accessKeyId: config.public.awsAccessKey,
        secretAccessKey: config.awsSecretKey,
      },
      bucketName: config.public.awsS3BucketName,
    })
    await s3Service.deleteFile(body.fileUrl)
    return { success: true }
  } catch (error: any) {
    console.error('Error en el endpoint de eliminación:', error)

    throw createError({
      statusCode: 500,
      message: `Error al eliminar archivo: ${error.message}`,
    })
  }
})
