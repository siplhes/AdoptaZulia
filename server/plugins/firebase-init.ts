import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'

export default defineNitroPlugin((nitroApp) => {
  try {
    if (!getApps().length) {
      console.log('Nitro plugin: Initializing Firebase Admin manually...')

      let serviceAccount: any

      // 1. Try GOOGLE_APPLICATION_CREDENTIALS_JSON env var
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        try {
          serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
          console.log('Nitro plugin: Using GOOGLE_APPLICATION_CREDENTIALS_JSON')
        } catch (err) {
          console.error('Nitro plugin: Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON', err)
        }
      }

      // 2. Try GOOGLE_APPLICATION_CREDENTIALS env var (path to file)
      if (!serviceAccount && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
          const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS
          if (existsSync(filePath)) {
            serviceAccount = JSON.parse(readFileSync(filePath, 'utf-8'))
            console.log('Nitro plugin: Using GOOGLE_APPLICATION_CREDENTIALS file path')
          }
        } catch (err) {
          console.error('Nitro plugin: Failed to read GOOGLE_APPLICATION_CREDENTIALS file', err)
        }
      }

      // 3. Fallback: Search for service account file in root
      if (!serviceAccount) {
        // Known pattern for service account file
        const rootDir = process.cwd()
        const specificFile = 'adopta-zulia-firebase-adminsdk-fbsvc-6d31a9d727.json'
        const specificPath = join(rootDir, specificFile)

        if (existsSync(specificPath)) {
          try {
            serviceAccount = JSON.parse(readFileSync(specificPath, 'utf-8'))
            console.log(`Nitro plugin: Found service account file in root: ${specificFile}`)
          } catch (err) {
            console.error('Nitro plugin: Failed to read local service account file', err)
          }
        }
      }

      if (serviceAccount) {
        initializeApp({
          credential: cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        })
        console.log('Nitro plugin: Firebase Admin initialized successfully.')
      } else {
        console.warn('Nitro plugin: No valid credentials found. Firebase Admin not initialized.')
      }
    } else {
      console.log('Nitro plugin: Firebase Admin already initialized.')
    }
  } catch (e) {
    console.error('Nitro plugin: Error initializing firebase admin:', e)
  }
})
