import { Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import HeroTextFixed from "../components/HeroTextFixed";
import { Astronaut } from "../components/Astronaut";
import Loader from "../components/Loader";
import NavigationSystemStable from "../components/NavigationSystemStable";
import CameraControllerZustand from "../components/CameraController.Zustand";
import { useNavigationStore } from "../stores/navigation.store";

/**
 * Hero Section com Zustand
 */
const HeroZustand = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const astronautRef = useRef();
  
  const astronautScale = isMobile ? 0.25 : 0.4;
  const astronautPosition = [-0.08, -0.5, 0];
  
  // Estados do store
  const navigationState = useNavigationStore(state => state.navigationState);
  const currentSection = useNavigationStore(state => state.currentSection);
  const targetSection = useNavigationStore(state => state.targetSection);
  const zoomProgress = useNavigationStore(state => state.zoomProgress);
  const fadeProgress = useNavigationStore(state => state.fadeProgress);
  const canvas3DActive = useNavigationStore(state => state.canvas3DActive);
  const zoomOutProgress = useNavigationStore(state => state.zoomOutProgress);
  
  // Ações do store
  const startNavigation = useNavigationStore(state => state.startNavigation);
  const handleScroll = useNavigationStore(state => state.handleScroll);
  const canInteract = useNavigationStore(state => state.canInteract);
  
  // Handler de navegação
  const handleNavigate = useCallback((point) => {
    if (!canInteract()) {
      console.log('⚠️ Navegação bloqueada - Estado:', navigationState);
      return;
    }
    
    console.log('🎯 Navegando para:', point.name);
    startNavigation(point.id);
  }, [startNavigation, canInteract, navigationState]);
  
  // Handler para voltar ao início
  const handleBackToMain = useCallback(() => {
    console.log('🏠 Voltando para MAIN');
    startNavigation('MAIN');
  }, [startNavigation]);
  
  // Setup de event listeners
  useEffect(() => {
    // Handler de wheel
    const handleWheel = (e) => {
      const state = useNavigationStore.getState().navigationState;
      
      // Verifica se o scroll está em um elemento scrollável (dentro do conteúdo)
      const isInsideContent = e.target.closest('.overflow-y-auto, .overflow-y-scroll, .overflow-auto, .overflow-scroll');
      
      if (state === 'in_section') {
        // Se está dentro de uma seção
        if (isInsideContent) {
          // Permite scroll normal do conteúdo
          console.log('📜 Scroll dentro do conteúdo');
          handleScroll(e.deltaY, true);
          return; // Não previne o default
        } else {
          // Scroll fora do conteúdo, pode ser para sair
          e.preventDefault();
          handleScroll(e.deltaY, false);
        }
      } else if (state !== 'idle') {
        // Outros estados (orbiting, zooming, etc)
        e.preventDefault();
        handleScroll(e.deltaY, false);
      }
    };
    
    // Handler de ESC
    const handleKeyDown = (e) => {
      console.log('⌨️ Tecla pressionada:', e.key);
      
      if (e.key === 'Escape') {
        const state = useNavigationStore.getState();
        console.log('🔄 ESC detectado! Estado atual:', state.navigationState);
        e.preventDefault();
        
        // Se está em seção, sai da seção E vai para inicial
        if (state.navigationState === 'in_section') {
          console.log('🔄 ESC - Saindo da seção e voltando ao início');
          state.goToInitialState();
        } 
        // Se está orbitando um planeta, volta para inicial
        else if (state.navigationState === 'orbiting') {
          console.log('🔄 ESC - Voltando ao estado inicial do orbiting');
          state.goToInitialState();
        }
        // Se está fazendo zoom, cancela
        else if (state.navigationState === 'zooming_in') {
          console.log('🔄 ESC - Cancelando zoom');
          state.goToInitialState();
        }
        // Qualquer outro estado
        else {
          console.log('🔄 ESC - Estado atual não requer ação:', state.navigationState);
        }
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      // Cleanup do store
      useNavigationStore.getState().cleanup();
    };
  }, [handleScroll]);
  
  // Monitor de desenvolvimento
  const DevMonitor = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="fixed top-4 right-4 z-50 
                        bg-black/90 backdrop-blur-sm rounded-lg 
                        border border-white/20 p-3 
                        font-mono text-xs text-white/90
                        min-w-[280px] pointer-events-none">
          <div className="font-bold mb-2 text-white">
            Estado: {navigationState.toUpperCase()}
          </div>
          <div className="space-y-1 text-white/70">
            <div>Seção Atual: {currentSection}</div>
            {targetSection && <div>Destino: {targetSection}</div>}
            <div>Canvas: {canvas3DActive ? '✅ Ativo' : '⏸️ Pausado'}</div>
            <div>Pode Interagir: {canInteract() ? '✅' : '❌'}</div>
            {zoomProgress > 0 && (
              <div>
                Zoom: {Math.round(zoomProgress * 100)}%
                <div className="w-full h-1 bg-white/20 rounded mt-1">
                  <div 
                    className="h-full bg-blue-500 rounded transition-all"
                    style={{ width: `${zoomProgress * 100}%` }}
                  />
                </div>
              </div>
            )}
            {fadeProgress > 0 && (
              <div>
                Fade: {Math.round(fadeProgress * 100)}%
                <div className="w-full h-1 bg-white/20 rounded mt-1">
                  <div 
                    className="h-full bg-purple-500 rounded transition-all"
                    style={{ width: `${fadeProgress * 100}%` }}
                  />
                </div>
              </div>
            )}
            {zoomOutProgress > 0 && (
              <div>
                Zoom Out: {Math.round(zoomOutProgress * 100)}%
                <div className="w-full h-1 bg-white/20 rounded mt-1">
                  <div 
                    className="h-full bg-orange-500 rounded transition-all"
                    style={{ width: `${zoomOutProgress * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Texto Hero - Oculta durante navegação */}
      {(navigationState === 'idle' || navigationState === 'orbiting') && (
        <HeroTextFixed />
      )}
      
      {/* Canvas 3D Principal */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          camera={{ 
            position: [0, 0, 5], 
            fov: 75, 
            near: 0.001, 
            far: 1000 
          }}
          frameloop={canvas3DActive ? 'always' : 'demand'}
          dpr={[1, 2]}
        >
          <Suspense fallback={<Loader />}>
            {/* Iluminação */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* Modelo do Astronauta */}
            <Astronaut
              ref={astronautRef}
              scale={astronautScale}
              position={astronautPosition}
            />
            
            {/* Sistema de Navegação (hitboxes) */}
            <NavigationSystemStable
              astronautRef={astronautRef}
              astronautScale={astronautScale}
              astronautPosition={astronautPosition}
              onNavigate={handleNavigate}
              debugMode={false}
            />
            
            {/* Controlador de Câmera com Zustand */}
            <CameraControllerZustand
              astronautRef={astronautRef}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Overlay de Fade */}
      {fadeProgress > 0 && (
        <div 
          className="fixed inset-0 bg-black pointer-events-none z-10"
          style={{ 
            opacity: fadeProgress,
            transition: 'opacity 0.1s linear'
          }}
        />
      )}
      
      {/* Indicador de zoom out com progresso */}
      {navigationState === 'orbiting' && targetSection && targetSection !== 'MAIN' && (
        <div className="fixed top-4 left-4 z-30 px-3 py-2 
                        bg-white/5 backdrop-blur-sm rounded-lg
                        border border-white/10 text-white/60 text-xs
                        pointer-events-none flex items-center gap-2">
          <span>🖱️ ⬆️</span>
          <span>Zoom out para voltar</span>
          {zoomOutProgress > 0 && (
            <div className="ml-2 w-16 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                style={{ width: `${zoomOutProgress * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Instruções Contextuais */}
      {navigationState === 'idle' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20
                        animate-pulse pointer-events-none">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full
                          border border-white/20 text-white/80 text-sm">
            👆 Clique nos planetas para navegar
          </div>
        </div>
      )}
      
      {navigationState === 'orbiting' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20
                        pointer-events-none">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full
                          border border-white/20 text-white/80 text-sm text-center">
            {currentSection !== 'MAIN' ? (
              <>
                <span className="font-semibold">🌍 {currentSection}</span>
                <span className="mx-2">|</span>
                <span>🖱️ Scroll fluido para navegar</span>
                <span className="mx-2">|</span>
                <span>👆 Outro planeta</span>
              </>
            ) : (
              '👆 Clique em um planeta para explorar'
            )}
          </div>
        </div>
      )}
      
      {/* Indicador de progresso do zoom fluido */}
      {(navigationState === 'orbiting' || navigationState === 'zooming_in') && 
       (zoomProgress > 0.05 || zoomOutProgress > 0.05) && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20
                        pointer-events-none">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full
                          border border-white/20 text-white/80 text-sm text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span>🖱️ Scroll fluido</span>
              {zoomProgress > 0.05 && <span className="text-blue-400">↗️ {Math.round(zoomProgress * 100)}%</span>}
              {zoomOutProgress > 0.05 && <span className="text-orange-400">↙️ {Math.round(zoomOutProgress * 100)}%</span>}
            </div>
            <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden flex">
              {/* Barra de zoom in (azul) */}
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${zoomProgress * 50}%` }}
              />
              {/* Espaço do meio */}
              <div className="flex-1 bg-white/10" />
              {/* Barra de zoom out (laranja) */}
              <div 
                className="h-full bg-gradient-to-l from-orange-500 to-red-500 transition-all"
                style={{ width: `${zoomOutProgress * 50}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Monitor de Desenvolvimento */}
      <DevMonitor />
    </section>
  );
};

export default HeroZustand;