/**
 * Pet Comments Seeder
 *
 * Utility to populate the database with realistic pet comment and rating data for development/testing
 */

import { pushData, deleteData, fetchData } from '~/utils/firebase'

const COMMENT_TEMPLATES = [
  '¡Qué mascota tan hermosa! Se ve muy saludable.',
  'Me encantaría adoptar a este angelito. ¿Está disponible?',
  'Tiene una mirada muy dulce. Espero encuentre un hogar pronto.',
  '¿Qué tan grande es? Tengo espacio limitado en mi apartamento.',
  'Se ve muy juguetón. Perfecto para mi familia.',
  'Ya lo compartí en mis redes sociales. ¡Que encuentre hogar pronto!',
  'Conocí una mascota igual y era súper cariñosa.',
  '¿Está vacunado y desparasitado?',
  'Qué lindo. Ojalá pudiera adoptar pero ya tengo 3 mascotas.',
  'Hermoso ejemplar. Se nota que está bien cuidado.',
]

/**
 * Generate a random comment
 */
function generateRandomComment(petId: string, userId: string, index: number): any {
  const comment = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)]
  const rating = Math.floor(Math.random() * 2) + 4 // 4 or 5 stars mostly

  return {
    petId,
    userId,
    userName: `Usuario Prueba ${index}`,
    userPhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
    comment,
    rating,
    createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
    isTest: true,
  }
}

/**
 * Seed pet comments
 */
export async function seedPetComments(count: number = 30): Promise<void> {
  console.log(`🌱 Seeding ${count} pet comments...`)

  const testPetIds = ['test_pet_1', 'test_pet_2', 'test_pet_3']
  const testUserIds = ['test_user_1', 'test_user_2', 'test_user_3', 'test_user_4', 'test_user_5']

  const promises: Promise<string | null>[] = []

  for (let i = 1; i <= count; i++) {
    const petId = testPetIds[Math.floor(Math.random() * testPetIds.length)]
    const userId = testUserIds[Math.floor(Math.random() * testUserIds.length)]
    const comment = generateRandomComment(petId, userId, i)
    promises.push(pushData('petComments', comment))
  }

  const results = await Promise.all(promises)
  const successCount = results.filter((id) => id !== null).length

  console.log(`✅ Successfully seeded ${successCount} pet comments!`)
}

/**
 * Clear test pet comments
 */
export async function clearPetCommentsTestData(): Promise<void> {
  console.log('🧹 Clearing test pet comments...')

  const allComments = await fetchData<Record<string, any>>('petComments')

  if (!allComments) {
    console.log('No comments found')
    return
  }

  const testIds = Object.entries(allComments)
    .filter(([_, comment]) => comment.isTest === true)
    .map(([id]) => id)

  console.log(`Found ${testIds.length} test comments`)

  const deletePromises = testIds.map((id) => deleteData(`petComments/${id}`))
  await Promise.all(deletePromises)

  console.log(`✅ Successfully deleted ${testIds.length} test comments!`)
}
