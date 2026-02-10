import { defineEventHandler, readBody, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { storyData } = body

  if (!storyData || !storyData.petId || !storyData.userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  if (getApps().length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Firebase Admin not initialized',
    })
  }

  const db = getDatabase()

  try {
    const petId = storyData.petId

    // 1. Check if ANY story exists (Legacy) - REMOVED
    // New Logic: Check if THIS USER already wrote a story for this pet
    const existingSnap = await db.ref('adoption_stories').orderByChild('petId').equalTo(petId).get()

    if (existingSnap.exists()) {
      const stories = existingSnap.val()
      const userHasStory = Object.values(stories).some((s: any) => s.userId === storyData.userId)
      if (userHasStory) {
        throw createError({
          statusCode: 409,
          statusMessage: 'You already wrote a story for this pet',
        })
      }
    }

    // 2. Prepare Data
    const storiesRef = db.ref('adoption_stories')
    const newStoryRef = storiesRef.push()
    const storyId = newStoryRef.key

    const newStory = {
      id: storyId, // Add ID to the object too if needed, though key is usually enough
      petId: petId,
      adoptionId: storyData.adoptionId || null,
      userId: storyData.userId,
      title: storyData.title || '',
      content: storyData.content || '',
      images: storyData.images || [],
      featured: storyData.featured || false,
      verified: storyData.verified || false,
      verificationId: storyData.verificationId || null,
      likes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // 3. Multi-path Update
    const updates: Record<string, any> = {}
    updates[`adoption_stories/${storyId}`] = newStory
    // We do NOT update `petStories/{petId}` anymore as it assumes 1 story per pet.
    // Getting rid of this legacy index to support multiple stories.
    // updates[`petStories/${petId}`] = storyId

    await db.ref().update(updates)

    return { success: true, storyId }
  } catch (error: any) {
    console.error('Create story error:', error)
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' })
  }
})
