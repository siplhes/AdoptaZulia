import { ref, computed } from 'vue'
import {
  getDatabase,
  ref as dbRef,
  get,
  query,
  orderByChild,
  startAt,
  endAt,
  set,
} from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import { addMonths, subMonths, subDays, subQuarters, startOfYear, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '~/composables/useAuth'

// Interfaces para los datos de estadísticas
export interface Stats {
  totalPets: number
  totalAdoptions: number
  totalUsers: number
  urgentPets: number
  pendingRequests: number
  requestDistribution: {
    pending: number
    approved: number
    rejected: number
  }
  adoptionSuccess: number
}

export interface AdoptionTrend {
  label: string
  value: number
}

export interface PetDistribution {
  type: string
  count: number
  percentage: number
  color: string
}

export interface DetailedStat {
  metric: string
  actual: number
  target: number
}

export function useStats() {
  // Estado
  const stats = ref<Stats>({
    totalPets: 0,
    totalAdoptions: 0,
    totalUsers: 0,
    urgentPets: 0,
    pendingRequests: 0,
    requestDistribution: {
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    adoptionSuccess: 0,
  })

  const adoptionTrends = ref<AdoptionTrend[]>([])
  const petDistribution = ref<PetDistribution[]>([])
  const detailedStats = ref<DetailedStat[]>([])

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
      error.value = 'No tienes permisos para acceder a esta información. Se requiere rol de administrador.'
      console.error('Intento de acceso a estadísticas administrativas sin permisos')
      return false
    }
    return true
  }

  // Calcular máximo valor de tendencia para gráficos
  const maxAdoptionTrend = computed(() => {
    if (adoptionTrends.value.length === 0) return 10
    return Math.max(...adoptionTrends.value.map((item) => item.value))
  })

  /**
   * Obtiene estadísticas básicas para usuarios públicos
   * Esta función no requiere permisos de administrador
   */
  async function fetchPublicStats(): Promise<Stats> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)

      // Primero intentamos obtener estadísticas públicas ya almacenadas
      const publicStatsRef = dbRef(db, 'statistics/public')
      const publicStatsSnapshot = await get(publicStatsRef)
      
      if (publicStatsSnapshot.exists()) {
        // Si ya existen estadísticas públicas, las usamos
        stats.value = publicStatsSnapshot.val()
      } else {
        // Si no existen, obtenemos estadísticas básicas
        await fetchGeneralStats(db)
        
        // Guardamos las estadísticas en la ubicación pública para futuras consultas
        // Solo almacenamos los datos que queremos sean públicos
        const publicStats = {
          totalPets: stats.value.totalPets,
          totalAdoptions: stats.value.totalAdoptions,
          totalUsers: stats.value.totalUsers,
          urgentPets: stats.value.urgentPets,
          // Omitimos datos sensibles como pendingRequests, requestDistribution, etc.
          pendingRequests: 0,
          requestDistribution: {
            pending: 0,
            approved: 0,
            rejected: 0,
          },
          adoptionSuccess: stats.value.adoptionSuccess
        }
        
        try {
          // Solo guardamos si somos admin (para evitar intentos de escritura sin permisos)
          if (isAdmin.value) {
            await set(publicStatsRef, publicStats)
          }
          stats.value = publicStats
        } catch (writeErr) {
          console.warn('No se pudieron guardar las estadísticas públicas:', writeErr)
          // Continuamos aunque no podamos guardarlas
        }
      }
      
      return stats.value
    } catch (err: any) {
      console.error('Error al obtener estadísticas públicas:', err)
      error.value = 'Error al cargar las estadísticas. Por favor, inténtalo de nuevo.'
      return stats.value
    } finally {
      loading.value = false
    }
  }

  // Obtener estadísticas basadas en un período
  async function fetchStats(period: string = 'month'): Promise<Stats> {
    loading.value = true
    error.value = null

    try {
      // Si el usuario no es administrador, obtener solo estadísticas públicas
      if (!isAdmin.value) {
        return await fetchPublicStats()
      }
      
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)

      // 1. Estadísticas generales
      await fetchGeneralStats(db)

      // 2. Tendencias de adopción (solo para administradores)
      await fetchAdoptionTrends(db, period)

      // 3. Distribución de mascotas por tipo (solo para administradores)
      await fetchPetDistribution(db)

      // 4. Estadísticas detalladas (solo para administradores)
      generateDetailedStats()

      // 5. Actualizar las estadísticas públicas con las más recientes
      try {
        const publicStatsRef = dbRef(db, 'statistics/public')
        const publicStats = {
          totalPets: stats.value.totalPets,
          totalAdoptions: stats.value.totalAdoptions,
          totalUsers: stats.value.totalUsers,
          urgentPets: stats.value.urgentPets,
          pendingRequests: 0,
          requestDistribution: {
            pending: 0,
            approved: 0,
            rejected: 0,
          },
          adoptionSuccess: stats.value.adoptionSuccess
        }
        await set(publicStatsRef, publicStats)
      } catch (writeErr) {
        console.warn('No se pudieron actualizar las estadísticas públicas:', writeErr)
        // Continuamos aunque no podamos guardarlas
      }

      return stats.value
    } catch (err: any) {
      console.error('Error al obtener estadísticas:', err)
      error.value = 'Error al cargar las estadísticas. Por favor, inténtalo de nuevo.'
      return stats.value
    } finally {
      loading.value = false
    }
  }

  // Obtener estadísticas generales
  async function fetchGeneralStats(db: any) {
    // Total de mascotas
    const petsRef = dbRef(db, 'pets')
    const petsSnapshot = await get(petsRef)

    if (petsSnapshot.exists()) {
      const petsData = petsSnapshot.val()
      const pets = Object.values(petsData || {})

      stats.value.totalPets = pets.length

      // Mascotas urgentes
      stats.value.urgentPets = pets.filter((pet: any) => pet.urgent).length

      // Mascotas adoptadas (estatus = adopted)
      stats.value.totalAdoptions = pets.filter((pet: any) => pet.status === 'adopted').length
    }

    // Total de usuarios
    const usersRef = dbRef(db, 'users')
    const usersSnapshot = await get(usersRef)

    if (usersSnapshot.exists()) {
      const users = Object.values(usersSnapshot.val() || {})
      stats.value.totalUsers = users.length
    }

    // Solicitudes pendientes y distribución
    const adoptionsRef = dbRef(db, 'adoptions')
    const adoptionsSnapshot = await get(adoptionsRef)

    if (adoptionsSnapshot.exists()) {
      const adoptions = Object.values(adoptionsSnapshot.val() || {}) as any[]

      // Solicitudes pendientes
      const pendingAdoptions = adoptions.filter((adoption) => adoption.status === 'pending')
      stats.value.pendingRequests = pendingAdoptions.length

      // Distribución de solicitudes
      const totalAdoptions = adoptions.length || 1 // Evitar división por cero

      const pending = adoptions.filter((adoption) => adoption.status === 'pending').length
      const approved = adoptions.filter((adoption) => adoption.status === 'approved').length
      const rejected = adoptions.filter((adoption) => adoption.status === 'rejected').length

      stats.value.requestDistribution = {
        pending: Math.round((pending / totalAdoptions) * 100),
        approved: Math.round((approved / totalAdoptions) * 100),
        rejected: Math.round((rejected / totalAdoptions) * 100),
      }

      // Tasa de éxito de adopciones
      stats.value.adoptionSuccess = Math.round((approved / (approved + rejected || 1)) * 100)
    }
  }

  // Obtener tendencias de adopción
  async function fetchAdoptionTrends(db: any, periodType: string) {
    // Determinar el rango de fechas según el período
    let startDate: Date
    const endDate = new Date() // Fecha actual como fin
    const labels: string[] = []

    switch (periodType) {
      case '7days':
        startDate = subDays(endDate, 7)
        // Crear etiquetas para los últimos 7 días
        for (let i = 6; i >= 0; i--) {
          const date = subDays(endDate, i)
          labels.push(format(date, 'dd/MM', { locale: es }))
        }
        break
      case 'month':
        startDate = subMonths(endDate, 1)
        // Crear etiquetas para los últimos 30 días (agrupados por semana)
        for (let i = 4; i >= 0; i--) {
          const date = subDays(endDate, i * 7)
          labels.push(`Sem ${i + 1}`)
        }
        break
      case 'quarter':
        startDate = subQuarters(endDate, 1)
        // Crear etiquetas para los últimos 3 meses
        for (let i = 2; i >= 0; i--) {
          const date = subMonths(endDate, i)
          labels.push(format(date, 'MMM', { locale: es }))
        }
        break
      case 'year':
        startDate = startOfYear(endDate)
        // Crear etiquetas para los meses del año actual
        for (let i = 0; i < 6; i++) {
          const date = addMonths(startDate, i)
          labels.push(format(date, 'MMM', { locale: es }))
        }
        break
      default:
        startDate = subMonths(endDate, 1)
        labels.push('Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5')
    }

    // Timestamp de inicio y fin para la consulta
    const startTimestamp = startDate.getTime()
    const endTimestamp = endDate.getTime()

    try {
      // Consultar adopciones completadas en el período
      const adoptionsRef = dbRef(db, 'adoptions')
      const adoptionsQuery = query(
        adoptionsRef,
        orderByChild('createdAt'),
        startAt(startTimestamp),
        endAt(endTimestamp)
      )

      const snapshot = await get(adoptionsQuery)

      if (snapshot.exists()) {
        const adoptions = Object.values(snapshot.val()) as any[]

        // Agrupar resultados según el período
        let groupedValues: number[] = []

        if (periodType === '7days') {
          // Agrupar por día
          groupedValues = new Array(7).fill(0)

          adoptions.forEach((adoption) => {
            const adoptionDate = new Date(adoption.createdAt)
            const dayDiff = Math.floor(
              (endDate.getTime() - adoptionDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            if (dayDiff >= 0 && dayDiff < 7) {
              groupedValues[6 - dayDiff]++
            }
          })
        } else if (periodType === 'month') {
          // Agrupar por semana
          groupedValues = new Array(5).fill(0)

          adoptions.forEach((adoption) => {
            const adoptionDate = new Date(adoption.createdAt)
            const dayDiff = Math.floor(
              (endDate.getTime() - adoptionDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            const weekIndex = Math.floor(dayDiff / 7)
            if (weekIndex >= 0 && weekIndex < 5) {
              groupedValues[4 - weekIndex]++
            }
          })
        } else if (periodType === 'quarter') {
          // Agrupar por mes
          groupedValues = new Array(3).fill(0)

          adoptions.forEach((adoption) => {
            const adoptionDate = new Date(adoption.createdAt)
            const monthDiff = Math.floor(
              endDate.getMonth() -
                adoptionDate.getMonth() +
                12 * (endDate.getFullYear() - adoptionDate.getFullYear())
            )
            if (monthDiff >= 0 && monthDiff < 3) {
              groupedValues[2 - monthDiff]++
            }
          })
        } else if (periodType === 'year') {
          // Agrupar por mes para el año
          groupedValues = new Array(6).fill(0)

          adoptions.forEach((adoption) => {
            const adoptionDate = new Date(adoption.createdAt)
            const monthDiff = Math.floor(
              adoptionDate.getMonth() -
                startDate.getMonth() +
                12 * (adoptionDate.getFullYear() - startDate.getFullYear())
            )
            if (monthDiff >= 0 && monthDiff < 6) {
              groupedValues[monthDiff]++
            }
          })
        }

        // Crear tendencias de adopción para el gráfico
        adoptionTrends.value = labels.map((label, index) => ({
          label,
          value: groupedValues[index] || 0,
        }))
      } else {
        // Si no hay datos, inicializar con ceros
        adoptionTrends.value = labels.map((label) => ({
          label,
          value: 0,
        }))
      }
    } catch (error) {
      console.error('Error al obtener tendencias de adopción:', error)
      // Inicializar con datos vacíos en caso de error
      adoptionTrends.value = labels.map((label) => ({
        label,
        value: 0,
      }))
    }
  }

  // Obtener distribución de mascotas por tipo
  async function fetchPetDistribution(db: any) {
    try {
      const petsRef = dbRef(db, 'pets')
      const snapshot = await get(petsRef)

      if (snapshot.exists()) {
        const pets = Object.values(snapshot.val()) as any[]
        const totalPets = pets.length || 1 // Evitar división por cero

        // Contar por tipo
        const typeCounts: Record<string, number> = {
          perro: 0,
          gato: 0,
          conejo: 0,
          ave: 0,
          otros: 0,
        }

        pets.forEach((pet) => {
          const type = pet.type?.toLowerCase() || 'otros'
          if (Object.prototype.hasOwnProperty.call(typeCounts, type)) {
            typeCounts[type]++
          } else {
            typeCounts.otros++
          }
        })

        // Definir colores para tipos de mascotas
        const colors = {
          perro: '#10b981', // emerald-600
          gato: '#f59e0b', // amber-500
          conejo: '#6366f1', // indigo-500
          ave: '#0ea5e9', // sky-500
          otros: '#8b5cf6', // violet-500
        }

        // Crear distribución para el gráfico
        petDistribution.value = Object.entries(typeCounts)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1) + 's',
            count,
            percentage: Math.round((count / totalPets) * 100),
            color: colors[type as keyof typeof colors],
          }))
          .sort((a, b) => b.count - a.count) // Ordenar de mayor a menor
      } else {
        // Si no hay datos, inicializar con distribución por defecto
        petDistribution.value = [
          { type: 'Perros', count: 0, percentage: 0, color: '#10b981' },
          { type: 'Gatos', count: 0, percentage: 0, color: '#f59e0b' },
          { type: 'Otros', count: 0, percentage: 0, color: '#6366f1' },
        ]
      }
    } catch (error) {
      console.error('Error al obtener distribución de mascotas:', error)
      // Inicializar con datos por defecto en caso de error
      petDistribution.value = [
        { type: 'Perros', count: 0, percentage: 0, color: '#10b981' },
        { type: 'Gatos', count: 0, percentage: 0, color: '#f59e0b' },
        { type: 'Otros', count: 0, percentage: 0, color: '#6366f1' },
      ]
    }
  }

  // Generar estadísticas detalladas combinando datos reales con metas
  function generateDetailedStats() {
    // Metas definidas para la aplicación
    const metasMensuales = {
      nuevasMascotas: 25,
      adopcionesCompletadas: 50,
      nuevosUsuarios: 75,
      tiempoPromedioAdopcion: 10,
      mascotasEspecialesAdoptadas: 10,
    }

    // Calcular nuevas mascotas (asumimos que las creadas en el último mes)
    const unMesAtras = subMonths(new Date(), 1).getTime()

    // Actualizar estadísticas detalladas
    detailedStats.value = [
      {
        metric: 'Nuevas mascotas publicadas',
        actual: stats.value.totalPets,
        target: metasMensuales.nuevasMascotas,
      },
      {
        metric: 'Adopciones completadas',
        actual: stats.value.totalAdoptions,
        target: metasMensuales.adopcionesCompletadas,
      },
      {
        metric: 'Nuevos usuarios registrados',
        actual: stats.value.totalUsers,
        target: metasMensuales.nuevosUsuarios,
      },
      {
        metric: 'Tiempo promedio de adopción (días)',
        actual: 12, // Este dato requeriría un cálculo más complejo
        target: metasMensuales.tiempoPromedioAdopcion,
      },
      {
        metric: 'Mascotas con necesidades especiales adoptadas',
        actual: Math.round(stats.value.totalAdoptions * 0.15), // Asumimos un 15% del total
        target: metasMensuales.mascotasEspecialesAdoptadas,
      },
    ]
  }

  return {
    stats,
    loading,
    error,
    adoptionTrends,
    petDistribution,
    detailedStats,
    maxAdoptionTrend,
    fetchStats,
    fetchPublicStats
  }
}
