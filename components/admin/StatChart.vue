<template>
  <div class="overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>
      <select
        v-if="showPeriodSelector"
        v-model="selectedPeriod"
        class="rounded-lg border-gray-300 px-3 py-1 text-sm focus:border-emerald-500 focus:ring-emerald-500"
        @change="$emit('period-change', selectedPeriod)"
      >
        <option value="week">Esta semana</option>
        <option value="month">Este mes</option>
        <option value="quarter">Este trimestre</option>
        <option value="year">Este año</option>
      </select>
    </div>

    <!-- Chart Container -->
    <div class="relative" :style="{ height: height }">
      <canvas ref="chartCanvas" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
  PieController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
  PieController,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'line', // line, bar, doughnut, pie
  },
  data: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: String,
    default: '300px',
  },
  showPeriodSelector: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['period-change'])

const chartCanvas = ref(null)
const chartInstance = ref(null)
const selectedPeriod = ref('month')

// Default options based on chart type
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderRadius: 8,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales:
    props.type !== 'doughnut' && props.type !== 'pie'
      ? {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        }
      : undefined,
}

const initChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  // Create new chart
  const ctx = chartCanvas.value.getContext('2d')
  chartInstance.value = new Chart(ctx, {
    type: props.type,
    data: props.data,
    options: {
      ...defaultOptions,
      ...props.options,
    },
  })
}

onMounted(() => {
  initChart()
})

watch(
  () => props.data,
  () => {
    initChart()
  },
  { deep: true }
)

watch(
  () => props.type,
  () => {
    initChart()
  }
)

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})
</script>
