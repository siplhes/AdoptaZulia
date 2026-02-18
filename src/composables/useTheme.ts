import { ref, onMounted } from 'vue'

const isDark = ref(false)

export function useTheme() {
  
  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
  }

  function applyTheme() {
    document.body.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  function initTheme() {
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    }
    applyTheme()
  }

  // Initialize on import (singleton-ish behavior validation/init)
  // We'll call init in App.vue or similar, but calling it here ensures state is synced
  
  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
