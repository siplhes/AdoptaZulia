/**
 * Lost Pets Seeder
 *
 * Utility to populate the database with realistic lost pet data for development/testing.
 *
 * Usage:
 *   import { seedLostPets, clearLostPetsTestData } from '~/utils/seeders/lostPetsSeeder'
 *
 *   // Seed 30 lost pets
 *   await seedLostPets(30)
 *
 *   // Clear all test data
 *   await clearLostPetsTestData()
 */

import { pushData, deleteData, fetchData } from '~/utils/firebase'
import type { LostPet } from '~/models/LostPet'

// Sample data for Venezuelan context
const PET_NAMES = {
  perro: [
    'Max',
    'Luna',
    'Rocky',
    'Bella',
    'Coco',
    'Charlie',
    'Toby',
    'Milo',
    'Buddy',
    'Canela',
    'Pelusa',
    'Firulais',
  ],
  gato: [
    'Michi',
    'Garfield',
    'Tom',
    'Simba',
    'Nala',
    'Whiskers',
    'Miau',
    'Felix',
    'Tigre',
    'Pelusa',
    'Minino',
  ],
  ave: ['Piolín', 'Tweety', 'Kiko', 'Loro', 'Cotorra', 'Canario'],
  conejo: ['Tambor', 'Copito', 'Pelusa', 'Bunny', 'Oreja'],
}

const PET_BREEDS = {
  perro: [
    'Labrador',
    'Golden Retriever',
    'Pitbull',
    'Chihuahua',
    'Poodle',
    'Mestizo',
    'Schnauzer',
    'Pastor Alemán',
    'Criollo',
  ],
  gato: ['Siamés', 'Persa', 'Angora', 'Criollo', 'Mestizo', 'Carey', 'Tricolor'],
  ave: ['Periquito', 'Canario', 'Guacamaya', 'Cotorra', 'Loro'],
  conejo: ['Mini Lop', 'Holandés', 'Angora', 'Rex'],
}

const ZULIA_LOCATIONS = [
  'Maracaibo Centro',
  'Delicias',
  'Santa Rita',
  'Valle Frío',
  'La Lago',
  'Las Verdes',
  'Pomona',
  'San Francisco',
  'La Limpia',
  'Raúl Leoni',
  'La Victoria',
  'San Jacinto',
  'Tierra Negra',
  'Circunvalación 2',
  'Los Haticos',
  'Bella Vista',
  'El Naranjal',
  'La Trinidad',
]

const DESCRIPTIONS_TEMPLATES = [
  'Se perdió cerca de {location}. Es muy cariñoso y responde a su nombre.',
  'Perdido en las cercanías de {location}. Lleva collar {color}.',
  'Extraviado el {date} en {location}. Muy importante para la familia.',
  'Se escapó de casa en {location}. Es asustadizo con personas desconocidas.',
  'Perdido después de un trueno en {location}. Por favor ayúdenos a encontrarlo.',
  'Desapareció en {location}. Tiene una mancha característica en el pecho.',
  'Se perdió durante un paseo en {location}. Es muy juguetón.',
  'Extraviado cerca de {location}. Necesita medicación urgente.',
]

const COLORS = [
  'marrón',
  'negro',
  'blanco',
  'gris',
  'amarillo',
  'naranja',
  'tricolor',
  'carey',
  'manchado',
]

const SIZES = ['pequeño', 'mediano', 'grande']

const CONTACT_PREFIXES = ['0414', '0424', '0412', '0416', '0426']

/**
 * Generate a random phone number
 */
function generatePhone(): string {
  const prefix = CONTACT_PREFIXES[Math.floor(Math.random() * CONTACT_PREFIXES.length)]
  const number = Math.floor(1000000 + Math.random() * 9000000)
  return `${prefix}-${number}`
}

/**
 * Generate a random timestamp within the last 90 days
 */
function generateRecentTimestamp(): number {
  const now = Date.now()
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000
  return Math.floor(ninetyDaysAgo + Math.random() * (now - ninetyDaysAgo))
}

/**
 * Generate a random lost pet entry
 */
