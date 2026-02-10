/**
 * Firebase Utilities
 * Centralized Firebase database access to follow DRY principle
 */

import { useFirebaseApp } from 'vuefire'
import {
  getDatabase,
  ref as dbRef,
  get,
  set,
  update,
  remove,
  push,
  type DatabaseReference,
} from 'firebase/database'

/**
 * Get a Firebase database reference for a given path
 * @param path - Database path (e.g., 'users', 'pets/123')
 * @returns DatabaseReference
 */
export function getDbRef(path: string): DatabaseReference {
  const firebaseApp = useFirebaseApp()
  const db = getDatabase(firebaseApp)
  return dbRef(db, path)
}

/**
 * Fetch data from Firebase database
 * @param path - Database path
 * @returns Data or null if not found
 */
export async function fetchData<T = any>(path: string): Promise<T | null> {
  try {
    const ref = getDbRef(path)
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
    const ref = getDbRef(path)
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
    const ref = getDbRef(path)
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

/**
 * Update data in Firebase database
 * @param path - Database path
 * @param data - Data to update
 * @returns Success boolean
 */
export async function updateData(path: string, data: any): Promise<boolean> {
  try {
    const ref = getDbRef(path)
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
    const ref = getDbRef(path)
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
    const ref = getDbRef(path)
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
    const ref = getDbRef(path)
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
    const ref = getDbRef(path)
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
export function getDb() {
  const firebaseApp = useFirebaseApp()
  return getDatabase(firebaseApp)
}
