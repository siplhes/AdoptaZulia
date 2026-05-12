import { ref, computed } from 'vue'
import { useCookie } from '#app'
import type { AnalyticsEvent } from './useAnalytics'

type TestVariant = 'A' | 'B'
type TestName = 'petCardLayout' | 'featuredPetsStrategy' | 'petDetailLayout'

interface TestResult {
  variant: TestVariant
  impressions: number
  clicks: number
  adoptionRequests: number
  conversions: number
  revenue?: number
}

interface TestConfig {
  name: TestName
  description: string
  variants: {
    A: { description: string, weight?: number }
    B: { description: string, weight?: number }
  }
  trafficSplit: { A: number, B: number }
  startDate?: Date
  endDate?: Date
  targetMetrics: string[]
}

export function useABTesting() {
  const analytics = useAnalytics()
  
  // Use cookies to maintain consistent user experience across sessions
  const testGroupCookie = useCookie<Record<TestName, TestVariant>>('ab_test_group', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    default: () => ({} as Record<TestName, TestVariant>),
  })

  // Test configurations
  const testConfigs: Record<TestName, TestConfig> = {
    petCardLayout: {
      name: 'petCardLayout',
      description: 'Test different pet card layouts for better engagement',
      variants: {
        A: { description: 'Current layout with image on left, info on right' },
        B: { description: 'New layout with larger image and compact info' }
      },
      trafficSplit: { A: 50, B: 50 },
      targetMetrics: ['click_through_rate', 'adoption_requests', 'time_on_page']
    },
    featuredPetsStrategy: {
      name: 'featuredPetsStrategy',
      description: 'Test different strategies for featuring pets on homepage',
      variants: {
        A: { description: 'Random selection of pets' },
        B: { description: 'AI-powered selection based on user preferences' }
      },
      trafficSplit: { A: 50, B: 50 },
      targetMetrics: ['click_through_rate', 'adoption_requests', 'user_satisfaction']
    },
    petDetailLayout: {
      name: 'petDetailLayout',
      description: 'Test different pet detail page layouts',
      variants: {
        A: { description: 'Current vertical layout' },
        B: { description: 'New horizontal layout with gallery' }
      },
      trafficSplit: { A: 50, B: 50 },
      targetMetrics: ['adoption_requests', 'time_on_page', 'image_views']
    }
  }

  // Store test results for analytics
  const testResults = ref<Record<TestName, Record<TestVariant, TestResult>>>({
    petCardLayout: {
      A: { variant: 'A', impressions: 0, clicks: 0, adoptionRequests: 0, conversions: 0 },
      B: { variant: 'B', impressions: 0, clicks: 0, adoptionRequests: 0, conversions: 0 },
    },
    featuredPetsStrategy: {
      A: { variant: 'A', impressions: 0, clicks: 0, adoptionRequests: 0, conversions: 0 },
      B: { variant: 'B', impressions: 0, clicks: 0, adoptionRequests: 0, conversions: 0 },
    },
    petDetailLayout: {
      A: { variant: 'A', impressions: 0, clicks: 0, adoptionRequests: 0, conversions: 0 },
      B: { variant: 'B', impressions: 0, clicks: 0, adoptionRequests: 0, conversions: 0 },
    },
  })

  /**
   * Assigns a user to a test variant based on traffic split
   */
  function getTestVariant(testName: TestName): TestVariant {
    if (!testGroupCookie.value[testName]) {
      const config = testConfigs[testName]
      const random = Math.random() * 100
      
      // Assign based on traffic split
      const variant = random < config.trafficSplit.A ? 'A' : 'B'
      
      testGroupCookie.value = {
        ...testGroupCookie.value,
        [testName]: variant,
      }
      
      // Track test assignment
      analytics.track('ab_test_assigned', {
        test_name: testName,
        variant,
        traffic_split: config.trafficSplit
      })
    }
    return testGroupCookie.value[testName]
  }

  /**
   * Records an impression for the given test
   */
  function recordImpression(testName: TestName, context?: Record<string, any>) {
    const variant = getTestVariant(testName)
    testResults.value[testName][variant].impressions++

    // Track with analytics
    analytics.track('ab_test_impression', {
      test_name: testName,
      variant,
      ...context
    })
  }

  /**
   * Records a click for the given test
   */
  function recordClick(testName: TestName, context?: Record<string, any>) {
    const variant = getTestVariant(testName)
    testResults.value[testName][variant].clicks++

    // Track with analytics
    analytics.track('ab_test_click', {
      test_name: testName,
      variant,
      ...context
    })
  }

  /**
   * Records an adoption request for the given test
   */
  function recordAdoptionRequest(testName: TestName, context?: Record<string, any>) {
    const variant = getTestVariant(testName)
    testResults.value[testName][variant].adoptionRequests++

    // Track with analytics
    analytics.track('ab_test_adoption_request', {
      test_name: testName,
      variant,
      ...context
    })
  }

  /**
   * Records a conversion for the given test
   */
  function recordConversion(testName: TestName, conversionType: string, value?: number, context?: Record<string, any>) {
    const variant = getTestVariant(testName)
    testResults.value[testName][variant].conversions++
    
    if (value) {
      testResults.value[testName][variant].revenue = 
        (testResults.value[testName][variant].revenue || 0) + value
    }

    // Track with analytics
    analytics.track('ab_test_conversion', {
      test_name: testName,
      variant,
      conversion_type: conversionType,
      value,
      ...context
    })
  }

  /**
   * Records user engagement metrics
   */
  function recordEngagement(testName: TestName, metric: string, value: number, context?: Record<string, any>) {
    const variant = getTestVariant(testName)

    // Track with analytics
    analytics.track('ab_test_engagement', {
      test_name: testName,
      variant,
      metric,
      value,
      ...context
    })
  }

  /**
   * Calculate the click-through rate for a test variant
   */
  function getCTR(testName: TestName, variant: TestVariant): number {
    const result = testResults.value[testName][variant]
    return result.impressions > 0 ? (result.clicks / result.impressions) * 100 : 0
  }

  /**
   * Calculate the conversion rate for a test variant
   */
  function getConversionRate(testName: TestName, variant: TestVariant): number {
    const result = testResults.value[testName][variant]
    return result.clicks > 0 ? (result.conversions / result.clicks) * 100 : 0
  }

  /**
   * Calculate the adoption rate for a test variant
   */
  function getAdoptionRate(testName: TestName, variant: TestVariant): number {
    const result = testResults.value[testName][variant]
    return result.clicks > 0 ? (result.adoptionRequests / result.clicks) * 100 : 0
  }

  /**
   * Calculate statistical significance using chi-squared test
   */
  function getStatisticalSignificance(testName: TestName): { isSignificant: boolean, confidence: number, pValue: number } {
    const results = testResults.value[testName]
    const variantA = results.A
    const variantB = results.B

    // Simple chi-squared test for conversion rates
    const totalConversions = variantA.conversions + variantB.conversions
    const totalNonConversions = (variantA.clicks - variantA.conversions) + (variantB.clicks - variantB.conversions)
    const total = totalConversions + totalNonConversions

    if (total === 0) return { isSignificant: false, confidence: 0, pValue: 1 }

    const expectedConversionsA = (variantA.clicks / total) * totalConversions
    const expectedConversionsB = (variantB.clicks / total) * totalConversions
    const expectedNonConversionsA = (variantA.clicks / total) * totalNonConversions
    const expectedNonConversionsB = (variantB.clicks / total) * totalNonConversions

    const chiSquared = 
      Math.pow(variantA.conversions - expectedConversionsA, 2) / expectedConversionsA +
      Math.pow(variantB.conversions - expectedConversionsB, 2) / expectedConversionsB +
      Math.pow((variantA.clicks - variantA.conversions) - expectedNonConversionsA, 2) / expectedNonConversionsA +
      Math.pow((variantB.clicks - variantB.conversions) - expectedNonConversionsB, 2) / expectedNonConversionsB

    // Degrees of freedom = 1, critical value at 95% confidence = 3.841
    const isSignificant = chiSquared > 3.841
    const confidence = isSignificant ? 95 : Math.max(0, Math.min(100, (1 - chiSquared / 10) * 100))
    const pValue = isSignificant ? 0.05 : Math.max(0.05, chiSquared / 10)

    return { isSignificant, confidence, pValue }
  }

  /**
   * Get the current test results for analysis
   */
  const allTestResults = computed(() => {
    return Object.entries(testResults.value).map(([testName, variants]) => {
      const stats = getStatisticalSignificance(testName as TestName)
      const config = testConfigs[testName as TestName]
      
      return {
        testName,
        description: config.description,
        targetMetrics: config.targetMetrics,
        variantA: {
          ...variants.A,
          ctr: getCTR(testName as TestName, 'A'),
          conversionRate: getConversionRate(testName as TestName, 'A'),
          adoptionRate: getAdoptionRate(testName as TestName, 'A'),
          description: config.variants.A.description
        },
        variantB: {
          ...variants.B,
          ctr: getCTR(testName as TestName, 'B'),
          conversionRate: getConversionRate(testName as TestName, 'B'),
          adoptionRate: getAdoptionRate(testName as TestName, 'B'),
          description: config.variants.B.description
        },
        statisticalSignificance: stats,
        winner: variants.A.conversions > variants.B.conversions ? 'A' : 
                variants.B.conversions > variants.A.conversions ? 'B' : 'tie',
        improvement: variants.A.conversions > 0 ? 
          ((variants.B.conversions - variants.A.conversions) / variants.A.conversions) * 100 : 0
      }
    })
  })

  /**
   * Get test configuration
   */
  function getTestConfig(testName: TestName): TestConfig {
    return testConfigs[testName]
  }

  /**
   * Check if a test is currently running
   */
  function isTestActive(testName: TestName): boolean {
    const config = testConfigs[testName]
    const now = new Date()
    
    if (config.startDate && now < config.startDate) return false
    if (config.endDate && now > config.endDate) return false
    
    return true
  }

  /**
   * Get recommended winner based on statistical significance and performance
   */
  function getRecommendedWinner(testName: TestName): { variant: TestVariant | 'tie', confidence: number, reason: string } {
    const stats = getStatisticalSignificance(testName)
    const results = testResults.value[testName]
    
    if (!stats.isSignificant) {
      return { variant: 'tie', confidence: stats.confidence, reason: 'Not statistically significant' }
    }
    
    const variantA = results.A
    const variantB = results.B
    
    if (variantA.conversions > variantB.conversions) {
      const improvement = ((variantA.conversions - variantB.conversions) / variantB.conversions) * 100
      return { 
        variant: 'A', 
        confidence: stats.confidence, 
        reason: `Variant A leads with ${improvement.toFixed(1)}% improvement` 
      }
    } else if (variantB.conversions > variantA.conversions) {
      const improvement = ((variantB.conversions - variantA.conversions) / variantA.conversions) * 100
      return { 
        variant: 'B', 
        confidence: stats.confidence, 
        reason: `Variant B leads with ${improvement.toFixed(1)}% improvement` 
      }
    }
    
    return { variant: 'tie', confidence: stats.confidence, reason: 'No clear winner' }
  }

  return {
    getTestVariant,
    recordImpression,
    recordClick,
    recordAdoptionRequest,
    recordConversion,
    recordEngagement,
    allTestResults,
    getTestConfig,
    isTestActive,
    getRecommendedWinner,
    getStatisticalSignificance,
  }
}
