import {
  getAuth,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type UserInfo,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth'
import { getDatabase, ref, set, get, update, query, orderByChild, equalTo, limitToFirst } from 'firebase/database'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { useFirebaseApp } from 'vuefire'
import { useRuntimeConfig } from '#app'
import type { UserData } from '~/models/User'

// Use the firebase User type shape but allow email to be nullable to match library
type User = UserInfo & {
  uid: string
  email: string | null
  emailVerified: boolean
  isAnonymous: boolean
  metadata?: {
    creationTime?: string
    lastSignInTime?: string
  }
  providerData: UserInfo[]
  refreshToken: string
}

export class AuthService {
  private adminEmails: string[] = []

  constructor() {
    try {
      const config = useRuntimeConfig()
      if (config.public.adminEmails) {
        this.adminEmails = config.public.adminEmails.split(',').map((email: string) => email.trim().toLowerCase())
      } else {
        this.adminEmails = ['admin@adoptazulia.com', 'soporte@adoptazulia.com']
      }
    } catch (error) {
      console.error('Error loading admin emails from config:', error)
      this.adminEmails = ['admin@adoptazulia.com', 'soporte@adoptazulia.com']
    }
  }

  private getAuthInstance() {
    try {
      const firebaseApp = useFirebaseApp()
      return getAuth(firebaseApp)
    } catch (error) {
      console.error('Error obteniendo la instancia de Auth:', error)
      const firebaseApp = getApps().length > 0 ? getApp() : null
      if (!firebaseApp) {
        throw new Error('Firebase no está inicializado')
      }
      return getAuth(firebaseApp)
    }
  }
  private getDatabaseInstance() {
    try {
      const firebaseApp = useFirebaseApp()
      return getDatabase(firebaseApp)
    } catch (error) {
      console.error('Error obteniendo la instancia de Database:', error)
      const firebaseApp = getApps().length > 0 ? getApp() : null
      if (!firebaseApp) {
        throw new Error('Firebase no está inicializado')
      }
      return getDatabase(firebaseApp)
    }
  }


  /**
   * Inicia sesión con Google
   */
  async loginWithGoogle(): Promise<User> {
    const auth = this.getAuthInstance()
    const provider = new GoogleAuthProvider()

    try {
      await setPersistence(auth, browserLocalPersistence)

      const result = await signInWithPopup(auth, provider)

      // Verificar si ya existe un profile en RTDB
      const existingProfile = await this.getUserProfile(result.user.uid)

      // Generar un userName corto y único si no existe
      let userNameToSave = existingProfile?.userName
      if (!userNameToSave) {
        userNameToSave = await this.generateUniqueUserName(result.user.displayName || '', result.user.email || '', result.user.uid)
      }

      // Guardar o actualizar datos de usuario en RTDB (no sobreescribe campos si ya existen)
      await this.saveUserData(result.user.uid, {
        userName: userNameToSave,
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        lastLogin: Date.now(),
      })

      // Intentar actualizar el displayName en Auth si hace falta
      try {
        if (auth.currentUser && (!auth.currentUser.displayName || auth.currentUser.displayName !== result.user.displayName)) {
          await updateProfile(auth.currentUser, { displayName: result.user.displayName || '' })
        }
      } catch (err) {
        console.warn('No se pudo actualizar displayName en Auth:', err)
      }

      return result.user as unknown as User
    } catch (error) {
      console.error('Error iniciando sesión con Google:', error)
      throw error
    }
  }



  /**
   * Actualiza la fecha de último login
   */
  private async updateLastLogin(userId: string): Promise<void> {
    const db = this.getDatabaseInstance()
    const userRef = ref(db, `users/${userId}`)

    try {
      // Verificar si el usuario existe en la base de datos
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        // Si existe, solo actualizamos la fecha de último login
        await update(userRef, {
          lastLogin: Date.now(),
        })
      } else {
        // Si no existe, obtenemos info del usuario de Auth y lo creamos en RTDB
        const auth = this.getAuthInstance()
        if (auth.currentUser) {
          await this.saveUserData(userId, {
            displayName: auth.currentUser.displayName || '',
            email: auth.currentUser.email || '',
            photoURL: auth.currentUser.photoURL || '',
            createdAt: Date.now(),
            lastLogin: Date.now(),
          })
        }
      }
    } catch (error) {
      console.error('Error al actualizar fecha de último login:', error)
    }
  }

  /**
   * Guarda los datos del usuario en la RTDB
   */
  private async saveUserData(userId: string, userData: Partial<UserData>): Promise<void> {
    const db = this.getDatabaseInstance()
    const userRef = ref(db, `users/${userId}`)

    try {
      // Filtrar propiedades con valores undefined
      const cleanUserData: Partial<UserData> = {}
      for (const key of Object.keys(userData) as Array<keyof UserData>) {
        const k = key as keyof UserData
        if (userData[k] !== undefined) {
          cleanUserData[k] = userData[k] as any
        }
      }

      // Use update instead of set to avoid accidentally overwriting other fields
      await update(userRef, cleanUserData)
    } catch (error) {
      console.error('Error al guardar datos de usuario:', error)
      throw error
    }
  }

  /**
   * Cierra la sesión
   */
  async signOut(): Promise<void> {
    const auth = this.getAuthInstance()

    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Error cerrando sesión:', error)
      throw error
    }
  }



  /**
   * Suscribe a cambios en el estado de autenticación
   * @param callback Función a ejecutar cuando cambia el estado de autenticación
   */
  onAuthStateChanged(callback: (user: any | null) => void): () => void {
    const auth = this.getAuthInstance()
    return onAuthStateChanged(auth, callback)
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateUserProfile(
    displayName?: string,
    photoURL?: string,
    bio?: string,
    phoneNumber?: string,
    userName?: string
  ): Promise<void> {
    const auth = this.getAuthInstance()
    const user = auth.currentUser

    if (!user) throw new Error('No hay usuario autenticado')

    // Actualizar perfil en Firebase Auth
    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL,
    })

    // Preparar objeto con datos a actualizar, evitando valores undefined
    const userData: Partial<UserData> = {
      displayName: displayName || user.displayName || '',
      photoURL: photoURL || user.photoURL || '',
      updatedAt: Date.now(),
    }

    // Solo agregar propiedades si no son undefined
    if (bio !== undefined) userData.bio = bio || '';
    if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber || '';
    if (userName !== undefined) userData.userName = userName || '';

    // Actualizar datos en RTDB
    await this.saveUserData(user.uid, userData);
  }

  /**
   * Obtiene los datos de perfil completos del usuario desde RTDB
   */
  async getUserProfile(userId: string): Promise<UserData | null> {
    try {
      const db = this.getDatabaseInstance()
      const userRef = ref(db, `users/${userId}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        return snapshot.val()
      }

      return null
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error)
      throw error
    }
  }

  /**
   * Obtiene un usuario por su nombre de usuario
   */
  async getUserByUsername(username: string): Promise<UserData | null> {
    try {
      const db = this.getDatabaseInstance()
      // Use a RTDB query to find the user by username efficiently
      const usersRef = ref(db, 'users')
      const q = query(usersRef, orderByChild('userName'), equalTo(username), limitToFirst(1))
      const snapshot = await get(q)
      if (snapshot.exists()) {
        const data = snapshot.val()
        const firstKey = Object.keys(data)[0]
        return { ...(data[firstKey] as any), uid: firstKey }
      }
      return null
    } catch (error) {
      console.error('Error al buscar usuario por nombre de usuario:', error)
      throw error
    }
  }

  /**
   * Verifica si el usuario tiene rol de administrador
   * Primero verifica en la lista de admins en la base de datos
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const db = this.getDatabaseInstance()
      const adminRef = ref(db, `admins/${userId}`)
      const snapshot = await get(adminRef)

      // Si existe en la colección de admins, es administrador
      if (snapshot.exists() && snapshot.val() === true) {
        return true
      }

      // Si no está en la colección, verificamos si su email está en la lista de admins
      const userRef = ref(db, `users/${userId}`)
      const userSnapshot = await get(userRef)

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val()

        // Verificar que userData.email existe antes de usarlo
        if (userData && userData.email) {
          const userEmail = userData.email.toLowerCase()
          const isAdminByEmail = this.adminEmails.includes(userEmail)
          // Si es admin por email pero no está en la colección, lo agregamos
          // Si es admin por email pero no está en la colección, lo agregamos
          if (isAdminByEmail) {
            try {
              await set(adminRef, true)
            } catch (error) {
              console.error('Error al agregar usuario a admins:', error)
            }
          }

          return isAdminByEmail
        }
      }

      return false
    } catch (error) {
    
      return false
    }
  }

  /**
   * Verifica si un email está en la lista de administradores
   */
  isAdminEmail(email: string): boolean {
    return this.adminEmails.includes(email.toLowerCase())
  }

  /**
   * Genera un userName único a partir de displayName/email.
   * Reglas: todo junto (sin espacios), minúsculas, máximo 8 caracteres.
   * Si existe conflicto, se añade un sufijo numérico (truncando la base si es necesario).
   */
  private async generateUniqueUserName(displayName?: string | null, email?: string | null, currentUserId?: string | null): Promise<string> {
    const maxLen = 8

    const slugify = (s: string) =>
      s
        .normalize('NFD')
        // remove diacritics and non-alphanumeric characters
        .replace(/[\u0300-\u036f]/g, '') // remover diacríticos
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()

    // Preparar base desde displayName o email
    let base = ''
    if (displayName) base = slugify(displayName)
    if (!base && email) base = slugify((email.split('@')[0]) || '')
    if (!base) base = 'user'

    // Asegurarnos que al menos tenga caracteres alfanuméricos
    base = base.replace(/[^a-z0-9]/gi, '')
    if (!base) base = 'user'

    // Intento sin sufijo
    let candidate = base.slice(0, maxLen)
    try {
      const found = await this.getUserByUsername(candidate)
      if (!found || (currentUserId && found.uid === currentUserId)) {
        return candidate
      }
    } catch (err) {
      // Si falla la búsqueda, seguir intentando con fallback
      console.warn('Warning: no se pudo verificar unicidad del username inicial:', err)
    }

    // Intentar con sufijos numéricos
    for (let i = 1; i < 1000; i++) {
      const suffix = String(i)
      const allowedBaseLen = Math.max(1, maxLen - suffix.length)
      const baseTrunc = base.slice(0, allowedBaseLen)
      candidate = (baseTrunc + suffix).slice(0, maxLen)

      try {
        const found = await this.getUserByUsername(candidate)
        if (!found || (currentUserId && found.uid === currentUserId)) {
          return candidate
        }
      } catch (err) {
        console.warn('Warning: error verificando username', candidate, err)
        // si la verificación falla, pero el candidate parece válido, podemos devolverlo como último recurso
      }
    }

    // Si no encontramos un nombre disponible con el método anterior, generar uno aleatorio alfanumérico de 8 chars
    const randomCandidate = () => Math.random().toString(36).slice(2, 2 + maxLen)
    for (let i = 0; i < 10; i++) {
      const c = randomCandidate()
      try {
        const found = await this.getUserByUsername(c)
        if (!found) return c
      } catch (err) {
        // ignorar y seguir
      }
    }

    // Fallback final
    return candidate
  }
}
