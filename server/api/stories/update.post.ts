import { defineEventHandler, readBody, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { storyData } = body

  // Validation
  if (!storyData || !storyData.id || !storyData.userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  if (getApps().length === 0)
    throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not initialized' })

  const db = getDatabase()

  try {
    const storyRef = db.ref(`adoption_stories/${storyData.id}`)
    const snapshot = await storyRef.get()

    if (!snapshot.exists()) {
      throw createError({ statusCode: 404, statusMessage: 'Story not found' })
    }

    const currentStory = snapshot.val()
    if (currentStory.userId !== storyData.userId) {
      throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    const updates = {
      ...storyData,
      updatedAt: Date.now(),
    }
    // Prevent changing critical fields if needed (like petId, userId)
    // ensure petId and userId match original if passed

    await storyRef.update(updates)

    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
