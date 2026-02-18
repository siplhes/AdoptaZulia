/**
 * Lost Pets Composable
 * Handles fetching, filtering, and CRUD for lost/found pets
 */

import { ref, computed } from 'vue'
import { fetchCollection, fetchDataWithId, pushData, updateData, deleteData } from '@/config/firebase'
import type { LostPet, CreateLostPetPayload, LostPetStatus } from '@/models/LostPet'

export function useLostPets() {
  const lostPets = ref<(LostPet & { id: string })[]>([])
  const currentLostPet = ref<(LostPet & { id: string }) | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const statusFilter = ref<LostPetStatus | 'all'>('all')

  const filteredLostPets = computed(() => {
    let result = [...lostPets.value]

    if (statusFilter.value !== 'all') {
      result = result.filter((p) => p.status === statusFilter.value)
    }

    return result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  })

  const activeLostPets = computed(() => {
    return lostPets.value
      .filter((p) => p.status === 'active')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  })

  async function loadLostPets() {
    loading.value = true
    error.value = null
    try {
      lostPets.value = await fetchCollection<LostPet>('lostPets')
    } catch (e: any) {
      error.value = 'Error al cargar mascotas perdidas'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function loadLostPet(id: string) {
    loading.value = true
    error.value = null
    try {
      currentLostPet.value = await fetchDataWithId<LostPet>(`lostPets/${id}`)
    } catch (e: any) {
      error.value = 'Error al cargar mascota perdida'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function createLostPet(payload: CreateLostPetPayload) {
    loading.value = true
    error.value = null
    try {
      const data: Omit<LostPet, 'id'> = {
        ...payload,
        identificationMarks: payload.identificationMarks || [],
        images: payload.images || [],
        status: 'active',
        urgencyLevel: payload.urgencyLevel || 'medium',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        views: 0,
        shares: 0,
      }

      const id = await pushData('lostPets', data)
      if (id) await loadLostPets()
      return id
    } catch (e: any) {
      error.value = 'Error al reportar mascota perdida'
      console.error(e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateLostPet(id: string, data: Partial<LostPet>) {
    loading.value = true
    error.value = null
    try {
      await updateData(`lostPets/${id}`, data)
      await loadLostPets()
      return true
    } catch (e: any) {
      error.value = 'Error al actualizar reporte'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteLostPet(id: string) {
    loading.value = true
    error.value = null
    try {
      await deleteData(`lostPets/${id}`)
      await loadLostPets()
      return true
    } catch (e: any) {
      error.value = 'Error al eliminar reporte'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    lostPets,
    currentLostPet,
    filteredLostPets,
    activeLostPets,
    loading,
    error,
    statusFilter,
    loadLostPets,
    loadLostPet,
    createLostPet,
    updateLostPet,
    deleteLostPet,
  }
}
