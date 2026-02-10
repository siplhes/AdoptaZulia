import { ref } from 'vue'
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser as firebaseDeleteUser,
  type UserCredential,
} from 'firebase/auth'
import { useFirebaseApp } from 'vuefire'
import type { UserProfile, UserData } from '~/models/User'
import { useAuth } from '~/composables/useAuth'
import { useSecureLogger } from '~/composables/useSecureLogger'
import { fetchData, updateData, deleteData, setData } from '~/utils/firebase'
import { handleFirebaseError } from '~/utils/errorHandler'

export function useUsers() {
  const users = ref<UserProfile[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { error: logError } = useSecureLogger()

  // Usamos el composable de autenticación para verificar permisos de administrador
  const { isAdmin } = useAuth()

  /**
   * Verifica si el usuario actual tiene permisos de administrador
   * @returns {boolean} true si es administrador, false en caso contrario
   */
  function checkAdminPermission(): boolean {
    if (!isAdmin.value) {
      error.value =
        'No tienes permisos para realizar esta operación. Se requiere rol de administrador.'
      logError('Intento de acceso a funcionalidad administrativa sin permisos')
      return false
    }
    return true
  }

  /**
   * Obtiene todos los usuarios registrados
   */
  async function fetchAllUsers(): Promise<UserProfile[]> {
    loading.value = true
    error.value = null

    try {
      // Verificar permisos de administrador
      if (!checkAdminPermission()) {
        return []
      }

      const rawData = await fetchData<Record<string, any>>('users')

      if (rawData) {
        const usersData: UserProfile[] = []

        // Convertimos los datos en un array y añadimos el ID
        for (const [id, userData] of Object.entries(rawData)) {
          usersData.push({
            id,
            displayName: userData.displayName || '',
            email: userData.email || '',
            photoURL: userData.photoURL || '',
            role: userData.role || 'user',
            status: userData.status || 'active',
            phone: userData.phoneNumber || userData.phone || '',
            address: userData.address || '',
            createdAt: userData.createdAt || 0,
            lastLogin: userData.lastLogin || 0,
            postCount: await fetchUserPostCount(id),
          })
        }

        users.value = usersData
        return usersData
      } else {
        users.value = []
        return []
      }
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError('Error al obtener usuarios:', err)
      error.value = errorMsg || 'Error al cargar usuarios'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene el número de publicaciones de un usuario
   */
  async function fetchUserPostCount(userId: string): Promise<number> {
    try {
      const allPets = await fetchData<Record<string, any>>('pets')

      if (allPets) {
        // Filtramos las mascotas del usuario específico
        const pets = Object.values(allPets).filter((pet: any) => pet.userId === userId)
        return pets.length
      }

      return 0
    } catch (error) {
      logError(`Error al obtener publicaciones del usuario ${userId}:`, error)
      return 0
    }
  }

  /**
   * Obtiene los datos de un usuario por su ID
   * Esta función no requiere permisos de administrador ya que se usa para mostrar
   * información de usuarios en solicitudes de adopción y otras partes de la aplicación
   */
  async function fetchUserById(userId: string): Promise<UserProfile | null> {
    loading.value = true
    error.value = null

    try {
      const userData = await fetchData<any>(`users/${userId}`)

      if (userData) {
        const userProfile: UserProfile = {
          id: userId,
          displayName: userData.displayName || '',
          email: userData.email || '',
          photoURL: userData.photoURL || '',
          role: userData.role || 'user',
          status: userData.status || 'active',
          phone: userData.phoneNumber || userData.phone || '',
          address: userData.address || '',
          createdAt: userData.createdAt || 0,
          lastLogin: userData.lastLogin || 0,
          postCount: await fetchUserPostCount(userId),
        }

        return userProfile
      } else {
        error.value = 'Usuario no encontrado'
        return null
      }
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError(`Error al obtener usuario ${userId}:`, err)
      error.value = errorMsg || 'Error al cargar usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async function createUser(
    userData: Partial<UserProfile> & { password: string }
  ): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      // Verificar permisos de administrador
      if (!checkAdminPermission()) {
        return null
      }

      const firebaseApp = useFirebaseApp()
      const auth = getAuth(firebaseApp)
      const db = getDatabase(firebaseApp)

      // Crear usuario en Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email!,
        userData.password
      )

      const user = userCredential.user

      // Actualizar perfil con displayName si existe
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName,
          photoURL: userData.photoURL || null,
        })
      }

      // Guardar datos adicionales en Realtime Database
      const additionalData = {
        email: userData.email || '',
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        role: userData.role || 'user',
        status: userData.status || 'active',
        phoneNumber: userData.phone || '',
        address: userData.address || '',
        createdAt: Date.now(),
        lastLogin: Date.now(),
      }

      await setData(`users/${user.uid}`, additionalData)

      // Actualizar el estado local
      const newUser: UserProfile = {
        id: user.uid,
        email: userData.email || '',
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        role: userData.role || 'user',
        status: userData.status || 'active',
        phone: userData.phone || '',
        address: userData.address || '',
        createdAt: Date.now(),
        lastLogin: Date.now(),
        postCount: 0,
      }

      users.value.push(newUser)

      return user.uid
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError('Error al crear usuario:', err)
      error.value = errorMsg || 'Error al crear usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza los datos de un usuario
   */
  async function updateUser(userId: string, userData: Partial<UserProfile>): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      // Verificar permisos de administrador
      if (!checkAdminPermission()) {
        return false
      }

      // Solo actualizamos los campos proporcionados
      const updatePayload: any = {}

      if (userData.displayName !== undefined) updatePayload.displayName = userData.displayName
      if (userData.photoURL !== undefined) updatePayload.photoURL = userData.photoURL
      if (userData.role !== undefined) updatePayload.role = userData.role
      if (userData.status !== undefined) updatePayload.status = userData.status
      if (userData.phone !== undefined) updatePayload.phoneNumber = userData.phone
      if (userData.address !== undefined) updatePayload.address = userData.address

      // Actualizar en la base de datos
      await updateData(`users/${userId}`, updatePayload)

      // Actualizar el estado local
      const index = users.value.findIndex((u) => u.id === userId)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          ...updatePayload,
          phone: updatePayload.phoneNumber || users.value[index].phone,
        }
      }

      return true
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError(`Error al actualizar usuario (${userId}):`, err)
      error.value = errorMsg || 'Error al actualizar usuario'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza el estado de un usuario
   */
  async function updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<boolean> {
    // Verificar permisos de administrador antes de continuar
    if (!checkAdminPermission()) {
      return false
    }

    return updateUser(userId, { status })
  }

  /**
   * Elimina un usuario
   * Nota: Eliminar usuarios de Firebase Auth requiere privilegios de administrador
   * y normalmente debe hacerse desde una función de Cloud Functions
   */
  async function deleteUser(userId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      // Verificar permisos de administrador
      if (!checkAdminPermission()) {
        return false
      }

      // Eliminamos de Realtime Database
      await deleteData(`users/${userId}`)

      // Nota: No podemos eliminar el usuario de Firebase Auth directamente
      // desde el cliente debido a restricciones de seguridad

      // Actualizar el estado local
      users.value = users.value.filter((u) => u.id !== userId)

      return true
    } catch (err: any) {
      const errorMsg = handleFirebaseError(err)
      logError(`Error al eliminar usuario (${userId}):`, err)
      error.value = errorMsg || 'Error al eliminar usuario'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    fetchUserById,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
  }
}
