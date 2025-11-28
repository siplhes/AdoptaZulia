import { ref } from 'vue'
import {
  getDatabase,
  ref as dbRef,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
} from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser as firebaseDeleteUser,
  type UserCredential,
} from 'firebase/auth'
import type { UserProfile, UserData } from '~/models/User'
import { useAuth } from '~/composables/useAuth'

export function useUsers() {
  const users = ref<UserProfile[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Usamos el composable de autenticación para verificar permisos de administrador
  const { isAdmin } = useAuth()

  /**
   * Verifica si el usuario actual tiene permisos de administrador
   * @returns {boolean} true si es administrador, false en caso contrario
   */
  function checkAdminPermission(): boolean {
    if (!isAdmin.value) {
      error.value = 'No tienes permisos para realizar esta operación. Se requiere rol de administrador.'
      console.error('Intento de acceso a funcionalidad administrativa sin permisos')
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

      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const usersRef = dbRef(db, 'users')

      // Obtenemos los usuarios
      const snapshot = await get(usersRef)

      if (snapshot.exists()) {
        const usersData: UserProfile[] = []
        const rawData = snapshot.val()

        // Convertimos los datos en un array y añadimos el ID
        for (const [id, data] of Object.entries(rawData)) {
          const userData = data as any
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
            postCount: await fetchUserPostCount(id, db),
          })
        }

        users.value = usersData
        return usersData
      } else {
        users.value = []
        return []
      }
    } catch (err: any) {
      console.error('Error al obtener usuarios:', err)
      error.value = 'Error al cargar usuarios. Por favor, intenta de nuevo.'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene el número de publicaciones de un usuario
   */
  async function fetchUserPostCount(userId: string, db: any): Promise<number> {
    try {
      // Consulta para obtener mascotas publicadas por el usuario
      const petsRef = dbRef(db, 'pets')
      const userPetsQuery = query(petsRef, orderByChild('userId'))

      const snapshot = await get(userPetsQuery)

      if (snapshot.exists()) {
        // Filtramos las mascotas del usuario específico
        const pets = Object.values(snapshot.val() || {}).filter((pet: any) => pet.userId === userId)
        return pets.length
      }

      return 0
    } catch (error) {
      console.error(`Error al obtener publicaciones del usuario ${userId}:`, error)
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
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const userRef = dbRef(db, `users/${userId}`)

      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const userData = snapshot.val()

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
          postCount: await fetchUserPostCount(userId, db),
        }

        return userProfile
      } else {
        error.value = 'Usuario no encontrado'
        return null
      }
    } catch (err: any) {
      console.error(`Error al obtener usuario ${userId}:`, err)
      error.value = 'Error al cargar usuario. Por favor, intenta de nuevo.'
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
      const userRef = dbRef(db, `users/${user.uid}`)

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

      await set(userRef, additionalData)

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
      console.error('Error al crear usuario:', err)

      // Manejar errores específicos de Firebase Auth
      if (err.code === 'auth/email-already-in-use') {
        error.value = 'El correo electrónico ya está en uso.'
      } else if (err.code === 'auth/invalid-email') {
        error.value = 'El formato del correo electrónico no es válido.'
      } else if (err.code === 'auth/weak-password') {
        error.value = 'La contraseña debe tener al menos 6 caracteres.'
      } else {
        error.value = 'Error al crear usuario. Por favor, intenta de nuevo.'
      }

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

      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const userRef = dbRef(db, `users/${userId}`)

      // Solo actualizamos los campos proporcionados
      const updateData: any = {}

      if (userData.displayName !== undefined) updateData.displayName = userData.displayName
      if (userData.photoURL !== undefined) updateData.photoURL = userData.photoURL
      if (userData.role !== undefined) updateData.role = userData.role
      if (userData.status !== undefined) updateData.status = userData.status
      if (userData.phone !== undefined) updateData.phoneNumber = userData.phone
      if (userData.address !== undefined) updateData.address = userData.address

      // Actualizar en la base de datos
      await update(userRef, updateData)

      // Actualizar el estado local
      const index = users.value.findIndex((u) => u.id === userId)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          ...updateData,
          phone: updateData.phoneNumber || users.value[index].phone,
        }
      }

      return true
    } catch (err: any) {
      console.error(`Error al actualizar usuario (${userId}):`, err)
      error.value = 'Error al actualizar usuario. Por favor, intenta de nuevo.'
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

      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const userRef = dbRef(db, `users/${userId}`)

      // Eliminamos de Realtime Database
      await remove(userRef)

      // Nota: No podemos eliminar el usuario de Firebase Auth directamente
      // desde el cliente debido a restricciones de seguridad

      // Actualizar el estado local
      users.value = users.value.filter((u) => u.id !== userId)

      return true
    } catch (err: any) {
      console.error(`Error al eliminar usuario (${userId}):`, err)
      error.value = 'Error al eliminar usuario. Por favor, intenta de nuevo.'
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
