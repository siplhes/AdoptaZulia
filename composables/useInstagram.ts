import { ref } from 'vue'
import { useSecureLogger } from './useSecureLogger'

interface InstagramPublishPayload {
  imageUrl: string
  caption: string
}

interface PetDataForCaption {
  name: string
  type?: string
  age?: string
  ageValue?: string
  gender?: string
  location?: string
  description?: string
  url?: string
}

export function useInstagram() {
  const { error: logError } = useSecureLogger()
  const publishing = ref(false)

  async function publishToInstagram(payload: InstagramPublishPayload): Promise<boolean> {
    publishing.value = true
    try {
      await $fetch('/api/instagram/publish', {
        method: 'POST',
        body: payload,
      })
      return true
    } catch (err: any) {
      logError('Error publicando en Instagram:', err)
      return false
    } finally {
      publishing.value = false
    }
  }

  function generateCaption(pet: PetDataForCaption): string {
    const tags = ['#AdoptaZulia', '#Maracaibo', '#AdopcionResponsable']

    if (pet.type?.toLowerCase().includes('perro')) tags.push('#AdoptaUnPerro', '#PerroEnAdopcion')
    if (pet.type?.toLowerCase().includes('gato')) tags.push('#AdoptaUnGato', '#GatoEnAdopcion')
    if (pet.gender === 'macho') tags.push('#Macho')
    if (pet.gender === 'hembra') tags.push('#Hembra')

    const lines: string[] = [
      '🐾 ¡Nueva mascota en adopción!',
      '',
      `✨ ${pet.name} te está esperando.`,
    ]

    if (pet.type) lines.push(`🐕 Tipo: ${pet.type}`)
    if (pet.age || pet.ageValue) lines.push(`🎂 Edad: ${pet.age || pet.ageValue}`)
    if (pet.location) lines.push(`📍 Ubicación: ${pet.location}`)

    lines.push('')

    if (pet.description) {
      const shortDesc = pet.description.length > 200
        ? pet.description.slice(0, 197) + '...'
        : pet.description
      lines.push(shortDesc)
      lines.push('')
    }

    if (pet.url) {
      lines.push(`🏠 Conoce más y adopta: ${pet.url}`)
      lines.push('')
    }

    lines.push(tags.join(' '))

    return lines.join('\n')
  }

  return {
    publishing,
    publishToInstagram,
    generateCaption,
  }
}
