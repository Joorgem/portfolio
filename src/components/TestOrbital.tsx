import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useAnimationFrame, useMouseTracking } from '../hooks/useScrollAnimation';

const TestOrbital: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotation = useMotionValue(0);
  const mousePos = useMouseTracking(containerRef as React.RefObject<HTMLElement>, 300);
  
  // Animar rotação contínua
  useAnimationFrame((deltaTime) => {
    rotation.set(rotation.get() + deltaTime * 0.02);
  }, true);

  // Transformar rotação em posições x/y para órbitas
  const orbit1X = useTransform(rotation, (r) => Math.cos(r * Math.PI / 180) * 100);
  const orbit1Y = useTransform(rotation, (r) => Math.sin(r * Math.PI / 180) * 100);
  
  const orbit2X = useTransform(rotation, (r) => Math.cos((r + 120) * Math.PI / 180) * 150);
  const orbit2Y = useTransform(rotation, (r) => Math.sin((r + 120) * Math.PI / 180) * 150);
  
  const orbit3X = useTransform(rotation, (r) => Math.cos((r + 240) * Math.PI / 180) * 200);
  const orbit3Y = useTransform(rotation, (r) => Math.sin((r + 240) * Math.PI / 180) * 200);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div 
        ref={containerRef}
        className="relative w-[600px] h-[600px] flex items-center justify-center"
      >
        {/* Campo gravitacional do mouse */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `radial-gradient(circle 200px at ${mousePos.elementX}px ${mousePos.elementY}px, 
              rgba(0,255,136,${mousePos.intensity * 0.2}) 0%, 
              transparent 70%)`
          }}
        />

        {/* Linhas orbitais */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <circle cx="300" cy="300" r="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          <circle cx="300" cy="300" r="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          <circle cx="300" cy="300" r="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
        </svg>

        {/* Centro - Sol */}
        <motion.div
          className="relative z-20 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl"
          animate={{
            scale: 1 + mousePos.intensity * 0.1,
            boxShadow: `0 0 ${30 + mousePos.intensity * 50}px rgba(255,200,0,0.5)`
          }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-300 opacity-30" />
        </motion.div>

        {/* Planeta 1 - Órbita interna */}
        <motion.div
          className="absolute w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"
          style={{ x: orbit1X, y: orbit1Y }}
          whileHover={{ scale: 1.2 }}
        >
          <div className="absolute inset-0 rounded-full bg-blue-300 opacity-30 animate-pulse" />
        </motion.div>

        {/* Planeta 2 - Órbita média */}
        <motion.div
          className="absolute w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg"
          style={{ x: orbit2X, y: orbit2Y }}
          whileHover={{ scale: 1.2 }}
        >
          <div className="absolute inset-0 rounded-full bg-green-300 opacity-30 animate-pulse" />
        </motion.div>

        {/* Planeta 3 - Órbita externa */}
        <motion.div
          className="absolute w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg"
          style={{ x: orbit3X, y: orbit3Y }}
          whileHover={{ scale: 1.2 }}
        >
          <div className="absolute inset-0 rounded-full bg-purple-300 opacity-30 animate-pulse" />
        </motion.div>

        {/* Informações de debug */}
        <div className="absolute top-4 left-4 text-white text-xs space-y-1 font-mono">
          <div>Mouse X: {mousePos.elementX.toFixed(0)}</div>
          <div>Mouse Y: {mousePos.elementY.toFixed(0)}</div>
          <div>Distance: {mousePos.distance.toFixed(0)}</div>
          <div>Intensity: {(mousePos.intensity * 100).toFixed(0)}%</div>
          <div>Hovering: {mousePos.isHovering ? 'Yes' : 'No'}</div>
          <div>Rotation: {rotation.get().toFixed(0)}°</div>
        </div>
      </div>
    </div>
  );
};

export default TestOrbital;