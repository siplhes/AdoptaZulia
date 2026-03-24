import { ref as vueRef } from 'vue'
import { getDatabase, ref as fbRef, query, orderByChild, limitToLast, get } from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import { useSecureLogger } from './useSecureLogger'

export interface Activity {
  type: string
  title: string
  description: string
  timestamp: number
  badge?: string
}

export function useActivityTimeline() {
  const activities = vueRef<Activity[]>([])
  const loading = vueRef(false)
  const error = vueRef<string | null>(null)
  const { error: logError } = useSecureLogger()

  async function fetchActivities() {
    loading.value = true
    error.value = null
    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const allActivities: Activity[] = []

      const fetchPromises = []

      // 1. Pets (type: 'pet')
      fetchPromises.push(
        get(query(fbRef(db, 'pets'), orderByChild('createdAt'), limitToLast(10))).then(snap => {
          if (snap.exists()) {
            const pets = Object.values(snap.val()) as any[]
            pets.forEach(pet => {
              if (!pet.isTest) {
                const tipo = pet.type ? pet.type.toLowerCase() : 'mascota'
                allActivities.push({
                  type: 'pet',
                  title: 'Nueva mascota publicada',
                  description: `${tipo === 'perro' ? 'Perro' : tipo === 'gato' ? 'Gato' : 'Mascota'} ${pet.name || ''} disponible`,
                  timestamp: pet.createdAt || Date.now()
                })
              }
            })
          }
        })
      )

      // 2. Users (type: 'user')
      fetchPromises.push(
        get(query(fbRef(db, 'users'), orderByChild('createdAt'), limitToLast(10))).then(snap => {
          if (snap.exists()) {
            const users = Object.values(snap.val()) as any[]
            users.forEach(user => {
              if (!user.isTest) {
                allActivities.push({
                  type: 'user',
                  title: 'Nuevo usuario',
                  description: `${user.displayName || 'Alguien'} se unió a la plataforma`,
                  timestamp: user.createdAt || Date.now()
                })
              }
            })
          }
        })
      )

      // 3. Adoptions (type: 'adoption')
      fetchPromises.push(
        get(query(fbRef(db, 'adoptions'), orderByChild('createdAt'), limitToLast(10))).then(snap => {
          if (snap.exists()) {
            const adoptions = Object.values(snap.val()) as any[]
            adoptions.forEach(adoption => {
              if (!adoption.isTest) {
                let badgeStr = 'Pendiente'
                if (adoption.status === 'approved') badgeStr = 'Aprobada'
                if (adoption.status === 'rejected') badgeStr = 'Rechazada'

                allActivities.push({
                  type: 'adoption',
                  title: 'Solicitud de adopción',
                  description: `Solicitud para ${adoption.petName || 'mascota'}`,
                  timestamp: adoption.createdAt || Date.now(),
                  badge: badgeStr
                })
              }
            })
          }
        })
      )

      // 4. Lost Pets (type: 'lost')
      fetchPromises.push(
        get(query(fbRef(db, 'lost_pets'), orderByChild('createdAt'), limitToLast(10))).then(snap => {
          if (snap.exists()) {
            const lostPets = Object.values(snap.val()) as any[]
            lostPets.forEach(pet => {
              if (!pet.isTest) {
                allActivities.push({
                  type: 'lost',
                  title: 'Mascota perdida',
                  description: `${pet.petName || 'Mascota'} perdida en ${pet.location?.address || 'ubicación desconocida'}`,
                  timestamp: pet.createdAt || Date.now(),
                  badge: pet.reward ? 'Recompensa' : undefined
                })
              }
            })
          }
        })
      )

      await Promise.all(fetchPromises)

      // Sort globally and take top 10
      allActivities.sort((a, b) => b.timestamp - a.timestamp)
      activities.value = allActivities.slice(0, 10)

    } catch (err: any) {
      logError('Error fetching activities:', err)
      error.value = 'Error cargando actividad reciente'
    } finally {
      loading.value = false
    }
  }

  return { activities, loading, error, fetchActivities }
}
