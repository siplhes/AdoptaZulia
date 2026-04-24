import { defineEventHandler, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

export default defineEventHandler(async () => {
  if (getApps().length === 0) {
    throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not initialized' })
  }

  const db = getDatabase(getApps()[0])

  try {
    const petsRef = db.ref('pets')
    const snapshot = await petsRef.get()

    if (!snapshot.exists()) {
      return { pets: [] }
    }

    const pets: any[] = []
    snapshot.forEach((childSnapshot: any) => {
      const pet = { id: childSnapshot.key, ...childSnapshot.val() }
      if (!pet.isTest) {
        pets.push(pet)
      }
    })

    pets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    return { pets }
  } catch (error: any) {
    console.error('Error fetching public pets:', error)
    throw createError({ statusCode: 500, statusMessage: error.message || 'Error fetching public pets' })
  }
})
