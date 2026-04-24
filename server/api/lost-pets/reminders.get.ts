import { defineEventHandler, getHeader, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'
import { Resend } from 'resend'
import { getLostPetReminderEmail } from '~/utils/emailTemplates'

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000

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

    const snapshot = await db.ref('lost_pets').orderByChild('status').equalTo('active').once('value')
    if (!snapshot.exists()) {
      return { success: true, remindersSent: 0, archived: 0 }
    }

    const pets: any[] = []
    snapshot.forEach((child: any) => {
      pets.push({ id: child.key, ...child.val() })
      return false
    })

    const resend = new Resend(process.env.RESEND_API_KEY)
    const baseUrl = process.env.BASE_URL || 'https://adoptazulia.vercel.app'

    let remindersSent = 0
    let archived = 0
    const updates: Record<string, any> = {}

    for (const pet of pets) {
      const createdAt = pet.createdAt || 0
      const age = now - createdAt

      // Auto-archive after 60 days
      if (age >= SIXTY_DAYS_MS) {
        updates[`lost_pets/${pet.id}/status`] = 'archived'
        updates[`lost_pets/${pet.id}/archivedAt`] = now
        archived++
        continue
      }

      // Skip if less than 14 days old
      if (age < FOURTEEN_DAYS_MS) continue

      const lastReminderAt = pet.lastReminderAt || 0
      if (lastReminderAt && now - lastReminderAt < SEVEN_DAYS_MS) continue

      const petName = pet.name || 'tu mascota'
      const actionUrl = `${baseUrl}/perdidas/${pet.id}`
      const emailHtml = getLostPetReminderEmail(petName, actionUrl)
      const subject = 'Recordatorio: Mascota Perdida - Adopta Zulia'

      // In-app notification to owner
      if (pet.ownerId) {
        const notifRef = db.ref(`notifications/${pet.ownerId}`).push()
        updates[`notifications/${pet.ownerId}/${notifRef.key}`] = {
          type: 'lost_pet_reminder',
          title: '¿Ya encontraste a tu mascota?',
          message: `Hace tiempo que reportaste a ${petName} como perdido/a. Por favor actualiza el estado si ya fue encontrado/a.`,
          data: { lostPetId: pet.id },
          actionLink: actionUrl,
          actionText: 'Actualizar',
          read: false,
          createdAt: now,
          senderId: 'system',
        }
      }

      // Email to owner
      if (pet.contact) {
        try {
          const contactEmail = pet.contact.includes('@') ? pet.contact : null
          if (contactEmail) {
            await resend.emails.send({
              from: 'Adopta Zulia <onboarding@resend.dev>',
              to: [contactEmail],
              subject,
              html: emailHtml,
            })
          }
        } catch (err) {
          console.error(`Failed to send lost pet reminder email for ${pet.id}:`, err)
        }
      }

      // Also try to fetch owner email from users node
      if (pet.ownerId) {
        try {
          const ownerSnap = await db.ref(`users/${pet.ownerId}`).once('value')
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
          console.error(`Failed to send lost pet reminder to owner email for ${pet.id}:`, err)
        }
      }

      updates[`lost_pets/${pet.id}/lastReminderAt`] = now
      remindersSent++
    }

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates)
    }

    return { success: true, remindersSent, archived }
  } catch (error: any) {
    console.error('Lost pets reminders error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})
