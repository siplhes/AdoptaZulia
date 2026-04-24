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
  const noticiasRef = db.ref('tablon/noticias')

  try {
    const snapshot = await noticiasRef.orderByChild('createdAt').get()
    if (snapshot.exists()) {
      const noticias = snapshotToArray(snapshot).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      return { noticias }
    }

    return { noticias: [] }
  } catch (error: any) {
    if (!isMissingIndexError(error)) {
      console.error('Error fetching noticias:', error)
      throw createError({ statusCode: 500, statusMessage: error.message || 'Error fetching noticias' })
    }

    const fallbackSnapshot = await noticiasRef.get()
    if (!fallbackSnapshot.exists()) {
      return { noticias: [] }
    }

    const noticias = snapshotToArray(fallbackSnapshot).filter((item) => item).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    return { noticias }
  }
})
