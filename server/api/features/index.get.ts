import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

const DEFAULT_FEATURES = {
  favorites: false,
  comments: false,
  imageGeneration: true,
  adoption: true,
}

export default defineEventHandler(async (event) => {
  try {
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

    const snapshot = await featuresRef.get()

    if (snapshot.exists()) {
      return {
        success: true,
        features: snapshot.val(),
      }
    } else {
      // Initialize with defaults if not exists
      await featuresRef.set({
        ...DEFAULT_FEATURES,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      return {
        success: true,
        features: DEFAULT_FEATURES,
      }
    }
  } catch (error: any) {
    console.error('Error fetching features:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch features',
    })
  }
})
