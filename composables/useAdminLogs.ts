import { ref } from 'vue'
import { useAuth } from './useAuth'
import { useSecureLogger } from './useSecureLogger'
import { fetchData, pushData } from '~/utils/firebase'

export interface AdminLog {
  id?: string
  action: 'create' | 'update' | 'delete' | 'other'
  module: 'pets' | 'stories' | 'reports' | 'users' | 'communication' | 'config' | 'auth'
  details: string
  metadata?: Record<string, any>
  userId: string
  userName: string
  timestamp: number
}

export function useAdminLogs() {
  const { user } = useAuth()
  const { error: logError } = useSecureLogger()
  
  const logs = ref<AdminLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Registra una acción administrativa
   */
  const logAction = async (
    action: AdminLog['action'],
    module: AdminLog['module'],
    details: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!user.value) return

    try {
      const logEntry: AdminLog = {
        action,
        module,
        details,
        metadata,
        userId: user.value.uid,
        userName: user.value.displayName || user.value.email || 'Admin',
        timestamp: Date.now(),
      }

      await pushData('admin_logs', logEntry)
      return true
    } catch (err) {
      logError('Error creating admin log:', err)
      return false
    }
  }

  /**
   * Obtiene todos los logs de auditoría
   */
  const fetchLogs = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchData<Record<string, AdminLog>>('admin_logs')
      if (data) {
        logs.value = Object.entries(data)
          .map(([id, log]) => ({ ...log, id }))
          .sort((a, b) => b.timestamp - a.timestamp)
      } else {
        logs.value = []
      }
    } catch (err) {
      logError('Error fetching admin logs:', err)
      error.value = 'Error al cargar los logs'
    } finally {
      loading.value = false
    }
  }

  return {
    logs,
    loading,
    error,
    logAction,
    fetchLogs,
  }
}
