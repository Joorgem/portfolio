import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useNavigationStore } from '../stores/navigation.store';
import { getAllNavigationPoints } from '../constants/navigationPoints';
import { useTranslation } from 'react-i18next';

// Variants para animações organizadas
const dotVariants: Variants = {
  initial: { 
    scale: 0, 
    opacity: 0 
  },
  enter: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: { 
    scale: 1.3,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  tap: { 
    scale: 0.95 
  },
  orbiting: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};


const pulseRingVariants: Variants = {
  initial: { 
    scale: 1, 
    opacity: 0 
  },
  pulse: {
    scale: [1, 1.5, 1.8],
    opacity: [0.4, 0.2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeOut"
    }
  }
};

interface ProgressDotProps {
  section: {
    id: string;
  };
  index: number;
  isVisited: boolean;
  isActive: boolean;
  isOrbiting: boolean;
  onClick: () => void;
  progress: number;
  getSectionName: (_id: string) => string;
}

const ProgressDot: React.FC<ProgressDotProps> = ({ 
  section, 
  index: _index,
  isVisited, 
  isActive, 
  isOrbiting,
  onClick,
  progress: _progress,
  getSectionName
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine dot color based on state
  const getDotColor = () => {
    if (isActive || isOrbiting) return '#33c2cc'; // aqua
    if (isVisited) return 'rgba(255, 255, 255, 0.5)'; // white semi-transparent
    return 'rgba(255, 255, 255, 0.2)';
  };

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex items-center gap-4 group cursor-pointer w-full text-left z-10"
      variants={dotVariants}
      initial="initial"
      animate="enter"
      whileHover="hover"
      whileTap="tap"
      custom={_index}
      aria-label={`Navigate to ${section.id} section`}
      role="button"
      tabIndex={0}
    >
      {/* Main dot container */}
      <div className="relative w-4 h-4 flex-shrink-0">
        {/* Pulse ring for orbiting state */}
        <AnimatePresence>
          {isOrbiting && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid #33c2cc',
              }}
              variants={pulseRingVariants}
              initial="initial"
              animate="pulse"
              exit="initial"
            />
          )}
        </AnimatePresence>

        {/* Glow effect for active/orbiting */}
        <AnimatePresence>
          {(isActive || isOrbiting) && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 0.4, 
                scale: 1.5,
                filter: 'blur(8px)'
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                background: isOrbiting ? '#33c2cc' : 'rgba(255, 255, 255, 0.3)'
              }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Main dot */}
        <motion.div
          className="relative w-full h-full rounded-full border transition-all duration-300"
          style={{
            backgroundColor: isVisited || isActive || isOrbiting ? getDotColor() : 'transparent',
            borderColor: getDotColor(),
            borderWidth: isActive ? '2px' : '1px'
          }}
          animate={isOrbiting ? "orbiting" : "default"}
          variants={dotVariants}
        />

        {/* Active pulse center dot */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: [0.8, 1.2, 0.8] }}
              exit={{ scale: 0 }}
              transition={{
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Label with enhanced states */}
      <div className="relative">
        <motion.span 
          className={`text-xs font-light tracking-wider transition-all duration-300 whitespace-nowrap select-none`}
          style={{
            color: isActive ? '#ffffff' : 
                  isOrbiting ? '#33c2cc' :
                  isVisited ? 'rgba(255, 255, 255, 0.8)' : 
                  'rgba(255, 255, 255, 0.4)',
            fontWeight: isActive || isOrbiting ? 500 : 300
          }}
          animate={{
            x: isHovered ? 2 : 0
          }}
        >
          {getSectionName(section.id)}
        </motion.span>

      </div>
    </motion.button>
  );
};



const NavigationProgress: React.FC = () => {
  const { t } = useTranslation('navigation');
  const navigationState = useNavigationStore(state => state.navigationState);
  const currentSection = useNavigationStore(state => state.currentSection);
  const targetSection = useNavigationStore(state => state.targetSection);
  const visitedSections = useNavigationStore(state => state.visitedSections);
  const tutorialCompleted = useNavigationStore(state => state.tutorialCompleted);
  const canInteract = useNavigationStore(state => state.canInteract);
  const startNavigation = useNavigationStore(state => state.startNavigation);

  // Function to get section name from translation
  const getSectionName = (sectionId: string) => {
    return t(`labels.${sectionId}`, sectionId);
  };

  // Get navigation points
  const allNavigationPoints = getAllNavigationPoints();

  // Reorganize navigation points: visited sections at top in order of visit, unvisited below
  const navigationPoints = React.useMemo(() => {
    const visited = [];
    const unvisited = [];
    
    // First add visited sections in the order they were visited
    for (const visitedId of visitedSections) {
      const point = allNavigationPoints.find(p => p.id === visitedId);
      if (point) {
        visited.push(point);
      }
    }
    
    // Then add unvisited sections in their original order
    for (const point of allNavigationPoints) {
      if (!visitedSections.includes(point.id)) {
        unvisited.push(point);
      }
    }
    
    return [...visited, ...unvisited];
  }, [visitedSections, allNavigationPoints]);

  // Desktop detection
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

  // Don't render on mobile or if tutorial not completed
  if (!isDesktop || !tutorialCompleted) return null;

  // Only show on hero page (idle, orbiting states)
  // Hide when in section or during transitions
  const shouldHide = navigationState === 'entering' || 
                     navigationState === 'exiting' ||
                     navigationState === 'zooming_in' ||
                     navigationState === 'zooming_out' ||
                     navigationState === 'in_section';

  // Calculate progress
  const getProgressForSection = (index: number) => {
    const visitedCount = visitedSections.filter((id) => {
      const sectionIndex = navigationPoints.findIndex(p => p.id === id);
      return sectionIndex <= index;
    }).length;
    return Math.min(visitedCount / (index + 1), 1);
  };


  // Determine section state
  const getSectionState = (sectionId: string) => {
    const isVisited = visitedSections.includes(sectionId);
    const isActive = currentSection.toLowerCase() === sectionId && navigationState === 'in_section';
    const isOrbiting = targetSection?.toLowerCase() === sectionId && 
                      (navigationState === 'orbiting' || navigationState === 'zooming_in');
    
    return { isVisited, isActive, isOrbiting };
  };

  const handleDotClick = (sectionId: string) => {
    if (!canInteract()) return;
    
    // If already orbiting the same section, don't do anything
    if (targetSection?.toLowerCase() === sectionId && navigationState === 'orbiting') {
      return;
    }

    // Start navigation
    startNavigation(sectionId);
  };

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.div
          className="fixed right-8 top-8 z-[9998] flex flex-col items-end gap-6"
          initial={{ opacity: 0, x: 20, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 20, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Progress dots */}
          <div className="relative flex flex-col gap-4">
            {/* Navigation dots */}
            {navigationPoints.map((point, index) => {
              const { isVisited, isActive, isOrbiting } = getSectionState(point.id);
              
              return (
                <motion.div
                  key={point.id}
                  layout
                  layoutId={`nav-dot-${point.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: index * 0.1 + 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    layout: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }
                  }}
                >
                  <ProgressDot
                    section={{
                      id: point.id
                    }}
                    index={index}
                    isVisited={isVisited}
                    isActive={isActive}
                    isOrbiting={isOrbiting}
                    onClick={() => handleDotClick(point.id)}
                    progress={getProgressForSection(index)}
                    getSectionName={getSectionName}
                  />
                </motion.div>
              );
            })}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationProgress;