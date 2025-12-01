<template>
  <div class="mx-auto max-w-4xl transform-gpu px-4">
    <div id="lost-poster-root" class="bg-white shadow-xl rounded-lg overflow-hidden border-2 border-gray-200">
      <!-- Top red stripe (full width) -->
      <div class="bg-red-600 text-white text-center py-3 uppercase tracking-widest font-bold rounded-t-lg">SE BUSCA</div>

      <div class="md:grid md:grid-cols-2 md:gap-6">
        <!-- Main image / carousel (left column) -->
        <div class="bg-black relative image-col overflow-hidden">
          <div class="flex transition-transform duration-300" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
            <div v-for="(img, idx) in images" :key="idx" class="min-w-full">
              <img v-if="img" :src="img" :alt="name + ' ' + (idx+1)" class="w-full object-cover poster-image" />
              <div v-else class="w-full poster-image flex items-center justify-center bg-gray-100 text-gray-400">Sin imagen</div>
            </div>
            <div v-if="(!images || images.length === 0)" class="min-w-full">
              <div class="w-full poster-image flex items-center justify-center bg-gray-100 text-gray-400">Sin imagen</div>
            </div>
          </div>

          <!-- prev/next -->
          <button v-if="images && images.length > 1" @click="prev" class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-40 p-2 text-white">
            <Icon name="heroicons:chevron-left" class="h-5 w-5" />
          </button>
          <button v-if="images && images.length > 1" @click="next" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-40 p-2 text-white">
            <Icon name="heroicons:chevron-right" class="h-5 w-5" />
          </button>

          <!-- dots -->
          <div v-if="images && images.length > 1" class="absolute left-0 right-0 bottom-3 flex justify-center gap-2">
            <button v-for="(img, idx) in images" :key="idx" @click="goTo(idx)" :class="['h-2 w-8 rounded-full', currentIndex===idx ? 'bg-amber-300' : 'bg-gray-300']"></button>
          </div>
        </div>

        <!-- Description and details (right column on desktop) -->
        <div class="px-6 py-6 bg-white flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">{{ name }}</h2>
                <p class="text-sm text-gray-500">Reportada: {{ formatDate(createdAt) }}</p>
              </div>
              <div class="text-right">
                <span v-if="reward !== null" class="inline-block rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">Recompensa: ${{ formatReward(reward) }}</span>
              </div>
            </div>

            <div class="mt-4 text-gray-700 whitespace-pre-line">{{ description }}</div>

            <div class="mt-6 grid grid-cols-1 gap-4">
              <div>
                <p class="text-xs text-gray-500">Última vez vista</p>
                <p class="font-semibold text-gray-900">{{ location }} — {{ formatShortDate(lastSeenAt) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Contacto</p>
                <p class="font-semibold text-emerald-800 break-words">{{ contact }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <a v-if="contact" :href="`tel:${contact}`" class="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300">Llamar</a>
            <button @click="copyContact" class="mt-2 sm:mt-0 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-200">Copiar contacto</button>
            <button @click="printPoster" class="mt-2 sm:mt-0 ml-auto inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
              <Icon name="heroicons:printer" class="mr-2 h-4 w-4" /> Imprimir póster
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { ref } from 'vue'
const props = defineProps({
  name: { type: String, default: 'Mascota perdida' },
  images: { type: Array, default: () => [] },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  lastSeenAt: { type: [Number, String, null], default: null },
  contact: { type: String, default: '' },
  reward: { type: [Number, String, null], default: null },
  createdAt: { type: [Number, String, null], default: null },
})

const currentIndex = ref(0)

function prev() {
  if (!props.images || props.images.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function next() {
  if (!props.images || props.images.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function goTo(i) { currentIndex.value = i }

// simple print helper: create a print stylesheet that shows only the poster
function printPoster() {
  const styleId = 'print-poster-style'
  if (document.getElementById(styleId)) document.getElementById(styleId).remove()
  const style = document.createElement('style')
  style.id = styleId
  style.innerHTML = `@media print { body * { visibility: hidden !important } #lost-poster-root, #lost-poster-root * { visibility: visible !important } #lost-poster-root { position: fixed !important; left: 0; top: 0; width: 100% } }`
  document.head.appendChild(style)
  window.print()
  setTimeout(() => { const s = document.getElementById(styleId); if (s) s.remove() }, 1000)
}

function copyContact() {
  if (!props.contact) return
  try {
    navigator.clipboard.writeText(String(props.contact))
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = String(props.contact)
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

function formatReward(r) {
  if (r == null || r === '') return ''
  const n = Number(r)
  return n.toFixed(2)
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(Number(ts))
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatShortDate(ts) {
  if (!ts) return ''
  const d = new Date(Number(ts))
  return d.toLocaleDateString('es-ES')
}
</script>

<style scoped>
/* Slight poster letter spacing and bold feel */
.tracking-widest { letter-spacing: 0.18em; }
.font-extrabold { font-weight: 800; }

@media (max-width: 640px) {
  .poster-image { height: 64vw !important; }
}

.poster-image {
  height: 100%;
  object-fit: cover;
}

.image-col {
  min-height: 60vh;
  display: flex;
  align-items: stretch;
}

@media (min-width: 768px) {
  /* ensure the image column and details align visually */
  .image-col .poster-image { height: 100%; }
}
</style>
