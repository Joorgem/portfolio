import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import HeroTextFixed from "../components/HeroTextFixed";
import { Astronaut } from "../components/Astronaut";
import Loader from "../components/Loader";
import NavigationSystemStable from "../components/NavigationSystemStable";
import CameraControllerFinal from "../components/CameraControllerFinal";
import { useNavigationFixed } from "../contexts/NavigationContextFixed";

/**
 * Hero Section Final - Sistema completo e funcional
 */
const HeroFinal = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const astronautRef = useRef();
  
  const astronautScale = isMobile ? 0.25 : 0.4;
  const astronautPosition = [-0.08, -0.5, 0];
  
  // Contexto de navegação
  const { 
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress,
    startNavigation,
    canvas3DActive,
    canInteract
  } = useNavigationFixed();
  
  // Handler de navegação
  const handleNavigate = useCallback((point) => {
    if (!canInteract) {
      console.log('⚠️ Navegação bloqueada - Estado:', navigationState);
      return;
    }
    
    console.log('🎯 Navegando para:', point.name);
    startNavigation(point.id);
  }, [canInteract, startNavigation, navigationState]);
  
  // Handler para voltar ao início
  const handleBackToMain = useCallback(() => {
    console.log('🏠 Voltando para MAIN');
    startNavigation('MAIN');
  }, [startNavigation]);
  
  // Monitor de desenvolvimento
  const DevMonitor = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="fixed top-4 right-4 z-50 
                        bg-black/90 backdrop-blur-sm rounded-lg 
                        border border-white/20 p-3 
                        font-mono text-xs text-white/90
                        min-w-[250px] pointer-events-none">
          <div className="font-bold mb-2 text-white">
            Estado: {navigationState.toUpperCase()}
          </div>
          <div className="space-y-1 text-white/70">
            <div>Seção Atual: {currentSection}</div>
            {targetSection && <div>Destino: {targetSection}</div>}
            <div>Canvas: {canvas3DActive ? '✅ Ativo' : '⏸️ Pausado'}</div>
            <div>Pode Interagir: {canInteract ? '✅' : '❌'}</div>
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
            
            {/* Controlador de Câmera Final */}
            <CameraControllerFinal
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
      
      {/* Botão Voltar ao Início - Só aparece quando orbitando um planeta */}
      {navigationState === 'orbiting' && currentSection !== 'MAIN' && targetSection !== 'MAIN' && (
        <button
          onClick={handleBackToMain}
          className="fixed top-4 left-4 z-30 px-4 py-2 
                     bg-white/10 backdrop-blur-sm rounded-lg
                     border border-white/20 text-white/80 text-sm
                     hover:bg-white/20 transition-all cursor-pointer
                     flex items-center gap-2"
        >
          <span>←</span>
          <span>Início</span>
        </button>
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
                <span>🖱️ Scroll para entrar</span>
                <span className="mx-2">|</span>
                <span>👆 Clique em outro planeta</span>
              </>
            ) : (
              '👆 Clique em um planeta para explorar'
            )}
          </div>
        </div>
      )}
      
      {/* Monitor de Desenvolvimento */}
      <DevMonitor />
    </section>
  );
};

export default HeroFinal;