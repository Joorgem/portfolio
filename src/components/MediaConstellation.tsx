import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectMedia } from '../constants/index';
import { useMouseProximity } from '../hooks/useScrollProgress';
import MediaPlayer from './MediaPlayer';

interface MediaConstellationProps {
  media: ProjectMedia[];
  revealLevel: 1 | 2 | 3 | 4;
  className?: string;
}

interface OrbitConfig {
  radius: number;
  angle: number;
  speed: number;
  category: string;
  color: string;
  icon: string;
}

// Responsive orbit configurations
const getResponsiveCategoryConfigs = (): Record<string, OrbitConfig> => {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;
  
  const baseRadius = isMobile ? 80 : isTablet ? 100 : 120;
  const multiplier = isMobile ? 0.6 : isTablet ? 0.8 : 1;

  return {
    web: { 
      radius: baseRadius, 
      angle: 0, 
      speed: 0.5, 
      category: 'web',
      color: '#00ff88',
      icon: '🌐'
    },
    mobile: { 
      radius: baseRadius + (40 * multiplier), 
      angle: 90, 
      speed: 0.3, 
      category: 'mobile',
      color: '#ff6b6b',
      icon: '📱'
    },
    admin: { 
      radius: baseRadius + (20 * multiplier), 
      angle: 180, 
      speed: 0.4, 
      category: 'admin',
      color: '#4ecdc4',
      icon: '⚙️'
    },
    features: { 
      radius: baseRadius + (60 * multiplier), 
      angle: 270, 
      speed: 0.2, 
      category: 'features',
      color: '#ffe66d',
      icon: '✨'
    },
    api: { 
      radius: baseRadius + (80 * multiplier), 
      angle: 45, 
      speed: 0.1, 
      category: 'api',
      color: '#a8e6cf',
      icon: '🔌'
    },
    architecture: { 
      radius: baseRadius + (100 * multiplier), 
      angle: 135, 
      speed: 0.15, 
      category: 'architecture',
      color: '#ffd3a5',
      icon: '🏗️'
    }
  };
};

