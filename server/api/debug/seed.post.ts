import { defineEventHandler, readBody, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, count = 1 } = body

  // Check if Firebase Admin is initialized
  if (getApps().length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Firebase Admin not initialized. Check server configuration.',
    })
  }

  // Get database (databaseURL is now set in firebase-init plugin)
  const db = getDatabase()
  const results: any[] = []

  try {
    if (type === 'pet') {
      const petsRef = db.ref('pets')
      const types = ['perro', 'gato']
      const genders = ['macho', 'hembra']
      const sizes = ['pequeño', 'mediano', 'grande']
      const ages = ['Cachorro', 'Joven', 'Adulto', 'Senior']

      for (let i = 0; i < count; i++) {
        const newRef = petsRef.push()
        const type = types[Math.floor(Math.random() * types.length)]
        const gender = genders[Math.floor(Math.random() * genders.length)]
        const size = sizes[Math.floor(Math.random() * sizes.length)]
        const age = ages[Math.floor(Math.random() * ages.length)]

        const petData = {
          id: newRef.key,
          name: `Mascota Prueba ${Math.floor(Math.random() * 1000)}`,
          type: type,
          typeValue: type,
          breed: type === 'perro' ? 'Mestizo' : 'Común Europeo',
          age: age,
          ageValue: age.toLowerCase(),
          gender: gender,
          size: size,
          sizeValue: size,
          location: 'Maracaibo, Zulia',
          description:
            'Esta es una mascota de prueba con todos los datos completos para verificar la visualización correcta en el sistema.',
          urgent: Math.random() > 0.8,
          healthStatus: Math.floor(Math.random() * 40) + 60, // 60-100
          healthDescription: 'Salud general buena, con controles al día.',
          vaccinated: true,
          neutered: Math.random() > 0.5,
          microchipped: false,
          traits: ['Juguetón', 'Cariñoso', 'Leal'],
          adoptionRequirements: 'Entrevista previa y visita al hogar.',
          adoptionFee: 0,
          contact: {
            name: 'Refugio AdoptaZulia',
            email: 'contacto@adoptazulia.com',
            phone: '+58 412 1234567',
            type: 'organization',
            preferredMethod: 'whatsapp',
          },
          status: 'available',
          isTest: true,
          images: [`https://placedog.net/500/500?id=${Math.floor(Math.random() * 100)}`],
          photos: [
            `https://placedog.net/500/500?id=${Math.floor(Math.random() * 100)}`,
            `https://placedog.net/500/500?id=${Math.floor(Math.random() * 100)}`,
          ],
          userId: 'UwbbOhsBUhXa5HrKuEQk6fGhpzz2',
          createdAt: Date.now(),
        }
        await newRef.set(petData)
        results.push({ id: newRef.key, ...petData })
      }
    } else if (type === 'story') {
      const storiesRef = db.ref('adoption_stories')
      for (let i = 0; i < count; i++) {
        const newRef = storiesRef.push()
        const storyData = {
          id: newRef.key,
          title: `Historia de Prueba ${Math.floor(Math.random() * 1000)}`,
          content: 'Contenido de la historia de éxito generada para pruebas.',
          petId: 'test-pet-id',
          userId: 'UwbbOhsBUhXa5HrKuEQk6fGhpzz2',
          featured: false,
          likes: 0,
          images: [],
          isTest: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        await newRef.set(storyData)
        results.push({ id: newRef.key, ...storyData })
      }
    } else if (type === 'clear') {
      // Clear all test data
      const updates: Record<string, null> = {}

      // 1. Pets
      const petsRef = db.ref('pets')
      const petsSnap = await petsRef.orderByChild('isTest').equalTo(true).once('value')
      petsSnap.forEach((child) => {
        updates[`pets/${child.key}`] = null
      })

      // 2. Stories
      const storiesRef = db.ref('adoption_stories')
      const storiesSnap = await storiesRef.orderByChild('isTest').equalTo(true).once('value')
      storiesSnap.forEach((child) => {
        updates[`adoption_stories/${child.key}`] = null
      })

      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates)
      }

      return { success: true, message: `Cleared ${Object.keys(updates).length} test items` }
    } else {
      throw createError({ statusCode: 400, statusMessage: `Unknown type: ${type}` })
    }

    return { success: true, created: results }
  } catch (e: any) {
    console.error('Seed error:', e)
    throw createError({ statusCode: 500, statusMessage: e.message })
  }
})
