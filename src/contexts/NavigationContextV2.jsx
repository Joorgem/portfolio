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
 * Contexto unificado de navegação
 */
const NavigationContextV2 = createContext();

export const NavigationProviderV2 = ({ children }) => {
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
  const transitionTimeoutId = useRef(null);
  const lastScrollTime = useRef(0);
  
  // Configurações de transição
  const ZOOM_THRESHOLD_START_FADE = 0.7;  // Começa fade em 70% do zoom
  const ZOOM_THRESHOLD_ENTER = 0.95;      // Entra na página em 95% do zoom
  const FADE_THRESHOLD_PAUSE = 0.9;       // Pausa 3D em 90% do fade
  const SCROLL_SENSITIVITY = 0.002;       // Sensibilidade do scroll
  const TRANSITION_DURATION = 1200;       // ms para transições automáticas
  
  /**
   * Inicia navegação para uma seção (clique no planeta)
   */
  const startNavigation = useCallback((sectionId) => {
    if (navigationState !== NavigationStates.IDLE && 
        navigationState !== NavigationStates.ORBITING) return;
    
    console.log(`🎯 Iniciando navegação para: ${sectionId}`);
    setTargetSection(sectionId);
    setNavigationState(NavigationStates.ORBITING);
    
    // Notifica que está orbitando para CameraController posicionar
    return sectionId;
  }, [navigationState]);
  
  /**
   * Handler de scroll unificado
   */
  const handleScroll = useCallback((deltaY) => {
    const now = Date.now();
    const timeDelta = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    // Acumula scroll para suavidade
    if (timeDelta < 50) {
      scrollAccumulator.current += deltaY * SCROLL_SENSITIVITY;
    } else {
      scrollAccumulator.current = deltaY * SCROLL_SENSITIVITY;
    }
    
    // Processa baseado no estado atual
    switch (navigationState) {
      case NavigationStates.ORBITING:
        // Iniciando zoom in
        if (scrollAccumulator.current > 0) {
          setNavigationState(NavigationStates.ZOOMING_IN);
          animateZoomIn();
        }
        break;
        
      case NavigationStates.ZOOMING_IN:
        // Atualizando zoom
        const newZoom = Math.max(0, Math.min(1, zoomProgress + scrollAccumulator.current));
        setZoomProgress(newZoom);
        
        // Inicia fade quando apropriado
        if (newZoom >= ZOOM_THRESHOLD_START_FADE && fadeProgress === 0) {
          setNavigationState(NavigationStates.ENTERING);
          startFadeIn();
        }
        break;
        
      case NavigationStates.IN_SECTION:
        // Scroll para sair (scroll reverso)
        if (deltaY < -50) { // Threshold para evitar saída acidental
          initiateExit();
        }
        break;
    }
    
    // Decay do acumulador
    scrollAccumulator.current *= 0.9;
  }, [navigationState, zoomProgress, fadeProgress]);
  
  /**
   * Anima zoom in progressivo
   */
  const animateZoomIn = useCallback(() => {
    const animate = () => {
      setZoomProgress(prev => {
        const next = Math.min(1, prev + 0.02); // Incremento suave
        
        if (next >= ZOOM_THRESHOLD_ENTER) {
          // Zoom completo, entrar na seção
          enterSection();
          return 1;
        }
        
        if (next >= ZOOM_THRESHOLD_START_FADE && fadeProgress === 0) {
          startFadeIn();
        }
        
        if (next < 1) {
          animationFrameId.current = requestAnimationFrame(animate);
        }
        
        return next;
      });
    };
    
    animationFrameId.current = requestAnimationFrame(animate);
  }, [fadeProgress]);
  
  /**
   * Inicia fade in
   */
  const startFadeIn = useCallback(() => {
    console.log('🎨 Iniciando fade in');
    const fadeAnimate = () => {
      setFadeProgress(prev => {
        const next = Math.min(1, prev + 0.03); // Fade mais rápido que zoom
        
        if (next >= FADE_THRESHOLD_PAUSE && canvas3DActive) {
          console.log('⏸️ Pausando canvas 3D');
          setCanvas3DActive(false);
        }
        
        if (next < 1) {
          requestAnimationFrame(fadeAnimate);
        }
        
        return next;
      });
    };
    
    requestAnimationFrame(fadeAnimate);
  }, [canvas3DActive]);
  
  /**
   * Entra na seção (mostra página)
   */
  const enterSection = useCallback(() => {
    console.log(`📄 Entrando na seção: ${targetSection}`);
    setNavigationState(NavigationStates.IN_SECTION);
    setCurrentSection(targetSection);
    
    // Pequeno delay para garantir fade completo
    setTimeout(() => {
      setPageVisible(true);
      setCanvas3DActive(false); // Garante que está pausado
    }, 100);
    
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
    
    // Inicia fade out
    const fadeOutAnimate = () => {
      setFadeProgress(prev => {
        const next = Math.max(0, prev - 0.04); // Fade out mais rápido
        
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
   * Anima zoom out automático
   */
  const animateZoomOut = useCallback(() => {
    console.log('🔍 Iniciando zoom out');
    const animate = () => {
      setZoomProgress(prev => {
        const next = Math.max(0, prev - 0.03); // Zoom out suave
        
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
   * Handler global de wheel/scroll
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
      if (transitionTimeoutId.current) {
        clearTimeout(transitionTimeoutId.current);
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
    <NavigationContextV2.Provider value={value}>
      {children}
    </NavigationContextV2.Provider>
  );
};

// Hook para usar o contexto
export const useNavigationV2 = () => {
  const context = useContext(NavigationContextV2);
  if (!context) {
    throw new Error('useNavigationV2 deve ser usado dentro de NavigationProviderV2');
  }
  return context;
};