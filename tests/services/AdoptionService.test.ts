import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdoptionService } from '../../services/AdoptionService'
import { getDatabase, ref, get, push, set, update, remove, query } from 'firebase/database'

// Mock Firebase
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  push: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  query: vi.fn(),
  orderByChild: vi.fn(),
  equalTo: vi.fn(),
  limitToFirst: vi.fn(),
  limitToLast: vi.fn()
}))

describe('AdoptionService', () => {
  let adoptionService: AdoptionService
  const mockDb = {}

  beforeEach(() => {
    vi.clearAllMocks()
    ;(getDatabase as any).mockReturnValue(mockDb)
    adoptionService = new AdoptionService()
  })

  describe('getAllAdoptions', () => {
    it('should return all adoptions', async () => {
      const mockAdoptions = {
        'adop-1': { userId: 'user-1', petId: 'pet-1', status: 'pending', createdAt: 100 },
        'adop-2': { userId: 'user-2', petId: 'pet-2', status: 'approved', createdAt: 200 }
      }
      
      const mockSnapshot = {
        exists: () => true,
        forEach: (callback: Function) => {
          Object.entries(mockAdoptions).forEach(([key, val]) => {
            callback({ key, val: () => val })
          })
        }
      }
      ;(get as any).mockResolvedValue(mockSnapshot)
      ;(query as any).mockReturnValue({})

      const result = await adoptionService.getAllAdoptions()

      expect(result).toHaveLength(2)
      // Should be reversed (newest first)
      expect(result[0].id).toBe('adop-2')
      expect(result[1].id).toBe('adop-1')
    })
  })

  describe('createAdoption', () => {
    it('should create an adoption request', async () => {
      const mockAdoption = {
        userId: 'user-1',
        petId: 'pet-1',
        status: 'pending',
        createdAt: 123
      } as any

      const mockPushResult = { key: 'new-adop-id' }
      ;(push as any).mockReturnValue(mockPushResult)
      ;(set as any).mockResolvedValue(undefined)

      const result = await adoptionService.createAdoption(mockAdoption)

      expect(push).toHaveBeenCalled()
      expect(set).toHaveBeenCalledWith(mockPushResult, mockAdoption)
      expect(result).toBe('new-adop-id')
    })
  })

  describe('updateStatus', () => {
    it('should update status', async () => {
      ;(update as any).mockResolvedValue(undefined)
      ;(ref as any).mockReturnValue({})

      await adoptionService.updateStatus('adop-1', 'approved', 'Looks good')

      expect(update).toHaveBeenCalled()
      // Verify usage of arguments
      const updateCall = (update as any).mock.calls[0]
      expect(updateCall[1]).toMatchObject({ status: 'approved', notes: 'Looks good' })
    })
  })

  describe('checkExistingAdoption', () => {
    it('should return existing adoption if found', async () => {
       const mockAdoptions = [
         { id: '1', userId: 'user-1', petId: 'pet-1' },
         { id: '2', userId: 'user-1', petId: 'pet-2' }
       ]
       
       // Mock getUserAdoptions internally
       // Since it's a class method calling another class method, we can spy on it
       // But mocking the DB call is safer integration-like test
       
       const mockSnapshot = {
        exists: () => true,
        forEach: (callback: Function) => {
          mockAdoptions.forEach((adop) => {
            callback({ key: adop.id, val: () => adop })
          })
        }
      }
      ;(get as any).mockResolvedValue(mockSnapshot)
      ;(query as any).mockReturnValue({})

      const result = await adoptionService.checkExistingAdoption('user-1', 'pet-1')
      
      expect(result).toBeTruthy()
      expect(result?.id).toBe('1')
    })

    it('should return null if not found for that pet', async () => {
       const mockSnapshot = { exists: () => false }
       ;(get as any).mockResolvedValue(mockSnapshot)

       const result = await adoptionService.checkExistingAdoption('user-1', 'pet-999')
       expect(result).toBeNull()
    })
  })
})
