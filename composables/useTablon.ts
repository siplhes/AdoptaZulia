import { ref } from 'vue'
import {
  getDatabase,
  ref as dbRef,
  push,
  set,
  get,
  remove,
  update,
  query,
  orderByChild,
} from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import { useAuth } from '~/composables/useAuth'
import { useSecureLogger } from '~/composables/useSecureLogger'
import { useAdminLogs } from '~/composables/useAdminLogs'

export interface TablonNoticia {
  id?: string
  title: string
  content: string
  imageUrl: string
  authorId: string
  authorName?: string
  createdAt: number
  updatedAt?: number
}

export interface TablonEvento {
  id?: string
  title: string
  description: string
  date: number
  location: string
  imageUrl: string
  authorId: string
  authorName?: string
  createdAt: number
  updatedAt?: number
  attendees?: Record<string, boolean>
}

export function useTablon() {
  const { user, isAdmin } = useAuth()
  const { error: logError } = useSecureLogger()
  const { logAction } = useAdminLogs()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const firebaseApp = useFirebaseApp()
  const db = getDatabase(firebaseApp)

  // NOTICIAS
  async function fetchNoticias(): Promise<TablonNoticia[]> {
    loading.value = true
    error.value = null
    try {
      const noticiasRef = query(dbRef(db, 'tablon/noticias'), orderByChild('createdAt'))
      const snapshot = await get(noticiasRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => b.createdAt - a.createdAt)
      }
      return []
    } catch (err: any) {
      logError('Error fetching noticias', err)
      error.value = 'No se pudieron cargar las noticias'
      return []
    } finally {
      loading.value = false
    }
  }

  async function getNoticiaById(id: string): Promise<TablonNoticia | null> {
    loading.value = true
    try {
      const noticiaRef = dbRef(db, `tablon/noticias/${id}`)
      const snapshot = await get(noticiaRef)
      if (snapshot.exists()) {
        return { id, ...snapshot.val() }
      }
      return null
    } catch (err: any) {
      logError('Error fetching noticia', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createNoticia(noticia: Omit<TablonNoticia, 'id' | 'createdAt' | 'authorId'>): Promise<string | null> {
    if (!isAdmin.value || !user.value) {
      console.warn('[useTablon] Intento de crear noticia sin permisos:', { isAdmin: isAdmin.value, user: user.value?.uid })
      error.value = 'No tienes permisos para crear noticias'
      return null
    }
    loading.value = true
    try {
      const noticiasRef = dbRef(db, 'tablon/noticias')
      const newNoticiaRef = push(noticiasRef)
      
      const newNoticia: TablonNoticia = {
        ...noticia,
        authorId: user.value.uid,
        authorName: user.value.displayName || 'Administrador',
        createdAt: Date.now(),
      }
      
      await set(newNoticiaRef, newNoticia)
      
      // Log administrativo
      await logAction('create', 'communication', `Publicó la noticia: ${noticia.title}`, { noticiaId: newNoticiaRef.key })
      
      return newNoticiaRef.key
    } catch (err: any) {
      logError('Error creating noticia', err)
      error.value = 'No se pudo publicar la noticia: ' + err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteNoticia(id: string): Promise<boolean> {
    if (!isAdmin.value) return false
    loading.value = true
    try {
      await remove(dbRef(db, `tablon/noticias/${id}`))
      await logAction('delete', 'communication', `Eliminó una noticia`, { noticiaId: id })
      return true
    } catch (err: any) {
      logError('Error deleting noticia', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // EVENTOS
  async function fetchEventos(): Promise<TablonEvento[]> {
    loading.value = true
    error.value = null
    try {
      const eventosRef = query(dbRef(db, 'tablon/eventos'), orderByChild('date'))
      const snapshot = await get(eventosRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => a.date - b.date)
      }
      return []
    } catch (err: any) {
      logError('Error fetching eventos', err)
      error.value = 'No se pudieron cargar los eventos'
      return []
    } finally {
      loading.value = false
    }
  }

  async function getEventoById(id: string): Promise<TablonEvento | null> {
    loading.value = true
    try {
      const eventoRef = dbRef(db, `tablon/eventos/${id}`)
      const snapshot = await get(eventoRef)
      if (snapshot.exists()) {
        return { id, ...snapshot.val() }
      }
      return null
    } catch (err: any) {
      logError('Error fetching evento', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createEvento(evento: Omit<TablonEvento, 'id' | 'createdAt' | 'authorId'>): Promise<string | null> {
    if (!isAdmin.value || !user.value) {
      console.warn('[useTablon] Intento de crear evento sin permisos:', { isAdmin: isAdmin.value, user: user.value?.uid })
      error.value = 'No tienes permisos para crear eventos'
      return null
    }
    loading.value = true
    try {
      const eventosRef = dbRef(db, 'tablon/eventos')
      const newEventoRef = push(eventosRef)
      
      const newEvento: TablonEvento = {
        ...evento,
        authorId: user.value.uid,
        authorName: user.value.displayName || 'Administrador',
        createdAt: Date.now(),
      }
      
      await set(newEventoRef, newEvento)
      
      // Log administrativo
      await logAction('create', 'communication', `Creó el evento: ${evento.title}`, { eventoId: newEventoRef.key })
      
      return newEventoRef.key
    } catch (err: any) {
      logError('Error creating evento', err)
      error.value = 'No se pudo crear el evento: ' + err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteEvento(id: string): Promise<boolean> {
    if (!isAdmin.value) return false
    loading.value = true
    try {
      await remove(dbRef(db, `tablon/eventos/${id}`))
      await logAction('delete', 'communication', `Eliminó un evento`, { eventoId: id })
      return true
    } catch (err: any) {
      logError('Error deleting evento', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function toggleAsistenciaEvento(eventoId: string): Promise<boolean> {
    if (!user.value) {
      error.value = 'Debes iniciar sesión para confirmar asistencia'
      return false
    }
    loading.value = true
    try {
      const userId = user.value.uid
      const asistenciaRef = dbRef(db, `tablon/eventos/${eventoId}/attendees/${userId}`)
      
      const snapshot = await get(asistenciaRef)
      if (snapshot.exists() && snapshot.val() === true) {
        await remove(asistenciaRef)
      } else {
        await set(asistenciaRef, true)
      }
      return true
    } catch (err: any) {
      logError('Error toggling asistencia', err)
      error.value = 'No se pudo actualizar tu asistencia'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    // Noticias
    fetchNoticias,
    getNoticiaById,
    createNoticia,
    deleteNoticia,
    // Eventos
    fetchEventos,
    getEventoById,
    createEvento,
    deleteEvento,
    toggleAsistenciaEvento,
  }
}
