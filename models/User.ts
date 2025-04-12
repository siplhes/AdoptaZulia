// Define the interfaces
interface UserProfile {
  id: string | any
  uid?: string // Para compatibilidad con Firebase Auth
  userName: string | any // Nombre de usuario único para identificación
  displayName?: string | any
  email: string | null
  photoURL?: string | null
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
  id: string
  uid?: string // Para compatibilidad con Firebase Auth
  userName: string | any // Nombre de usuario único para identificación
  displayName?: string | any
  email: string | any
  photoURL?: string | any
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

// Re-export for convenience
export type { UserProfile, UserData }
