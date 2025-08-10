
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface MobileGameProps {
  orientation: 'portrait' | 'landscape';
  viewport: { width: number; height: number };
}

const MobileGame: React.FC<MobileGameProps> = ({ orientation, viewport }) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [isSlapping, setIsSlapping] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastTapTime = useRef(0);
  const tapCount = useRef(0);

  // Anti-cheat: Rate limiting for taps
  const maxTapsPerSecond = 4;
  const resetTapCountInterval = 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      tapCount.current = 0;
    }, resetTapCountInterval);

    return () => clearInterval(interval);
  }, []);

  const handleSlap = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    
    const now = Date.now();
    
    // Rate limiting
    if (tapCount.current >= maxTapsPerSecond) {
      console.warn('Rate limit exceeded');
      return;
    }
    
    tapCount.current++;
    lastTapTime.current = now;
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Update score with combo multiplier
    const points = Math.floor(Math.random() * 10 + 1) * combo;
    setScore(prev => prev + points);
    
    // Update combo
    setCombo(prev => Math.min(prev + 1, 10));
    
    // Visual feedback
    setIsSlapping(true);
    setTimeout(() => setIsSlapping(false), 150);
    
    // Create floating score animation
    createFloatingScore(points, event);
  }, [combo]);

  const createFloatingScore = useCallback((points: number, event: React.TouchEvent | React.MouseEvent) => {
    if (!gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      clientX = event.touches[0]?.clientX || event.changedTouches[0]?.clientX || 0;
      clientY = event.touches[0]?.clientY || event.changedTouches[0]?.clientY || 0;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const scoreElement = document.createElement('div');
    scoreElement.textContent = `+${points}`;
    scoreElement.className = 'floating-score';
    scoreElement.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      color: #00ff88;
      font-weight: bold;
      font-size: 1.2rem;
      pointer-events: none;
      z-index: 1000;
      animation: floatUp 1s ease-out forwards;
    `;
    
    gameAreaRef.current.appendChild(scoreElement);
    
    setTimeout(() => {
      if (scoreElement.parentNode) {
        scoreElement.parentNode.removeChild(scoreElement);
      }
    }, 1000);
  }, []);

  // Optimize for different orientations
  const gameAreaStyle = {
    width: '100%',
    height: orientation === 'portrait' ? '60%' : '80%',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    borderRadius: '16px',
    border: '2px solid #00ff88',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none'
  };

  const slapButtonStyle = {
    width: Math.min(viewport.width * 0.4, 200),
    height: Math.min(viewport.width * 0.4, 200),
    borderRadius: '50%',
    background: isSlapping 
      ? 'linear-gradient(135deg, #00cc66, #00ff88)' 
      : 'linear-gradient(135deg, #00ff88, #00c1ff)',
    border: 'none',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    boxShadow: isSlapping 
      ? '0 8px 32px rgba(0, 255, 136, 0.6), 0 0 0 8px rgba(0, 255, 136, 0.2)'
      : '0 8px 32px rgba(0, 255, 136, 0.3)',
    transform: isSlapping ? 'scale(0.95)' : 'scale(1)',
    transition: 'all 0.15s ease-out',
    touchAction: 'manipulation',
    cursor: 'pointer'
  };

  return (
    <div className="flex flex-col h-full p-4 bg-background text-foreground">
      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-green-400 mb-2">
          {score.toLocaleString()}
        </div>
        {combo > 1 && (
          <div className="text-xl text-blue-400">
            Combo x{combo}
          </div>
        )}
      </div>
      
      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        style={gameAreaStyle}
        onTouchStart={handleSlap}
        onClick={handleSlap}
      >
        <button
          style={slapButtonStyle}
          onTouchStart={(e) => e.preventDefault()}
          onTouchEnd={(e) => e.preventDefault()}
        >
          SLAP!
        </button>
      </div>
      
      {/* Mobile UI Controls */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button variant="outline" className="h-12">
            Power-ups
          </Button>
          <Button variant="outline" className="h-12">
            Leaderboard
          </Button>
        </div>
      </div>
      
      {/* Add floating score animation styles */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(1.2);
          }
        }
        
        .floating-score {
          animation: floatUp 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MobileGame;
