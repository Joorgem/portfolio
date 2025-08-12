import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const NavigationStates = {
  IDLE: 'idle',
  ORBITING: 'orbiting',
  ZOOMING_IN: 'zooming_in',
  ENTERING: 'entering',
  IN_SECTION: 'in_section',
  EXITING: 'exiting',
  ZOOMING_OUT: 'zooming_out',
};

const NavigationContextV4 = createContext();

export const NavigationProviderV4 = ({ children }) => {
  // Estados principais
  const [navigationState, setNavigationState] = useState(NavigationStates.IDLE);
  const [currentSection, setCurrentSection] = useState('MAIN');
  const [targetSection, setTargetSection] = useState(null);
  
  // Estados de transição
  const [zoomProgress, setZoomProgress] = useState(0);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [pageVisible, setPageVisible] = useState(false);
  const [canvas3DActive, setCanvas3DActive] = useState(true);
  
  // Refs para controle
  const scrollAccumulator = useRef(0);
  const lastScrollTime = useRef(0);
  const animationFrameId = useRef(null);
  const isAnimatingZoom = useRef(false);
  const isAnimatingFade = useRef(false);
  const lastPauseState = useRef(true); // Para evitar logs repetidos
  
  // Configurações ajustadas
  const ZOOM_THRESHOLD_START_FADE = 0.9;   // Fade começa bem tarde
  const ZOOM_THRESHOLD_ENTER = 0.99;       // Entrada quase no final
  const FADE_THRESHOLD_PAUSE = 0.98;       // Pausa no final do fade
  const SCROLL_SENSITIVITY = 0.0003;       // Extremamente menos sensível
  const SCROLL_THRESHOLD = 0.05;           // Precisa acumular mais para começar
  const ZOOM_SPEED = 0.005;                // Zoom muito mais lento
  const FADE_SPEED = 0.01;                 // Fade mais lento
  
  /**
   * Inicia navegação para uma seção
   */
  const startNavigation = useCallback((sectionId) => {
    if (navigationState !== NavigationStates.IDLE && 
        navigationState !== NavigationStates.ORBITING) return;
    
    console.log(`🎯 Navegando para: ${sectionId}`);
    setTargetSection(sectionId);
    setNavigationState(NavigationStates.ORBITING);
    
    return sectionId;
  }, [navigationState]);
  
  /**
   * Handler de scroll com debounce e threshold
   */
  const handleScroll = useCallback((deltaY) => {
    const now = Date.now();
    
    // Debounce - ignora scrolls muito rápidos
    if (now - lastScrollTime.current < 50) return;
    lastScrollTime.current = now;
    
    // Só processa em estados apropriados
    if (navigationState === NavigationStates.ORBITING) {
      // Acumula scroll
      scrollAccumulator.current += deltaY * SCROLL_SENSITIVITY;
      
      // Só inicia zoom se acumulou o suficiente
      if (scrollAccumulator.current > SCROLL_THRESHOLD && !isAnimatingZoom.current) {
        console.log('🔍 Iniciando zoom in');
        setNavigationState(NavigationStates.ZOOMING_IN);
        isAnimatingZoom.current = true;
        animateZoomIn();
      }
      
      // Reset acumulador se scroll reverso
      if (deltaY < 0) {
        scrollAccumulator.current = 0;
      }
    } else if (navigationState === NavigationStates.IN_SECTION) {
      // Precisa de scroll reverso forte para sair
      if (deltaY < -150) {
        initiateExit();
      }
    }
  }, [navigationState]);
  
  /**
   * Animação de zoom com velocidade controlada
   */
  const animateZoomIn = useCallback(() => {
    const animate = () => {
      setZoomProgress(prev => {
        const next = Math.min(1, prev + ZOOM_SPEED);
        
        // Inicia fade apenas quando zoom estiver bem avançado
        if (next >= ZOOM_THRESHOLD_START_FADE && !isAnimatingFade.current) {
          console.log('🎨 Iniciando fade');
          isAnimatingFade.current = true;
          setNavigationState(NavigationStates.ENTERING);
          animateFadeIn();
        }
        
        // Entra na seção quando zoom completo
        if (next >= ZOOM_THRESHOLD_ENTER) {
          console.log('📄 Zoom completo, entrando na seção');
          enterSection();
          isAnimatingZoom.current = false;
          return 1;
        }
        
        if (next < 1 && isAnimatingZoom.current) {
          animationFrameId.current = requestAnimationFrame(animate);
        }
        
        return next;
      });
    };
    
    animationFrameId.current = requestAnimationFrame(animate);
  }, []);
  
  /**
   * Animação de fade com controle de pause único
   */
  const animateFadeIn = useCallback(() => {
    const animate = () => {
      setFadeProgress(prev => {
        const next = Math.min(1, prev + FADE_SPEED);
        
        // Pausa canvas apenas uma vez quando apropriado
        if (next >= FADE_THRESHOLD_PAUSE && canvas3DActive && lastPauseState.current) {
          console.log('⏸️ Pausando canvas 3D');
          setCanvas3DActive(false);
          lastPauseState.current = false;
        }
        
        if (next < 1 && isAnimatingFade.current) {
          requestAnimationFrame(animate);
        } else {
          isAnimatingFade.current = false;
        }
        
        return next;
      });
    };
    
    requestAnimationFrame(animate);
  }, [canvas3DActive]);
  
  /**
   * Entra na seção
   */
  const enterSection = useCallback(() => {
    if (!targetSection) return;
    
    console.log(`✅ Entrando na seção: ${targetSection}`);
    setNavigationState(NavigationStates.IN_SECTION);
    setCurrentSection(targetSection);
    
    // Mostra página com delay
    setTimeout(() => {
      setPageVisible(true);
    }, 300);
    
    // Reset flags
    isAnimatingZoom.current = false;
    isAnimatingFade.current = false;
    scrollAccumulator.current = 0;
    
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
   * Inicia saída da seção
   */
  const initiateExit = useCallback(() => {
    if (navigationState !== NavigationStates.IN_SECTION) return;
    
    console.log('🚪 Saindo da seção');
    setNavigationState(NavigationStates.EXITING);
    setPageVisible(false);
    
    // Cancela animações
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    // Reset flags
    isAnimatingZoom.current = false;
    isAnimatingFade.current = false;
    
    // Fade out
    const fadeOut = () => {
      setFadeProgress(prev => {
        const next = Math.max(0, prev - 0.02);
        
        // Resume canvas quando fade diminui
        if (next <= 0.5 && !canvas3DActive) {
          console.log('▶️ Resumindo canvas 3D');
          setCanvas3DActive(true);
          lastPauseState.current = true;
        }
        
        if (next > 0) {
          requestAnimationFrame(fadeOut);
        } else {
          // Inicia zoom out
          setNavigationState(NavigationStates.ZOOMING_OUT);
          animateZoomOut();
        }
        
        return next;
      });
    };
    
    requestAnimationFrame(fadeOut);
  }, [navigationState, canvas3DActive]);
  
  /**
   * Animação de zoom out
   */
  const animateZoomOut = useCallback(() => {
    const animate = () => {
      setZoomProgress(prev => {
        const next = Math.max(0, prev - 0.015);
        
        if (next > 0) {
          requestAnimationFrame(animate);
        } else {
          completeExit();
        }
        
        return next;
      });
    };
    
    requestAnimationFrame(animate);
  }, []);
  
  /**
   * Completa saída
   */
  const completeExit = useCallback(() => {
    console.log('✅ Retorno completo');
    setNavigationState(NavigationStates.IDLE);
    setCurrentSection('MAIN');
    setTargetSection(null);
    setZoomProgress(0);
    setFadeProgress(0);
    setCanvas3DActive(true);
    scrollAccumulator.current = 0;
    lastPauseState.current = true;
    
    window.history.pushState({ section: 'MAIN' }, '', '#');
  }, []);
  
  /**
   * Handler de ESC
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
   * Handler de wheel com throttle
   */
  useEffect(() => {
    let wheelTimeout;
    
    const handleWheel = (e) => {
      if (navigationState === NavigationStates.ORBITING || 
          navigationState === NavigationStates.ZOOMING_IN ||
          navigationState === NavigationStates.IN_SECTION) {
        e.preventDefault();
        
        // Throttle wheel events
        if (!wheelTimeout) {
          handleScroll(e.deltaY);
          wheelTimeout = setTimeout(() => {
            wheelTimeout = null;
          }, 50);
        }
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [navigationState, handleScroll]);
  
  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
  const value = {
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress,
    pageVisible,
    canvas3DActive,
    startNavigation,
    initiateExit,
    isNavigating: navigationState !== NavigationStates.IDLE && 
                  navigationState !== NavigationStates.IN_SECTION,
    isInSection: navigationState === NavigationStates.IN_SECTION,
    canInteract: navigationState === NavigationStates.IDLE || 
                 navigationState === NavigationStates.ORBITING
  };
  
  return (
    <NavigationContextV4.Provider value={value}>
      {children}
    </NavigationContextV4.Provider>
  );
};

export const useNavigationV4 = () => {
  const context = useContext(NavigationContextV4);
  if (!context) {
    throw new Error('useNavigationV4 deve ser usado dentro de NavigationProviderV4');
  }
  return context;
};