import { defineEventHandler, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

function snapshotToArray(snapshot: any) {
  const items: any[] = []
  snapshot.forEach((childSnapshot: any) => {
    items.push({ id: childSnapshot.key, ...childSnapshot.val() })
  })
  return items
}

function isMissingIndexError(error: any) {
  const message = String(error?.message || error)
  return /Index not defined|\.indexOn|add ".indexOn"/i.test(message)
}

async function fetchRecordsByChild(ref: any, child: string, value: string) {
  try {
    const snapshot = await ref.orderByChild(child).equalTo(value).get()
    return snapshot.exists() ? snapshotToArray(snapshot) : []
  } catch (error: any) {
    if (!isMissingIndexError(error)) {
      throw error
    }
    const fallbackSnapshot = await ref.get()
    if (!fallbackSnapshot.exists()) {
      return []
    }
    return snapshotToArray(fallbackSnapshot).filter((item) => item[child] === value)
  }
}

export default defineEventHandler(async (event) => {
  const params = event.context.params as { username?: string }
  const username = params?.username

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Username is required' })
  }

  if (getApps().length === 0) {
    throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not initialized' })
  }

  const db = getDatabase(getApps()[0])

  try {
    const usersRef = db.ref('users')
    const userQuery = usersRef.orderByChild('userName').equalTo(username).limitToFirst(1)
    const userSnapshot = await userQuery.get()

    if (!userSnapshot.exists()) {
      throw createError({ statusCode: 404, statusMessage: 'Perfil no encontrado' })
    }

    const usersData = userSnapshot.val()
    const userId = Object.keys(usersData)[0]
    const userProfile = { uid: userId, ...usersData[userId] }

    const [pets, lostReports, stories] = await Promise.all([
      fetchRecordsByChild(db.ref('pets'), 'userId', userId),
      fetchRecordsByChild(db.ref('lost_pets'), 'userId', userId),
      fetchRecordsByChild(db.ref('adoption_stories'), 'userId', userId),
    ])

    const storiesFiltered = stories.filter((item) => !item.isTest)

    const petIds = pets.map((pet) => pet.id)
    const verifiedAdoptions: any[] = []

    if (petIds.length > 0) {
      const adoptionsRef = db.ref('adoptions')
      const allAdoptionsSnapshot = await adoptionsRef.get()
      if (allAdoptionsSnapshot.exists()) {
        snapshotToArray(allAdoptionsSnapshot).forEach((adoption) => {
          if (petIds.includes(adoption.petId) && adoption.status === 'completed') {
            verifiedAdoptions.push(adoption)
          }
        })
      }
    }

    verifiedAdoptions.sort((a, b) => b.createdAt - a.createdAt)

    return {
      success: true,
      userProfile,
      pets,
      lostReports,
      stories: storiesFiltered,
      verifiedAdoptions,
    }
  } catch (error: any) {
    console.error('Error fetching profile by username:', error)
    if (error.statusCode === 404) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: error.message || 'Error fetching profile' })
  }
})
