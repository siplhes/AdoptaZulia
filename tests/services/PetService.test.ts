import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PetService } from '../../services/PetService'
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
  limitToLast: vi.fn()
}))

describe('PetService', () => {
  let petService: PetService
  const mockDb = {}

  beforeEach(() => {
    vi.clearAllMocks()
    ;(getDatabase as any).mockReturnValue(mockDb)
    petService = new PetService()
  })

  describe('createPet', () => {
    it('should create a pet and return its ID', async () => {
      const mockPet = {
        name: 'Firulais',
        age: '2 years',
        breed: 'Mestizo',
        description: 'Happy dog'
      } as any

      const mockPushResult = { key: 'new-pet-id' }
      ;(push as any).mockReturnValue(mockPushResult)
      ;(ref as any).mockReturnValue({})
      ;(set as any).mockResolvedValue(undefined)

      const result = await petService.createPet(mockPet)

      expect(push).toHaveBeenCalled()
      expect(set).toHaveBeenCalledWith(mockPushResult, { ...mockPet, id: 'new-pet-id' })
      expect(result).toBe('new-pet-id')
    })
  })

  describe('getPetById', () => {
    it('should return a pet if it exists', async () => {
      const mockPet = { id: 'pet-123', name: 'Firulais' }
      const mockSnapshot = {
        exists: () => true,
        val: () => mockPet
      }
      ;(get as any).mockResolvedValue(mockSnapshot)

      const result = await petService.getPetById('pet-123')

      expect(get).toHaveBeenCalled()
      expect(result).toEqual(mockPet)
    })

    it('should return null if pet does not exist', async () => {
      const mockSnapshot = {
        exists: () => false
      }
      ;(get as any).mockResolvedValue(mockSnapshot)

      const result = await petService.getPetById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('updatePet', () => {
    it('should update a pet', async () => {
      const updates = { name: 'Updated Name' }
      ;(update as any).mockResolvedValue(undefined)

      await petService.updatePet('pet-123', updates)

      expect(update).toHaveBeenCalled()
    })
  })

  describe('deletePet', () => {
    it('should delete a pet', async () => {
      ;(remove as any).mockResolvedValue(undefined)

      await petService.deletePet('pet-123')

      expect(remove).toHaveBeenCalled()
    })
  })

  describe('getAllPets', () => {
    it('should return all pets', async () => {
      const mockPets = {
        'pet-1': { id: 'pet-1', name: 'Pet 1' },
        'pet-2': { id: 'pet-2', name: 'Pet 2' }
      }
      const mockSnapshot = {
        exists: () => true,
        forEach: (callback: Function) => {
           Object.values(mockPets).forEach(pet => callback({ val: () => pet }))
        }
      }
      ;(get as any).mockResolvedValue(mockSnapshot)

      const result = await petService.getAllPets()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockPets['pet-1'])
      expect(result[1]).toEqual(mockPets['pet-2'])
    })

    it('should return empty array if no pets', async () => {
       const mockSnapshot = { exists: () => false }
       ;(get as any).mockResolvedValue(mockSnapshot)

       const result = await petService.getAllPets()
       expect(result).toEqual([])
    })
  })

  describe('searchPets', () => {
    it('should filter pets by name', async () => {
      const mockPets = [
        { id: '1', name: 'Max', breed: 'Dog', location: 'Maracaibo', description: 'Good boy' },
        { id: '2', name: 'Bella', breed: 'Cat', location: 'San Francisco', description: 'Cute' }
      ]
      
      // Mock getAllPets implementation for this test
      vi.spyOn(petService, 'getAllPets').mockResolvedValue(mockPets as any)

      const result = await petService.searchPets('Max')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Max')
    })
    
     it('should filter pets by breed', async () => {
      const mockPets = [
        { id: '1', name: 'Max', breed: 'Labrador', location: 'Maracaibo', description: 'Good boy' },
        { id: '2', name: 'Bella', breed: 'Siamese', location: 'San Francisco', description: 'Cute' }
      ]

      vi.spyOn(petService, 'getAllPets').mockResolvedValue(mockPets as any)

      const result = await petService.searchPets('Siamese')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Bella')
    })

    it('should return all pets if search text is empty', async () => {
       const mockPets = [{ id: '1', name: 'Max' }]
       vi.spyOn(petService, 'getAllPets').mockResolvedValue(mockPets as any)
       
       const result = await petService.searchPets('')
       expect(result).toEqual(mockPets)
    })
  })

  describe('filterPets', () => {
    it('should filter by specific criteria', async () => {
       const mockPets = [
        { id: '1', typeValue: 'dog', ageValue: 'puppy', gender: 'male', vaccinated: true, urgent: true, location: 'Zulia' },
        { id: '2', typeValue: 'cat', ageValue: 'adult', gender: 'female', vaccinated: false, urgent: false, location: 'Zulia' },
        { id: '3', typeValue: 'dog', ageValue: 'senior', gender: 'male', vaccinated: true, urgent: false, location: 'Caracas' }
      ] as any

      vi.spyOn(petService, 'getAllPets').mockResolvedValue(mockPets)

      // Filter by type 'dog'
      const dogs = await petService.filterPets({ types: ['dog'] })
      expect(dogs).toHaveLength(2)

      // Filter by urgent
      const urgent = await petService.filterPets({ urgent: true })
      expect(urgent).toHaveLength(1)
      expect(urgent[0].id).toBe('1')

      // Filter by combined criteria
      const combined = await petService.filterPets({ types: ['dog'], vaccinated: true })
      expect(combined).toHaveLength(2)
    })
  })
})
