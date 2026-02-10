import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body',
      })
    }

    // Get Firebase Admin app
    const apps = getApps()
    if (apps.length === 0) {
      throw createError({
        statusCode: 500,
        message: 'Firebase Admin not initialized',
      })
    }

    const db = getDatabase(apps[0])
    const featuresRef = db.ref('config/features')

    // Get current features
    const snapshot = await featuresRef.get()
    const currentFeatures = snapshot.exists() ? snapshot.val() : {}

    // Merge with updates
    const updatedFeatures = {
      ...currentFeatures,
      ...body,
      updatedAt: Date.now(),
    }

    // Save to database
    await featuresRef.set(updatedFeatures)

    return {
      success: true,
      features: updatedFeatures,
    }
  } catch (error: any) {
    console.error('Error updating features:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update features',
    })
  }
})
