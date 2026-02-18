import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || 'dummy', // Fallback or throw if missing?
  },
})

// Note: Storing secretAccessKey in client-side code is risky but requested for parity with existing web app architecture.
// In production, consider a backend proxy or presigned URLs.

export class S3Service {
  static async uploadFile(file: Blob, folder: string = 'pets'): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    const bucketName = import.meta.env.VITE_AWS_S3_BUCKET_NAME
    const domain = import.meta.env.VITE_AWS_S3_BUCKET_DOMAIN

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file,
        ContentType: 'image/jpeg',
        ACL: 'public-read', // Ensure bucket allows public read via ACL or policy
      })

      await s3Client.send(command)

      // Construct public URL
      if (domain) {
        return `https://${domain}/${fileName}`
      }
      return `https://${bucketName}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${fileName}`
    } catch (error) {
      console.error('Error uploading to S3:', error)
      throw new Error('Failed to upload image')
    }
  }
}
