/**
 * Analytics Plugin
 * Automatically tracks performance metrics, user behavior, and page interactions
 */

export default defineNuxtPlugin(async (nuxtApp) => {
  const analytics = useAnalytics()
  const router = useRouter()
  const route = useRoute()
  
  // Initialize Vercel Analytics window function if not available
  if (typeof window !== 'undefined' && !window.va) {
    // Create a mock window.va function for development/debugging
    window.va = (command: string, properties?: any) => {
      if (command === 'event' && properties) {
        console.log('Analytics Event:', properties.name, properties.data)
      }
    }
  }

  // Disable analytics tracking in development to avoid 404 errors
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics tracking disabled in development mode')
    return
  }
  
  let sessionStartTime = Date.now()
  let pageStartTime = Date.now()
  let interactionCount = 0
  let isPageVisible = true

  // Track session start
  if (process.client) {
    analytics.sessions.started()
    
    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPageVisible = false
        analytics.track('page_hidden', { 
          path: route.path,
          time_on_page: Date.now() - pageStartTime 
        })
      } else {
        isPageVisible = true
        pageStartTime = Date.now()
        analytics.track('page_visible', { path: route.path })
      }
    }

    // Track user interactions
    const handleInteraction = () => {
      if (isPageVisible) {
        interactionCount++
      }
    }

    // Track scroll depth
    let maxScrollDepth = 0
    const handleScroll = () => {
      if (!isPageVisible) return
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentScroll = window.scrollY
      const scrollPercentage = scrollHeight > 0 ? (currentScroll / scrollHeight) * 100 : 0
      
      if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage
        
        // Track milestone scroll depths
        if (scrollPercentage >= 25 && scrollPercentage < 30) {
          analytics.track('scroll_depth_25', { path: route.path })
        } else if (scrollPercentage >= 50 && scrollPercentage < 55) {
          analytics.track('scroll_depth_50', { path: route.path })
        } else if (scrollPercentage >= 75 && scrollPercentage < 80) {
          analytics.track('scroll_depth_75', { path: route.path })
        } else if (scrollPercentage >= 90 && scrollPercentage < 95) {
          analytics.track('scroll_depth_90', { path: route.path })
        }
      }
    }

    // Track page load performance
    const trackPagePerformance = () => {
      if (!window.performance || !window.performance.timing) return

      const timing = window.performance.timing
      const navigation = window.performance.navigation
      
      const loadTime = timing.loadEventEnd - timing.navigationStart
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
      const firstPaint = timing.responseStart - timing.requestStart
      
      analytics.performance.pageLoadTime(loadTime, route.path)
      analytics.track('dom_content_loaded', { 
        path: route.path, 
        load_time: domContentLoaded 
      })
      analytics.track('first_paint', { 
        path: route.path, 
        load_time: firstPaint 
      })

      // Track Core Web Vitals if available
      if (window.performance.getEntriesByType) {
        const vitals = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (vitals) {
          // LCP (Largest Contentful Paint) - need to observe this separately
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            if (lastEntry) {
              analytics.performance.coreWebVitals('LCP', Math.round(lastEntry.startTime), 
                lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor')
            }
          })
          observer.observe({ entryTypes: ['largest-contentful-paint'] })

          // FID (First Input Delay)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              analytics.performance.coreWebVitals('FID', Math.round(entry.processingStart - entry.startTime),
                entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor')
            })
          })
          fidObserver.observe({ entryTypes: ['first-input'] })

          // CLS (Cumulative Layout Shift)
          let clsValue = 0
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            })
            analytics.performance.coreWebVitals('CLS', Math.round(clsValue * 1000) / 1000,
              clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor')
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })
        }
      }
    }

    // Track route changes
    router.afterEach((to, from) => {
      // Track time on previous page
      const timeOnPage = Date.now() - pageStartTime
      analytics.track('page_exit', { 
        path: from.path,
        time_on_page: timeOnPage,
        interactions: interactionCount,
        scroll_depth: maxScrollDepth
      })

      // Track new page view
      pageStartTime = Date.now()
      maxScrollDepth = 0
      interactionCount = 0
      
      analytics.trackPageView(to.path, {
        referrer: from.path,
        navigation_type: 'spa_navigation'
      })
    })

    // Track errors
    const handleError = (event: ErrorEvent) => {
      analytics.errors.javascriptError(
        event.message,
        event.error?.stack,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          path: route.path
        }
      )
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.errors.javascriptError(
        'Unhandled Promise Rejection',
        event.reason?.stack || String(event.reason),
        {
          type: 'unhandled_promise_rejection',
          path: route.path
        }
      )
    }

    // Track API calls (intercept fetch)
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = Date.now()
      const [url, options] = args
      
      try {
        const response = await originalFetch(...args)
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        analytics.performance.apiResponseTime(
          url as string,
          responseTime,
          response.status
        )
        
        // Track API errors
        if (!response.ok) {
          analytics.errors.apiError(
            url as string,
            response.status.toString(),
            response.statusText,
            { method: options?.method || 'GET', response_time: responseTime }
          )
        }
        
        return response
      } catch (error) {
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        analytics.errors.networkError(
          url as string,
          options?.method || 'GET'
        )
        
        analytics.performance.apiResponseTime(
          url as string,
          responseTime,
          0
        )
        
        throw error
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('click', handleInteraction, true)
    document.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    // Track initial page load
    if (document.readyState === 'complete') {
      trackPagePerformance()
    } else {
      window.addEventListener('load', trackPagePerformance)
    }

    // Track session end on page unload
    const handlePageUnload = () => {
      const sessionDuration = Date.now() - sessionStartTime
      analytics.sessions.ended(sessionDuration, interactionCount)
      analytics.utils.flush() // Flush any remaining events
    }

    window.addEventListener('beforeunload', handlePageUnload)

    // Cleanup will be handled automatically on page unload

    // Track initial page view
    analytics.trackPageView(route.path, {
      navigation_type: 'initial_load'
    })
  }
})
