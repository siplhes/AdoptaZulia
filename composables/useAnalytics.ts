/**
 * Enhanced Analytics Composable
 * Provides a comprehensive interface for tracking events with multiple analytics providers
 */

// Analytics provider types
export type AnalyticsProvider = 'vercel' | 'google' | 'custom'

// Enhanced event interface with validation and metadata
export interface AnalyticsEvent {
  name: string
  data?: Record<string, any>
  provider?: AnalyticsProvider
  timestamp?: number
  userId?: string
  sessionId?: string
  metadata?: {
    userAgent?: string
    referrer?: string
    screenResolution?: string
    locale?: string
  }
}

// Event validation schema
export interface EventSchema {
  required: string[]
  optional?: string[]
  validators?: Record<string, (value: any) => boolean>
}

// Analytics configuration
export interface AnalyticsConfig {
  providers: AnalyticsProvider[]
  enableDebugMode: boolean
  enableBatching: boolean
  batchSize: number
  batchTimeout: number
  enableUserTracking: boolean
  enablePerformanceTracking: boolean
  enableErrorTracking: boolean
}

export function useAnalytics() {
  const config = useRuntimeConfig()
  const { $firebaseAuth } = useNuxtApp()
  
  // Analytics configuration
  const analyticsConfig: AnalyticsConfig = {
    providers: ['vercel'], // Can be extended to include Google Analytics, etc.
    enableDebugMode: process.env.NODE_ENV === 'development',
    enableBatching: true,
    batchSize: 10,
    batchTimeout: 5000,
    enableUserTracking: true,
    enablePerformanceTracking: true,
    enableErrorTracking: true,
  }

  // Event batching system
  const eventQueue = ref<AnalyticsEvent[]>([])
  const batchTimer = ref<NodeJS.Timeout | null>(null)
  const sessionId = ref<string>(generateSessionId())
  
  // Event schemas for validation
  const eventSchemas: Record<string, EventSchema> = {
    pet_published: {
      required: ['pet_id', 'pet_type'],
      optional: ['organization_id', 'breed', 'age'],
      validators: {
        pet_type: (value) => ['dog', 'cat', 'other'].includes(value),
      }
    },
    adoption_request: {
      required: ['pet_id', 'pet_type'],
      optional: ['user_id', 'request_type'],
    },
    search_performed: {
      required: ['query'],
      optional: ['filters', 'results_count'],
    },
    page_load_time: {
      required: ['load_time', 'page'],
      validators: {
        load_time: (value) => typeof value === 'number' && value >= 0,
      }
    }
  }

  /**
   * Generate a unique session ID
   */
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get current user ID from Firebase Auth
   */
  function getCurrentUserId(): string | null {
    try {
      return $firebaseAuth?.currentUser?.uid || null
    } catch {
      return null
    }
  }

  /**
   * Validate event data against schema
   */
  function validateEvent(eventName: string, data?: Record<string, any>): boolean {
    const schema = eventSchemas[eventName]
    if (!schema) return true // No validation required for unknown events

    if (schema.required) {
      for (const field of schema.required) {
        if (!data || !(field in data)) {
          console.warn(`Analytics validation failed: Missing required field '${field}' for event '${eventName}'`)
          return false
        }
      }
    }

    if (schema.validators && data) {
      for (const [field, validator] of Object.entries(schema.validators)) {
        if (field in data && !validator(data[field])) {
          console.warn(`Analytics validation failed: Invalid value for field '${field}' in event '${eventName}'`)
          return false
        }
      }
    }

    return true
  }

  /**
   * Enrich event with additional metadata
   */
  function enrichEvent(event: AnalyticsEvent): AnalyticsEvent {
    return {
      ...event,
      timestamp: Date.now(),
      userId: getCurrentUserId() || undefined,
      sessionId: sessionId.value,
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        screenResolution: `${screen.width}x${screen.height}`,
        locale: navigator.language,
        ...event.metadata,
      }
    }
  }

  /**
   * Send event to analytics providers
   */
  function sendToProviders(event: AnalyticsEvent) {
    for (const provider of analyticsConfig.providers) {
      try {
        switch (provider) {
          case 'vercel':
            if (window.va) {
              window.va('event', { name: event.name, data: event.data })
            }
            break
          // Future: Add Google Analytics, custom endpoints, etc.
        }
      } catch (error) {
        console.warn(`Analytics provider '${provider}' failed:`, error)
      }
    }
  }

  /**
   * Process event queue
   */
  function processQueue() {
    if (eventQueue.value.length === 0) return

    const events = [...eventQueue.value]
    eventQueue.value = []

    if (batchTimer.value) {
      clearTimeout(batchTimer.value)
      batchTimer.value = null
    }

    events.forEach(event => sendToProviders(event))

    if (analyticsConfig.enableDebugMode) {
      console.log('Analytics batch processed:', events)
    }
  }

  /**
   * Track a custom event with validation and enrichment
   */
  function track(eventName: string, properties?: Record<string, any>, options?: { provider?: AnalyticsProvider, immediate?: boolean }) {
    if (typeof window === 'undefined') return

    // Validate event
    if (!validateEvent(eventName, properties)) {
      return
    }

    const event: AnalyticsEvent = enrichEvent({
      name: eventName,
      data: properties,
      provider: options?.provider || 'vercel',
    })

    if (analyticsConfig.enableDebugMode) {
      console.log('Analytics event tracked:', event)
    }

    // Handle batching
    if (analyticsConfig.enableBatching && !options?.immediate) {
      eventQueue.value.push(event)

      if (eventQueue.value.length >= analyticsConfig.batchSize) {
        processQueue()
      } else if (!batchTimer.value) {
        batchTimer.value = setTimeout(processQueue, analyticsConfig.batchTimeout)
      }
    } else {
      sendToProviders(event)
    }
  }

  /**
   * Track page views with enhanced metadata
   */
  function trackPageView(path?: string, metadata?: Record<string, any>) {
    if (typeof window === 'undefined') return

    const currentPath = path || window.location.pathname
    
    track('page_view', {
      path: currentPath,
      title: document.title,
      referrer: document.referrer,
      ...metadata
    }, { immediate: true })
  }

  /**
   * Track user session events
   */
  const sessions = {
    started: (userId?: string) => 
      track('session_started', { user_id: userId }),
    
    ended: (duration: number, interactions: number) => 
      track('session_ended', { duration, interactions }),
    
    timedOut: () => 
      track('session_timed_out'),
  }

  /**
   * Enhanced performance tracking
   */
  const performance = {
    pageLoadTime: (loadTime: number, page: string) => 
      track('page_load_time', { load_time: loadTime, page }),
    
    imageUploadTime: (uploadTime: number, imageSize: number, format: string) => 
      track('image_upload_time', { upload_time: uploadTime, image_size: imageSize, format }),
    
    apiResponseTime: (endpoint: string, responseTime: number, statusCode: number) => 
      track('api_response_time', { endpoint, response_time: responseTime, status_code: statusCode }),
    
    coreWebVitals: (metric: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') => 
      track('core_web_vital', { metric, value, rating }),
  }

  /**
   * Enhanced error tracking with context
   */
  const errors = {
    formValidationError: (formName: string, field: string, errorMessage: string) => 
      track('form_validation_error', { form_name: formName, field, error_message: errorMessage }),
    
    apiError: (endpoint: string, errorCode: string, errorMessage?: string, context?: Record<string, any>) => 
      track('api_error', { endpoint, error_code: errorCode, error_message: errorMessage, ...context }),
    
    javascriptError: (errorMessage: string, stackTrace?: string, context?: Record<string, any>) => 
      track('javascript_error', { error_message: errorMessage, stack_trace: stackTrace, ...context }),
    
    networkError: (url: string, method: string, statusCode?: number) => 
      track('network_error', { url, method, status_code: statusCode }),
  }

  /**
   * Enhanced user interaction tracking
   */
  const interactions = {
    // Pet-related interactions with enhanced context
    petPublished: (petId: string, petType: string, metadata?: { organizationId?: string, breed?: string, age?: string }) => 
      track('pet_published', { pet_id: petId, pet_type: petType, ...metadata }),
    
    petViewed: (petId: string, petType: string, source?: string) => 
      track('pet_viewed', { pet_id: petId, pet_type: petType, source }),
    
    adoptionRequest: (petId: string, petType: string, userId?: string) => 
      track('adoption_request', { pet_id: petId, pet_type: petType, user_id: userId }),
    
    adoptionCompleted: (petId: string, petType: string, timeToComplete?: number) => 
      track('adoption_completed', { pet_id: petId, pet_type: petType, time_to_complete: timeToComplete }),

    // Lost pet interactions
    lostPetReported: (petId: string, hasReward: boolean, rewardAmount?: number) => 
      track('lost_pet_reported', { pet_id: petId, has_reward: hasReward, reward_amount: rewardAmount }),
    
    lostPetFound: (petId: string, finderId?: string) => 
      track('lost_pet_found', { pet_id: petId, finder_id: finderId }),

    // User interactions
    userRegistered: (userId: string, userType: 'individual' | 'organization') => 
      track('user_registered', { user_id: userId, user_type: userType }),
    
    userLogin: (userId: string, method: 'email' | 'google' | 'facebook') => 
      track('user_login', { user_id: userId, method }),
    
    userLogout: (userId: string, sessionDuration: number) => 
      track('user_logout', { user_id: userId, session_duration: sessionDuration }),

    // Organization interactions
    orgRegistered: (orgId: string, orgType: string) => 
      track('organization_registered', { org_id: orgId, org_type: orgType }),
    
    orgPetPublished: (orgId: string, petId: string) => 
      track('organization_pet_published', { org_id: orgId, pet_id: petId }),

    // Content interactions
    storyShared: (storyId: string, platform: string) => 
      track('story_shared', { story_id: storyId, platform }),
    
    storyViewed: (storyId: string, duration?: number) => 
      track('story_viewed', { story_id: storyId, duration }),

    // Donation interactions
    donationInitiated: (amount: number, type: string, currency: string = 'USD') => 
      track('donation_initiated', { amount, type, currency }),
    
    donationCompleted: (amount: number, type: string, currency: string = 'USD', paymentMethod?: string) => 
      track('donation_completed', { amount, type, currency, payment_method: paymentMethod }),

    // Search and filter interactions
    searchPerformed: (query: string, filters?: Record<string, any>, resultsCount?: number) => 
      track('search_performed', { query, ...filters, results_count: resultsCount }),
    
    filterApplied: (filterType: string, filterValue: string, context?: string) => 
      track('filter_applied', { filter_type: filterType, filter_value: filterValue, context }),

    // UI interactions
    contactFormSubmitted: (formType: string, topic?: string) => 
      track('contact_form_submitted', { form_type: formType, topic }),
    
    newsletterSubscribed: (source?: string) => 
      track('newsletter_subscribed', { source }),
    
    socialShare: (platform: string, contentType: string, contentId: string) => 
      track('social_share', { platform, content_type: contentType, content_id: contentId }),
  }

  /**
   * Enhanced conversion tracking with funnel analysis
   */
  const conversions = {
    adoptionFunnel: {
      step: (step: string, petId?: string, stepData?: Record<string, any>) => 
        track('adoption_funnel_step', { step, pet_id: petId, ...stepData }),
      
      completed: (petId: string, timeToComplete: number, adoptionType?: string) => 
        track('adoption_funnel_completed', { pet_id: petId, time_to_complete: timeToComplete, adoption_type: adoptionType }),
      
      abandoned: (step: string, petId?: string, reason?: string) => 
        track('adoption_funnel_abandoned', { step, pet_id: petId, reason }),
    },

    registrationFunnel: {
      step: (step: string, userType?: string, stepData?: Record<string, any>) => 
        track('registration_funnel_step', { step, user_type: userType, ...stepData }),
      
      completed: (userType: string, registrationMethod: string) => 
        track('registration_funnel_completed', { user_type: userType, registration_method: registrationMethod }),
      
      abandoned: (step: string, userType?: string, reason?: string) => 
        track('registration_funnel_abandoned', { step, user_type: userType, reason }),
    },

    donationFunnel: {
      step: (step: string, amount?: number, donationType?: string) => 
        track('donation_funnel_step', { step, amount, donation_type: donationType }),
      
      completed: (amount: number, donationType: string, paymentMethod: string) => 
        track('donation_funnel_completed', { amount, donation_type: donationType, payment_method: paymentMethod }),
    },
  }

  /**
   * Analytics utility functions
   */
  const utils = {
    // Flush the event queue immediately
    flush: () => processQueue(),
    
    // Get current queue status
    getQueueStatus: () => ({
      queueLength: eventQueue.value.length,
      hasPendingBatch: batchTimer.value !== null,
      sessionId: sessionId.value,
    }),
    
    // Update configuration
    updateConfig: (newConfig: Partial<AnalyticsConfig>) => {
      Object.assign(analyticsConfig, newConfig)
    },
    
    // Generate custom event with validation
    createCustomEvent: (eventName: string, schema: EventSchema) => {
      eventSchemas[eventName] = schema
    },
  }


  return {
    track,
    trackPageView,
    interactions,
    conversions,
    performance,
    errors,
    sessions,
    utils,
  }
}

// Enhanced type declarations for multiple analytics providers
declare global {
  interface Window {
    va?: (event: 'beforeSend' | 'event' | 'pageview', properties?: unknown) => void
    gtag?: (command: string, action: string, options?: Record<string, any>) => void
    dataLayer?: any[]
  }
}
