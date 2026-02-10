import { ref } from 'vue'
import { useFirebaseApp } from 'vuefire'
import { getDatabase, ref as fbRef, get, set, push, remove } from 'firebase/database'
import { useSecureLogger } from '~/composables/useSecureLogger'
import { fetchData, setData } from '~/utils/firebase'

export interface Report {
  id?: string
  type: 'pet' | 'user' | 'story' | 'comment'
  targetId: string
  reporterId: string
  reporterName?: string
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: number
  resolvedAt?: number
  resolvedBy?: string
  resolution?: string
}

export function useReports() {
  const reports = ref<Report[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { error: logError } = useSecureLogger()

  /**
   * Fetch all reports from Firebase
   */
  async function fetchReports(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const reportsData = await fetchData<Record<string, Report>>('reports')

      if (reportsData) {
        reports.value = Object.entries(reportsData).map(([id, data]) => ({
          ...data,
          id,
        }))
      } else {
        reports.value = []
      }
    } catch (err: any) {
      logError('Error fetching reports:', err)
      error.value = err.message || 'Error al cargar reportes'
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new report
   */
  async function createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<string | null> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const reportsRef = fbRef(db, 'reports')

      const newReport: Omit<Report, 'id'> = {
        ...reportData,
        status: 'pending',
        createdAt: Date.now(),
      }

      const newReportRef = push(reportsRef)
      await set(newReportRef, newReport)

      await fetchReports()
      return newReportRef.key
    } catch (err: any) {
      logError('Error creating report:', err)
      error.value = err.message || 'Error al crear reporte'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update report status
   */
  async function updateReportStatus(
    reportId: string,
    status: 'resolved' | 'dismissed',
    resolution?: string,
    resolvedBy?: string
  ): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const reportRef = fbRef(db, `reports/${reportId}`)

      const updates: Partial<Report> = {
        status,
        resolvedAt: Date.now(),
      }

      if (resolution) {
        updates.resolution = resolution
      }

      if (resolvedBy) {
        updates.resolvedBy = resolvedBy
      }

      await set(reportRef, { ...reports.value.find(r => r.id === reportId), ...updates })

      await fetchReports()
      return true
    } catch (err: any) {
      logError('Error updating report status:', err)
      error.value = err.message || 'Error al actualizar reporte'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a report
   */
  async function deleteReport(reportId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const firebaseApp = useFirebaseApp()
      const db = getDatabase(firebaseApp)
      const reportRef = fbRef(db, `reports/${reportId}`)

      await remove(reportRef)

      await fetchReports()
      return true
    } catch (err: any) {
      logError('Error deleting report:', err)
      error.value = err.message || 'Error al eliminar reporte'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Get report by ID
   */
  function getReportById(reportId: string): Report | undefined {
    return reports.value.find(r => r.id === reportId)
  }

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReportStatus,
    deleteReport,
    getReportById,
  }
}
