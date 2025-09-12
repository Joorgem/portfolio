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
import { getAllNavigationPoints } from "../constants/navigationPoints";
import { LanguageToggle } from "../components/LanguageToggle";
import { useTranslation } from "react-i18next";

/**
 * Hero Section com Zustand
 */
const HeroZustand: React.FC = () => {
  const { t } = useTranslation('common');
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const astronautRef = useRef<THREE.Group>(null!);
  
  // Estados do store - TODOS OS HOOKS PRIMEIRO
  const navigationState = useNavigationStore(state => state.navigationState);
  const fadeProgress = useNavigationStore(state => state.fadeProgress);
  const canvas3DActive = useNavigationStore(state => state.canvas3DActive);
  const startNavigation = useNavigationStore(state => state.startNavigation);
  const handleScroll = useNavigationStore(state => state.handleScroll);
  const canInteract = useNavigationStore(state => state.canInteract);
  
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
  
  // Handler de navegação - MOBILE E DESKTOP IGUAIS
  const handleNavigate = useCallback((point: NavigationPoint) => {
    if (!canInteract()) {
      return;
    }
    
    // Comportamento unificado: sempre entra em órbita primeiro
    // O usuário controla o zoom via scroll/touch
    startNavigation(point.id);
  }, [startNavigation, canInteract]);
  
  
  // Setup de event listeners
  useEffect(() => {
    // MOBILE SUPPORT: Variáveis para touch
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTouchY = 0;
    
    // Handler de wheel
    const handleWheel = (e: WheelEvent) => {
      const state = useNavigationStore.getState().navigationState;

      // CORREÇÃO CRÍTICA: Se estiver em uma seção, IGNORA COMPLETAMENTE
      // Permite scroll nativo normal dentro das seções
      if (state === 'in_section') {
        return;
      }
      
      // Para estados de navegação 3D, previne scroll padrão e controla câmera
      if (state !== 'idle') {
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
        
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const state = useNavigationStore.getState().navigationState;

      // CORREÇÃO CRÍTICA: Isolamento total em seções
      if (state === 'in_section') {
        return;
      }

      // Só processa se estiver em estado de navegação 3D
      if (state !== 'orbiting' && state !== 'zooming_in') {
        return;
      }
      
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const deltaY = lastTouchY - currentY;
        
        // Previne scroll padrão do browser
        if (Math.abs(deltaY) > 2) { // Threshold mínimo para evitar touches acidentais
          e.preventDefault();
          
          // Usa o handler de scroll com delta amplificado para mobile
          // Inverte o deltaY para mobile (swipe down = zoom in)
          handleScroll(-deltaY * 3, false);
        }
        
        lastTouchY = currentY;
      }
    };
    
    const handleTouchEnd = (_e: TouchEvent) => {
      const state = useNavigationStore.getState().navigationState;

      // CORREÇÃO CRÍTICA: Isolamento total em seções
      if (state === 'in_section') {
        return;
      }

      // Este handler só deve ser acionado para gestos de navegação 3D
      if (state !== 'orbiting' && state !== 'zooming_in') {
        return;
      }

      const deltaTime = Date.now() - touchStartTime;
      const totalDeltaY = touchStartY - lastTouchY;
      
      
      // Detecta swipe rápido e forte
      if (deltaTime < 300 && Math.abs(totalDeltaY) > 50) {
        // Swipe forte detectado - amplifica ainda mais
        handleScroll(-totalDeltaY * 5, false);
      }
    };
    
    // Handler de ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.key === 'Escape') {
        const state = useNavigationStore.getState();
        e.preventDefault();
        
        // Se está em seção, sai da seção E vai para inicial
        if (state.navigationState === 'in_section') {
          state.goToInitialState();
        } 
        // Se está orbitando um planeta, volta para inicial
        else if (state.navigationState === 'orbiting') {
          state.goToInitialState();
        }
        // Se está fazendo zoom, cancela
        else if (state.navigationState === 'zooming_in') {
          state.goToInitialState();
        }
        // Qualquer outro estado - não há ação necessária
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
  
  // Controla a visibilidade do Hero para manter o canvas renderizando no fundo
  const isSceneVisible = navigationState !== 'in_section';

  return (
    <section 
      className={`relative w-screen h-screen overflow-hidden bg-transparent transition-opacity duration-500 ${isSceneVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!isSceneVisible}
    >{/* Partículas agora no App.jsx */}
      {/* Texto Hero - Visível apenas no estado inicial */}
      {navigationState === 'idle' && (
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
      
      {/* Overlay de Fade Otimizado - Sistema Unificado */}
      {fadeProgress > 0 && (
        <div 
          className="fixed inset-0 bg-black pointer-events-none z-50"
          style={{ 
            opacity: fadeProgress,
            // Removida transition CSS para usar apenas o controle do Zustand
            willChange: 'opacity'
          }}
        />
      )}
      
      
      {/* Instruções progressivas no topo centralizado */}
      {!isMobile && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20
                        pointer-events-none transition-all duration-500">
          {navigationState === 'idle' && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/50 text-[14px] font-light tracking-widest uppercase drop-shadow-sm">
                {t('footer.desktop.idle')}
              </span>
            </div>
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
      
      {/* Overlay de Acessibilidade para Elementos 3D */}
      {navigationState === 'idle' && (
        <div className="fixed inset-0 z-[5] pointer-events-none">
          {/* Área acessível do Astronauta */}
          <button
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       w-32 h-32 opacity-0 pointer-events-auto focus:opacity-100 
                       focus:bg-white/10 focus:border-2 focus:border-white/50 
                       rounded-full transition-opacity duration-200"
            aria-label={t('a11y.astronaut.description', 'Interactive 3D astronaut model. Navigate through space to explore different sections of the portfolio.')}
            tabIndex={0}
            onFocus={() => {
              // Feedback visual quando focado
              document.body.style.setProperty('--astronaut-focused', '1');
            }}
            onBlur={() => {
              document.body.style.setProperty('--astronaut-focused', '0');
            }}
          />
          
          {/* Áreas acessíveis dos Planetas */}
          {navigationState === 'idle' && getAllNavigationPoints().map((point) => (
            <button
              key={`a11y-${point.id}`}
              className="absolute opacity-0 pointer-events-auto focus:opacity-100 
                         focus:bg-blue-500/20 focus:border-2 focus:border-blue-400 
                         rounded-full transition-opacity duration-200"
              style={{
                left: `${50 + (point.position[0] * 10)}%`,
                top: `${50 + (point.position[1] * -10)}%`,
                width: `${point.radius * 4}px`,
                height: `${point.radius * 4}px`,
                transform: 'translate(-50%, -50%)'
              }}
              aria-label={t(`a11y.navigation.${point.id}.ariaLabel`, `Navigate to ${point.id} section`)}
              tabIndex={0}
              onClick={() => handleNavigate(point)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNavigate(point);
                }
              }}
            />
          ))}
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