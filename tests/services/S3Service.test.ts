import { describe, it, expect, vi, beforeEach } from 'vitest'
import { S3Service } from '../../services/S3Service'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn()
  })),
  DeleteObjectCommand: vi.fn()
}))

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: vi.fn(() => ({
    done: vi.fn()
  }))
}))

describe('S3Service', () => {
  let s3Service: S3Service
  const mockConfig = {
    region: 'us-east-1',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    bucketName: 'test-bucket'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    s3Service = new S3Service(mockConfig)
  })

  describe('constructor', () => {
    it('should throw error if config is missing', () => {
      expect(() => new S3Service({} as any)).toThrow()
    })
  })

  describe('uploadFile', () => {
    it('should upload file and return url', async () => {
      const mockFile = { type: 'image/png' }
      
      const result = await s3Service.uploadFile(mockFile, 'pets', 'test.png')

      expect(Upload).toHaveBeenCalled()
      expect(result).toContain('https://test-bucket.s3.us-east-1.amazonaws.com/pets/')
      expect(result).toContain('test.png')
    })

    it('should sanitize paths', async () => {
       const mockFile = { type: 'image/png' }
       // Attempt path traversal
       const result = await s3Service.uploadFile(mockFile, '../restricted', 'hack.png')
       
       // Should have removed ../
       expect(Upload).toHaveBeenCalled()
       // The mock implementation of Upload calculates key inside the service, 
       // so checking the arguments passed to Upload constructor would be ideal
       // But checking the return URL is also valid as it reflects the key generated
       expect(result).not.toContain('..')
       expect(result).toContain('restricted')
    })
  })

  describe('deleteFile', () => {
    it('should delete file', async () => {
      const fileUrl = 'https://test-bucket.s3.us-east-1.amazonaws.com/pets/test.png'
      
      // Get the send mock from the client instance
      const mockSend = (s3Service as any).s3Client.send
      mockSend.mockResolvedValue({})

      await s3Service.deleteFile(fileUrl)

      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'pets/test.png'
      })
      expect(mockSend).toHaveBeenCalled()
    })

    it('should throw error for invalid url', async () => {
       await expect(s3Service.deleteFile('invalid-url')).rejects.toThrow()
    })
  })
})
