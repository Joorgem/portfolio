import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project as ProjectType } from '../constants/index';
import { useScrollProgress, useMouseProximity } from '../hooks/useScrollProgress';
import MediaConstellation from './MediaConstellation';

interface ProjectOrbitProps extends ProjectType {
  index: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const ProjectOrbit: React.FC<ProjectOrbitProps> = ({
  title,
  subDescription,
  href,
  repositoryUrl,
  media,
  tags,
  index,
  isExpanded = false,
  onToggleExpand
}) => {
  const projectRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress(projectRef as React.RefObject<HTMLElement>, { threshold: 0.1 });
  const mouseProximity = useMouseProximity(projectRef as React.RefObject<HTMLElement>);
  
  const [isHovered, setIsHovered] = useState(false);
  
  // Alternating layout based on index
  const isEven = index % 2 === 0;

  // Animations based on scroll reveal level
  const getContentAnimations = () => {
    const baseDelay = 0.2;
    
    switch (scrollProgress.revealLevel) {
      case 1:
        return {
          title: { opacity: 1, y: 0, transition: { delay: baseDelay, duration: 0.8 } },
          description: { opacity: 0, y: 20 },
          tags: { opacity: 0, y: 20 },
          actions: { opacity: 0, y: 20 }
        };
      
      case 2:
        return {
          title: { opacity: 1, y: 0, transition: { delay: 0, duration: 0.6 } },
          description: { opacity: 1, y: 0, transition: { delay: baseDelay + 0.1, duration: 0.8 } },
          tags: { opacity: 0, y: 20 },
          actions: { opacity: 0, y: 20 }
        };
      
      case 3:
        return {
          title: { opacity: 1, y: 0 },
          description: { opacity: 1, y: 0 },
          tags: { opacity: 1, y: 0, transition: { delay: baseDelay + 0.2, duration: 0.6 } },
          actions: { opacity: 0, y: 20 }
        };
      
      case 4:
        return {
          title: { opacity: 1, y: 0 },
          description: { opacity: 1, y: 0 },
          tags: { opacity: 1, y: 0 },
          actions: { opacity: 1, y: 0, transition: { delay: baseDelay + 0.3, duration: 0.6 } }
        };
    }
  };

  const contentAnimations = getContentAnimations();

  // Efeito gravitacional baseado na proximidade do mouse
  const gravitationalPull = {
    x: mouseProximity.isNear ? (mouseProximity.intensity * 10 * Math.cos(mouseProximity.angle)) : 0,
    y: mouseProximity.isNear ? (mouseProximity.intensity * 10 * Math.sin(mouseProximity.angle)) : 0,
    scale: mouseProximity.isNear ? 1 + (mouseProximity.intensity * 0.02) : 1,
  };

  return (
    <motion.div
      ref={projectRef}
      className="relative min-h-screen flex items-center justify-center py-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: scrollProgress.isVisible ? 1 : 0,
        ...gravitationalPull
      }}
      transition={{ 
        opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        x: { type: "spring", stiffness: 300, damping: 30 },
        y: { type: "spring", stiffness: 300, damping: 30 },
        scale: { type: "spring", stiffness: 400, damping: 25 }
      }}
    >
      {/* Campo Gravitacional Visual */}
      <AnimatePresence>
        {isHovered && mouseProximity.isNear && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 rounded-full opacity-10 blur-3xl"
              style={{
                background: `radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)`,
                transform: `translate(${mouseProximity.intensity * 20}px, ${mouseProximity.intensity * 20}px)`
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* Media Section - Alternating position */}
          <motion.div 
            className={`relative ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
            initial={{ opacity: 0, x: isEven ? -100 : 100 }}
            animate={{ 
              opacity: scrollProgress.isVisible ? 1 : 0,
              x: scrollProgress.isVisible ? 0 : (isEven ? -100 : 100)
            }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Media Constellation */}
            <div className="relative">
              {/* Efeito de "Descoberta de Planeta" */}
              <motion.div
                className="absolute -inset-16 opacity-20 blur-2xl rounded-full"
                style={{ 
                  background: 'radial-gradient(circle, rgba(0,255,136,0.4) 0%, rgba(0,200,255,0.2) 50%, transparent 100%)'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <MediaConstellation 
                media={media}
                revealLevel={scrollProgress.revealLevel}
                className="relative z-10"
              />
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            className={`space-y-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
            initial={{ opacity: 0, x: isEven ? 100 : -100 }}
            animate={{ 
              opacity: scrollProgress.isVisible ? 1 : 0,
              x: scrollProgress.isVisible ? 0 : (isEven ? 100 : -100)
            }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Title - Level 1 Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={contentAnimations.title}
            >
              <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                whileHover={{ 
                  scale: 1.02,
                  color: "#00ff88",
                  textShadow: "0 0 20px rgba(0,255,136,0.5)"
                }}
                transition={{ duration: 0.3 }}
              >
                {title}
              </motion.h2>
              
              {/* Indicador de Progresso de Scroll */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${scrollProgress.elementProgress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Description - Level 2 Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={contentAnimations.description}
              className="space-y-4"
            >
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                {subDescription[0]}
              </p>
              
              {/* Scan Line Effect */}
              {scrollProgress.revealLevel >= 2 && (
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              )}
            </motion.div>

            {/* Tags - Level 3 Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={contentAnimations.tags}
              className="space-y-4"
            >
              <h4 className="text-sm uppercase tracking-wider text-gray-400 font-medium">
                Orbital Technologies
              </h4>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {tags.slice(0, 5).map((tag, tagIndex) => (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 0,
                      y: [0, -2, 0]
                    }}
                    transition={{ 
                      duration: 0.5, 
                      delay: tagIndex * 0.1,
                      y: { duration: 2, repeat: Infinity, delay: tagIndex * 0.3 }
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      boxShadow: "0 0 20px rgba(0,255,136,0.3)"
                    }}
                    className="group relative px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm text-white/80 text-xs sm:text-sm rounded-full border border-white/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-1 left-2 w-1 h-1 bg-green-400 rounded-full animate-ping" />
                      <div className="absolute bottom-1 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-200" />
                    </div>
                    <span className="relative z-10">{tag.name}</span>
                  </motion.div>
                ))}
                
                {tags.length > 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="px-4 py-2 text-white/60 text-sm rounded-full border border-white/10"
                  >
                    +{tags.length - 5} mais
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Actions - Level 4 Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={contentAnimations.actions}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <motion.a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold rounded-full overflow-hidden transition-all duration-300 text-sm sm:text-base"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 40px rgba(0,255,136,0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Project
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
                
                {/* Particle trail effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-1/2 left-4 w-1 h-1 bg-white rounded-full animate-ping" />
                  <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-white rounded-full animate-ping animation-delay-100" />
                  <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200" />
                </div>
              </motion.a>

              {repositoryUrl && (
                <motion.a
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-full border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(255,255,255,0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    Código Fonte
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </span>
                </motion.a>
              )}

              <motion.button
                onClick={onToggleExpand}
                className="group px-8 py-3 bg-transparent text-white/70 font-medium rounded-full border border-white/20 hover:bg-white/5 hover:text-white hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  {isExpanded ? 'Collapse' : 'Explore More'}
                  <motion.svg
                    className="w-4 h-4"
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-8 border-t border-white/10 space-y-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Características Detalhadas</h4>
                    
                    {subDescription.slice(0, 4).map((desc, descIndex) => (
                      <motion.div
                        key={descIndex}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * descIndex, duration: 0.5 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-400 leading-relaxed">{desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Reveal Level Indicator */}
      {scrollProgress.isVisible && (
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="flex flex-col items-center space-y-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  scrollProgress.revealLevel >= level 
                    ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                    : 'bg-white/20'
                }`}
              />
            ))}
            <span className="text-xs text-white/50 mt-2">
              Level {scrollProgress.revealLevel}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProjectOrbit;