import { ref, computed } from 'vue'
import { useCookie } from '#app'

type TestVariant = 'A' | 'B'
type TestName = 'petCardLayout' | 'featuredPetsStrategy' | 'petDetailLayout'

interface TestResult {
  variant: TestVariant
  impressions: number
  clicks: number
  adoptionRequests: number
}

export function useABTesting() {
  // Use cookies to maintain consistent user experience across sessions
  const testGroupCookie = useCookie<Record<TestName, TestVariant>>('ab_test_group', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    default: () => ({}),
  })

  // Store test results for analytics
  const testResults = ref<Record<TestName, Record<TestVariant, TestResult>>>({
    petCardLayout: {
      A: { variant: 'A', impressions: 0, clicks: 0, adoptionRequests: 0 },
      B: { variant: 'B', impressions: 0, clicks: 0, adoptionRequests: 0 },
    },
    featuredPetsStrategy: {
      A: { variant: 'A', impressions: 0, clicks: 0, adoptionRequests: 0 },
      B: { variant: 'B', impressions: 0, clicks: 0, adoptionRequests: 0 },
    },
    petDetailLayout: {
      A: { variant: 'A', impressions: 0, clicks: 0, adoptionRequests: 0 },
      B: { variant: 'B', impressions: 0, clicks: 0, adoptionRequests: 0 },
    },
  })

  /**
   * Assigns a user to a test variant if not already assigned
   */
  function getTestVariant(testName: TestName): TestVariant {
    if (!testGroupCookie.value[testName]) {
      // Assign randomly if not already assigned
      testGroupCookie.value = {
        ...testGroupCookie.value,
        [testName]: Math.random() < 0.5 ? 'A' : 'B',
      }
    }
    return testGroupCookie.value[testName]
  }

  /**
   * Records an impression for the given test
   */
  function recordImpression(testName: TestName) {
    const variant = getTestVariant(testName)
    testResults.value[testName][variant].impressions++
    
    // In a real implementation, you might want to send this to your analytics service
    // sendToAnalytics('impression', testName, variant)
  }

  /**
   * Records a click for the given test
   */
  function recordClick(testName: TestName) {
    const variant = getTestVariant(testName)
    testResults.value[testName][variant].clicks++
    
    // sendToAnalytics('click', testName, variant)
  }

  /**
   * Records an adoption request for the given test
   */
  function recordAdoptionRequest(testName: TestName) {
    const variant = getTestVariant(testName)
    testResults.value[testName][variant].adoptionRequests++
    
    // sendToAnalytics('adoption_request', testName, variant)
  }

  /**
   * Calculate the click-through rate for a test variant
   */
  function getCTR(testName: TestName, variant: TestVariant): number {
    const result = testResults.value[testName][variant]
    return result.impressions > 0 ? (result.clicks / result.impressions) * 100 : 0
  }

  /**
   * Calculate the conversion rate (adoption requests) for a test variant
   */
  function getConversionRate(testName: TestName, variant: TestVariant): number {
    const result = testResults.value[testName][variant]
    return result.clicks > 0 ? (result.adoptionRequests / result.clicks) * 100 : 0
  }

  /**
   * Get the current test results for analysis
   */
  const allTestResults = computed(() => {
    return Object.entries(testResults.value).map(([testName, variants]) => {
      return {
        testName,
        variantA: {
          ...variants.A,
          ctr: getCTR(testName as TestName, 'A'),
          conversionRate: getConversionRate(testName as TestName, 'A'),
        },
        variantB: {
          ...variants.B,
          ctr: getCTR(testName as TestName, 'B'),
          conversionRate: getConversionRate(testName as TestName, 'B'),
        },
      }
    })
  })

  return {
    getTestVariant,
    recordImpression,
    recordClick,
    recordAdoptionRequest,
    allTestResults,
  }
}