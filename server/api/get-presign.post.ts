import { S3Service } from '~/services/S3Service'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { folder = 'uploads', fileName, expiresIn = 300 } = body || {}

    if (!fileName) {
      throw createError({ statusCode: 400, message: 'fileName is required' })
    }

    const config = useRuntimeConfig()
    const s3Config: any = {
      region: config.public.awsRegion,
      bucketName: config.public.awsS3BucketName,
      publicBucket: false,
    }
    if (config.public.awsAccessKey && config.awsSecretKey) {
      s3Config.credentials = {
        accessKeyId: config.public.awsAccessKey,
        secretAccessKey: config.awsSecretKey,
      }
    }

    const s3Service = new S3Service(s3Config as any)

    // call method dynamically to avoid TS mismatch in environments
    const result: any = await (s3Service as any).getPresignedUploadUrl(folder, fileName, Number(expiresIn))
    const { url, key } = result || {}

    return { url, key }
  } catch (err: any) {
    console.error('Error generating presigned URL:', err)
    throw createError({ statusCode: 500, message: err.message || 'Error generating presigned URL' })
  }
})
