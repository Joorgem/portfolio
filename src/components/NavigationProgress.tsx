import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '../stores/navigation.store';
import { getAllNavigationPoints } from '../constants/navigationPoints';

interface ProgressDotProps {
  section: {
    id: string;
    name: string;
  };
  isVisited: boolean;
  isActive: boolean;
  isOrbiting: boolean;
  onClick: () => void;
}

const ProgressDot: React.FC<ProgressDotProps> = ({ 
  section, 
  isVisited, 
  isActive, 
  isOrbiting,
  onClick 
}) => {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center gap-3 group cursor-pointer w-full text-left"
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: 1, 
        x: isOrbiting ? -4 : 0 
      }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Dot */}
      <motion.div
        className="relative w-3 h-3 flex-shrink-0 transition-transform duration-300"
        whileHover={{ scale: 1.2 }}
      >
        {/* Outer ring for active/orbiting state */}
        <AnimatePresence>
          {(isActive || isOrbiting) && (
            <motion.div
              className="absolute inset-0 rounded-full border border-white/40"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isOrbiting ? [1, 1.4, 1] : 1, 
                opacity: 0.6 
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: isOrbiting ? 2 : 0.3,
                repeat: isOrbiting ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          )}
        </AnimatePresence>

        {/* Main dot */}
        <motion.div
          className={`
            w-full h-full rounded-full transition-all duration-300
            ${isVisited 
              ? 'bg-white/60 border-white/20 border' 
              : 'bg-transparent border border-white/20'
            }
            ${isActive ? 'bg-white/80' : ''}
          `}
          animate={{
            scale: isActive ? 1.1 : 1
          }}
        >
          {/* Checkmark for visited */}
          <AnimatePresence>
            {isVisited && !isActive && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-1 h-1 bg-black rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Label */}
      <div className="text-left">
        <span className={`text-xs font-light tracking-wider transition-colors duration-300 whitespace-nowrap ${
          isActive ? 'text-white font-medium' : 
          isOrbiting ? 'text-white/90 font-medium' :
          isVisited ? 'text-white/70' : 
          'text-white/40'
        }`}>
          {section.name}
        </span>
      </div>
    </motion.button>
  );
};

const NavigationProgress: React.FC = () => {
  const navigationState = useNavigationStore(state => state.navigationState);
  const currentSection = useNavigationStore(state => state.currentSection);
  const targetSection = useNavigationStore(state => state.targetSection);
  const visitedSections = useNavigationStore(state => state.visitedSections);
  const tutorialCompleted = useNavigationStore(state => state.tutorialCompleted);
  const canInteract = useNavigationStore(state => state.canInteract);
  const startNavigation = useNavigationStore(state => state.startNavigation);

  // Detecta se é desktop
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

  // Não renderiza em mobile ou se tutorial não foi completado
  if (!isDesktop || !tutorialCompleted) return null;

  // Esconde durante transições intensas
  const shouldHide = navigationState === 'entering' || 
                     navigationState === 'exiting' ||
                     navigationState === 'zooming_in' && 
                     useNavigationStore.getState().zoomProgress > 0.7;

  // Obtém todos os pontos de navegação
  const navigationPoints = getAllNavigationPoints();

  // Determina estado de cada seção
  const getSectionState = (sectionId: string) => {
    const isVisited = visitedSections.includes(sectionId);
    const isActive = currentSection.toLowerCase() === sectionId && navigationState === 'in_section';
    const isOrbiting = targetSection?.toLowerCase() === sectionId && 
                      (navigationState === 'orbiting' || navigationState === 'zooming_in');
    
    return { isVisited, isActive, isOrbiting };
  };

  const handleDotClick = (sectionId: string) => {
    if (!canInteract()) return;
    
    // Se já está orbitando a mesma seção, não faz nada
    if (targetSection?.toLowerCase() === sectionId && navigationState === 'orbiting') {
      return;
    }

    // Inicia navegação
    startNavigation(sectionId);
  };

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.div
          className="fixed right-8 top-1/2 -translate-y-1/2 z-[9998] flex flex-col gap-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Progress counter */}
          <motion.div
            className="text-right mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: visitedSections.length > 0 ? 1 : 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white/40 text-xs font-light tracking-wider">
              {visitedSections.length}/{navigationPoints.length} explored
            </span>
          </motion.div>

          {/* Progress dots */}
          <div className="flex flex-col gap-4">
            {navigationPoints.map((point, index) => {
              const { isVisited, isActive, isOrbiting } = getSectionState(point.id);
              
              return (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <ProgressDot
                    section={{
                      id: point.id,
                      name: point.name
                    }}
                    isVisited={isVisited}
                    isActive={isActive}
                    isOrbiting={isOrbiting}
                    onClick={() => handleDotClick(point.id)}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Completion indicator */}
          <AnimatePresence>
            {visitedSections.length === navigationPoints.length && (
              <motion.div
                className="text-center mt-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-full h-px bg-white/10 mb-2" />
                <span className="text-white/60 text-xs font-light tracking-wider">
                  Complete!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationProgress;