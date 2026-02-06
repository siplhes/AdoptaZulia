/* eslint-disable @typescript-eslint/no-explicit-any */

import { ref, computed } from 'vue'
import type { UserInfo } from 'firebase/auth'
import { AuthService } from '~/services/AuthService'
import { useNuxtApp } from '#app'
import type { UserProfile, UserData } from '~/models/User'
import { useSecureLogger } from '~/composables/useSecureLogger'

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



function initializeAuth() {
  if (isInitialized || !import.meta.client) return
  const { error: logError } = useSecureLogger()
  try {
    const authService = new AuthService()
    unsubscribeAuth = authService.onAuthStateChanged(async (currentUser: any) => {
      user.value = currentUser
      if (currentUser) {
        try {
          isAdmin.value =
            (await authService.isAdmin(currentUser.uid)) ||
            authService.isAdminEmail(currentUser.email || '')
          const rtdbProfile = await authService.getUserProfile(currentUser.uid)
          userProfile.value = {
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
    })
    isInitialized = true
  } catch (err) {
    const { error: logError } = useSecureLogger()
    logError('Error al inicializar autenticación:', err)
  }
}

export function useAuth() {
  const nuxtApp = useNuxtApp()
  const { error: logError, warn } = useSecureLogger()
  // Initialize auth immediately on client so onAuthStateChanged is registered
  // before page components run their onMounted checks. The previous 100ms
  // delay could cause pages to redirect to /login before auth state was known.
  if (import.meta.client && !isInitialized) {
    initializeAuth()
  }
  const authService = new AuthService()
  const isAuthenticated = computed(() => !!user.value)



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
      error.value = traducirErrorFirebase(err.code)
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
      // Redirect to home after successful logout
      try {
        nuxtApp?.$router?.push('/')
      } catch (err) {
        // Ignore navigation errors in environments without router
        warn('Logout: unable to navigate to home', err)
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
  function traducirErrorFirebase(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está en uso por otra cuenta'
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido'
      case 'auth/user-disabled':
        return 'Esta cuenta de usuario ha sido deshabilitada'
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico'
      case 'auth/operation-not-allowed':
        return 'Esta operación no está permitida'
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Inténtalo más tarde'
      case 'auth/account-exists-with-different-credential':
        return 'Ya existe una cuenta con el mismo correo electrónico pero con diferentes credenciales de inicio de sesión'
      case 'auth/popup-blocked':
        return 'El navegador ha bloqueado la ventana emergente. Por favor, permite ventanas emergentes para este sitio'
      case 'auth/popup-closed-by-user':
        return 'La ventana emergente fue cerrada antes de finalizar la operación'
      case 'auth/invalid-action-code':
        return 'El código de acción es inválido. Esto puede suceder si el código ha caducado o ya ha sido utilizado'
      case 'auth/missing-email':
        return 'Debes proporcionar un correo electrónico'
      default:
        return 'Error de autenticación: ' + errorCode
    }
  }
  async function getUserByUsername(username: string) {
    loading.value = true
    error.value = null
    try {
      const userData = await authService.getUserByUsername(username)

      if (userData) {
        // Asegurarnos de que todos los campos requeridos estén presentes
        return {
          ...userData,
          uid: userData.uid || '',
          displayName: userData.displayName || '',
          email: userData.email || null,
          photoURL: userData.photoURL || null,
          userName: userData.userName || username
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


  /**
   * Retrieves complete data for the currently authenticated user
   * Includes both auth profile data and any additional user data from the database
   * @returns {Promise<UserData | null>} Complete user data or null if not authenticated
   */
  async function getCurrentUserData(): Promise<UserData | null> {
    loading.value = true
    error.value = null

    try {
      if (!user.value) return null

      // Get user data from database
      const userData = await authService.getUserById(user.value.uid)

      if (!userData) return null

      // Combine auth profile with database data
      return {
        ...userData,
        uid: user.value.uid,
        email: user.value.email || userData.email || null,
        displayName: user.value.displayName || userData.displayName || '',
        photoURL: user.value.photoURL || userData.photoURL || null,
        isAdmin: isAdmin.value,
        userName: userData.userName || userProfile.value?.userName || '',
        // Asegurarse de que todos los campos opcionales estén definidos
        bio: userData.bio || userProfile.value?.bio || '',
        phoneNumber: userData.phoneNumber || userProfile.value?.phoneNumber || '',
        createdAt: userData.createdAt || userProfile.value?.createdAt || '',
      }
    } catch (err: any) {
      logError('Error al obtener datos completos del usuario:', err)
      error.value = 'Error al recuperar información del usuario'
      return null
    } finally {
      loading.value = false
    }
  }


  return {
    user,
    userProfile,
    loading,
    error,
    isAdmin,
    isAuthenticated,
    needsProfileCompletion,
    loginWithGoogle,
    logout,
    updateProfile,
    isLoggedIn,
    getUserByUsername,
    getCurrentUserData
  }
}
