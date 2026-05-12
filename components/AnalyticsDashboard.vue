<template>
  <div class="analytics-dashboard p-6 bg-white rounded-lg shadow-lg">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h2>
      <p class="text-gray-600">Real-time insights into user behavior and system performance</p>
    </div>

    <!-- Key Metrics Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-600 font-medium">Page Views</p>
            <p class="text-2xl font-bold text-blue-800">{{ formatNumber(metrics.pageViews) }}</p>
          </div>
          <div class="bg-blue-200 p-3 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-blue-600">{{ metrics.pageViewsChange >= 0 ? '+' : '' }}{{ metrics.pageViewsChange }}%</span>
          <span class="text-xs text-gray-500">from last period</span>
        </div>
      </div>

      <div class="bg-green-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-600 font-medium">Adoption Requests</p>
            <p class="text-2xl font-bold text-green-800">{{ formatNumber(metrics.adoptionRequests) }}</p>
          </div>
          <div class="bg-green-200 p-3 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-green-600">{{ metrics.adoptionRequestsChange >= 0 ? '+' : '' }}{{ metrics.adoptionRequestsChange }}%</span>
          <span class="text-xs text-gray-500">from last period</span>
        </div>
      </div>

      <div class="bg-purple-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-purple-600 font-medium">Avg. Session Time</p>
            <p class="text-2xl font-bold text-purple-800">{{ formatDuration(metrics.avgSessionTime) }}</p>
          </div>
          <div class="bg-purple-200 p-3 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-purple-600">{{ metrics.sessionTimeChange >= 0 ? '+' : '' }}{{ metrics.sessionTimeChange }}%</span>
          <span class="text-xs text-gray-500">from last period</span>
        </div>
      </div>

      <div class="bg-orange-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-orange-600 font-medium">Conversion Rate</p>
            <p class="text-2xl font-bold text-orange-800">{{ metrics.conversionRate }}%</p>
          </div>
          <div class="bg-orange-200 p-3 rounded-full">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-orange-600">{{ metrics.conversionRateChange >= 0 ? '+' : '' }}{{ metrics.conversionRateChange }}%</span>
          <span class="text-xs text-gray-500">from last period</span>
        </div>
      </div>
    </div>

    <!-- A/B Testing Results -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">A/B Testing Results</h3>
      <div class="space-y-4">
        <div v-for="test in abTestResults" :key="test.testName" class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h4 class="font-medium text-gray-800">{{ test.description }}</h4>
              <p class="text-sm text-gray-600">Test: {{ test.testName }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="getConfidenceClass(test.statisticalSignificance.confidence)" 
                    class="px-2 py-1 rounded text-xs font-medium">
                {{ test.statisticalSignificance.confidence }}% Confidence
              </span>
              <span v-if="test.statisticalSignificance.isSignificant" 
                    class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                Significant
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Variant A -->
            <div class="border rounded p-3" :class="{ 'border-blue-500 bg-blue-50': test.winner === 'A' }">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-700">Variant A</span>
                <span v-if="test.winner === 'A'" class="text-xs bg-blue-500 text-white px-2 py-1 rounded">Winner</span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ test.variantA.description }}</p>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Impressions:</span>
                  <span class="font-medium">{{ test.variantA.impressions }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Clicks:</span>
                  <span class="font-medium">{{ test.variantA.clicks }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Conversions:</span>
                  <span class="font-medium">{{ test.variantA.conversions }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">CTR:</span>
                  <span class="font-medium">{{ test.variantA.ctr.toFixed(2) }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Conv. Rate:</span>
                  <span class="font-medium">{{ test.variantA.conversionRate.toFixed(2) }}%</span>
                </div>
              </div>
            </div>

            <!-- Variant B -->
            <div class="border rounded p-3" :class="{ 'border-blue-500 bg-blue-50': test.winner === 'B' }">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-700">Variant B</span>
                <span v-if="test.winner === 'B'" class="text-xs bg-blue-500 text-white px-2 py-1 rounded">Winner</span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ test.variantB.description }}</p>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Impressions:</span>
                  <span class="font-medium">{{ test.variantB.impressions }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Clicks:</span>
                  <span class="font-medium">{{ test.variantB.clicks }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Conversions:</span>
                  <span class="font-medium">{{ test.variantB.conversions }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">CTR:</span>
                  <span class="font-medium">{{ test.variantB.ctr.toFixed(2) }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Conv. Rate:</span>
                  <span class="font-medium">{{ test.variantB.conversionRate.toFixed(2) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="test.improvement !== 0" class="mt-3 p-2 bg-gray-50 rounded text-sm">
            <span class="font-medium">Improvement: </span>
            <span :class="test.improvement > 0 ? 'text-green-600' : 'text-red-600'">
              {{ test.improvement > 0 ? '+' : '' }}{{ test.improvement.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="border rounded-lg p-4">
          <h4 class="font-medium text-gray-700 mb-3">Core Web Vitals</h4>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">LCP</span>
              <span :class="getPerformanceClass(performanceMetrics.lcp)" class="text-sm font-medium">
                {{ performanceMetrics.lcp }}ms
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">FID</span>
              <span :class="getPerformanceClass(performanceMetrics.fid)" class="text-sm font-medium">
                {{ performanceMetrics.fid }}ms
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">CLS</span>
              <span :class="getPerformanceClass(performanceMetrics.cls)" class="text-sm font-medium">
                {{ performanceMetrics.cls }}
              </span>
            </div>
          </div>
        </div>

        <div class="border rounded-lg p-4">
          <h4 class="font-medium text-gray-700 mb-3">Page Load Times</h4>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Average</span>
              <span class="text-sm font-medium">{{ performanceMetrics.avgLoadTime }}ms</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Fastest</span>
              <span class="text-sm font-medium text-green-600">{{ performanceMetrics.fastestLoadTime }}ms</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Slowest</span>
              <span class="text-sm font-medium text-red-600">{{ performanceMetrics.slowestLoadTime }}ms</span>
            </div>
          </div>
        </div>

        <div class="border rounded-lg p-4">
          <h4 class="font-medium text-gray-700 mb-3">Error Tracking</h4>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">JavaScript Errors</span>
              <span class="text-sm font-medium text-red-600">{{ errorMetrics.jsErrors }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">API Errors</span>
              <span class="text-sm font-medium text-orange-600">{{ errorMetrics.apiErrors }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Network Errors</span>
              <span class="text-sm font-medium text-red-600">{{ errorMetrics.networkErrors }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time Activity -->
    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Real-time Activity</h3>
      <div class="border rounded-lg p-4">
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div v-for="event in recentEvents" :key="event.id" 
               class="flex items-center justify-between py-2 border-b last:border-b-0">
            <div class="flex items-center space-x-3">
              <div :class="getEventIconClass(event.type)" class="p-2 rounded-full">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path :d="getEventIcon(event.type)"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ event.name }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(event.timestamp) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-600">{{ event.user ? event.user : 'Anonymous' }}</p>
              <p class="text-xs text-gray-500">{{ event.path }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Mock data - in real implementation, this would come from your analytics API
const metrics = ref({
  pageViews: 15420,
  pageViewsChange: 12.5,
  adoptionRequests: 342,
  adoptionRequestsChange: 8.3,
  avgSessionTime: 245000, // milliseconds
  sessionTimeChange: -2.1,
  conversionRate: 2.2,
  conversionRateChange: 0.5
})

const performanceMetrics = ref({
  lcp: 2100,
  fid: 45,
  cls: 0.08,
  avgLoadTime: 1800,
  fastestLoadTime: 1200,
  slowestLoadTime: 3200
})

const errorMetrics = ref({
  jsErrors: 12,
  apiErrors: 8,
  networkErrors: 3
})

const recentEvents = ref([
  {
    id: 1,
    name: 'pet_viewed',
    type: 'interaction',
    timestamp: Date.now() - 60000,
    user: 'user_123',
    path: '/pets/dog-123'
  },
  {
    id: 2,
    name: 'adoption_request',
    type: 'conversion',
    timestamp: Date.now() - 120000,
    user: 'user_456',
    path: '/pets/cat-456'
  },
  {
    id: 3,
    name: 'page_view',
    type: 'page',
    timestamp: Date.now() - 180000,
    user: 'user_789',
    path: '/'
  }
])

// A/B Testing composable
const abTesting = useABTesting()
const abTestResults = computed(() => abTesting.allTestResults.value)

// Utility functions
function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

function getConfidenceClass(confidence: number): string {
  if (confidence >= 95) return 'bg-green-100 text-green-800'
  if (confidence >= 80) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function getPerformanceClass(value: number): string {
  if (value < 2500) return 'text-green-600'
  if (value < 4000) return 'text-yellow-600'
  return 'text-red-600'
}

function getEventIconClass(type: string): string {
  switch (type) {
    case 'interaction': return 'bg-blue-100 text-blue-600'
    case 'conversion': return 'bg-green-100 text-green-600'
    case 'page': return 'bg-purple-100 text-purple-600'
    case 'error': return 'bg-red-100 text-red-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function getEventIcon(type: string): string {
  switch (type) {
    case 'interaction': return 'M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z'
    case 'conversion': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'page': return 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    case 'error': return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

onMounted(() => {
  // In a real implementation, you would fetch real-time data here
  // and set up WebSocket connections for live updates
})
</script>
