
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

interface GameCanvasProps {
  viewport: { width: number; height: number };
}

const GameCanvas: React.FC<GameCanvasProps> = ({ viewport }) => {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{
          position: [0, 2, 8],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: viewport.width > 1200, // Disable antialiasing on smaller screens
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true
        }}
        dpr={Math.min(window.devicePixelRatio, 2)} // Limit pixel ratio for performance
      >
        <color attach="background" args={["#111111"]} />
        
        <Suspense fallback={null}>
          {/* Game content will go here */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GameCanvas;
