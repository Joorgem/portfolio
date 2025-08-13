import React, { useEffect, useState } from 'react';
import { useNavigationStore } from '../stores/navigation.store';

const MobilePlanetIndicator: React.FC = () => {
  const hoveredPlanet = useNavigationStore(state => state.hoveredPlanet, null);
  const navigationState = useNavigationStore(state => state.navigationState);
  const targetSection = useNavigationStore(state => state.targetSection, null);
  const [showIndicator, setShowIndicator] = useState(false);
  const [displayText, setDisplayText] = useState('');

  // Detecta se é dispositivo móvel
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Não renderiza em desktop
  if (!isMobile) return null;

  useEffect(() => {
    // Mostra permanentemente quando está orbitando, fazendo zoom ou navegando para um planeta específico
    if ((navigationState === 'orbiting' || navigationState === 'zooming_in') && targetSection && targetSection !== 'MAIN') {
      setDisplayText(targetSection);
      setShowIndicator(true);
    }
    // Mostra temporariamente quando toca em um planeta no estado idle
    else if (hoveredPlanet && navigationState === 'idle') {
      setDisplayText(hoveredPlanet);
      setShowIndicator(true);
      
      // Auto-hide depois de 2 segundos para toque rápido
      const timeout = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);

      return () => clearTimeout(timeout);
    } 
    // Esconde quando volta ao estado inicial ou está em uma seção
    else {
      setShowIndicator(false);
    }
  }, [hoveredPlanet, navigationState, targetSection]);

  if (!showIndicator || !displayText) return null;

  return (
    <div className="pointer-events-none fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9998]">
      <div 
        className={`
          px-6 py-3 
          bg-black/80 backdrop-blur-md 
          border border-white/15 
          rounded-2xl
          shadow-2xl shadow-black/60
          transition-all duration-500 ease-out
          ${showIndicator ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
      >
        <span className="text-white/95 text-sm font-medium tracking-widest uppercase">
          {displayText}
        </span>
      </div>
    </div>
  );
};

export default MobilePlanetIndicator;