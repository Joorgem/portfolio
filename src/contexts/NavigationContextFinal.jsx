import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

/**
 * Estados bem definidos do sistema de navegação
 */
const NavigationStates = {
  IDLE: 'idle',                    // Estado inicial
  ORBITING: 'orbiting',            // Orbitando planeta selecionado
  ZOOMING_IN: 'zooming_in',        // Fazendo zoom in
  ENTERING: 'entering',            // Entrando na seção (fade)
  IN_SECTION: 'in_section',        // Dentro da seção
  EXITING: 'exiting',              // Saindo da seção
  ZOOMING_OUT: 'zooming_out',      // Fazendo zoom out
};

const NavigationContextFinal = createContext();

export const NavigationProviderFinal = ({ children }) => {
  // Estados principais
  const [navigationState, setNavigationState] = useState(NavigationStates.IDLE);
  const [currentSection, setCurrentSection] = useState('MAIN');
  const [targetSection, setTargetSection] = useState(null);
  
  // Estados de transição (0 a 1)
  const [zoomProgress, setZoomProgress] = useState(0);
  const [fadeProgress, setFadeProgress] = useState(0);
  
  // Estados de UI
  const [pageVisible, setPageVisible] = useState(false);
  const [canvas3DActive, setCanvas3DActive] = useState(true);
  
  // Controle de animação
  const animationFrame = useRef(null);
  const zoomDirection = useRef(0); // -1 = out, 0 = parado, 1 = in
  const accumulatedScroll = useRef(0);
  const lastScrollTime = useRef(0);
  
  // Configurações
  const CONFIG = {
    scrollSensitivity: 0.001,      // Sensibilidade do scroll
    scrollThreshold: 30,            // Threshold mínimo para iniciar zoom
    zoomSpeed: 0.008,               // Velocidade do zoom
    fadeSpeed: 0.012,               // Velocidade do fade
    zoomStartFade: 0.85,            // Quando começar fade (85% do zoom)
    zoomComplete: 0.98,             // Quando considerar zoom completo
    fadePauseCanvas: 0.95,          // Quando pausar canvas (95% do fade)
  };
  
  /**
   * Inicia navegação para uma seção (clique no planeta)
   */
  const startNavigation = useCallback((sectionId) => {
    // Permite navegação de IDLE ou ORBITING (para trocar entre planetas)
    if (navigationState !== NavigationStates.IDLE && 
        navigationState !== NavigationStates.ORBITING) {
      console.log('⚠️ Navegação bloqueada - estado:', navigationState);
      return;
    }
    
    console.log(`🚀 Iniciando navegação para: ${sectionId}`);
    
    // Se já está orbitando outro planeta, reseta o zoom primeiro
    if (navigationState === NavigationStates.ORBITING && targetSection !== sectionId) {
      setZoomProgress(0);
      setFadeProgress(0);
    }
    
    setTargetSection(sectionId);
    setNavigationState(NavigationStates.ORBITING);
    
    // Reset valores
    accumulatedScroll.current = 0;
    zoomDirection.current = 0;
    
    return sectionId;
  }, [navigationState]);
  
  /**
   * Processa scroll do mouse
   */
  const handleScroll = (deltaY) => {
    const now = Date.now();
    const timeDelta = now - lastScrollTime.current;
    
    // Ignora scrolls muito rápidos
    if (timeDelta < 16) return; // ~60fps
    lastScrollTime.current = now;
    
    console.log('🖱️ Scroll detectado:', { deltaY, state: navigationState });
    
    // Só processa em estados apropriados
    if (navigationState === NavigationStates.ORBITING) {
      // Acumula scroll
      accumulatedScroll.current += deltaY;
      console.log('📊 Scroll acumulado:', accumulatedScroll.current);
      
      // Verifica se passou do threshold para iniciar zoom
      if (Math.abs(accumulatedScroll.current) > CONFIG.scrollThreshold) {
        if (accumulatedScroll.current > 0) {
          // Zoom in
          console.log('🔍 Iniciando zoom in');
          setNavigationState(NavigationStates.ZOOMING_IN);
          zoomDirection.current = 1;
          startZoomAnimation();
        }
        accumulatedScroll.current = 0;
      }
    } else if (navigationState === NavigationStates.IN_SECTION) {
      // Scroll reverso forte para sair
      if (deltaY < -100) {
        initiateExit();
      }
    }
  };
  
  /**
   * Animação de zoom - NÃO usar useCallback para evitar problemas de dependências
   */
  const startZoomAnimation = () => {
    const animate = () => {
      let shouldContinue = false;
      
      setZoomProgress(current => {
        let next = current;
        
        // Zoom in
        if (zoomDirection.current > 0) {
          next = Math.min(1, current + CONFIG.zoomSpeed);
          shouldContinue = next < 1;
          
          // Verifica se deve iniciar fade
          if (next >= CONFIG.zoomStartFade) {
            console.log('🎨 Iniciando fade in');
            startFadeAnimation();
          }
          
          // Verifica se zoom está completo
          if (next >= CONFIG.zoomComplete) {
            console.log('✅ Zoom completo');
            setTimeout(() => enterSection(), 100);
            shouldContinue = false;
          }
        }
        // Zoom out
        else if (zoomDirection.current < 0) {
          next = Math.max(0, current - CONFIG.zoomSpeed * 1.5);
          shouldContinue = next > 0;
          
          if (next === 0) {
            setTimeout(() => completeExit(), 100);
            shouldContinue = false;
          }
        }
        
        return next;
      });
      
      if (shouldContinue) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };
    
    // Cancela animação anterior
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(animate);
  };
  
  /**
   * Animação de fade
   */
  const startFadeAnimation = () => {
    let fadeFrame = null;
    
    const animate = () => {
      let shouldContinue = false;
      
      setFadeProgress(current => {
        const next = Math.min(1, current + CONFIG.fadeSpeed);
        shouldContinue = next < 1;
        
        // Pausa canvas quando fade estiver quase completo
        if (next >= CONFIG.fadePauseCanvas) {
          console.log('⏸️ Pausando canvas 3D');
          setTimeout(() => setCanvas3DActive(false), 50);
        }
        
        return next;
      });
      
      if (shouldContinue) {
        fadeFrame = requestAnimationFrame(animate);
      }
    };
    
    fadeFrame = requestAnimationFrame(animate);
  };
  
  /**
   * Entra na seção
   */
  const enterSection = () => {
    if (!targetSection) return;
    
    console.log(`📄 Entrando na seção: ${targetSection}`);
    setNavigationState(NavigationStates.ENTERING);
    setCurrentSection(targetSection);
    
    // Mostra página após pequeno delay
    setTimeout(() => {
      setPageVisible(true);
      setNavigationState(NavigationStates.IN_SECTION);
    }, 200);
    
    // Atualiza URL
    window.history.pushState(
      { section: targetSection },
      '',
      `#${targetSection.toLowerCase()}`
    );
  };
  
  /**
   * Inicia saída da seção
   */
  const initiateExit = () => {
    if (navigationState !== NavigationStates.IN_SECTION) return;
    
    console.log('🚪 Iniciando saída');
    setNavigationState(NavigationStates.EXITING);
    setPageVisible(false);
    
    // Fade out
    let fadeOutFrame = null;
    const fadeOut = () => {
      let shouldContinue = false;
      
      setFadeProgress(current => {
        const next = Math.max(0, current - CONFIG.fadeSpeed * 2);
        shouldContinue = next > 0;
        
        // Resume canvas quando fade diminuir
        if (next <= 0.5) {
          console.log('▶️ Resumindo canvas 3D');
          setTimeout(() => setCanvas3DActive(true), 50);
        }
        
        if (next === 0) {
          // Inicia zoom out
          setNavigationState(NavigationStates.ZOOMING_OUT);
          zoomDirection.current = -1;
          setTimeout(() => startZoomAnimation(), 100);
        }
        
        return next;
      });
      
      if (shouldContinue) {
        fadeOutFrame = requestAnimationFrame(fadeOut);
      }
    };
    
    fadeOutFrame = requestAnimationFrame(fadeOut);
  };
  
  /**
   * Completa saída e retorna ao estado apropriado
   */
  const completeExit = () => {
    console.log('✅ Saída completa');
    
    // Se tem targetSection, volta para ORBITING, senão volta para IDLE
    if (targetSection) {
      setNavigationState(NavigationStates.ORBITING);
      setCurrentSection(targetSection);
      console.log(`🌍 Voltando para órbita de ${targetSection}`);
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
    zoomDirection.current = 0;
    accumulatedScroll.current = 0;
    
    // Atualiza URL
    const section = targetSection || 'MAIN';
    if (section === 'MAIN') {
      window.history.pushState({ section: 'MAIN' }, '', '#');
    } else {
      window.history.pushState({ section }, '', `#${section.toLowerCase()}`);
    }
  };
  
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
   * Handler de wheel/scroll
   */
  useEffect(() => {
    const handleWheel = (e) => {
      // Previne scroll da página em estados relevantes
      if (navigationState !== NavigationStates.IDLE) {
        e.preventDefault();
        handleScroll(e.deltaY);
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [navigationState]);
  
  /**
   * Cleanup de animações
   */
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
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
    <NavigationContextFinal.Provider value={value}>
      {children}
    </NavigationContextFinal.Provider>
  );
};

// Hook para usar o contexto
export const useNavigationFinal = () => {
  const context = useContext(NavigationContextFinal);
  if (!context) {
    throw new Error('useNavigationFinal deve ser usado dentro de NavigationProviderFinal');
  }
  return context;
};