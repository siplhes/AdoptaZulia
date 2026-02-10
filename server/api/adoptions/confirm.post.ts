import { defineEventHandler, readBody, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { adoptionId, verificationData, isDigital, userId } = body

  if (!adoptionId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // Check if Firebase Admin is initialized
  if (getApps().length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Firebase Admin not initialized',
    })
  }

  const db = getDatabase()

  try {
    // 1. Get Adoption
    const adoptionSnap = await db.ref(`adoptions/${adoptionId}`).get()
    if (!adoptionSnap.exists()) {
      throw createError({ statusCode: 404, statusMessage: 'Adoption not found' })
    }
    const adoption = adoptionSnap.val()

    // 2. Get Pet
    const petSnap = await db.ref(`pets/${adoption.petId}`).get()
    if (!petSnap.exists()) {
      throw createError({ statusCode: 404, statusMessage: 'Pet not found' })
    }
    const pet = petSnap.val()

    // 3. Verify Ownership (Basic Check)
    if (pet.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Not authorized to confirm adoption for this pet',
      })
    }

    const now = Date.now()
    const updates: Record<string, any> = {}

    // Update Adoption
    updates[`adoptions/${adoptionId}/status`] = 'completed'
    updates[`adoptions/${adoptionId}/updatedAt`] = now

    // Update Pet
    updates[`pets/${adoption.petId}/status`] = 'adopted'
    updates[`pets/${adoption.petId}/adoptedBy`] = adoption.userId
    updates[`pets/${adoption.petId}/adoptionId`] = adoptionId
    updates[`pets/${adoption.petId}/adoptionDate`] = now

    // Create Verification
    const verificationRef = db.ref('adoptions_verification').push()
    const verification = {
      adoptionId,
      petId: adoption.petId,
      adopterId: adoption.userId,
      verifierId: userId, // The owner verifying
      verifiedAt: now,
      method: isDigital ? 'digital' : 'manual',
      data: verificationData || {},
      note: 'Adopción completada y verificada por el propietario',
    }
    updates[`adoptions_verification/${verificationRef.key}`] = verification

    await db.ref().update(updates)

    return { success: true, verificationId: verificationRef.key }
  } catch (error: any) {
    console.error('Confirm adoption error:', error)
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' })
  }
})
