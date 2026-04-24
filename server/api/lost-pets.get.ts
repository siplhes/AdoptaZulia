import { defineEventHandler, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

function ensureFirebaseAdmin() {
  if (getApps().length === 0) {
    throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not initialized' })
  }
  return getDatabase(getApps()[0])
}

function snapshotToArray(snapshot: any) {
  const items: any[] = []
  snapshot.forEach((childSnapshot: any) => {
    items.push({ id: childSnapshot.key, ...childSnapshot.val() })
  })
  return items
}

export default defineEventHandler(async () => {
  const db = ensureFirebaseAdmin()
  const lostPetsRef = db.ref('lost_pets')

  try {
    const snapshot = await lostPetsRef.get()
    if (!snapshot.exists()) {
      return { lostPets: [] }
    }

    const lostPets = snapshotToArray(snapshot)
      .filter((pet) => pet.status !== 'archived')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    return { lostPets }
  } catch (error: any) {
    console.error('Error fetching lost pets:', error)
    throw createError({ statusCode: 500, statusMessage: error.message || 'Error fetching lost pets' })
  }
})
