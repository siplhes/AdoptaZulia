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
    if (
      !config.region ||
      !config.credentials.accessKeyId ||
      !config.credentials.secretAccessKey ||
      !config.bucketName
    ) {
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

    console.log('🔧 S3Service.uploadFile - Input:', {
      hasFile: !!file,
      hasData: !!file.data,
      dataType: file.data ? typeof file.data : 'N/A',
      dataLength: file.data?.length,
      isBuffer: file.data instanceof Buffer,
      isUint8Array: file.data instanceof Uint8Array,
      filename: file.filename,
      type: file.type,
      folder,
      fileName,
      key,
    })

    try {
      // Detect content type from file
      let contentType = 'application/octet-stream'
      let fileBody: any

      // Handle multipart form data (from readMultipartFormData)
      if (file.data) {
        // file.data from readMultipartFormData is already a Buffer
        fileBody = file.data
        
        console.log('📄 Processing file.data:', {
          isBuffer: fileBody instanceof Buffer,
          isUint8Array: fileBody instanceof Uint8Array,
          length: fileBody.length,
          firstBytes: fileBody.slice(0, 20).toString('hex'),
        })
        
        // Try to get content type from the file object
        if (file.type) {
          contentType = file.type
        } else if (file.filename) {
          // Determine content type from file extension
          const ext = file.filename.toLowerCase().split('.').pop()
          const mimeTypes: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            pdf: 'application/pdf',
            mp4: 'video/mp4',
            webm: 'video/webm',
          }
          contentType = mimeTypes[ext || ''] || 'application/octet-stream'
        }
      } else {
        // Direct file/blob (from client-side File object)
        fileBody = file
        contentType = file.type || 'application/octet-stream'
      }

      console.log('☁️ Uploading to S3:', {
        bucket: this.bucketName,
        key,
        contentType,
        bodyLength: fileBody?.length || fileBody?.size || 'unknown',
        bodyType: typeof fileBody,
      })

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileBody,
          ContentType: contentType,
        },
      })
      
      const result = await upload.done()
      const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
      
      console.log('✅ S3 Upload successful:', {
        fileUrl,
        result: result,
      })
      
      return fileUrl
    } catch (error) {
      console.error('❌ Error al subir archivo a S3:', error)
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
    // Remove any path traversal patterns like ../ and ..\
    path = path.split('../').join('').split('..\\').join('')

    // Replace backslashes with forward slashes
    path = path.split('\\').join('/')

    // Remove any leading slashes
    while (path.startsWith('/')) path = path.slice(1)

    // Collapse multiple slashes into one
    while (path.includes('//')) path = path.replace('//', '/')

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
