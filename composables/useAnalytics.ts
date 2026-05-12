/**
 * Analytics Composable
 * Provides a clean interface for tracking events with Vercel Analytics
 */

export interface AnalyticsEvent {
  name: string
  data?: Record<string, any>
}

export function useAnalytics() {
  /**
   * Track a custom event
   * @param eventName - Name of the event to track
   * @param properties - Additional properties to include with the event
   */
  function track(eventName: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return

    try {
      // Track with Vercel Analytics
      if (window.va) {
        window.va('event', { name: eventName, data: properties })
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }

  /**
   * Track page views (automatically handled by Vercel Analytics)
   * This is available for manual tracking if needed
   */
  function trackPageView(path?: string) {
    if (typeof window === 'undefined') return

    try {
      if (window.va) {
        window.va('pageview', { path: path || window.location.pathname })
      }
    } catch (error) {
      console.warn('Page view tracking failed:', error)
    }
  }

  /**
   * Track user interactions
   */
  const interactions = {
    // Pet-related interactions
    petPublished: (petId: string, petType: string) => 
      track('pet_published', { pet_id: petId, pet_type: petType }),
    
    petViewed: (petId: string, petType: string) => 
      track('pet_viewed', { pet_id: petId, pet_type: petType }),
    
    adoptionRequest: (petId: string, petType: string) => 
      track('adoption_request', { pet_id: petId, pet_type: petType }),
    
    adoptionCompleted: (petId: string, petType: string) => 
      track('adoption_completed', { pet_id: petId, pet_type: petType }),

    // Lost pet interactions
    lostPetReported: (petId: string, hasReward: boolean) => 
      track('lost_pet_reported', { pet_id: petId, has_reward: hasReward }),
    
    lostPetFound: (petId: string) => 
      track('lost_pet_found', { pet_id: petId }),

    // User interactions
    userRegistered: (userId: string) => 
      track('user_registered', { user_id: userId }),
    
    userLogin: (userId: string) => 
      track('user_login', { user_id: userId }),

    // Organization interactions
    orgRegistered: (orgId: string) => 
      track('organization_registered', { org_id: orgId }),
    
    orgPetPublished: (orgId: string, petId: string) => 
      track('organization_pet_published', { org_id: orgId, pet_id: petId }),

    // Content interactions
    storyShared: (storyId: string) => 
      track('story_shared', { story_id: storyId }),
    
    storyViewed: (storyId: string) => 
      track('story_viewed', { story_id: storyId }),

    // Donation interactions
    donationInitiated: (amount: number, type: string) => 
      track('donation_initiated', { amount, type }),
    
    donationCompleted: (amount: number, type: string) => 
      track('donation_completed', { amount, type }),

    // Search and filter interactions
    searchPerformed: (query: string, filters?: Record<string, any>) => 
      track('search_performed', { query, ...filters }),
    
    filterApplied: (filterType: string, filterValue: string) => 
      track('filter_applied', { filter_type: filterType, filter_value: filterValue }),

    // UI interactions
    contactFormSubmitted: (formType: string) => 
      track('contact_form_submitted', { form_type: formType }),
    
    newsletterSubscribed: () => 
      track('newsletter_subscribed'),
    
    socialShare: (platform: string, contentType: string, contentId: string) => 
      track('social_share', { platform, content_type: contentType, content_id: contentId }),
  }

  /**
   * Track conversion events
   */
  const conversions = {
    adoptionFunnel: {
      step: (step: string, petId?: string) => 
        track('adoption_funnel_step', { step, pet_id: petId }),
      
      completed: (petId: string, timeToComplete: number) => 
        track('adoption_funnel_completed', { pet_id: petId, time_to_complete: timeToComplete }),
    },

    registrationFunnel: {
      step: (step: string, userType?: string) => 
        track('registration_funnel_step', { step, user_type: userType }),
      
      completed: (userType: string) => 
        track('registration_funnel_completed', { user_type: userType }),
    },
  }

  /**
   * Track performance metrics
   */
  const performance = {
    pageLoadTime: (loadTime: number, page: string) => 
      track('page_load_time', { load_time: loadTime, page }),
    
    imageUploadTime: (uploadTime: number, imageSize: number) => 
      track('image_upload_time', { upload_time: uploadTime, image_size: imageSize }),
  }

  /**
   * Track error events
   */
  const errors = {
    formValidationError: (formName: string, field: string) => 
      track('form_validation_error', { form_name: formName, field }),
    
    apiError: (endpoint: string, errorCode: string) => 
      track('api_error', { endpoint, error_code: errorCode }),
    
    javascriptError: (errorMessage: string, stackTrace?: string) => 
      track('javascript_error', { error_message: errorMessage, stack_trace: stackTrace }),
  }

  return {
    track,
    trackPageView,
    interactions,
    conversions,
    performance,
    errors,
  }
}

// Type declaration for Vercel Analytics
declare global {
  interface Window {
    va?: (event: 'beforeSend' | 'event' | 'pageview', properties?: unknown) => void
  }
}