const MediaConstellation: React.FC<MediaConstellationProps> = ({
  media,
  revealLevel,
  className = ""
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredMedia, setHoveredMedia] = useState<string | null>(null);
  const [categoryConfigs, setCategoryConfigs] = useState(getResponsiveCategoryConfigs());
  const constellationRef = useRef<HTMLDivElement>(null);
  const mouseProximity = useMouseProximity(constellationRef as React.RefObject<HTMLElement>);

  // Update configs on resize
  React.useEffect(() => {
    const handleResize = () => setCategoryConfigs(getResponsiveCategoryConfigs());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Agrupar mídia por categoria
  const mediaByCategory = media.reduce((acc, mediaItem) => {
    if (!acc[mediaItem.category]) {
      acc[mediaItem.category] = [];
    }
    acc[mediaItem.category].push(mediaItem);
    return acc;
  }, {} as Record<string, ProjectMedia[]>);

  // Mídia principal (primeira categoria ou web)
  const primaryMedia = media.find(m => m.category === 'web') || media[0];
  
  // Calcular posição orbital
  const getOrbitPosition = (category: string, index: number = 0) => {
    const config = categoryConfigs[category];
    if (!config) return { x: 0, y: 0 };

    const time = Date.now() * 0.001 * config.speed;
    const offsetAngle = (index * 60) + (time * 10); // Múltiplos itens na mesma órbita
    const radians = (config.angle + offsetAngle) * Math.PI / 180;
    
    // Adicionar efeito de mouse proximity
    const proximityEffect = mouseProximity.intensity * 20;
    const adjustedRadius = config.radius + proximityEffect;
    
    return {
      x: Math.cos(radians) * adjustedRadius,
      y: Math.sin(radians) * adjustedRadius
    };
  };

  // Animações de revelação por nível
  const getRevealAnimation = (category: string) => {

    switch (revealLevel) {
      case 1:
        return category === 'web' ? { 
          opacity: 1, 
          scale: 1
        } : { opacity: 0, scale: 0.8 };
      
      case 2:
        return ['web', 'mobile'].includes(category) ? {
          opacity: 1,
          scale: 1
        } : { opacity: 0, scale: 0.8 };
      
      case 3:
        return ['web', 'mobile', 'admin'].includes(category) ? {
          opacity: 1,
          scale: 1
        } : { opacity: 0, scale: 0.8 };
      
      case 4:
        return {
          opacity: 1,
          scale: 1
        };
      default:
        return { opacity: 0, scale: 0.8 };
    }
  };

  return (
    <div 
      ref={constellationRef}
      className={`relative w-full h-96 flex items-center justify-center ${className}`}
    >
      {/* Mídia Central (Planeta Principal) */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: mouseProximity.isNear ? 1.05 : 1,
          rotate: mouseProximity.isNear ? mouseProximity.angle * (180 / Math.PI) * 0.02 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="relative">
          {/* Glow effect */}
          <motion.div 
            className="absolute -inset-8 rounded-full opacity-30 blur-xl"
            style={{ backgroundColor: categoryConfigs[primaryMedia.category]?.color || '#00ff88' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300">
            <MediaPlayer 
              media={selectedCategory ? mediaByCategory[selectedCategory] : [primaryMedia]}
              className="w-full h-full"
              autoPlay={true}
              showControls={true}
              showIndicators={false}
            />
          </div>
        </div>
      </motion.div>

      {/* Órbitas e Mídias Satelites */}
      <AnimatePresence>
        {Object.entries(mediaByCategory).map(([category, categoryMedia]) => {
          if (category === primaryMedia.category) return null;
          
          return categoryMedia.map((mediaItem, index) => {
            const position = getOrbitPosition(category, index);
            const config = categoryConfigs[category];
            const shouldShow = getRevealAnimation(category).opacity === 1;

            if (!shouldShow) return null;

            return (
              <motion.div
                key={`${category}-${index}`}
                className="absolute cursor-pointer"
                style={{
                  x: position.x,
                  y: position.y
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={getRevealAnimation(category)}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ 
                  delay: Object.keys(categoryConfigs).indexOf(category) * 0.2, 
                  duration: 0.6, 
                  ease: "easeOut" 
                }}
                whileHover={{ 
                  scale: 1.1, 
                  zIndex: 20,
                  transition: { duration: 0.2 }
                }}
                onHoverStart={() => setHoveredMedia(`${category}-${index}`)}
                onHoverEnd={() => setHoveredMedia(null)}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                {/* Órbita visual */}
                {hoveredMedia === `${category}-${index}` && (
                  <motion.div
                    className="absolute border border-white/20 rounded-full pointer-events-none"
                    style={{
                      width: config.radius * 2,
                      height: config.radius * 2,
                      left: -config.radius,
                      top: -config.radius,
                      x: -position.x,
                      y: -position.y
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}

                {/* Media Thumbnail */}
                <div className="relative group">
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute -inset-4 rounded-full opacity-20 blur-lg"
                    style={{ backgroundColor: config.color }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                  />
                  
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-white/30 hover:border-white/60 transition-all duration-300">
                    <MediaPlayer 
                      media={[mediaItem]}
                      className="w-full h-full"
                      autoPlay={false}
                      showControls={false}
                      showIndicators={false}
                    />
                    
                    {/* Category Icon */}
                    <div 
                      className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: `${config.color}40` }}
                    >
                      {config.icon}
                    </div>
                  </div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredMedia === `${category}-${index}` && (
                      <motion.div
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        {mediaItem.description}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/80" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          });
        })}
      </AnimatePresence>

      {/* Category Selector (Constellation Map) */}
      {revealLevel >= 3 && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex space-x-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            {Object.entries(mediaByCategory).map(([category]) => {
              const config = categoryConfigs[category];
              const isActive = selectedCategory === category;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(isActive ? null : category)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                    isActive 
                      ? 'scale-110 shadow-lg' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: isActive ? config.color : `${config.color}40`,
                    boxShadow: isActive ? `0 0 20px ${config.color}60` : 'none'
                  }}
                >
                  {config.icon}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MediaConstellation;