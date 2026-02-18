import { ref, computed } from 'vue'
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  type User as FirebaseUser,
  type UserInfo,
} from 'firebase/auth'
import { getFirebaseApp } from '@/config/firebase'
import { AuthService } from '@/services/AuthService'
import type { UserProfile, UserData } from '@/models/User'
import { useSecureLogger } from '@/composables/useSecureLogger'
import { useRouter } from 'vue-router'

type User = UserInfo & {
  uid: string
  email: string | null
  userName?: string
  displayName: string | null
  emailVerified: boolean
  isAnonymous: boolean
  metadata?: {
    creationTime?: string
    lastSignInTime?: string
  }
  providerData: UserInfo[]
  refreshToken: string
}

const user = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const isAdmin = ref(false)
const needsProfileCompletion = ref(false)
let unsubscribeAuth: (() => void) | null = null
let isInitialized = false

// Promise that resolves when initial auth state is determined
let authReadyResolve: (() => void) | null = null
const authReady = new Promise<void>((resolve) => {
  authReadyResolve = resolve
})

// Configure global persistence before any auth operations
async function configurePersistence() {
  try {
    const firebaseApp = getFirebaseApp()
    const auth = getAuth(firebaseApp)
    await setPersistence(auth, browserLocalPersistence)
  } catch (err) {
    console.error('Error configuring auth persistence:', err)
  }
}

function initializeAuth() {
  if (isInitialized) return
  const { error: logError } = useSecureLogger()

  // Configure persistence first
  configurePersistence()

  try {
    const authService = new AuthService()
    let isFirstCall = true

    unsubscribeAuth = authService.onAuthStateChanged(async (currentUser: any) => {
      user.value = currentUser
      if (currentUser) {
        try {
          isAdmin.value =
            (await authService.isAdmin(currentUser.uid)) ||
            authService.isAdminEmail(currentUser.email || '')
          const rtdbProfile = await authService.getUserProfile(currentUser.uid)
          userProfile.value = {
            id: currentUser.uid, // Compat with App model
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            userName: rtdbProfile?.userName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            isAdmin: isAdmin.value,
            ...rtdbProfile,
          }
          needsProfileCompletion.value = !userProfile.value.userName
        } catch (err) {
          logError('Error al cargar perfil completo:', err)
          userProfile.value = {
            id: currentUser.uid,
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            userName: '',
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            isAdmin: isAdmin.value,
          }
          needsProfileCompletion.value = true
        }
      } else {
        userProfile.value = null
        isAdmin.value = false
        needsProfileCompletion.value = false
      }

      // Resolve authReady promise on first auth state determination
      if (isFirstCall && authReadyResolve) {
        authReadyResolve()
        isFirstCall = false
      }
    })
    isInitialized = true
  } catch (err) {
    const { error: logError } = useSecureLogger()
    logError('Error al inicializar autenticación:', err)
    // Resolve even on error so middleware doesn't hang
    if (authReadyResolve) authReadyResolve()
  }
}

