/**
 * Interface que define la estructura de datos de una mascota
 */
export interface Pet {
  id?: string
  name: string
  type: string
  typeValue?: string
  breed?: string
  age?: string
  ageValue?: string
  gender?: 'macho' | 'hembra' | string
  size?: string
  sizeValue?: string
  location?: string
  description?: string
  urgent?: boolean
  image?: string
  photos?: string[]
  healthStatus?: number
  healthDescription?: string
  vaccinated?: boolean
  vaccines?: Vaccine[]
  neutered?: boolean
  microchipped?: boolean
  medicalRecords?: MedicalRecord[]
  traits?: string[]
  idealFor?: string[]
  adoptionRequirements?: string
  adoptionFee?: number
  contact: Contact
  createdAt?: number | string
  userId?: string | null
  status?: 'available' | 'adopted' | 'pending' | 'lost' | 'found'
}

export interface Vaccine {
  name: string
  date: string
}

export interface MedicalRecord {
  title: string
  date: string
  description?: string
}

export interface Contact {
  name?: string
  email?: string | null
  phone?: string
  type?: string
  preferredMethod?: 'email' | 'phone' | 'whatsapp' | string
  notes?: string
}

export enum PetType {
  DOG = 'perro',
  CAT = 'gato',
  BIRD = 'ave',
  RABBIT = 'conejo',
  OTHER = 'otro',
}

export enum AgeRange {
  BABY = 'cachorro',
  YOUNG = 'joven',
  ADULT = 'adulto',
  SENIOR = 'senior',
}

export enum SizeValue {
  SMALL = 'pequeño',
  MEDIUM = 'mediano',
  LARGE = 'grande',
}

export enum Gender {
  MALE = 'macho',
  FEMALE = 'hembra',
}

export type PetFilters = {
  type?: string
  size?: string
  gender?: string
  location?: string
  urgent?: boolean
}
