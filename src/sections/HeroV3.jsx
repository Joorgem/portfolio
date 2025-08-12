import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { useMediaQuery } from "react-responsive";
import HeroTextFixed from "../components/HeroTextFixed";
import { Astronaut } from "../components/Astronaut";
import Loader from "../components/Loader";
import NavigationSystemStable from "../components/NavigationSystemStable";
import CameraControllerV4 from "../components/CameraControllerV4";
import { OptimizedCanvasV2 } from "../components/OptimizedCanvasV2";
import { useNavigationV4 } from "../contexts/NavigationContextV4";

const HeroV3 = () => {
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
  } = useNavigationV4();
  
  // Handler de navegação
  const handleNavigate = useCallback((point) => {
    if (!canInteract) return;
    
    console.log('🎯 Clicou em:', point.name);
    startNavigation(point.id);
  }, [canInteract, startNavigation]);
  
  // Debug keyboard
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        setDebugVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Monitor de estado (desenvolvimento)
  const StateMonitor = () => {
    if (!debugVisible && process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 
                      bg-black/90 backdrop-blur-md rounded-lg 
                      border border-white/10 p-4 
                      font-mono text-xs text-white/80
                      min-w-[280px] pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${
            isNavigating ? 'bg-yellow-400 animate-pulse' : 
            isInSection ? 'bg-green-400' : 
            'bg-blue-400'
          }`} />
          <span className="font-semibold uppercase">
            {navigationState.replace('_', ' ')}
          </span>
        </div>
        
        <div className="space-y-2 text-white/60">
          <div className="flex justify-between">
            <span>Seção:</span>
            <span className="text-white">{currentSection}</span>
          </div>
          
          {targetSection && (
            <div className="flex justify-between">
              <span>Destino:</span>
              <span className="text-yellow-400">{targetSection}</span>
            </div>
          )}
          
          {zoomProgress > 0 && (
            <div>
              <div className="flex justify-between mb-1">
                <span>Zoom:</span>
                <span className="text-white">{Math.round(zoomProgress * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 
                             transition-all duration-300 ease-out"
                  style={{ width: `${zoomProgress * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {fadeProgress > 0 && (
            <div>
              <div className="flex justify-between mb-1">
                <span>Fade:</span>
                <span className="text-white">{Math.round(fadeProgress * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 
                             transition-all duration-300 ease-out"
                  style={{ width: `${fadeProgress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <section className="relative w-screen h-screen overflow-hidden">
      {/* Texto Hero fixo no canto superior esquerdo */}
      <HeroTextFixed />
      
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
              debugMode={false}
            />
            
            {/* Controlador de câmera V4 */}
            <CameraControllerV4
              astronautRef={astronautRef}
            />
          </Suspense>
        </OptimizedCanvasV2>
      </figure>
      
      {/* Monitor de estado */}
      <StateMonitor />
      
      {/* Instruções iniciais */}
      {navigationState === 'idle' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10
                        animate-pulse pointer-events-none">
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full
                          border border-white/20 text-white/80 text-sm
                          flex items-center gap-2">
            <span>👆</span>
            <span>Clique nos planetas para explorar</span>
          </div>
        </div>
      )}
      
      {/* Instruções de zoom */}
      {navigationState === 'orbiting' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10
                        pointer-events-none">
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full
                          border border-white/20 text-white/80 text-sm
                          flex items-center gap-2">
            <span>🖱️</span>
            <span>Use o scroll para aproximar</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroV3;