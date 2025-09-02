import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ProjectMedia } from '../constants/index';
import { useAnimationFrame, useMouseTracking } from '../hooks/useScrollAnimation';
import MediaPlayer from './MediaPlayer';

interface OrbitalMediaProps {
  media: ProjectMedia[];
  revealLevel: 1 | 2 | 3 | 4;
  className?: string;
}

// Configuração simplificada de órbitas
const orbitConfigs = {
  web: { radius: 0, color: '#00ff88', icon: '🌐' },
  mobile: { radius: 120, color: '#ff6b6b', icon: '📱' },
  admin: { radius: 150, color: '#4ecdc4', icon: '⚙️' },
  features: { radius: 180, color: '#ffe66d', icon: '✨' },
  api: { radius: 200, color: '#9b59b6', icon: '🔗' },
  architecture: { radius: 220, color: '#e74c3c', icon: '🏗️' }
};

const OrbitalMedia: React.FC<OrbitalMediaProps> = ({ media, revealLevel, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<ProjectMedia | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  // Mouse tracking para efeitos gravitacionais
  const mousePos = useMouseTracking(containerRef as React.RefObject<HTMLElement>, 400);
  
  // Motion value para rotação animada
  const [rotation, setRotation] = useState(0);
  
  // Animar rotação contínua das órbitas
  useAnimationFrame((deltaTime) => {
    setRotation(prev => prev + deltaTime * 0.01);
  }, true);

  // Agrupar mídia por categoria
  const mediaByCategory = media.reduce((acc, item) => {
    const category = item.category || 'web';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ProjectMedia[]>);

  // Mídia principal (web ou primeira)
  const primaryMedia = mediaByCategory.web?.[0] || media[0];

  // Calcular se uma categoria deve ser visível baseado no reveal level
  const isCategoryVisible = (category: string) => {
    switch (revealLevel) {
      case 1: return category === 'web';
      case 2: return ['web', 'mobile'].includes(category);
      case 3: return ['web', 'mobile', 'admin'].includes(category);
      case 4: return true;
      default: return false;
    }
  };

  // Calcular posição orbital
  const getOrbitPosition = (category: string, index: number = 0) => {
    const config = orbitConfigs[category as keyof typeof orbitConfigs];
    if (!config) return { x: 0, y: 0 };

    const angleOffset = (index * 120) + (category === 'mobile' ? 0 : category === 'admin' ? 120 : 240);
    const currentAngle = (rotation + angleOffset) * Math.PI / 180;
    
    return {
      x: Math.cos(currentAngle) * config.radius,
      y: Math.sin(currentAngle) * config.radius
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[400px] flex items-center justify-center ${className}`}
    >
      {/* Campo gravitacional visual baseado no mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,255,136,${mousePos.intensity * 0.1}) 0%, transparent 50%)`
        }}
      />

      {/* Mídia Central */}
      <motion.div
        className="relative z-20"
        animate={{
          scale: 1 + mousePos.intensity * 0.05,
          x: mousePos.isHovering ? 0 : (mousePos.intensity * 10 * Math.cos(mousePos.angle)),
          y: mousePos.isHovering ? 0 : (mousePos.intensity * 10 * Math.sin(mousePos.angle))
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Glow pulsante */}
        <motion.div
          className="absolute -inset-8 rounded-full"
          style={{ backgroundColor: orbitConfigs.web.color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Container da mídia principal */}
        <div className="relative w-64 h-40 rounded-xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all bg-black/40 backdrop-blur-sm">
          <MediaPlayer 
            media={[selectedMedia || primaryMedia]}
            className="w-full h-full"
            autoPlay={false}
            showControls={false}
            showIndicators={false}
          />
          
          {/* Label da categoria */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded-full text-xs text-white flex items-center gap-1">
            {orbitConfigs[selectedMedia?.category || primaryMedia.category || 'web' as keyof typeof orbitConfigs]?.icon}
            <span>{selectedMedia?.category || primaryMedia.category || 'web'}</span>
          </div>
        </div>
      </motion.div>

      {/* Mídias Orbitais */}
      {Object.entries(mediaByCategory).map(([category, items]) => {
        if (category === 'web' || !isCategoryVisible(category)) return null;
        
        const config = orbitConfigs[category as keyof typeof orbitConfigs];
        if (!config) return null;

        return items.map((item, index) => {
          const position = getOrbitPosition(category, index);

          return (
            <motion.div
              key={`${category}-${index}`}
              className="absolute"
              animate={{ 
                x: position.x,
                y: position.y
              }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ 
                opacity: 1, 
                scale: hoveredCategory === category ? 1.2 : 1 
              }}
              transition={{ 
                x: { type: "spring", stiffness: 100, damping: 30 },
                y: { type: "spring", stiffness: 100, damping: 30 },
                opacity: { duration: 0.5, delay: revealLevel * 0.2 },
                scale: { type: "spring", stiffness: 300 }
              }}
              onHoverStart={() => setHoveredCategory(category)}
              onHoverEnd={() => setHoveredCategory(null)}
              onClick={() => setSelectedMedia(item)}
            >
              {/* Linha orbital */}
              {hoveredCategory === category && (
                <svg 
                  className="absolute inset-0 w-[400px] h-[400px] -left-[200px] -top-[200px] pointer-events-none"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r={config.radius}
                    fill="none"
                    stroke={config.color}
                    strokeWidth="1"
                    strokeDasharray="5 5"
                    opacity="0.3"
                  />
                </svg>
              )}

              {/* Thumbnail da mídia */}
              <motion.div 
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Efeito de glow */}
                <div 
                  className="absolute -inset-2 rounded-lg blur-md opacity-50"
                  style={{ backgroundColor: config.color }}
                />
                
                {/* Container da mídia */}
                <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-white/30 bg-black/60">
                  <MediaPlayer 
                    media={[item]}
                    className="w-full h-full"
                    autoPlay={false}
                    showControls={false}
                    showIndicators={false}
                  />
                  
                  {/* Ícone da categoria */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-all">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {config.icon}
                    </span>
                  </div>
                </div>

                {/* Tooltip */}
                <motion.div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap pointer-events-none"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: hoveredCategory === category ? 1 : 0, y: 0 }}
                >
                  {item.description || item.alt}
                </motion.div>
              </motion.div>
            </motion.div>
          );
        });
      })}

      {/* Indicadores de categoria (bottom) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {Object.entries(mediaByCategory).map(([category]) => {
          if (!isCategoryVisible(category)) return null;
          const config = orbitConfigs[category as keyof typeof orbitConfigs];
          if (!config) return null;

          return (
            <motion.button
              key={category}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm border border-white/20"
              style={{ 
                backgroundColor: hoveredCategory === category ? config.color : `${config.color}30`,
                borderColor: hoveredCategory === category ? config.color : 'rgba(255,255,255,0.2)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const item = mediaByCategory[category]?.[0];
                if (item) setSelectedMedia(item);
              }}
            >
              {config.icon}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default OrbitalMedia;