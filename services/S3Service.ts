import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

interface S3ServiceConfig {
  region: string
  credentials: {
    accessKeyId: string
    secretAccessKey: string
  }
  bucketName: string
}

export class S3Service {
  private s3Client: S3Client
  private bucketName: string
  private region: string

  constructor(config: S3ServiceConfig) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.credentials.accessKeyId || '',
        secretAccessKey: config.credentials.secretAccessKey || '',
      },
    })

    this.bucketName = config.bucketName
    this.region = config.region
  }

  async uploadFile(file: any, folder: string, fileName: string): Promise<string> {
    const timestamp = Date.now()
    const key = `${folder}/${timestamp}_${fileName}`

    try {
      let contentType = file.type || 'application/octet-stream'
      let fileBody = file
      if (file.data) {
        contentType = file.type || file.filename?.split('.').pop() || 'application/octet-stream'
        fileBody = file.data
      }
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileBody,
          ContentType: contentType,
          ACL: 'public-read',
        },
      })
      await upload.done()
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
    } catch (error) {
      console.error('Error al subir archivo a S3:', error)
      throw error
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = fileUrl.split('.amazonaws.com/')[1]

    if (!key) {
      throw new Error('URL de archivo no válida')
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      await this.s3Client.send(command)
    } catch (error) {
      console.error('Error al eliminar archivo de S3:', error)
      throw error
    }
  }
}
