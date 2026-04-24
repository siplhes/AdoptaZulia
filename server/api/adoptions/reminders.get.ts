import { defineEventHandler, getQuery, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'
import { Resend } from 'resend'
import { getAdoptionReminderEmail } from '~/utils/emailTemplates'

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const rawSecret = query.secret
    const secret = Array.isArray(rawSecret) ? rawSecret[0] : rawSecret

    const expectedSecret = process.env.CRON_SECRET || ''
    if (!expectedSecret || secret !== expectedSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    if (getApps().length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Firebase Admin not initialized',
      })
    }

    const db = getDatabase()
    const now = Date.now()

    const snapshot = await db.ref('adoptions').orderByChild('status').equalTo('approved').once('value')
    if (!snapshot.exists()) {
      return { success: true, remindersSent: 0 }
    }

    const adoptions: any[] = []
    snapshot.forEach((child: any) => {
      adoptions.push({ id: child.key, ...child.val() })
      return false
    })

    const pendingReminders = adoptions.filter((a) => {
      const approvedAt = a.approvedAt || 0
      if (!approvedAt || now - approvedAt < ONE_WEEK_MS) return false

      const lastReminderAt = a.lastReminderAt || 0
      if (!lastReminderAt) return true
      return now - lastReminderAt >= THREE_DAYS_MS
    })

    if (pendingReminders.length === 0) {
      return { success: true, remindersSent: 0 }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const baseUrl = process.env.BASE_URL || 'https://adoptazulia.vercel.app'
    const adminEmailsRaw = process.env.ADMIN_EMAILS || ''
    const adminEmails = adminEmailsRaw
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    // Collect all user IDs we need to fetch
    const userIdsToFetch = new Set<string>()
    const petIdsToFetch = new Set<string>()
    pendingReminders.forEach((a) => {
      if (a.userId) userIdsToFetch.add(a.userId)
      if (a.petId) petIdsToFetch.add(a.petId)
    })

    // Fetch users and pets in parallel
    const userFetches = Array.from(userIdsToFetch).map(async (uid) => {
      const snap = await db.ref(`users/${uid}`).once('value')
      return { uid, data: snap.exists() ? snap.val() : null }
    })
    const petFetches = Array.from(petIdsToFetch).map(async (pid) => {
      const snap = await db.ref(`pets/${pid}`).once('value')
      return { pid, data: snap.exists() ? snap.val() : null }
    })

    const [userResults, petResults] = await Promise.all([
      Promise.all(userFetches),
      Promise.all(petFetches),
    ])

    const usersMap = new Map(userResults.map((r) => [r.uid, r.data]))
    const petsMap = new Map(petResults.map((r) => [r.pid, r.data]))

    // Fetch admin UIDs from RTDB
    const adminsSnap = await db.ref('admins').once('value')
    const adminUids: string[] = []
    if (adminsSnap.exists()) {
      const adminsVal = adminsSnap.val()
      Object.entries(adminsVal).forEach(([key, val]) => {
        if (val === true) adminUids.push(key)
      })
    }

    let remindersSent = 0
    const updates: Record<string, any> = {}

    for (const adoption of pendingReminders) {
      const pet = petsMap.get(adoption.petId)
      const applicant = usersMap.get(adoption.userId)
      const owner = pet?.userId ? usersMap.get(pet.userId) : null

      const petName = pet?.name || 'la mascota'
      const actionUrl = `${baseUrl}/mascotas/solicitudes/${adoption.id}`
      const emailHtml = getAdoptionReminderEmail(petName, actionUrl)
      const subject = 'Recordatorio de Adopción - Adopta Zulia'

      // In-app notifications
      const targetUids = new Set<string>()
      if (adoption.userId) targetUids.add(adoption.userId)
      if (pet?.userId) targetUids.add(pet.userId)
      adminUids.forEach((uid) => targetUids.add(uid))

      const timestamp = Date.now()
      for (const uid of targetUids) {
        const notifRef = db.ref(`notifications/${uid}`).push()
        updates[`notifications/${uid}/${notifRef.key}`] = {
          type: 'adoption_reminder',
          title: 'Recordatorio de adopción',
          message: `La adopción de ${petName} fue aprobada hace más de una semana y aún no se ha confirmado.`,
          data: { adoptionId: adoption.id, petId: adoption.petId },
          actionLink: actionUrl,
          actionText: 'Gestionar',
          read: false,
          createdAt: timestamp,
          senderId: 'system',
        }
      }

      // Emails
      const emailTargets = new Set<string>()
      if (applicant?.email) emailTargets.add(applicant.email)
      if (owner?.email) emailTargets.add(owner.email)
      adminEmails.forEach((e) => emailTargets.add(e))

      for (const email of emailTargets) {
        try {
          await resend.emails.send({
            from: 'Adopta Zulia <onboarding@resend.dev>',
            to: [email],
            subject,
            html: emailHtml,
          })
        } catch (err) {
          console.error(`Failed to send reminder email to ${email} for adoption ${adoption.id}:`, err)
        }
      }

      updates[`adoptions/${adoption.id}/lastReminderAt`] = timestamp
      remindersSent++
    }

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates)
    }

    return { success: true, remindersSent }
  } catch (error: any) {
    console.error('Adoption reminders error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})
