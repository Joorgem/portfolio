import React, { Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import * as THREE from 'three';
import HeroTextFixed from "../components/HeroTextFixed";
import { Astronaut } from "../components/Astronaut";
import Loader from "../components/Loader";
import NavigationSystemStable from "../components/NavigationSystemStable";
import CameraControllerZustand from "../components/CameraController.Zustand";
import { useNavigationStore } from "../stores/navigation.store";
import type { NavigationPoint } from "../constants/navigationPoints";
import { Particles } from "../components/Particles";

/**
 * Hero Section com Zustand
 */
const HeroZustand: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const astronautRef = useRef<THREE.Group>(null!);
  
  // MOBILE FIX: Escala adaptativa baseada no viewport
  const getAstronautScale = () => {
    const width = window.innerWidth;
    if (width < 375) return 0.3;   // Phones muito pequenos
    if (width < 414) return 0.32;   // iPhone padrão
    if (width < 768) return 0.35;   // Tablets pequenos
    if (width < 853) return 0.38;   // Tablets
    return 0.4;                     // Desktop
  };
  
  const astronautScale = getAstronautScale();
  // MOBILE FIX: Ajuste de posição vertical para centralizar melhor no mobile
  const astronautPosition: [number, number, number] = isMobile ? [-0.08, -0.45, 0] : [-0.08, -0.5, 0];
  
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
  
  // Handler de navegação - MOBILE E DESKTOP IGUAIS
  const handleNavigate = useCallback((point: NavigationPoint) => {
    if (!canInteract()) {
      console.log('⚠️ Navegação bloqueada - Estado:', navigationState);
      return;
    }
    
    console.log('🎯 Navegando para:', point.name);
    
    // Comportamento unificado: sempre entra em órbita primeiro
    // O usuário controla o zoom via scroll/touch
    startNavigation(point.id);
  }, [startNavigation, canInteract, navigationState]);
  
  
  // Setup de event listeners
  useEffect(() => {
    // MOBILE SUPPORT: Variáveis para touch
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTouchY = 0;
    
    // Handler de wheel
    const handleWheel = (e: WheelEvent) => {
      const state = useNavigationStore.getState().navigationState;
      
      // Verifica se o scroll está em um elemento scrollável (dentro do conteúdo)
      const target = e.target as Element;
      const isInsideContent = target.closest('.overflow-y-auto, .overflow-y-scroll, .overflow-auto, .overflow-scroll');
      
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
    
    // MOBILE: Touch handlers melhorados
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        lastTouchY = touchStartY;
        touchStartTime = Date.now();
        
        console.log('📱 Touch Start:', touchStartY);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const state = useNavigationStore.getState().navigationState;
      
      // Só processa se estiver em estado que aceita scroll
      if (state !== 'orbiting' && state !== 'zooming_in' && state !== 'in_section') {
        return;
      }
      
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const deltaY = lastTouchY - currentY;
        
        // Verifica se está em conteúdo scrollável
        const target = e.target as Element;
        const isInsideContent = target.closest('.overflow-y-auto, .overflow-y-scroll, .overflow-auto, .overflow-scroll');
        
        if (state === 'in_section' && isInsideContent) {
          // Permite scroll normal do conteúdo
          return;
        }
        
        // Previne scroll padrão do browser
        if (Math.abs(deltaY) > 2) { // Threshold mínimo para evitar touches acidentais
          e.preventDefault();
          
          // Usa o handler de scroll com delta amplificado para mobile
          // Inverte o deltaY para mobile (swipe up = zoom in)
          handleScroll(deltaY * 3, false);
          
          console.log('📱 Touch Move - Delta:', deltaY);
        }
        
        lastTouchY = currentY;
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const deltaTime = Date.now() - touchStartTime;
      const totalDeltaY = touchStartY - lastTouchY;
      
      console.log('📱 Touch End - Total Delta:', totalDeltaY, 'Time:', deltaTime);
      
      // Detecta swipe rápido e forte
      if (deltaTime < 300 && Math.abs(totalDeltaY) > 50) {
        // Swipe forte detectado - amplifica ainda mais
        handleScroll(totalDeltaY * 5, false);
        console.log('📱 Swipe detectado!');
      }
    };
    
    // Handler de ESC
    const handleKeyDown = (e: KeyboardEvent) => {
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
    
    // Adiciona event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    // MOBILE: Adiciona listeners de touch
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      
      // MOBILE: Remove listeners de touch
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
      // Cleanup do store
      useNavigationStore.getState().cleanup();
    };
  }, [handleScroll]);
  
  // Monitor de desenvolvimento - DESATIVADO
  const DevMonitor: React.FC = () => {
    return null; // Removido para produção
  };
  
  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black">
      <Particles
        className="absolute inset-0 -z-50"
        quantity={isMobile ? 50 : 100}  // Mobile: menos partículas para performance
        ease={80}
        color={"#ffffff"}
        refresh
      />
      {/* Texto Hero - Oculta durante navegação */}
      {(navigationState === 'idle' || navigationState === 'orbiting') && (
        <HeroTextFixed />
      )}
      
      {/* Canvas 3D Principal */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          camera={{ 
            position: [0, 0, isMobile ? 4 : 5], // Mobile mais próximo
            fov: isMobile ? 65 : 75, // FOV menor para mobile (mais zoom)
            near: 0.001, 
            far: 1000 
          }}
          frameloop={canvas3DActive ? 'always' : 'demand'}
          dpr={[1, 2]} // QUALIDADE MÁXIMA: Mantém DPR alto para todos os dispositivos
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
            
            {/* Controlador de Câmera com Zustand - PASSA ESCALA DINÂMICA */}
            <CameraControllerZustand
              astronautRef={astronautRef}
              astronautScale={astronautScale}
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