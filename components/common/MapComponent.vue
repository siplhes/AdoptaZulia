<template>
  <div class="w-full h-96 rounded-xl overflow-hidden border border-gray-200">
    <!-- Search Input -->
    <div class="absolute top-4 left-4 right-4 z-10">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar dirección en Maracaibo..."
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 pr-10 shadow-lg focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
          @keyup.enter="searchAddress"
        />
        <Icon name="lucide:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Icon name="lucide:x" />
        </button>
      </div>
      <!-- Search Results Dropdown -->
      <div
        v-if="searchResults.length > 0"
        class="mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
      >
        <div
          v-for="(result, index) in searchResults"
          :key="index"
          class="cursor-pointer px-4 py-2 hover:bg-gray-50"
          @click="selectSearchResult(result)"
        >
          <p class="text-sm font-medium text-gray-900">{{ result.display_name }}</p>
          <p class="text-xs text-gray-500">{{ result.lat.toFixed(6) }}, {{ result.lon.toFixed(6) }}</p>
        </div>
      </div>
    </div>
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    lng: number
    lat: number
    title?: string
    description?: string
  }>
  selectable?: boolean
  modelValue?: { lat: number; lng: number }
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [-71.61875101348085, 10.663924191285304], // Coordenadas de Maracaibo por defecto
  zoom: 12,
  markers: () => [],
  selectable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: { lat: number; lng: number }]
  'select': [coordinates: { lat: number; lng: number }]
}>()

const mapContainer = ref<HTMLDivElement>()
let map: maplibregl.Map | null = null
let currentMarker: maplibregl.Marker | null = null

// Search functionality
const searchQuery = ref('')
const searchResults = ref<any[]>([])
let searchTimeout: NodeJS.Timeout | null = null

// Watch search query for autocomplete
watch(searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  if (newQuery.length < 3) {
    searchResults.value = []
    return
  }
  
  searchTimeout = setTimeout(() => {
    searchAddress()
  }, 500)
}, { flush: 'post' })

async function searchAddress() {
  if (!searchQuery.value || searchQuery.value.length < 3) return
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value + ', Maracaibo, Venezuela')}&limit=5&addressdetails=1`
    )
    const data = await response.json()
    searchResults.value = data
  } catch (error) {
    console.error('Error searching address:', error)
    searchResults.value = []
  }
}

function selectSearchResult(result: any) {
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)
  
  addOrUpdateMarker(lng, lat)
  
  if (map) {
    map.flyTo({
      center: [lng, lat],
      zoom: 16,
      essential: true
    })
  }
  
  searchQuery.value = result.display_name.split(',')[0]
  searchResults.value = []
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

function addOrUpdateMarker(lng: number, lat: number) {
  if (currentMarker) {
    currentMarker.setLngLat([lng, lat])
  } else {
    const el = document.createElement('div')
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-emerald-500/30 rounded-full animate-ping"></div>
        <div class="relative w-8 h-8 bg-emerald-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    `
    
    currentMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .addTo(map!)
  }
  
  const coordinates = { lat, lng }
  emit('update:modelValue', coordinates)
  emit('select', coordinates)
}

onMounted(() => {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      },
      layers: [
        {
          id: 'carto-dark',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
    center: props.center,
    zoom: props.zoom,
  })

  // Agregar marcadores existentes
  props.markers.forEach((marker) => {
    const el = document.createElement('div')
    el.innerHTML = `
      <div class="relative flex items-center justify-center group">
        <div class="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    `
    
    const popup = new maplibregl.Popup({ 
      offset: 25,
      className: 'custom-popup'
    }).setHTML(
      `<div class="p-3 min-w-[200px]">
        <h3 class="font-bold text-gray-900 text-base mb-1">${marker.title || 'Ubicación'}</h3>
        ${marker.description ? `<p class="text-sm text-gray-600">${marker.description}</p>` : ''}
        <p class="text-xs text-gray-500 mt-2">${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}</p>
      </div>`
    )

    new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([marker.lng, marker.lat])
      .setPopup(popup)
      .addTo(map!)
  })

  // Si es seleccionable y hay un valor inicial, agregar marcador
  if (props.selectable && props.modelValue) {
    addOrUpdateMarker(props.modelValue.lng, props.modelValue.lat)
  }

  // Click para seleccionar ubicación
  if (props.selectable) {
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      addOrUpdateMarker(lng, lat)
    })
  }

  // Controles de navegación
  map.addControl(new maplibregl.NavigationControl(), 'bottom-right')
})

// Watch for modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && map && props.selectable) {
      addOrUpdateMarker(newValue.lng, newValue.lat)
      map.flyTo({ center: [newValue.lng, newValue.lat], zoom: 14 })
    }
  },
  { deep: true, flush: 'post' }
)

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
/* Estilos específicos del mapa si son necesarios */
</style>
