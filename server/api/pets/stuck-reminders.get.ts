import { defineEventHandler, getHeader, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'
import { Resend } from 'resend'
import { getStuckPetReminderEmail } from '~/utils/emailTemplates'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const MAX_REMINDERS = 2

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')

    const expectedSecret = process.env.CRONS_SECRET || process.env.CRON_SECRET || ''
    if (!expectedSecret || token !== expectedSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    if (getApps().length === 0) {
      throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not initialized' })
    }

    const db = getDatabase()
    const now = Date.now()

    const snapshot = await db.ref('pets').orderByChild('status').equalTo('available').once('value')
    if (!snapshot.exists()) {
      return { success: true, remindersSent: 0 }
    }

    const pets: any[] = []
    snapshot.forEach((child: any) => {
      pets.push({ id: child.key, ...child.val() })
      return false
    })

    const resend = new Resend(process.env.RESEND_API_KEY)
    const baseUrl = process.env.BASE_URL || 'https://adoptazulia.vercel.app'

    let remindersSent = 0
    const updates: Record<string, any> = {}

    for (const pet of pets) {
      const createdAt = pet.createdAt || 0
      if (now - createdAt < THIRTY_DAYS_MS) continue

      const lastBump = pet.lastBumpReminderAt || 0
      if (lastBump && now - lastBump < FOURTEEN_DAYS_MS) continue

      const bumpCount = pet.bumpReminderCount || 0
      if (bumpCount >= MAX_REMINDERS) continue

      // Check if pet has pending or approved adoptions
      const adoptionsSnap = await db.ref('adoptions').orderByChild('petId').equalTo(pet.id).once('value')
      let hasActiveAdoption = false
      if (adoptionsSnap.exists()) {
        adoptionsSnap.forEach((child: any) => {
          const val = child.val()
          if (val.status === 'pending' || val.status === 'approved') {
            hasActiveAdoption = true
          }
          return false
        })
      }
      if (hasActiveAdoption) continue

      const petName = pet.name || 'tu mascota'
      const actionUrl = `${baseUrl}/publicar/editar/${pet.id}`
      const emailHtml = getStuckPetReminderEmail(petName, actionUrl)
      const subject = 'Sugerencia: Publicación de Adopción - Adopta Zulia'

      // In-app notification to owner
      if (pet.userId) {
        const notifRef = db.ref(`notifications/${pet.userId}`).push()
        updates[`notifications/${pet.userId}/${notifRef.key}`] = {
          type: 'pet_bump_reminder',
          title: '¿Necesitas ayuda con tu publicación?',
          message: `${petName} lleva tiempo publicado/a sin recibir solicitudes. Considera actualizar las fotos o descripción.`,
          data: { petId: pet.id },
          actionLink: actionUrl,
          actionText: 'Editar',
          read: false,
          createdAt: now,
          senderId: 'system',
        }
      }

      // Email to owner
      if (pet.userId) {
        try {
          const ownerSnap = await db.ref(`users/${pet.userId}`).once('value')
          if (ownerSnap.exists()) {
            const owner = ownerSnap.val()
            if (owner.email) {
              await resend.emails.send({
                from: 'Adopta Zulia <onboarding@resend.dev>',
                to: [owner.email],
                subject,
                html: emailHtml,
              })
            }
          }
        } catch (err) {
          console.error(`Failed to send stuck pet reminder email for ${pet.id}:`, err)
        }
      }

      updates[`pets/${pet.id}/lastBumpReminderAt`] = now
      updates[`pets/${pet.id}/bumpReminderCount`] = bumpCount + 1
      remindersSent++
    }

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates)
    }

    return { success: true, remindersSent }
  } catch (error: any) {
    console.error('Stuck pets reminders error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})
