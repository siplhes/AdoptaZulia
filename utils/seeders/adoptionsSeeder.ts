/**
 * Adoptions Seeder
 *
 * Utility to populate the database with realistic adoption request data for development/testing
 */

import { pushData, deleteData, fetchData } from '~/utils/firebase'

const ADOPTION_STATUSES = ['pending', 'approved', 'rejected', 'completed']

const REASONS_FOR_ADOPTION = [
  'Tengo experiencia con mascotas y busco un compañero fiel',
  'Mi familia y yo queremos darle un hogar amoroso a una mascota',
  'Tengo un hogar espacioso con patio para que la mascota juegue',
  'Perdí recientemente a mi mascota y estoy listo para adoptar de nuevo',
  'Mis hijos quieren una mascota y estamos preparados para cuidarla',
  'Trabajo desde casa y puedo dedicarle mucho tiempo',
  'Siempre me han gustado los animales y quiero adoptar',
  'Tengo otras mascotas que necesitan compañía',
]

const LIVING_SITUATIONS = [
  'Casa propia con patio',
  'Apartamento espacioso',
  'Casa alquilada con permiso del propietario',
  'Casa familiar',
  'Quinta con terreno amplio',
]

/**
 * Generate a random adoption request
 */
function generateRandomAdoption(petId: string, userId: string, index: number): any {
  const status = ADOPTION_STATUSES[Math.floor(Math.random() * ADOPTION_STATUSES.length)]
  const reason = REASONS_FOR_ADOPTION[Math.floor(Math.random() * REASONS_FOR_ADOPTION.length)]
  const livingSituation = LIVING_SITUATIONS[Math.floor(Math.random() * LIVING_SITUATIONS.length)]

  const requestDate = Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000) // Last 60 days

  return {
    petId,
    userId,
    status,
    reason,
    livingSituation,
    hasExperience: Math.random() > 0.4,
    hasOtherPets: Math.random() > 0.6,
    requestDate,
    reviewDate:
      status !== 'pending'
        ? requestDate + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        : null,
    isTest: true,
  }
}

/**
 * Seed adoption requests
 */
export async function seedAdoptions(count: number = 20): Promise<void> {
  console.log(`🌱 Seeding ${count} adoption requests...`)

  // Get available pets and users (or use test IDs)
  const testPetIds = ['test_pet_1', 'test_pet_2', 'test_pet_3']
  const testUserIds = ['test_user_1', 'test_user_2', 'test_user_3']

  const promises: Promise<string | null>[] = []

  for (let i = 1; i <= count; i++) {
    const petId = testPetIds[Math.floor(Math.random() * testPetIds.length)]
    const userId = testUserIds[Math.floor(Math.random() * testUserIds.length)]
    const adoption = generateRandomAdoption(petId, userId, i)
    promises.push(pushData('adoptions', adoption))
  }

  const results = await Promise.all(promises)
  const successCount = results.filter((id) => id !== null).length

  console.log(`✅ Successfully seeded ${successCount} adoption requests!`)
}

/**
 * Clear test adoption requests
 */
export async function clearAdoptionsTestData(): Promise<void> {
  console.log('🧹 Clearing test adoption requests...')

  const allAdoptions = await fetchData<Record<string, any>>('adoptions')

  if (!allAdoptions) {
    console.log('No adoptions found')
    return
  }

  const testIds = Object.entries(allAdoptions)
    .filter(([_, adoption]) => adoption.isTest === true)
    .map(([id]) => id)

  console.log(`Found ${testIds.length} test adoption requests`)

  const deletePromises = testIds.map((id) => deleteData(`adoptions/${id}`))
  await Promise.all(deletePromises)

  console.log(`✅ Successfully deleted ${testIds.length} test adoption requests!`)
}
