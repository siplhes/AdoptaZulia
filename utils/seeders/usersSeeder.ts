/**
 * Users Seeder
 *
 * Utility to populate the database with realistic user profile data for development/testing
 */

import { setData, deleteData, fetchData } from '~/utils/firebase'

const VENEZUELAN_NAMES = [
  'María González',
  'José Rodríguez',
  'Ana Fernández',
  'Carlos Pérez',
  'Luisa Martínez',
  'Pedro Sánchez',
  'Carmen López',
  'Rafael Díaz',
  'Isabel García',
  'Miguel Romero',
  'Teresa Moreno',
  'Antonio Jiménez',
  'Rosa Álvarez',
  'Francisco Ruiz',
  'Dolores Hernández',
]

/**
 * Generate a random user profile
 */
function generateRandomUser(index: number): any {
  const name = VENEZUELAN_NAMES[Math.floor(Math.random() * VENEZUELAN_NAMES.length)]
  const [firstName, lastName] = name.split(' ')

  return {
    uid: `test_user_${index}`,
    displayName: name,
    email: `test${index}@adoptazulia.test`,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
    phoneNumber: `0414-${Math.floor(1000000 + Math.random() * 9000000)}`,
    location: 'Maracaibo, Zulia',
    bio: `Usuario de prueba #${index}. Amante de los animales.`,
    role: Math.random() > 0.9 ? 'admin' : 'user',
    createdAt: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
    isTest: true,
  }
}

/**
 * Seed user profiles
 */
export async function seedUsers(count: number = 10): Promise<void> {
  console.log(`🌱 Seeding ${count} user profiles...`)

  const promises: Promise<void>[] = []

  for (let i = 1; i <= count; i++) {
    const user = generateRandomUser(i)
    promises.push(setData(`users/${user.uid}`, user))
  }

  await Promise.all(promises)

  console.log(`✅ Successfully seeded ${count} user profiles!`)
}

/**
 * Clear test user profiles
 */
export async function clearUsersTestData(): Promise<void> {
  console.log('🧹 Clearing test user profiles...')

  const allUsers = await fetchData<Record<string, any>>('users')

  if (!allUsers) {
    console.log('No users found')
    return
  }

  const testIds = Object.entries(allUsers)
    .filter(([_, user]) => user.isTest === true)
    .map(([id]) => id)

  console.log(`Found ${testIds.length} test users`)

  const deletePromises = testIds.map((id) => deleteData(`users/${id}`))
  await Promise.all(deletePromises)

  console.log(`✅ Successfully deleted ${testIds.length} test users!`)
}
