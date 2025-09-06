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
import { LanguageToggle } from "../components/LanguageToggle";
import { useTranslation } from "react-i18next";

/**
 * Hero Section com Zustand
 */
const HeroZustand: React.FC = () => {
  const { t } = useTranslation('common');
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
  // MOBILE FIX: Ajuste de posição vertical - abaixado para dar mais espaço ao texto
  const astronautPosition: [number, number, number] = isMobile ? [-0.08, -1.4, 0] : [-0.08, -0.5, 0];
  
  // Estados do store
  const navigationState = useNavigationStore(state => state.navigationState);
  const fadeProgress = useNavigationStore(state => state.fadeProgress);
  const canvas3DActive = useNavigationStore(state => state.canvas3DActive);
  
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
          // Inverte o deltaY para mobile (swipe down = zoom in)
          handleScroll(-deltaY * 3, false);
          
          console.log('📱 Touch Move - Delta:', deltaY);
        }
        
        lastTouchY = currentY;
      }
    };
    
    const handleTouchEnd = (_e: TouchEvent) => {
      const deltaTime = Date.now() - touchStartTime;
      const totalDeltaY = touchStartY - lastTouchY;
      
      console.log('📱 Touch End - Total Delta:', totalDeltaY, 'Time:', deltaTime);
      
      // Detecta swipe rápido e forte
      if (deltaTime < 300 && Math.abs(totalDeltaY) > 50) {
        // Swipe forte detectado - amplifica ainda mais
        handleScroll(-totalDeltaY * 5, false);
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
            position: [0, 0, isMobile ? 3.5 : 4.2], // Mobile mais próximo
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
      
      
      {/* Instruções progressivas no topo centralizado */}
      {!isMobile && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20
                        pointer-events-none transition-all duration-500">
          {navigationState === 'idle' && (
            <span className="text-white/50 text-[14px] font-light tracking-widest uppercase drop-shadow-sm">
              {t('footer.desktop.idle')}
            </span>
          )}
          {navigationState === 'orbiting' && (
            <div className="flex items-center gap-3 text-white/50 text-[12px] font-light tracking-widest uppercase drop-shadow-sm">
              <span>{t('footer.desktop.orbiting.enter')}</span>
              <span className="text-white/30">•</span>
              <span>{t('footer.desktop.orbiting.return')}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Instruções mobile - lado a lado */}
      {isMobile && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20
                        pointer-events-none transition-all duration-500">
          {navigationState === 'idle' && (
            <span className="text-white/60 text-[13px] font-light tracking-wider uppercase drop-shadow-sm">
              {t('footer.mobile.idle')}
            </span>
          )}
          {navigationState === 'orbiting' && (
            <span className="text-white/60 text-[11px] font-light tracking-wider uppercase drop-shadow-sm">
              {t('footer.mobile.orbiting.combined')}
            </span>
          )}
        </div>
      )}
      
      {/* Language Toggle - Apenas Desktop */}
      {navigationState !== 'in_section' && !isMobile && (
        <div className="fixed top-8 right-52 z-[9999] flex items-start">
          <LanguageToggle />
        </div>
      )}
      
      {/* Monitor de Desenvolvimento */}
      <DevMonitor />
    </section>
  );
};

export default HeroZustand;