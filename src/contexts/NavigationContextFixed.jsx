import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

/**
 * NavigationContextFixed - Versão corrigida com refs para evitar stale closures
 * 
 * Esta implementação usa um padrão híbrido:
 * - useState: Para valores que precisam causar re-render (UI)
 * - useRef: Para valores mutáveis acessados em callbacks
 * - Sincronização automática entre estado e refs
 */

// Estados bem definidos do sistema
const NavigationStates = {
  IDLE: 'idle',
  ORBITING: 'orbiting',
  ZOOMING_IN: 'zooming_in',
  ENTERING: 'entering',
  IN_SECTION: 'in_section',
  EXITING: 'exiting',
  ZOOMING_OUT: 'zooming_out',
};

const NavigationContextFixed = createContext();

export const NavigationProviderFixed = ({ children }) => {
  // ========================================
  // ESTADO REACT (causa re-render)
  // ========================================
  const [navigationState, setNavigationState] = useState(NavigationStates.IDLE);
  const [currentSection, setCurrentSection] = useState('MAIN');
  const [targetSection, setTargetSection] = useState(null);
  const [zoomProgress, setZoomProgress] = useState(0);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [pageVisible, setPageVisible] = useState(false);
  const [canvas3DActive, setCanvas3DActive] = useState(true);
  
  // ========================================
  // REFS (valores mutáveis, não causam re-render)
  // ========================================
  const stateRef = useRef({
    navigationState: NavigationStates.IDLE,
    currentSection: 'MAIN',
    targetSection: null,
    zoomProgress: 0,
    fadeProgress: 0,
    pageVisible: false,
    canvas3DActive: true
  });
  
  const animationRef = useRef({
    frame: null,
    zoomDirection: 0,
    fadeFrame: null
  });
  
  const scrollRef = useRef({
    accumulated: 0,
    lastTime: 0
  });
  
  // Configurações
  const CONFIG = {
    scrollSensitivity: 0.001,
    scrollThreshold: 30,
    zoomSpeed: 0.008,
    fadeSpeed: 0.012,
    zoomStartFade: 0.85,
    zoomComplete: 0.98,
    fadePauseCanvas: 0.95,
  };
  
  // ========================================
  // SINCRONIZAÇÃO: Estado React -> Refs
  // ========================================
  useEffect(() => {
    stateRef.current = {
      navigationState,
      currentSection,
      targetSection,
      zoomProgress,
      fadeProgress,
      pageVisible,
      canvas3DActive
    };
  }, [navigationState, currentSection, targetSection, zoomProgress, fadeProgress, pageVisible, canvas3DActive]);
  
  // ========================================
  // FUNÇÕES DE ANIMAÇÃO (usando refs)
  // ========================================
  
  const startZoomAnimation = useCallback(() => {
    const animate = () => {
      let shouldContinue = false;
      
      // Usa setZoomProgress para atualizar UI
      setZoomProgress(current => {
        let next = current;
        const direction = animationRef.current.zoomDirection;
        
        if (direction > 0) {
          // Zoom in
          next = Math.min(1, current + CONFIG.zoomSpeed);
          shouldContinue = next < 1;
          
          // Inicia fade quando apropriado
          if (next >= CONFIG.zoomStartFade && stateRef.current.fadeProgress === 0) {
            console.log('🎨 Iniciando fade in');
            startFadeAnimation();
          }
          
          // Zoom completo
          if (next >= CONFIG.zoomComplete) {
            console.log('✅ Zoom completo');
            enterSection();
            shouldContinue = false;
          }
        } else if (direction < 0) {
          // Zoom out
          next = Math.max(0, current - CONFIG.zoomSpeed * 1.5);
          shouldContinue = next > 0;
          
          if (next === 0) {
            completeExit();
            shouldContinue = false;
          }
        }
        
        // Atualiza ref também
        stateRef.current.zoomProgress = next;
        return next;
      });
      
      if (shouldContinue) {
        animationRef.current.frame = requestAnimationFrame(animate);
      }
    };
    
    // Cancela animação anterior
    if (animationRef.current.frame) {
      cancelAnimationFrame(animationRef.current.frame);
    }
    
    animationRef.current.frame = requestAnimationFrame(animate);
  }, []);
  
  const startFadeAnimation = useCallback(() => {
    const animate = () => {
      let shouldContinue = false;
      
      setFadeProgress(current => {
        const next = Math.min(1, current + CONFIG.fadeSpeed);
        shouldContinue = next < 1;
        
        // Pausa canvas quando apropriado
        if (next >= CONFIG.fadePauseCanvas && stateRef.current.canvas3DActive) {
          console.log('⏸️ Pausando canvas 3D');
          setCanvas3DActive(false);
        }
        
        // Atualiza ref
        stateRef.current.fadeProgress = next;
        return next;
      });
      
      if (shouldContinue) {
        animationRef.current.fadeFrame = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current.fadeFrame = requestAnimationFrame(animate);
  }, []);
  
  // ========================================
  // AÇÕES PRINCIPAIS
  // ========================================
  
  const startNavigation = useCallback((sectionId) => {
    const currentState = stateRef.current.navigationState;
    
    // Permite navegação de IDLE ou ORBITING
    if (currentState !== NavigationStates.IDLE && 
        currentState !== NavigationStates.ORBITING) {
      console.log('⚠️ Navegação bloqueada - estado:', currentState);
      return;
    }
    
    console.log(`🚀 Iniciando navegação para: ${sectionId}`);
    
    // Reset valores se mudando de planeta
    if (currentState === NavigationStates.ORBITING && 
        stateRef.current.targetSection !== sectionId) {
      setZoomProgress(0);
      setFadeProgress(0);
      stateRef.current.zoomProgress = 0;
      stateRef.current.fadeProgress = 0;
    }
    
    setTargetSection(sectionId);
    setNavigationState(NavigationStates.ORBITING);
    stateRef.current.targetSection = sectionId;
    stateRef.current.navigationState = NavigationStates.ORBITING;
    
    // Reset scroll
    scrollRef.current.accumulated = 0;
    animationRef.current.zoomDirection = 0;
    
    return sectionId;
  }, []);
  
  const enterSection = useCallback(() => {
    const section = stateRef.current.targetSection;
    if (!section) return;
    
    console.log(`📄 Entrando na seção: ${section}`);
    setNavigationState(NavigationStates.ENTERING);
    setCurrentSection(section);
    
    setTimeout(() => {
      setPageVisible(true);
      setNavigationState(NavigationStates.IN_SECTION);
    }, 200);
    
    // Atualiza URL
    window.history.pushState(
      { section },
      '',
      `#${section.toLowerCase()}`
    );
  }, []);
  
  const initiateExit = useCallback(() => {
    if (stateRef.current.navigationState !== NavigationStates.IN_SECTION) return;
    
    console.log('🚪 Iniciando saída');
    setNavigationState(NavigationStates.EXITING);
    setPageVisible(false);
    
    // Animação de fade out
    const fadeOut = () => {
      let shouldContinue = false;
      
      setFadeProgress(current => {
        const next = Math.max(0, current - CONFIG.fadeSpeed * 2);
        shouldContinue = next > 0;
        
        // Resume canvas
        if (next <= 0.5 && !stateRef.current.canvas3DActive) {
          console.log('▶️ Resumindo canvas 3D');
          setCanvas3DActive(true);
        }
        
        if (next === 0) {
          setNavigationState(NavigationStates.ZOOMING_OUT);
          animationRef.current.zoomDirection = -1;
          startZoomAnimation();
        }
        
        stateRef.current.fadeProgress = next;
        return next;
      });
      
      if (shouldContinue) {
        requestAnimationFrame(fadeOut);
      }
    };
    
    requestAnimationFrame(fadeOut);
  }, [startZoomAnimation]);
  
  const completeExit = useCallback(() => {
    console.log('✅ Saída completa');
    
    const target = stateRef.current.targetSection;
    
    if (target && target !== 'MAIN') {
      setNavigationState(NavigationStates.ORBITING);
      setCurrentSection(target);
      console.log(`🌍 Voltando para órbita de ${target}`);
    } else {
      setNavigationState(NavigationStates.IDLE);
      setCurrentSection('MAIN');
      setTargetSection(null);
      console.log('🏠 Voltando para MAIN');
    }
    
    setZoomProgress(0);
    setFadeProgress(0);
    setPageVisible(false);
    setCanvas3DActive(true);
    
    // Reset refs
    animationRef.current.zoomDirection = 0;
    scrollRef.current.accumulated = 0;
    
    // Atualiza URL
    const section = target || 'MAIN';
    if (section === 'MAIN') {
      window.history.pushState({ section: 'MAIN' }, '', '#');
    } else {
      window.history.pushState({ section }, '', `#${section.toLowerCase()}`);
    }
  }, []);
  
  // ========================================
  // EVENT HANDLERS (usando refs)
  // ========================================
  
  // Handler de scroll - usa refs para evitar closures
  const handleScrollRef = useRef((deltaY) => {
    const now = Date.now();
    const timeDelta = now - scrollRef.current.lastTime;
    
    if (timeDelta < 16) return; // Throttle 60fps
    scrollRef.current.lastTime = now;
    
    const currentState = stateRef.current.navigationState;
    console.log('🖱️ Scroll:', { deltaY, state: currentState, accumulated: scrollRef.current.accumulated });
    
    if (currentState === NavigationStates.ORBITING) {
      scrollRef.current.accumulated += deltaY;
      
      if (Math.abs(scrollRef.current.accumulated) > CONFIG.scrollThreshold) {
        if (scrollRef.current.accumulated > 0) {
          console.log('🔍 Iniciando zoom in - accumulated:', scrollRef.current.accumulated);
          setNavigationState(NavigationStates.ZOOMING_IN);
          stateRef.current.navigationState = NavigationStates.ZOOMING_IN;
          animationRef.current.zoomDirection = 1;
          startZoomAnimation();
        }
        scrollRef.current.accumulated = 0;
      }
    } else if (currentState === NavigationStates.IN_SECTION) {
      if (deltaY < -100) {
        initiateExit();
      }
    }
  });
  
  // Atualiza a função no ref quando dependências mudam
  useEffect(() => {
    handleScrollRef.current = (deltaY) => {
      const now = Date.now();
      const timeDelta = now - scrollRef.current.lastTime;
      
      if (timeDelta < 16) return;
      scrollRef.current.lastTime = now;
      
      const currentState = stateRef.current.navigationState;
      console.log('🖱️ Scroll:', { deltaY, state: currentState, accumulated: scrollRef.current.accumulated });
      
      if (currentState === NavigationStates.ORBITING) {
        scrollRef.current.accumulated += deltaY;
        
        if (Math.abs(scrollRef.current.accumulated) > CONFIG.scrollThreshold) {
          if (scrollRef.current.accumulated > 0) {
            console.log('🔍 Iniciando zoom in - accumulated:', scrollRef.current.accumulated);
            setNavigationState(NavigationStates.ZOOMING_IN);
            stateRef.current.navigationState = NavigationStates.ZOOMING_IN;
            animationRef.current.zoomDirection = 1;
            startZoomAnimation();
          }
          scrollRef.current.accumulated = 0;
        }
      } else if (currentState === NavigationStates.IN_SECTION) {
        if (deltaY < -100) {
          initiateExit();
        }
      }
    };
  }, [startZoomAnimation, initiateExit]);
  
  // Event listener de wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (stateRef.current.navigationState !== NavigationStates.IDLE) {
        e.preventDefault();
        handleScrollRef.current(e.deltaY);
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
  
  // Handler de ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && stateRef.current.navigationState === NavigationStates.IN_SECTION) {
        e.preventDefault();
        initiateExit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initiateExit]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current.frame) {
        cancelAnimationFrame(animationRef.current.frame);
      }
      if (animationRef.current.fadeFrame) {
        cancelAnimationFrame(animationRef.current.fadeFrame);
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
                  navigationState !== NavigationStates.IN_SECTION &&
                  navigationState !== NavigationStates.ORBITING,
    isInSection: navigationState === NavigationStates.IN_SECTION,
    canInteract: navigationState === NavigationStates.IDLE || 
                 navigationState === NavigationStates.ORBITING
  };
  
  return (
    <NavigationContextFixed.Provider value={value}>
      {children}
    </NavigationContextFixed.Provider>
  );
};

// Hook para usar o contexto
export const useNavigationFixed = () => {
  const context = useContext(NavigationContextFixed);
  if (!context) {
    throw new Error('useNavigationFixed deve ser usado dentro de NavigationProviderFixed');
  }
  return context;
};