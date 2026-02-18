import { ref, watch } from 'vue'

const FAVORITES_KEY = 'adopta_zulia_favorites'

const favorites = ref<string[]>([])

// Load initial state
const stored = localStorage.getItem(FAVORITES_KEY)
if (stored) {
  try {
    favorites.value = JSON.parse(stored)
  } catch (e) {
    console.error('Error parsing favorites', e)
  }
}

// Watch and save
watch(favorites, (newVal) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(newVal))
}, { deep: true })

export function useFavorites() {
  function toggleFavorite(petId?: string) {
    if (!petId) return
    const index = favorites.value.indexOf(petId)
    if (index === -1) {
      favorites.value.push(petId)
    } else {
      favorites.value.splice(index, 1)
    }
  }

  function isFavorite(petId?: string) {
    if (!petId) return false
    return favorites.value.includes(petId)
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite
  }
}
