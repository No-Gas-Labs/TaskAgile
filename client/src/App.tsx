import { lazy, Suspense, useEffect, useState, useCallback } from "react";
import { useIsMobile, useDeviceOrientation, useViewportSize } from "./hooks/use-is-mobile";
import "@fontsource/inter";

// Lazy load heavy components for better performance
const GameCanvas = lazy(() => import("./components/GameCanvas"));
const MobileGame = lazy(() => import("./components/MobileGame"));

// Mobile-optimized loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Main App component
function App() {
  const isMobile = useIsMobile();
  const orientation = useDeviceOrientation();
  const viewport = useViewportSize();
  const [isLoaded, setIsLoaded] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Optimize initialization for mobile
  useEffect(() => {
    const initializeApp = async () => {
      // Prevent zoom on iOS
      if (typeof window !== 'undefined' && window.visualViewport) {
        const viewport = window.visualViewport;
        viewport.addEventListener('resize', () => {
          // Handle virtual keyboard appearance
          document.documentElement.style.height = `${viewport.height}px`;
        });
      }

      // Add mobile-specific meta tags
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport && isMobile) {
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Preload critical resources for mobile
      if (isMobile) {
        await preloadCriticalResources();
      }

      setIsLoaded(true);
      
      // Small delay to ensure smooth transition
      setTimeout(() => setAppReady(true), 100);
    };

    initializeApp();
  }, [isMobile]);

  const preloadCriticalResources = useCallback(async () => {
    // Preload essential sounds and images for mobile
    const criticalResources = [
      '/sounds/hit.mp3',
      '/sounds/success.mp3'
    ];

    const promises = criticalResources.map(src => {
      return new Promise((resolve) => {
        if (src.endsWith('.mp3')) {
          const audio = new Audio(src);
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', resolve, { once: true });
          audio.load();
        } else {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        }
      });
    });

    await Promise.allSettled(promises);
  }, []);

  // Performance optimization: prevent unnecessary re-renders
  const appStyle = {
    width: '100vw',
    height: '100vh',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    touchAction: 'none' as const,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    WebkitTouchCallout: 'none' as const,
    WebkitTapHighlightColor: 'transparent'
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div style={appStyle} className="bg-background text-foreground">
      <Suspense fallback={<LoadingSpinner />}>
        {appReady && (
          <>
            {isMobile ? (
              <MobileGame 
                orientation={orientation}
                viewport={viewport}
              />
            ) : (
              <GameCanvas 
                viewport={viewport}
              />
            )}
          </>
        )}
      </Suspense>
      
      {/* Mobile-specific optimizations */}
      {isMobile && (
        <>
          {/* Prevent elastic scrolling */}
          <style jsx>{`
            body {
              position: fixed;
              overflow: hidden;
              -webkit-overflow-scrolling: touch;
            }
          `}</style>
          
          {/* Handle safe areas on notched devices */}
          <div className="fixed inset-0 pointer-events-none">
            <div 
              className="absolute top-0 left-0 right-0 bg-background"
              style={{ height: 'env(safe-area-inset-top)' }}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 bg-background"
              style={{ height: 'env(safe-area-inset-bottom)' }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
