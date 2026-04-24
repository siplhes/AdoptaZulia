/**
 * Firebase Utilities
 * Centralized Firebase database access to follow DRY principle
 */

import type { DatabaseReference } from 'firebase/database'

async function getDatabaseInstance() {
  const { useFirebaseApp } = await import('vuefire')
  const { getDatabase } = await import('firebase/database')

  const firebaseApp = useFirebaseApp()
  return getDatabase(firebaseApp)
}

/**
 * Get a Firebase database reference for a given path
 * @param path - Database path (e.g., 'users', 'pets/123')
 * @returns DatabaseReference
 */
export async function getDbRef(path: string): Promise<DatabaseReference> {
  const db = await getDatabaseInstance()
  const { ref } = await import('firebase/database')
  return ref(db, path)
}

/**
 * Fetch data from Firebase database
 * @param path - Database path
 * @returns Data or null if not found
 */
export async function fetchData<T = any>(path: string): Promise<T | null> {
  try {
    const ref = await getDbRef(path)
    const { get } = await import('firebase/database')
    const snapshot = await get(ref)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.val() as T
  } catch (error) {
    console.error(`Error fetching data from ${path}:`, error)
    throw error
  }
}

/**
 * Fetch data with ID included
 * @param path - Database path
 * @returns Data with id property or null
 */
export async function fetchDataWithId<T = any>(path: string): Promise<(T & { id: string }) | null> {
  try {
    const ref = await getDbRef(path)
    const { get } = await import('firebase/database')
    const snapshot = await get(ref)

    if (!snapshot.exists()) {
      return null
    }

    const data = snapshot.val()
    const id = snapshot.key

    return { ...data, id } as T & { id: string }
  } catch (error) {
    console.error(`Error fetching data from ${path}:`, error)
    throw error
  }
}

/**
 * Fetch collection as array with IDs
 * @param path - Database collection path
 * @returns Array of items with id property
 */
export async function fetchCollection<T = any>(path: string): Promise<Array<T & { id: string }>> {
  try {
    const ref = await getDbRef(path)
    const { get } = await import('firebase/database')
    const snapshot = await get(ref)

    if (!snapshot.exists()) {
      return []
    }

    const data = snapshot.val()
    return Object.entries(data).map(([id, value]) => ({
      ...(value as T),
      id,
    }))
  } catch (error) {
    console.error(`Error fetching collection from ${path}:`, error)
    throw error
  }
}

function isMissingIndexError(error: any): boolean {
  const message = String(error?.message || error || '')
  return /Index not defined|\.indexOn|add ".indexOn"/i.test(message)
}

export async function fetchCollectionByChild<T = any>(
  path: string,
  child: string,
  value: string
): Promise<Array<T & { id: string }>> {
  const ref = await getDbRef(path)
  const { query, orderByChild, equalTo, get } = await import('firebase/database')
  const q = query(ref, orderByChild(child), equalTo(value))

  try {
    const snapshot = await get(q)
    if (!snapshot.exists()) return []

    const data = snapshot.val()
    return Object.entries(data).map(([id, value]) => ({
      ...(value as T),
      id,
    }))
  } catch (error: any) {
    if (!isMissingIndexError(error)) {
      console.error(`Error fetching collection by child from ${path}:`, error)
      throw error
    }

    const fallbackSnapshot = await get(ref)
    if (!fallbackSnapshot.exists()) return []

    const fallbackData = fallbackSnapshot.val()
    return Object.entries(fallbackData)
      .map(([id, item]) => ({ ...(item as T), id }))
      .filter((item) => item[child] === value)
  }
}

/**
 * Update data in Firebase database
 * @param path - Database path
 * @param data - Data to update
 * @returns Success boolean
 */
export async function updateData(path: string, data: any): Promise<boolean> {
  try {
    const ref = await getDbRef(path)
    const { update } = await import('firebase/database')
    await update(ref, {
      ...data,
      updatedAt: Date.now(),
    })
    return true
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error)
    return false
  }
}

/**
 * Set (overwrite) data in Firebase database
 * @param path - Database path
 * @param data - Data to set
 * @returns Success boolean
 */
export async function setData(path: string, data: any): Promise<boolean> {
  try {
    const ref = await getDbRef(path)
    const { set } = await import('firebase/database')
    await set(ref, data)
    return true
  } catch (error) {
    console.error(`Error setting data at ${path}:`, error)
    return false
  }
}

/**
 * Delete data from Firebase database
 * @param path - Database path
 * @returns Success boolean
 */
export async function deleteData(path: string): Promise<boolean> {
  try {
    const ref = await getDbRef(path)
    const { remove } = await import('firebase/database')
    await remove(ref)
    return true
  } catch (error) {
    console.error(`Error deleting data at ${path}:`, error)
    return false
  }
}

/**
 * Push new data to collection
 * @param path - Collection path
 * @param data - Data to push
 * @returns New item ID or null on error
 */
export async function pushData(path: string, data: any): Promise<string | null> {
  try {
    const ref = await getDbRef(path)
    const { push, set } = await import('firebase/database')
    const newRef = push(ref)

    await set(newRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return newRef.key
  } catch (error) {
    console.error(`Error pushing data to ${path}:`, error)
    return null
  }
}

/**
 * Check if data exists at path
 * @param path - Database path
 * @returns True if data exists
 */
export async function dataExists(path: string): Promise<boolean> {
  try {
    const ref = await getDbRef(path)
    const { get } = await import('firebase/database')
    const snapshot = await get(ref)
    return snapshot.exists()
  } catch (error) {
    console.error(`Error checking if data exists at ${path}:`, error)
    return false
  }
}

/**
 * Get database instance (if needed for advanced operations)
 * @returns Firebase Database instance
 */
export async function getDb() {
  return await getDatabaseInstance()
}
