/**
 * Interface que define la estructura de datos de una mascota
 */
export interface Pet {
  id?: string
  name: string
  type: string
  typeValue: string
  breed: string
  age: string
  ageValue: string
  gender: string
  size: string
  sizeValue: string
  location: string
  description: string
  urgent: boolean
  image: string
  photos?: string[]
  healthStatus: number
  healthDescription?: string
  vaccinated: boolean
  vaccines?: Vaccine[]
  neutered: boolean
  microchipped?: boolean
  medicalRecords?: MedicalRecord[]
  traits?: string[]
  idealFor?: string[]
  adoptionRequirements?: string
  adoptionFee?: number
  contact: Contact
  createdAt: string
  userId: string | null
  status?: 'available' | 'adopted' | 'pending' | 'lost' | 'found'
}

export interface Vaccine {
  name: string
  date: string
}

export interface MedicalRecord {
  title: string
  date: string
  description: string
}

export interface Contact {
  name: string
  email: string
  phone: string
  type: string
}

export enum PetType {
  DOG = 'perro',
  CAT = 'gato',
  RABBIT = 'conejo',
  BIRD = 'ave',
  OTHER = 'otro',
}

export enum AgeRange {
  PUPPY = 'cachorro',
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

interface PetFilters {
  types?: string[]
  ages?: string[]
  sizes?: string[]
  gender?: string
  vaccinated?: boolean
  neutered?: boolean
  urgent?: boolean
  location?: string
}

export type { PetFilters }
