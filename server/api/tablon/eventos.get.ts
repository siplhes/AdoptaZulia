import { defineEventHandler, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

function ensureFirebaseAdmin() {
  if (getApps().length === 0) {
    throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not initialized' })
  }
  return getDatabase(getApps()[0])
}

function snapshotToArray(snapshot: any) {
  const items: any[] = []
  snapshot.forEach((childSnapshot: any) => {
    items.push({ id: childSnapshot.key, ...childSnapshot.val() })
  })
  return items
}

function isMissingIndexError(error: any) {
  const message = String(error?.message || error || '')
  return /Index not defined|\.indexOn|add ".indexOn"/i.test(message)
}

export default defineEventHandler(async () => {
  const db = ensureFirebaseAdmin()
  const eventosRef = db.ref('tablon/eventos')

  try {
    const snapshot = await eventosRef.orderByChild('date').get()
    if (snapshot.exists()) {
      const eventos = snapshotToArray(snapshot).sort((a, b) => (a.date || 0) - (b.date || 0))
      return { eventos }
    }

    return { eventos: [] }
  } catch (error: any) {
    if (!isMissingIndexError(error)) {
      console.error('Error fetching eventos:', error)
      throw createError({ statusCode: 500, statusMessage: error.message || 'Error fetching eventos' })
    }

    const fallbackSnapshot = await eventosRef.get()
    if (!fallbackSnapshot.exists()) {
      return { eventos: [] }
    }

    const eventos = snapshotToArray(fallbackSnapshot).filter((item) => item).sort((a, b) => (a.date || 0) - (b.date || 0))
    return { eventos }
  }
})
