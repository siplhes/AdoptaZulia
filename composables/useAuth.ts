import { ref, computed } from 'vue'
import type { UserInfo } from 'firebase/auth'
import { AuthService } from '~/services/AuthService'
import { useNuxtApp } from '#app'
import type { UserProfile, UserData } from '~/models/User'

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
  try {
    const authService = new AuthService()
    unsubscribeAuth = authService.onAuthStateChanged(async (currentUser) => {
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
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            isAdmin: isAdmin.value,
            ...rtdbProfile,
          }
          needsProfileCompletion.value = !userProfile.value.userName
        } catch (err) {
          console.error('Error al cargar perfil completo:', err)
          userProfile.value = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
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
    console.error('Error al inicializar autenticación:', err)
  }
}
export function useAuth() {
  const nuxtApp = useNuxtApp()
  if (import.meta.client && !isInitialized) {
    setTimeout(() => {
      initializeAuth()
    }, 100)
  }
  const authService = new AuthService()
  const isAuthenticated = computed(() => !!user.value)
  async function register(email: string, password: string, displayName: string, userName: string) {
    loading.value = true
    error.value = null
    try {
      user.value = await authService.register(email, password, displayName, userName)
      return true
    } catch (err: any) {
      console.error('Error al registrar usuario:', err)
      error.value = traducirErrorFirebase(err.code)
      return false
    } finally {
      loading.value = false
    }
  }
  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      user.value = await authService.login(email, password)
      if (user.value) {
        isAdmin.value =
          (await authService.isAdmin(user.value.uid)) ||
          authService.isAdminEmail(user.value.email || '')
        const rtdbProfile = await authService.getUserProfile(user.value.uid)
        userProfile.value = {
          uid: user.value.uid,
          displayName: user.value.displayName,
          email: user.value.email,
          photoURL: user.value.photoURL,
          isAdmin: isAdmin.value,
          ...rtdbProfile,
        }
        needsProfileCompletion.value = !rtdbProfile?.userName
      }

      return true
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err)
      error.value = traducirErrorFirebase(err.code)
      return false
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      user.value = await authService.loginWithGoogle()
      if (user.value) {
        isAdmin.value =
          (await authService.isAdmin(user.value.uid)) ||
          authService.isAdminEmail(user.value.email || '')
        const rtdbProfile = await authService.getUserProfile(user.value.uid)
        userProfile.value = {
          uid: user.value.uid,
          displayName: user.value.displayName,
          email: user.value.email,
          photoURL: user.value.photoURL,
          isAdmin: isAdmin.value,
          ...rtdbProfile,
        }
        needsProfileCompletion.value = !rtdbProfile?.userName
      }
      return true
    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err)
      error.value = traducirErrorFirebase(err.code)
      return false
    } finally {
      loading.value = false
    }
  }
  async function loginWithFacebook() {
    loading.value = true
    error.value = null
    try {
      user.value = await authService.loginWithFacebook()
      if (user.value) {
        isAdmin.value =
          (await authService.isAdmin(user.value.uid)) ||
          authService.isAdminEmail(user.value.email || '')
        const rtdbProfile = await authService.getUserProfile(user.value.uid)
        userProfile.value = {
          uid: user.value.uid,
          displayName: user.value.displayName,
          email: user.value.email,
          photoURL: user.value.photoURL,
          isAdmin: isAdmin.value,
          ...rtdbProfile,
        }
        needsProfileCompletion.value = !rtdbProfile?.userName
      }
      return true
    } catch (err: any) {
      console.error('Error al iniciar sesión con Facebook:', err)
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
      return true
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err)
      error.value = 'Error al cerrar sesión'
      return false
    } finally {
      loading.value = false
    }
  }
  async function resetPassword(email: string) {
    loading.value = true
    error.value = null
    try {
      await authService.resetPassword(email)
      return true
    } catch (err: any) {
      console.error('Error al restablecer contraseña:', err)
      error.value = traducirErrorFirebase(err.code)
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
      console.error('Error al actualizar perfil:', err)
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
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta'
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres'
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
      return await authService.getUserByUsername(username)
    } catch (err: any) {
      console.error('Error al buscar usuario por nombre de usuario:', err)
      error.value = 'Error al buscar usuario'
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
    register,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    resetPassword,
    updateProfile,
    isLoggedIn,
    getUserByUsername,
  }
}