export function useAuth() {
  const router = useRouter()
  const { error: logError, warn } = useSecureLogger()

  if (!isInitialized) {
    initializeAuth()
  }

  const authService = new AuthService()
  const isAuthenticated = computed(() => !!user.value)
  // Ensure we expose a standard user ref that matches expectations
  const currentUser = computed(() => user.value)

  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const authUser = await authService.loginWithGoogle()
      user.value = authUser as User
      if (user.value) {
        isAdmin.value =
          (await authService.isAdmin(user.value.uid)) ||
          authService.isAdminEmail(user.value.email || '')
        const rtdbProfile = await authService.getUserProfile(user.value.uid)
        userProfile.value = {
          id: user.value.uid,
          uid: user.value.uid,
          displayName: user.value.displayName || '',
          email: user.value.email,
          photoURL: user.value.photoURL || null,
          isAdmin: isAdmin.value,
          ...(rtdbProfile || {}),
        }
        needsProfileCompletion.value = !rtdbProfile?.userName
      }
      return true
    } catch (err: any) {
      logError('Error al iniciar sesión con Google:', err)
      error.value = getErrorMessage(err.code)
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    try {
      await authService.signOut()
      user.value = null
      userProfile.value = null
      isAdmin.value = false
      needsProfileCompletion.value = false
      // Redirect to welcome/login after successful logout
      try {
        router?.push('/login')
      } catch (err) {
        warn('Logout: unable to navigate', err)
      }
      return true
    } catch (err: any) {
      logError('Error al cerrar sesión:', err)
      error.value = 'Error al cerrar sesión'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(
    displayName?: string,
    photoURL?: string,
    bio?: string,
    phoneNumber?: string,
    userName?: string
  ) {
    loading.value = true
    error.value = null
    try {
      await authService.updateUserProfile(displayName, photoURL, bio, phoneNumber, userName)
      if (userProfile.value) {
        userProfile.value = {
          ...userProfile.value,
          displayName: displayName || userProfile.value.displayName,
          photoURL: photoURL || userProfile.value.photoURL,
          bio: bio || userProfile.value.bio,
          phoneNumber: phoneNumber || userProfile.value.phoneNumber,
          userName: userName || userProfile.value.userName,
        }
      }
      if (userName) {
        needsProfileCompletion.value = false
      }
      return true
    } catch (err: any) {
      logError('Error al actualizar perfil:', err)
      error.value = 'Error al actualizar el perfil'
      return false
    } finally {
      loading.value = false
    }
  }

  function isLoggedIn() {
    return !!user.value
  }

  function getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Email inválido',
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Esta cuenta de usuario ha sido deshabilitada',
      'auth/operation-not-allowed': 'Esta operación no está permitida',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/popup-closed-by-user': 'Ventana de inicio cerrada',
      'auth/popup-blocked': 'El navegador ha bloqueado la ventana emergente',
      'auth/account-exists-with-different-credential':
        'Ya existe una cuenta con el mismo email pero diferentes credenciales',
    }
    return messages[code] || `Error: ${code}`
  }

  async function getUserByUsername(username: string) {
    loading.value = true
    error.value = null
    try {
      const userData = await authService.getUserByUsername(username)

      if (userData) {
        return {
          ...userData,
          uid: userData.uid || '',
          displayName: userData.displayName || '',
          email: userData.email || null,
          photoURL: userData.photoURL || null,
          userName: userData.userName || username,
        }
      }
      return null
    } catch (err: any) {
      logError('Error al buscar usuario por nombre de usuario:', err)
      error.value = 'Error al buscar usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  async function getCurrentUserData(): Promise<UserData | null> {
    loading.value = true
    error.value = null

    try {
      if (!user.value) return null

      // Get user data from database (using getUserProfile from service which gets by ID)
      const userData = await authService.getUserProfile(user.value.uid)

      if (!userData) return null

      // Combine auth profile with database data
      return {
        ...userData,
        uid: user.value.uid,
        id: user.value.uid, // Compat
        email: user.value.email || userData.email || null,
        displayName: user.value.displayName || userData.displayName || '',
        photoURL: user.value.photoURL || userData.photoURL || null,
        isAdmin: isAdmin.value,
        userName: userData.userName || userProfile.value?.userName || '',
        bio: userData.bio || userProfile.value?.bio || '',
        phoneNumber: userData.phoneNumber || userProfile.value?.phoneNumber || '',
        createdAt: userData.createdAt || userProfile.value?.createdAt || 0,
      } as UserData
    } catch (err: any) {
      logError('Error al obtener datos completos del usuario:', err)
      error.value = 'Error al recuperar información del usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  async function waitForAuth(): Promise<void> {
    await authReady
  }

  // Init auth function exposed for manual init if needed options
  function initAuth() {
    initializeAuth()
  }

  // Register is simpler in App usually, but AuthService supports updateProfile.
  // Standard register with email/pass is not in AuthService Web (it focuses on Google/Profile),
  // but App useAuth has 'register'.
  // I will keep the 'register' function from previous App useAuth if beneficial, or rely on AuthService if proper.
  // Web AuthService DOES NOT have registerWithEmailAndPassword. Web seems to rely on Google Auth mostly?
  // Checking Web useAuth... it doesn't have register function! It only has loginWithGoogle.
  // App HAD register. I should probably keep it for App compatibility if UI uses it.
  // The App's RegisterPage.vue uses `register(name, email, password)`.
  // So I MUST implement `register`. I'll use firebase direct calls for this specific part or add it to AuthService.
  // For now I'll implement it here using standard firebase auth, similar to previous version.

  async function register(email: string, password: string, displayName: string) {
    error.value = null
    loading.value = true
    try {
      const { createUserWithEmailAndPassword, updateProfile: updateAuthProfile } = await import('firebase/auth')
      const auth = getAuth(getFirebaseApp())
      const result = await createUserWithEmailAndPassword(auth, email, password)

      await updateAuthProfile(result.user, { displayName })

      const profile: UserProfile = {
        id: result.user.uid,
        uid: result.user.uid,
        displayName,
        email,
        role: 'user',
        status: 'active',
        createdAt: Date.now(),
        lastLogin: Date.now(),
        postCount: 0,
      }

      // We can use authService to save user data
      // AuthService has saveUserData private... but updateProfile public.
      // Or we can use direct update like previous `setData`.
      // Let's use `updateUserProfile` from AuthService if possible, but it relies on currentUser.
      // After create, currentUser is set.
      // Better to use `setData` from firebase.ts directly or expose save in Service.
      // I'll use `authService.updateUserProfile` partially or just direct DB for now to keep it working.
      // Previous App used `setData`.
      const { setData } = await import('@/config/firebase')
      await setData(`users/${result.user.uid}`, profile)
      userProfile.value = profile

      return result.user
    } catch (e: any) {
      error.value = getErrorMessage(e.code)
      throw e
    } finally {
      loading.value = false
    }
  }

    async function login(email: string, password: string) {
    error.value = null
    loading.value = true
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const auth = getAuth(getFirebaseApp())
      const result = await signInWithEmailAndPassword(auth, email, password)
      
       // Updates last login
       const { updateData } = await import('@/config/firebase')
       await updateData(`users/${result.user.uid}`, { lastLogin: Date.now() })
       
      return result.user
    } catch (e: any) {
      error.value = getErrorMessage(e.code)
      throw e
    } finally {
      loading.value = false
    }
  }


  return {
    currentUser, // Exposing as Ref to match previous API
    user,
    userProfile,
    loading,
    error,
    isAdmin,
    isAuthenticated,
    needsProfileCompletion,
    loginWithGoogle,
    login, // Added back for App compatibility
    register, // Added back for App compatibility
    logout,
    updateProfile,
    isLoggedIn,
    getUserByUsername,
    getCurrentUserData,
    waitForAuth,
    initAuth,
  }
}
