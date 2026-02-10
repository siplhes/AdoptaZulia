import { defineEventHandler, readBody, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { storyId, userId } = body

  if (!storyId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  if (getApps().length === 0)
    throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not initialized' })

  const db = getDatabase()

  try {
    const storyRef = db.ref(`adoption_stories/${storyId}`)
    const snapshot = await storyRef.get()

    if (!snapshot.exists()) {
      throw createError({ statusCode: 404, statusMessage: 'Story not found' })
    }

    const currentStory = snapshot.val()
    if (currentStory.userId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    // Remove story
    // Also remove from petStories index if it exists and matches
    // But since we are moving to multi-story per pet, the index management is tricky.
    // For now, just remove the story. The index might be stale but it's just a check.
    // Ideally we remove from petStories/{petId} if it equals storyId.

    const updates: Record<string, any> = {}
    updates[`adoption_stories/${storyId}`] = null

    // Check legacy index
    const indexRef = db.ref(`petStories/${currentStory.petId}`)
    const indexSnap = await indexRef.get()
    if (indexSnap.exists() && indexSnap.val() === storyId) {
      updates[`petStories/${currentStory.petId}`] = null
    }

    await db.ref().update(updates)

    return { success: true }
  } catch (error: any) {
    console.error('[DELETE API ERROR]', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
