// Define the interfaces
interface UserProfile {
  id: string
  uid?: string // Para compatibilidad con Firebase Auth
  userName: string // Nombre de usuario único para identificación
  displayName?: string
  email: string
  photoURL?: string
  role: 'admin' | 'user' | 'volunteer' | 'shelter'
  status: 'active' | 'inactive' | 'suspended'
  phone?: string
  phoneNumber?: string // Para compatibilidad con diferentes campos
  address?: string
  bio?: string
  createdAt: number
  lastLogin?: number
  postCount?: number
  isAdmin?: boolean
}

interface UserData {
  userName: string // Nombre de usuario único para identificación
  displayName: string
  email: string
  photoURL?: string
  role?: 'admin' | 'user' | 'volunteer' | 'shelter'
  status?: 'active' | 'inactive' | 'suspended'
  phoneNumber?: string
  address?: string
  bio?: string
  createdAt: number
  lastLogin: number
}

// Re-export for convenience
export type { UserProfile, UserData }
