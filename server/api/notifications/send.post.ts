import { defineEventHandler, readBody, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { recipients, subject, message, type, sentBy, sentByName } = body

    if (!subject || !message) {
      throw createError({
        statusCode: 400,
        message: 'Subject and message are required',
      })
    }

    const db = getDatabase()
    const notifications: Record<string, any> = {}
    const timestamp = Date.now()

    let targetUserIds: string[] = []

    if (recipients === 'all') {
      // Fetch all users
      const usersRef = db.ref('users')
      const snapshot = await usersRef.once('value')
      if (snapshot.exists()) {
        targetUserIds = Object.keys(snapshot.val())
      }
    } else if (Array.isArray(recipients)) {
      targetUserIds = recipients
    } else if (typeof recipients === 'string') {
      targetUserIds = [recipients]
    }

    // Create notification objects for each user
    targetUserIds.forEach((userId) => {
      const notificationId = db.ref(`notifications/${userId}`).push().key
      if (notificationId) {
        notifications[`notifications/${userId}/${notificationId}`] = {
          type: type || 'system',
          title: subject,
          message,
          read: false,
          createdAt: timestamp,
          senderId: sentBy || 'admin',
        }
      }
    })

    // Also save to admin_notifications history
    const adminNotifId = db.ref('admin_notifications').push().key
    if (adminNotifId) {
      notifications[`admin_notifications/${adminNotifId}`] = {
        subject,
        message,
        type: type || 'system',
        recipients: recipients === 'all' ? 'all' : targetUserIds,
        sentAt: timestamp,
        sentBy: sentBy || 'admin',
        sentByName: sentByName || 'Admin',
      }
    }

    // Perform atomic update
    if (Object.keys(notifications).length > 0) {
      await db.ref().update(notifications)
    }

    return { success: true, count: targetUserIds.length }
  } catch (error: any) {
    console.error('Error sending notifications:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Internal Server Error',
    })
  }
})
