import { defineEventHandler, getHeader, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

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
    const cutoff = now - THIRTY_DAYS_MS

    const snapshot = await db.ref('notifications').once('value')
    if (!snapshot.exists()) {
      return { success: true, deleted: 0 }
    }

    const updates: Record<string, null> = {}
    let deleted = 0

    snapshot.forEach((userNotifs: any) => {
      const userId = userNotifs.key
      const notifs = userNotifs.val()
      if (!notifs) return false

      Object.entries(notifs).forEach(([notifId, notif]: [string, any]) => {
        if (notif.read === true && notif.createdAt && notif.createdAt < cutoff) {
          updates[`notifications/${userId}/${notifId}`] = null
          deleted++
        }
      })
      return false
    })

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates)
    }

    return { success: true, deleted }
  } catch (error: any) {
    console.error('Notification cleanup error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})
