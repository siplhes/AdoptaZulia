export interface UserProfile {
  id?: string
  uid?: string // Para compatibilidad con Firebase Auth
  userName?: string // Nombre de usuario único para identificación
  displayName?: string
  email?: string | null
  photoURL?: string | null
  role?: 'admin' | 'user' | 'volunteer' | 'shelter'
  status?: 'active' | 'inactive' | 'suspended'
  phone?: string
  phoneNumber?: string // Para compatibilidad con diferentes campos
  address?: string
  bio?: string
  createdAt?: number
  lastLogin?: number
  updatedAt?: number
  postCount?: number
  isAdmin?: boolean
  preferences?: Record<string, any>
  verifiedAdoptions?: Array<{
    verificationId?: string
    petId?: string
    adoptionId?: string
    verifiedAt?: number
  }>
}

export interface UserData {
  id: string
  uid?: string
  userName?: string
  displayName?: string
  email?: string | null
  photoURL?: string | null
  role?: 'admin' | 'user' | 'volunteer' | 'shelter'
  status?: 'active' | 'inactive' | 'suspended'
  phone?: string
  phoneNumber?: string
  address?: string
  bio?: string
  createdAt?: number
  lastLogin?: number
  updatedAt?: number
  postCount?: number
  isAdmin?: boolean
  preferences?: Record<string, any>
}

export type { UserProfile, UserData }
