/**
 * Pets Seeder (For Adoption)
 *
 * Utility to populate the database with realistic pet data for adoption/testing
 */

import { pushData, deleteData, fetchData } from '~/utils/firebase'

const PET_NAMES = {
  perro: ['Max', 'Luna', 'Rocky', 'Bella', 'Coco', 'Charlie', 'Toby', 'Milo', 'Buddy', 'Canela'],
  gato: ['Michi', 'Garfield', 'Tom', 'Simba', 'Nala', 'Whiskers', 'Felix', 'Tigre', 'Minino'],
  conejo: ['Tambor', 'Copito', 'Pelusa', 'Bunny'],
  ave: ['Piolín', 'Tweety', 'Kiko', 'Loro'],
}

const PET_BREEDS = {
  perro: ['Labrador', 'Golden Retriever', 'Pitbull', 'Chihuahua', 'Poodle', 'Mestizo', 'Criollo'],
  gato: ['Siamés', 'Persa', 'Angora', 'Criollo', 'Mestizo'],
  conejo: ['Mini Lop', 'Holandés', 'Angora'],
  ave: ['Periquito', 'Canario', 'Loro'],
}

const COLORS = ['marrón', 'negro', 'blanco', 'gris', 'dorado', 'tricolor', 'carey']
const SIZES = ['pequeño', 'mediano', 'grande']
const GENDERS = ['macho', 'hembra']

const DESCRIPTIONS = [
  'Mascota muy cariñosa y juguetona. Ideal para familias.',
  'Bien educadoy socializado. Le encanta jugar.',
  'Tranquilo y obediente. Perfecto compañero.',
  'Energético y amigable. Necesita espacio para correr.',
  'Dócil y afectuoso. Se lleva bien con niños.',
  'Inteligente y leal. Busca un hogar amoroso.',
  'Tímido pero muy dulce una vez que confía.',
  'Activo y juguetón. Ideal para personas activas.',
]

/**
 * Generate random age in months
 */
function generateAge(): number {
  // 80% younger than 5 years, 20% older
  if (Math.random() < 0.8) {
    return Math.floor(Math.random() * 60) // 0-5 years
  }
  return Math.floor(60 + Math.random() * 120) // 5-15 years
}

/**
 * Generate a random pet for adoption
 */
function generateRandomPet(index: number): any {
  const types = Object.keys(PET_NAMES) as Array<keyof typeof PET_NAMES>
  const typeValue = types[Math.floor(Math.random() * types.length)]

  const names = PET_NAMES[typeValue]
  const name = names[Math.floor(Math.random() * names.length)]

  const breeds = PET_BREEDS[typeValue]
  const breed = breeds[Math.floor(Math.random() * breeds.length)]

  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const size = SIZES[Math.floor(Math.random() * SIZES.length)]
  const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)]
  const age = generateAge()
  const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)]

  const vaccinated = Math.random() > 0.2
  const neutered = Math.random() > 0.3
  const goodWithKids = Math.random() > 0.3
  const goodWithPets = Math.random() > 0.4

  return {
    name,
    typeValue,
    breed,
    color,
    size,
    gender,
    age,
    description,
    vaccinated,
    neutered,
    goodWithKids,
    goodWithPets,
    userId: `test_user_${Math.floor(Math.random() * 5) + 1}`,
    images: [`https://placehold.co/600x400/8B5CF6/FFF?text=${encodeURIComponent(name)}`],
    status: 'available',
    featured: Math.random() > 0.8,
    createdAt: Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
    updatedAt: Date.now(),
    isTest: true,
  }
}

/**
 * Seed pets for adoption
 */
export async function seedPets(count: number = 30): Promise<void> {
  console.log(`🌱 Seeding ${count} pets for adoption...`)

  const promises: Promise<string | null>[] = []

  for (let i = 1; i <= count; i++) {
    const pet = generateRandomPet(i)
    promises.push(pushData('pets', pet))
  }

  const results = await Promise.all(promises)
  const successCount = results.filter((id) => id !== null).length

  console.log(`✅ Successfully seeded ${successCount} pets!`)
}

/**
 * Clear test pets
 */
export async function clearPetsTestData(): Promise<void> {
  console.log('🧹 Clearing test pets...')

  const allPets = await fetchData<Record<string, any>>('pets')

  if (!allPets) {
    console.log('No pets found')
    return
  }

  const testIds = Object.entries(allPets)
    .filter(([_, pet]) => pet.isTest === true)
    .map(([id]) => id)

  console.log(`Found ${testIds.length} test pets`)

  const deletePromises = testIds.map((id) => deleteData(`pets/${id}`))
  await Promise.all(deletePromises)

  console.log(`✅ Successfully deleted ${testIds.length} test pets!`)
}

/**
 * Get count of test pets
 */
export async function getTestPetsCount(): Promise<number> {
  const allPets = await fetchData<Record<string, any>>('pets')

  if (!allPets) {
    return 0
  }

  return Object.values(allPets).filter((pet: any) => pet.isTest === true).length
}
