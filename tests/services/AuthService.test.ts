import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../../services/AuthService'
import { getAuth, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, updateProfile } from 'firebase/auth'
import { getDatabase, ref, get, update, query } from 'firebase/database'

// Mock dependencies
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  updateProfile: vi.fn(),
  setPersistence: vi.fn(),
  browserLocalPersistence: 'local',
  onAuthStateChanged: vi.fn()
}))

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  query: vi.fn(),
  orderByChild: vi.fn(),
  equalTo: vi.fn(),
  limitToFirst: vi.fn()
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn()
}))

vi.mock('vuefire', () => ({
  useFirebaseApp: vi.fn()
}))

vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    public: {
      adminEmails: 'admin@test.com'
    }
  }))
}))

describe('AuthService', () => {
  let authService: AuthService
  const mockAuth = { currentUser: { uid: 'user-123', displayName: 'Test User', email: 'test@test.com' } }
  const mockDb = {}

  beforeEach(() => {
    vi.clearAllMocks()
    ;(getAuth as any).mockReturnValue(mockAuth)
    ;(getDatabase as any).mockReturnValue(mockDb)
    
    authService = new AuthService()
  })

  describe('loginWithGoogle', () => {
    it('should login with google and save user data', async () => {
      const mockUserResult = {
        user: {
          uid: 'user-123',
          displayName: 'Test User',
          email: 'test@test.com',
          photoURL: 'photo.jpg'
        }
      }
      ;(signInWithPopup as any).mockResolvedValue(mockUserResult)
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({ exists: () => false }) // User doesn't exist yet
      ;(update as any).mockResolvedValue(undefined)
      ;(query as any).mockReturnValue({})

      const result = await authService.loginWithGoogle()

      expect(signInWithPopup).toHaveBeenCalled()
      expect(update).toHaveBeenCalled() // Should save user data
      expect(result).toEqual(mockUserResult.user)
    })
  })

  describe('signOut', () => {
    it('should sign out', async () => {
      await authService.signOut()
      expect(firebaseSignOut).toHaveBeenCalledWith(mockAuth)
    })
  })

  describe('updateUserProfile', () => {
    it('should update profile in Auth and Database', async () => {
      ;(updateProfile as any).mockResolvedValue(undefined)
      ;(update as any).mockResolvedValue(undefined)

      await authService.updateUserProfile('New Name', 'new.jpg', 'New Bio')

      expect(updateProfile).toHaveBeenCalled()
      expect(update).toHaveBeenCalled()
    })
  })

  describe('getUserProfile', () => {
    it('should return user profile if exists', async () => {
      const mockProfile = { displayName: 'Test' }
      const mockSnapshot = {
        exists: () => true,
        val: () => mockProfile
      }
      ;(get as any).mockResolvedValue(mockSnapshot)

      const result = await authService.getUserProfile('user-123')
      expect(result).toEqual(mockProfile)
    })

    it('should return null if not exists', async () => {
      const mockSnapshot = { exists: () => false }
      ;(get as any).mockResolvedValue(mockSnapshot)

      const result = await authService.getUserProfile('user-123')
      expect(result).toBeNull()
    })
  })

  describe('isAdmin', () => {
    it('should return true if user is in admins collection', async () => {
      const mockSnapshot = {
        exists: () => true,
        val: () => true
      }
      ;(get as any).mockResolvedValue(mockSnapshot) // Mock admin check

      const result = await authService.isAdmin('user-123')
      expect(result).toBe(true)
    })

    it('should return true if email is in admin list', async () => {
      // First call check admin collection (false)
      // Second call check user profile (has email)
        
      // We need to mock separate return values for consecutive get calls
      const adminSnapshot = { exists: () => false }
      const userSnapshot = { 
          exists: () => true, 
          val: () => ({ email: 'admin@test.com' }) 
      }
      
      ;(get as any)
        .mockResolvedValueOnce(adminSnapshot)
        .mockResolvedValueOnce(userSnapshot)

      const result = await authService.isAdmin('user-123')
      expect(result).toBe(true)
    })

     it('should return false if not admin', async () => {
      const adminSnapshot = { exists: () => false }
      const userSnapshot = { 
          exists: () => true, 
          val: () => ({ email: 'user@test.com' }) 
      }
      
      ;(get as any)
        .mockResolvedValueOnce(adminSnapshot)
        .mockResolvedValueOnce(userSnapshot)

      const result = await authService.isAdmin('user-123')
      expect(result).toBe(false)
    })
  })
})
