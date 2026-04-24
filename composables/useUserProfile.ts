import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useAdoptions } from '~/composables/useAdoptions'

export function useUserProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const { fetchAdoptionsForOwner, fetchUserAdoptions } = useAdoptions()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const userProfile = ref<any>(null)
  const userPets = ref<any[]>([])
  const userLostReports = ref<any[]>([])
  const userStories = ref<any[]>([])
  const verifiedAdoptions = ref<any[]>([])
  const receivedAdoptions = ref<any[]>([])
  const sentAdoptions = ref<any[]>([])
  const activeTab = ref('pets')

  const isOwnProfile = computed(
    () => isAuthenticated.value && user.value?.uid === userProfile.value?.uid
  )

  const tabs = computed(() => {
    const baseTabs = [
      { id: 'pets', label: 'En Adopción' },
      { id: 'lost', label: 'Reportes Perdidos' },
      { id: 'stories', label: 'Historias' },
      { id: 'adopted', label: 'Adoptados' },
    ]

    if (isOwnProfile.value) {
      baseTabs.push({ id: 'received', label: 'Solicitudes Recibidas' })
      baseTabs.push({ id: 'sent', label: 'Solicitudes Enviadas' })
    }

    return baseTabs
  })

  const mappedUserLost = computed(() => {
    return userLostReports.value.map((r) => ({
      id: r.id,
      image: r.images?.[0] || r.image || '/placeholder.webp',
      name: r.name || 'Sin nombre',
      status: r.status || 'lost',
      createdAt: r.createdAt || r.lastSeenAt || Date.now(),
      breed: r.breed || null,
      age: r.age || null,
      location: r.location || null,
      urgent: r.urgent || false,
      vaccinated: false,
      neutered: false,
      size: r.size || null,
      gender: r.gender || null,
    }))
  })

  const getTabCount = (id: string) => {
    switch (id) {
      case 'pets':
        return userPets.value.length
      case 'lost':
        return userLostReports.value.length
      case 'stories':
        return userStories.value.length
      case 'adopted':
        return verifiedAdoptions.value.length
      case 'received':
        return receivedAdoptions.value.length
      case 'sent':
        return sentAdoptions.value.length
      default:
        return 0
    }
  }

  const verifiedCount = computed(() => verifiedAdoptions.value.length)

  async function loadProfile(username: string) {
    loading.value = true
    error.value = null

    try {
      const profileData = await $fetch(`/api/profile/${encodeURIComponent(username)}`)

      userProfile.value = profileData.userProfile
      userPets.value = profileData.pets || []
      userLostReports.value = profileData.lostReports || []
      userStories.value = profileData.stories || []
      verifiedAdoptions.value = profileData.verifiedAdoptions || []
      receivedAdoptions.value = []
      sentAdoptions.value = []

      const uid = userProfile.value?.uid
      if (user.value && uid && user.value.uid === uid) {
        const [received, sent] = await Promise.all([
          fetchAdoptionsForOwner(uid),
          fetchUserAdoptions(uid),
        ])
        receivedAdoptions.value = received || []
        sentAdoptions.value = sent || []
        verifiedAdoptions.value = (received || []).filter((a) => a.status === 'completed')
      }
    } catch (err: any) {
      console.error('loadProfile error:', err)
      if (err?.statusCode === 404 || err?.statusMessage === 'Perfil no encontrado') {
        error.value = 'Usuario no encontrado'
      } else {
        error.value = err?.message || 'Error cargando el perfil'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    userProfile,
    userPets,
    userLostReports,
    userStories,
    verifiedAdoptions,
    receivedAdoptions,
    sentAdoptions,
    activeTab,
    isOwnProfile,
    tabs,
    mappedUserLost,
    getTabCount,
    verifiedCount,
    loadProfile,
  }
}
