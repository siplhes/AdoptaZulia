/**
 * Interface que define la estructura de datos de una organización
 */
export interface Organization {
  id?: string
  name: string
  slug: string // URL-friendly identifier for the organization
  type: 'protectora' | 'refugio' | 'fundacion'
  description?: string
  mission?: string
  vision?: string
  
  // Contact information
  email?: string
  phone?: string
  website?: string
  
  // Location
  address?: string
  city?: string
  state?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
  
  // Social media
  instagram?: string
  facebook?: string
  twitter?: string
  whatsapp?: string
  
  // Images
  logo?: string
  coverImage?: string
  gallery?: string[]
  
  // Organization details
  foundedYear?: number
  taxId?: string // RIF or similar tax identification
  legalStatus?: 'registered' | 'pending' | 'informal'
  
  // Statistics
  totalPets?: number
  adoptedPets?: number
  activeVolunteers?: number
  
  // Verification
  verified?: boolean
  verifiedAt?: number
  
  // Status
  status?: 'active' | 'inactive' | 'suspended'
  
  // Ownership
  ownerId?: string // User ID of the owner/admin
  admins?: string[] // Array of user IDs with admin access
  members?: string[] // Array of user IDs with member access
  
  // Donation links
  donationLinks?: DonationLink[]
  donationGoals?: DonationGoal[]
  
  // Volunteers
  volunteers?: Volunteer[]
  
  // Reviews/Testimonials
  reviews?: Review[]
  
  // Timestamps
  createdAt?: number
  updatedAt?: number
}

export interface DonationLink {
  id?: string
  name: string // e.g., "PayPal", "Zelle", "Bancolombia"
  url: string
  description?: string
  active?: boolean
}

export interface DonationGoal {
  id?: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  currency?: string
  deadline?: number
  active?: boolean
  createdAt?: number
}

export interface Volunteer {
  id?: string
  userId: string
  name: string
  email: string
  phone?: string
  skills?: string[]
  availability?: string
  status?: 'active' | 'inactive' | 'pending'
  joinedAt?: number
}

export interface Review {
  id?: string
  userId: string
  userName: string
  rating: number // 1-5
  comment: string
  createdAt?: number
}

export interface OrganizationFilters {
  type?: 'protectora' | 'refugio' | 'fundacion'
  city?: string
  state?: string
  verified?: boolean
  status?: 'active' | 'inactive' | 'suspended'
}
