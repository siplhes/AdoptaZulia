<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="close"
    >
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h3 class="mb-4 text-2xl font-bold text-gray-900">{{ title }}</h3>
        <p class="mb-4 text-gray-600">{{ description }}</p>
        <div class="space-y-3">
          <button
            @click="shareToWhatsApp"
            class="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >
            <Icon name="logos:whatsapp-icon" class="h-5 w-5" />
            <span>WhatsApp</span>
          </button>
          <button
            @click="shareToFacebook"
            class="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            <Icon name="logos:facebook" class="h-5 w-5" />
            <span>Facebook</span>
          </button>
          <button
            @click="shareToTwitter"
            class="flex w-full items-center justify-center space-x-2 rounded-lg bg-sky-500 px-6 py-3 text-white hover:bg-sky-600"
          >
            <Icon name="logos:twitter" class="h-5 w-5" />
            <span>Twitter</span>
          </button>
          <button
            @click="copyLink"
            class="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <Icon name="heroicons:link" class="h-5 w-5" />
            <span>Copiar enlace</span>
          </button>
        </div>
        <button
          @click="close"
          class="mt-4 w-full rounded-lg bg-gray-100 px-6 py-3 text-gray-700 hover:bg-gray-200"
        >
          Cerrar
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  isOpen: boolean
  title: string
  description: string
  shareData: {
    title: string
    text: string
    url: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:isOpen', value: boolean): void
}>()

const { showToast } = useToast()

function close() {
  emit('close')
  emit('update:isOpen', false)
}

function copyLink() {
  navigator.clipboard.writeText(props.shareData.url)
  showToast('Enlace copiado al portapapeles', 'success')
}

function shareToWhatsApp() {
  const text = `${props.shareData.title}\n${props.shareData.text}\n${props.shareData.url}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

function shareToFacebook() {
  // Facebook sharer only takes the URL
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.shareData.url)}`,
    '_blank'
  )
}

function shareToTwitter() {
  const text = `${props.shareData.title} - ${props.shareData.text}`
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(props.shareData.url)}`,
    '_blank'
  )
}
</script>