function generateRandomLostPet(index: number): Omit<LostPet, 'id'> {
  const types = Object.keys(PET_NAMES) as Array<keyof typeof PET_NAMES>
  const type = types[Math.floor(Math.random() * types.length)]

  const names = PET_NAMES[type]
  const name = names[Math.floor(Math.random() * names.length)]

  const breeds = PET_BREEDS[type]
  const breed = breeds[Math.floor(Math.random() * breeds.length)]

  const location = ZULIA_LOCATIONS[Math.floor(Math.random() * ZULIA_LOCATIONS.length)]
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const size = SIZES[Math.floor(Math.random() * SIZES.length)]

  const lostDate = generateRecentTimestamp()
  const descriptionTemplate =
    DESCRIPTIONS_TEMPLATES[Math.floor(Math.random() * DESCRIPTIONS_TEMPLATES.length)]
  const description = descriptionTemplate
    .replace('{location}', location)
    .replace('{color}', color)
    .replace('{date}', new Date(lostDate).toLocaleDateString('es-VE'))

  // Determine status (70% lost, 20% found, 10% reunited)
  const statusRoll = Math.random()
  let status: 'lost' | 'found' | 'reunited'
  if (statusRoll < 0.7) {
    status = 'lost'
  } else if (statusRoll < 0.9) {
    status = 'found'
  } else {
    status = 'reunited'
  }

  // Generate reward (60% have reward)
  const hasReward = Math.random() < 0.6
  const reward = hasReward ? Math.floor(50 + Math.random() * 450) : 0

  return {
    name,
    type,
    breed,
    color,
    size,
    description,
    location,
    lostDate,
    contactName: `Prueba Usuario ${index}`,
    contactPhone: generatePhone(),
    contactEmail: `test${index}@adoptazulia.test`,
    reward,
    status,
    userId: 'test_user_seed', // Mark as test data
    images: [`https://placehold.co/600x400/EEE/999?text=${encodeURIComponent(name)}`],
    sightings: [],
    sightingCount: Math.floor(Math.random() * 5),
    views: Math.floor(Math.random() * 100),
    createdAt: lostDate,
    updatedAt: lostDate,
    isTest: true, // Mark as test data
  }
}

/**
 * Seed the database with lost pets
 *
 * @param count - Number of lost pets to generate (default: 30)
 * @returns Promise that resolves when seeding is complete
 */
export async function seedLostPets(count: number = 30): Promise<void> {
  console.log(`🌱 Seeding ${count} lost pets...`)

  const promises: Promise<string | null>[] = []

  for (let i = 1; i <= count; i++) {
    const lostPet = generateRandomLostPet(i)
    promises.push(pushData('lost_pets', lostPet))
  }

  const results = await Promise.all(promises)
  const successCount = results.filter((id) => id !== null).length

  console.log(`✅ Successfully seeded ${successCount} lost pets!`)
}

/**
 * Clear all test lost pets from the database
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function clearLostPetsTestData(): Promise<void> {
  console.log('🧹 Clearing test lost pets data...')

  const allLostPets = await fetchData<Record<string, any>>('lost_pets')

  if (!allLostPets) {
    console.log('No lost pets found')
    return
  }

  const testPetIds = Object.entries(allLostPets)
    .filter(([_, pet]) => pet.isTest === true || pet.userId === 'test_user_seed')
    .map(([id]) => id)

  console.log(`Found ${testPetIds.length} test lost pets`)

  const deletePromises = testPetIds.map((id) => deleteData(`lost_pets/${id}`))
  await Promise.all(deletePromises)

  console.log(`✅ Successfully deleted ${testPetIds.length} test lost pets!`)
}

/**
 * Get count of test lost pets
 */
export async function getTestLostPetsCount(): Promise<number> {
  const allLostPets = await fetchData<Record<string, any>>('lost_pets')

  if (!allLostPets) {
    return 0
  }

  return Object.values(allLostPets).filter(
    (pet: any) => pet.isTest === true || pet.userId === 'test_user_seed'
  ).length
}
