import { defineEventHandler, createError, getQuery } from 'h3'
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

function isMissingIndexError(error: any) {
  const message = String(error?.message || error || '')
  return /Index not defined|\.indexOn|add ".indexOn"/i.test(message)
}

async function fetchStories(db: any) {
  const storiesRef = db.ref('adoption_stories')

  try {
    const snapshot = await storiesRef.orderByChild('createdAt').get()
    if (!snapshot.exists()) {
      return []
    }
    return snapshotToArray(snapshot)
  } catch (error: any) {
    if (!isMissingIndexError(error)) {
      throw error
    }
    const fallbackSnapshot = await storiesRef.get()
    if (!fallbackSnapshot.exists()) {
      return []
    }
    return snapshotToArray(fallbackSnapshot)
  }
}

async function fetchCollectionByIds(db: any, path: string, ids: string[]) {
  if (ids.length === 0) {
    return []
  }

  const snapshot = await db.ref(path).get()
  if (!snapshot.exists()) {
    return []
  }

  const items: any[] = []
  snapshot.forEach((childSnapshot: any) => {
    const id = childSnapshot.key
    if (id && ids.includes(id)) {
      items.push({ id, ...childSnapshot.val() })
    }
  })

  return items
}

function enrichStories(stories: any[], pets: any[], users: any[]) {
  const petMap = new Map(pets.map((pet) => [pet.id, pet]))
  const userMap = new Map(users.map((user) => [user.id, user]))

  return stories.map((story) => {
    const pet = petMap.get(story.petId)
    const user = userMap.get(story.userId)

    return {
      ...story,
      pet: pet
        ? {
            id: pet.id,
            name: pet.name || 'Sin nombre',
            type: pet.type || 'No especificado',
            breed: pet.breed || 'No especificado',
            image: pet.image || '',
          }
        : null,
      user: user
        ? {
            id: user.id,
            displayName: user.displayName || 'Usuario',
            photoURL: user.photoURL || '',
          }
        : null,
    }
  })
}

export default defineEventHandler(async (event) => {
  const db = ensureFirebaseAdmin()
  const query = getQuery(event)
  const filter = String(query.filter || 'all')
  const limit = Number(query.limit || 3)
  const userId = String(query.userId || '')

  try {
    let stories = await fetchStories(db)
    stories = stories.filter((story) => !story.isTest)

    if (filter === 'featured') {
      stories = stories.filter((story) => story.featured)
    }

    if (filter === 'user' && userId) {
      stories = stories.filter((story) => story.userId === userId)
    }

    if (filter === 'featured' && stories.length > limit) {
      stories = stories.slice(0, limit)
    }

    const petIds = [...new Set(stories.map((story) => story.petId).filter(Boolean))]
    const userIds = [...new Set(stories.map((story) => story.userId).filter(Boolean))]

    const [pets, users] = await Promise.all([
      fetchCollectionByIds(db, 'pets', petIds),
      fetchCollectionByIds(db, 'users', userIds),
    ])

    const enrichedStories = enrichStories(stories, pets, users)

    enrichedStories.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    return { stories: enrichedStories }
  } catch (error: any) {
    console.error('Error fetching adoption stories:', error)
    throw createError({ statusCode: 500, statusMessage: error.message || 'Error fetching adoption stories' })
  }
})
