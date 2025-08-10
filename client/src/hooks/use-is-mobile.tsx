import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with actual value to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = React.useCallback(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, [])
    
    // Use the modern API if available
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange)
    } else {
      // Fallback for older browsers
      mql.addListener(onChange)
    }
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [])

  return isMobile
}

// Additional mobile detection utilities
export function useDeviceOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    }
    return 'portrait'
  })

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

export function useViewportSize() {
  const [viewport, setViewport] = React.useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  }))

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, 100)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return viewport
}
