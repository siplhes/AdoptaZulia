export interface AdoptionVerification {
  id?: string
  adoptionId: string
  petId: string
  adopterId: string
  verifierId?: string
  verifiedAt: number
  note?: string
}
