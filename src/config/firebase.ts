/**
 * Firebase Configuration & Initialization
 * Adapted from the Nuxt web app for standalone Ionic Vue usage
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import {
  getDatabase,
  ref as dbRef,
  get,
  set,
  update,
  remove,
  push,
  type DatabaseReference,
  type Database,
} from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

if (!firebaseConfig.apiKey) {
  console.error('Firebase configuration is missing! Check your .env.app file and make sure VITE_FIREBASE_* variables are set.')
  console.log('Current Config:', JSON.stringify(firebaseConfig, null, 2))
}

// Singleton instances
let app: FirebaseApp
let auth: Auth
let db: Database

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export function getDb(): Database {
  if (!db) {
    db = getDatabase(getFirebaseApp())
  }
  return db
}

// ─── Firebase Database Utilities ───────────────────────────

export function getDbRef(path: string): DatabaseReference {
  return dbRef(getDb(), path)
}

export async function fetchData<T = any>(path: string): Promise<T | null> {
  try {
    const snapshot = await get(getDbRef(path))
    return snapshot.exists() ? (snapshot.val() as T) : null
  } catch (error) {
    console.error(`Error fetching data from ${path}:`, error)
    throw error
  }
}

export async function fetchDataWithId<T = any>(path: string): Promise<(T & { id: string }) | null> {
  try {
    const snapshot = await get(getDbRef(path))
    if (!snapshot.exists()) return null
    return { ...snapshot.val(), id: snapshot.key } as T & { id: string }
  } catch (error) {
    console.error(`Error fetching data from ${path}:`, error)
    throw error
  }
}

export async function fetchCollection<T = any>(path: string): Promise<Array<T & { id: string }>> {
  try {
    const snapshot = await get(getDbRef(path))
    if (!snapshot.exists()) return []
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

export async function updateData(path: string, data: any): Promise<boolean> {
  try {
    await update(getDbRef(path), { ...data, updatedAt: Date.now() })
    return true
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error)
    return false
  }
}

export async function setData(path: string, data: any): Promise<boolean> {
  try {
    await set(getDbRef(path), data)
    return true
  } catch (error) {
    console.error(`Error setting data at ${path}:`, error)
    return false
  }
}

export async function deleteData(path: string): Promise<boolean> {
  try {
    await remove(getDbRef(path))
    return true
  } catch (error) {
    console.error(`Error deleting data at ${path}:`, error)
    return false
  }
}

export async function pushData(path: string, data: any): Promise<string | null> {
  try {
    const newRef = push(getDbRef(path))
    await set(newRef, { ...data, createdAt: Date.now(), updatedAt: Date.now() })
    return newRef.key
  } catch (error) {
    console.error(`Error pushing data to ${path}:`, error)
    return null
  }
}

export async function dataExists(path: string): Promise<boolean> {
  try {
    const snapshot = await get(getDbRef(path))
    return snapshot.exists()
  } catch (error) {
    console.error(`Error checking if data exists at ${path}:`, error)
    return false
  }
}

export { getFirebaseApp }
