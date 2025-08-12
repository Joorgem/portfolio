import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { useMediaQuery } from "react-responsive";
import HeroText from "../components/HeroText";
import { Astronaut } from "../components/Astronaut";
import Loader from "../components/Loader";
import NavigationSystemStable from "../components/NavigationSystemStable";
import CameraControllerV3 from "../components/CameraControllerV3";
import { OptimizedCanvasV2 } from "../components/OptimizedCanvasV2";
import { useNavigationV3 } from "../contexts/NavigationContextV3";

const HeroV2 = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const [debugVisible, setDebugVisible] = useState(false);
  const astronautRef = useRef();
  
  const astronautScale = isMobile ? 0.25 : 0.4;
  const astronautPosition = [-0.08, -0.5, 0];
  
  // Hook do contexto de navegação
  const { 
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress,
    startNavigation,
    initiateExit,
    isNavigating,
    isInSection,
    canInteract
  } = useNavigationV3();
  
  // Handler de navegação - conecta clique com contexto
  const handleNavigate = useCallback((point) => {
    if (!canInteract) return;
    
    console.log('🎯 Navegando para:', point.name);
    startNavigation(point.id);
  }, [canInteract, startNavigation]);
  
  // Debug keyboard handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        setDebugVisible(prev => !prev);
        console.log('Debug:', !debugVisible ? 'ON' : 'OFF');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugVisible]);
  
  // Indicador de estado visual
  const StateIndicator = () => (
    <div className="fixed top-4 right-4 z-50 
                    bg-black/80 backdrop-blur-md rounded-lg 
                    border border-white/10 p-4 
                    font-mono text-xs text-white/80
                    min-w-[250px]">
      {/* Estado principal */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${
          isNavigating ? 'bg-yellow-400 animate-pulse' : 
          isInSection ? 'bg-green-400' : 
          'bg-blue-400'
        }`} />
        <span className="font-semibold">
          {navigationState.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      {/* Informações detalhadas */}
      <div className="space-y-1 text-white/60">
        <div className="flex justify-between">
          <span>Seção:</span>
          <span className="text-white/90">{currentSection}</span>
        </div>
        {targetSection && targetSection !== currentSection && (
          <div className="flex justify-between">
            <span>Destino:</span>
            <span className="text-yellow-400">{targetSection}</span>
          </div>
        )}
        {zoomProgress > 0 && (
          <div className="flex justify-between">
            <span>Zoom:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 
                             transition-all duration-100"
                  style={{ width: `${zoomProgress * 100}%` }}
                />
              </div>
              <span className="text-white/90">{Math.round(zoomProgress * 100)}%</span>
            </div>
          </div>
        )}
        {fadeProgress > 0 && (
          <div className="flex justify-between">
            <span>Fade:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 
                             transition-all duration-100"
                  style={{ width: `${fadeProgress * 100}%` }}
                />
              </div>
              <span className="text-white/90">{Math.round(fadeProgress * 100)}%</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Instruções */}
      <div className="mt-3 pt-3 border-t border-white/10 text-white/50">
        {navigationState === 'idle' && (
          <p>🖱️ Clique em um planeta para navegar</p>
        )}
        {navigationState === 'orbiting' && (
          <p>🖱️ Use o scroll para aproximar</p>
        )}
        {navigationState === 'in_section' && (
          <p>⌨️ Pressione ESC para voltar</p>
        )}
      </div>
    </div>
  );
  
  return (
    <section className="relative flex items-start justify-center h-screen w-screen overflow-hidden">
      {/* Texto do Hero */}
      <HeroText />
      
      {/* Canvas 3D otimizado */}
      <figure className="fixed inset-0 z-0">
        <OptimizedCanvasV2 
          camera={{ 
            position: [0, 0, 5], 
            fov: 75, 
            near: 0.001, 
            far: 1000 
          }}
        >
          <Suspense fallback={<Loader />}>
            {/* Iluminação */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* Astronauta */}
            <Astronaut
              ref={astronautRef}
              scale={astronautScale}
              position={astronautPosition}
            />
            
            {/* Sistema de navegação */}
            <NavigationSystemStable
              astronautRef={astronautRef}
              astronautScale={astronautScale}
              astronautPosition={astronautPosition}
              onNavigate={handleNavigate}
              debugMode={debugVisible}
            />
            
            {/* Controlador de câmera V3 - com posições corrigidas */}
            <CameraControllerV3
              astronautRef={astronautRef}
            />
          </Suspense>
        </OptimizedCanvasV2>
      </figure>
      
      {/* Indicador de estado (desenvolvimento) */}
      {(debugVisible || process.env.NODE_ENV === 'development') && (
        <StateIndicator />
      )}
      
      {/* Instruções visuais */}
      {navigationState === 'idle' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10
                        animate-pulse">
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full
                          border border-white/20 text-white/80 text-sm
                          flex items-center gap-2">
            <span>👆</span>
            <span>Clique nos planetas para explorar</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroV2;