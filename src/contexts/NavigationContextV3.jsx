import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

/**
 * Estados de navegação bem definidos
 */
const NavigationStates = {
  IDLE: 'idle',                    // Navegação 3D livre
  ORBITING: 'orbiting',            // Orbitando um planeta/seção
  ZOOMING_IN: 'zooming_in',        // Scroll detectado, aproximando
  ENTERING: 'entering',            // Fade começando, preparando entrada
  IN_SECTION: 'in_section',        // Dentro da página, 3D pausado
  EXITING: 'exiting',              // Saindo da página
  ZOOMING_OUT: 'zooming_out',      // Voltando para órbita
};

/**
 * Contexto unificado de navegação V3 - com correções
 */
const NavigationContextV3 = createContext();

export const NavigationProviderV3 = ({ children }) => {
  // Estado principal da máquina de estados
  const [navigationState, setNavigationState] = useState(NavigationStates.IDLE);
  const [currentSection, setCurrentSection] = useState('MAIN');
  const [targetSection, setTargetSection] = useState(null);
  
  // Estados de transição
  const [zoomProgress, setZoomProgress] = useState(0); // 0-1: progresso do zoom
  const [fadeProgress, setFadeProgress] = useState(0);  // 0-1: opacidade do fade
  const [pageVisible, setPageVisible] = useState(false);
  const [canvas3DActive, setCanvas3DActive] = useState(true);
  
  // Refs para controle fino
  const scrollAccumulator = useRef(0);
  const animationFrameId = useRef(null);
  const lastScrollTime = useRef(0);
  const zoomAnimationId = useRef(null);
  const fadeAnimationId = useRef(null);
  
  // Configurações ajustadas
  const ZOOM_THRESHOLD_START_FADE = 0.85;  // Começa fade mais tarde (era 0.7)
  const ZOOM_THRESHOLD_ENTER = 0.98;       // Entra na página quase no final (era 0.95)
  const FADE_THRESHOLD_PAUSE = 0.95;       // Pausa 3D bem no final (era 0.9)
  const SCROLL_SENSITIVITY = 0.0008;       // Muito menos sensível (era 0.002)
  const ZOOM_INCREMENT = 0.008;            // Zoom mais lento (era 0.02)
  const FADE_INCREMENT = 0.015;            // Fade mais lento (era 0.03)
  
  /**
   * Inicia navegação para uma seção (clique no planeta)
   */
  const startNavigation = useCallback((sectionId) => {
    if (navigationState !== NavigationStates.IDLE && 
        navigationState !== NavigationStates.ORBITING) return;
    
    console.log(`🎯 Iniciando navegação para: ${sectionId}`);
    setTargetSection(sectionId);
    setNavigationState(NavigationStates.ORBITING);
    
    return sectionId;
  }, [navigationState]);
  
  /**
   * Handler de scroll melhorado - menos sensível
   */
  const handleScroll = useCallback((deltaY) => {
    const now = Date.now();
    const timeDelta = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    // Ignora scrolls muito rápidos em sequência
    if (timeDelta < 30) return;
    
    // Acumula scroll com sensibilidade reduzida
    const scrollDelta = deltaY * SCROLL_SENSITIVITY;
    scrollAccumulator.current += scrollDelta;
    
    // Limita acumulação
    scrollAccumulator.current = Math.max(-0.1, Math.min(0.1, scrollAccumulator.current));
    
    // Processa baseado no estado atual
    switch (navigationState) {
      case NavigationStates.ORBITING:
        // Precisa de mais scroll para iniciar zoom
        if (scrollAccumulator.current > 0.02) { // Threshold maior
          setNavigationState(NavigationStates.ZOOMING_IN);
          animateZoomIn();
          scrollAccumulator.current = 0;
        }
        break;
        
      case NavigationStates.ZOOMING_IN:
        // Atualiza zoom mais suavemente
        setZoomProgress(prev => {
          const next = Math.max(0, Math.min(1, prev + scrollAccumulator.current));
          
          // Só inicia fade quando zoom estiver bem avançado
          if (next >= ZOOM_THRESHOLD_START_FADE && fadeProgress === 0) {
            setNavigationState(NavigationStates.ENTERING);
            startFadeIn();
          }
          
          return next;
        });
        break;
        
      case NavigationStates.IN_SECTION:
        // Precisa de scroll reverso significativo para sair
        if (deltaY < -100) { // Threshold alto para evitar saída acidental
          initiateExit();
        }
        break;
    }
    
    // Decay mais rápido do acumulador
    scrollAccumulator.current *= 0.8;
  }, [navigationState, fadeProgress]);
  
  /**
   * Anima zoom in progressivo - mais lento
   */
  const animateZoomIn = useCallback(() => {
    const animate = () => {
      setZoomProgress(prev => {
        const next = Math.min(1, prev + ZOOM_INCREMENT);
        
        if (next >= ZOOM_THRESHOLD_ENTER) {
          // Zoom completo, entrar na seção
          enterSection();
          return 1;
        }
        
        if (next >= ZOOM_THRESHOLD_START_FADE && fadeProgress === 0) {
          startFadeIn();
        }
        
        if (next < 1) {
          zoomAnimationId.current = requestAnimationFrame(animate);
        }
        
        return next;
      });
    };
    
    // Cancela animação anterior se existir
    if (zoomAnimationId.current) {
      cancelAnimationFrame(zoomAnimationId.current);
    }
    
    zoomAnimationId.current = requestAnimationFrame(animate);
  }, [fadeProgress]);
  
  /**
   * Inicia fade in - mais gradual
   */
  const startFadeIn = useCallback(() => {
    console.log('🎨 Iniciando fade in gradual');
    const fadeAnimate = () => {
      setFadeProgress(prev => {
        const next = Math.min(1, prev + FADE_INCREMENT);
        
        if (next >= FADE_THRESHOLD_PAUSE && canvas3DActive) {
          console.log('⏸️ Pausando canvas 3D');
          setCanvas3DActive(false);
        }
        
        if (next < 1) {
          fadeAnimationId.current = requestAnimationFrame(fadeAnimate);
        }
        
        return next;
      });
    };
    
    // Cancela animação anterior se existir
    if (fadeAnimationId.current) {
      cancelAnimationFrame(fadeAnimationId.current);
    }
    
    fadeAnimationId.current = requestAnimationFrame(fadeAnimate);
  }, [canvas3DActive]);
  
  /**
   * Entra na seção (mostra página)
   */
  const enterSection = useCallback(() => {
    if (!targetSection) return;
    
    console.log(`📄 Entrando na seção: ${targetSection}`);
    setNavigationState(NavigationStates.IN_SECTION);
    setCurrentSection(targetSection);
    
    // Delay maior para garantir transição suave
    setTimeout(() => {
      setPageVisible(true);
      setCanvas3DActive(false);
    }, 200);
    
    // Atualiza URL
    if (targetSection !== 'MAIN') {
      window.history.pushState(
        { section: targetSection },
        '',
        `#${targetSection.toLowerCase()}`
      );
    }
  }, [targetSection]);
  
  /**
   * Inicia saída da seção (ESC ou botão)
   */
  const initiateExit = useCallback(() => {
    if (navigationState !== NavigationStates.IN_SECTION) return;
    
    console.log('🚪 Iniciando saída da seção');
    setNavigationState(NavigationStates.EXITING);
    setPageVisible(false);
    
    // Cancela animações em andamento
    if (zoomAnimationId.current) {
      cancelAnimationFrame(zoomAnimationId.current);
    }
    if (fadeAnimationId.current) {
      cancelAnimationFrame(fadeAnimationId.current);
    }
    
    // Inicia fade out
    const fadeOutAnimate = () => {
      setFadeProgress(prev => {
        const next = Math.max(0, prev - 0.025); // Fade out mais suave
        
        if (next <= 0.5 && !canvas3DActive) {
          console.log('▶️ Resumindo canvas 3D');
          setCanvas3DActive(true);
        }
        
        if (next > 0) {
          requestAnimationFrame(fadeOutAnimate);
        } else {
          // Fade completo, iniciar zoom out
          setNavigationState(NavigationStates.ZOOMING_OUT);
          animateZoomOut();
        }
        
        return next;
      });
    };
    
    requestAnimationFrame(fadeOutAnimate);
  }, [navigationState, canvas3DActive]);
  
  /**
   * Anima zoom out automático - mais suave
   */
  const animateZoomOut = useCallback(() => {
    console.log('🔍 Iniciando zoom out suave');
    const animate = () => {
      setZoomProgress(prev => {
        const next = Math.max(0, prev - 0.02); // Zoom out mais lento
        
        if (next > 0) {
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          // Zoom out completo
          completeExit();
        }
        
        return next;
      });
    };
    
    animationFrameId.current = requestAnimationFrame(animate);
  }, []);
  
  /**
   * Completa saída e retorna ao estado inicial
   */
  const completeExit = useCallback(() => {
    console.log('✅ Saída completa, voltando para MAIN');
    setNavigationState(NavigationStates.IDLE);
    setCurrentSection('MAIN');
    setTargetSection(null);
    setZoomProgress(0);
    setFadeProgress(0);
    setCanvas3DActive(true);
    scrollAccumulator.current = 0;
    
    // Limpa URL
    window.history.pushState({ section: 'MAIN' }, '', '#');
  }, []);
  
  /**
   * Handler global de ESC
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && navigationState === NavigationStates.IN_SECTION) {
        e.preventDefault();
        initiateExit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigationState, initiateExit]);
  
  /**
   * Handler global de wheel/scroll - melhorado
   */
  useEffect(() => {
    const handleWheel = (e) => {
      // Só processa scroll em estados relevantes
      if (navigationState === NavigationStates.ORBITING || 
          navigationState === NavigationStates.ZOOMING_IN ||
          navigationState === NavigationStates.IN_SECTION) {
        e.preventDefault();
        handleScroll(e.deltaY);
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [navigationState, handleScroll]);
  
  /**
   * Cleanup de animações
   */
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (zoomAnimationId.current) {
        cancelAnimationFrame(zoomAnimationId.current);
      }
      if (fadeAnimationId.current) {
        cancelAnimationFrame(fadeAnimationId.current);
      }
    };
  }, []);
  
  // Valor do contexto
  const value = {
    // Estados
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress,
    pageVisible,
    canvas3DActive,
    
    // Ações
    startNavigation,
    initiateExit,
    
    // Helpers
    isNavigating: navigationState !== NavigationStates.IDLE && 
                  navigationState !== NavigationStates.IN_SECTION,
    isInSection: navigationState === NavigationStates.IN_SECTION,
    canInteract: navigationState === NavigationStates.IDLE || 
                 navigationState === NavigationStates.ORBITING
  };
  
  return (
    <NavigationContextV3.Provider value={value}>
      {children}
    </NavigationContextV3.Provider>
  );
};

// Hook para usar o contexto
export const useNavigationV3 = () => {
  const context = useContext(NavigationContextV3);
  if (!context) {
    throw new Error('useNavigationV3 deve ser usado dentro de NavigationProviderV3');
  }
  return context;
};