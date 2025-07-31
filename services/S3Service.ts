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
    // Validate required credentials
    if (!config.region || !config.credentials.accessKeyId || !config.credentials.secretAccessKey || !config.bucketName) {
      throw new Error('Missing required AWS configuration parameters')
    }
    
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.credentials.accessKeyId,
        secretAccessKey: config.credentials.secretAccessKey,
      },
    })

    this.bucketName = config.bucketName
    this.region = config.region
  }

  async uploadFile(file: any, folder: string, fileName: string): Promise<string> {
    if (!file) {
      throw new Error('No file provided for upload')
    }
    
    // Sanitize folder and filename to prevent path traversal attacks
    folder = this.sanitizePath(folder)
    fileName = this.sanitizeFileName(fileName)
    
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
         // ACL: 'public-read',
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
    if (!fileUrl) {
      throw new Error('No file URL provided for deletion')
    }
    
    const key = fileUrl.split('.amazonaws.com/')[1]

    if (!key) {
      throw new Error('URL de archivo no válida')
    }

    // Validate that key doesn't contain unexpected path traversal
    if (key.includes('..')) {
      throw new Error('Invalid file path')
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
  
  /**
   * Sanitize a path to prevent directory traversal attacks
   */
  private sanitizePath(path: string): string {
    // Remove any path traversal patterns
    path = path.replace(/\.\.\//g, '').replace(/\.\.\\/g, '')
    
    // Remove any leading slashes
    path = path.replace(/^[\/\\]+/, '')
    
    // Replace multiple slashes with a single one
    path = path.replace(/[\/\\]+/g, '/')
    
    return path
  }
  
  /**
   * Sanitize a filename to ensure it's safe
   */
  private sanitizeFileName(fileName: string): string {
    // Replace any potentially dangerous characters
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  }
}
