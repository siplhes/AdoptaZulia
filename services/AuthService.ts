import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type UserInfo,
  inMemoryPersistence,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth'
import { getDatabase, ref, set, get, update } from 'firebase/database'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { useFirebaseApp } from 'vuefire'
import { useRuntimeConfig } from '#app'
import type { UserData } from '~/models/User'

// Definimos el tipo User basado en la estructura de Firebase
type User = UserInfo & {
  uid: string
  email: string
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
    // Load admin emails from runtime config when the service is instantiated
    try {
      const config = useRuntimeConfig()
      if (config.public.adminEmails) {
        this.adminEmails = config.public.adminEmails.split(',').map((email: string) => email.trim().toLowerCase())
      } else {
        // Fallback to default admin emails if not configured
        this.adminEmails = ['admin@adoptazulia.com', 'soporte@adoptazulia.com'] 
      }
    } catch (error) {
      console.error('Error loading admin emails from config:', error)
      // Fallback to default admin emails
      this.adminEmails = ['admin@adoptazulia.com', 'soporte@adoptazulia.com']
    }
  }

  /**
   * Obtiene la instancia de Firebase Auth
   */
  private getAuthInstance() {
    // Usar vuefire para obtener la aplicación Firebase inicializada
    try {
      const firebaseApp = useFirebaseApp()
      return getAuth(firebaseApp)
    } catch (error) {
      console.error('Error obteniendo la instancia de Auth:', error)
      // Fallback: intentar obtener la app directamente
      const firebaseApp = getApps().length > 0 ? getApp() : null
      if (!firebaseApp) {
        throw new Error('Firebase no está inicializado')
      }
      return getAuth(firebaseApp)
    }
  }

  /**
   * Obtiene la instancia de Firebase Database
   */
  private getDatabaseInstance() {
    try {
      const firebaseApp = useFirebaseApp()
      return getDatabase(firebaseApp)
    } catch (error) {
      console.error('Error obteniendo la instancia de Database:', error)
      // Fallback: intentar obtener la app directamente
      const firebaseApp = getApps().length > 0 ? getApp() : null
      if (!firebaseApp) {
        throw new Error('Firebase no está inicializado')
      }
      return getDatabase(firebaseApp)
    }
  }

  /**
   * Registra un nuevo usuario con email y contraseña
   */
  async register(
    email: string,
    password: string,
    displayName: string,
    userName: string
  ): Promise<User> {
    const auth = this.getAuthInstance()

    try {
      // Establecer persistencia para que la sesión se mantenga entre recargas
      await setPersistence(auth, browserLocalPersistence)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Actualizar el nombre de usuario
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
        })
      }

      // Guardar datos de usuario en RTDB
      await this.saveUserData(userCredential.user.uid, {
        userName,
        displayName,
        email,
        photoURL: userCredential.user.photoURL || '',
        createdAt: Date.now(),
        lastLogin: Date.now(),
      })

      return userCredential.user
    } catch (error) {
      console.error('Error registrando usuario:', error)
      throw error
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<User> {
    const auth = this.getAuthInstance()

    try {
      await setPersistence(auth, browserLocalPersistence)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Actualizar fecha de último login
      await this.updateLastLogin(userCredential.user.uid)

      return userCredential.user
    } catch (error) {
      console.error('Error iniciando sesión:', error)
      throw error
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

      // Guardar o actualizar datos de usuario en RTDB
      await this.saveUserData(result.user.uid, {
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        lastLogin: Date.now(),
      })

      return result.user
    } catch (error) {
      console.error('Error iniciando sesión con Google:', error)
      throw error
    }
  }

  /**
   * Inicia sesión con Facebook
   */
  async loginWithFacebook(): Promise<User> {
    const auth = this.getAuthInstance()
    const provider = new FacebookAuthProvider()

    try {
      await setPersistence(auth, browserLocalPersistence)

      const result = await signInWithPopup(auth, provider)

      // Guardar o actualizar datos de usuario en RTDB
      await this.saveUserData(result.user.uid, {
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        lastLogin: Date.now(),
      })

      return result.user
    } catch (error) {
      console.error('Error iniciando sesión con Facebook:', error)
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
      // Obtener datos existentes si los hay
      const snapshot = await get(userRef)
      const existingData = snapshot.exists() ? snapshot.val() : {}

      // Filtrar propiedades con valores undefined
      const cleanUserData: Partial<UserData> = {}
      for (const key in userData) {
        if (userData[key] !== undefined) {
          cleanUserData[key] = userData[key]
        }
      }

      // Combinar datos existentes con nuevos datos
      await set(userRef, {
        ...existingData,
        ...cleanUserData,
      })
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
   * Envía un correo para restablecer la contraseña
   */
  async resetPassword(email: string): Promise<void> {
    const auth = this.getAuthInstance()

    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Error enviando correo de recuperación:', error)
      throw error
    }
  }

  /**
   * Suscribe a cambios en el estado de autenticación
   * @param callback Función a ejecutar cuando cambia el estado de autenticación
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
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
      const usersRef = ref(db, 'users')
      const snapshot = await get(usersRef)

      if (snapshot.exists()) {
        const users = snapshot.val()
        for (const userId in users) {
          const userData = users[userId]
          if (
            userData &&
            userData.userName &&
            userData.userName.toLowerCase() === username.toLowerCase()
          ) {
            // Incluir el ID del usuario en el objeto de retorno
            return {
              ...userData,
              uid: userId, // Aseguramos que el uid esté incluido
            }
          }
        }
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
      console.error('Error al verificar si es admin:', error)
      return false
    }
  }

  /**
   * Verifica si un email está en la lista de administradores
   */
  isAdminEmail(email: string): boolean {
    return this.adminEmails.includes(email.toLowerCase())
  }
}
