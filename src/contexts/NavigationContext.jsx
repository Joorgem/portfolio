import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  // Estado principal de navegação
  const [currentSection, setCurrentSection] = useState('MAIN');
  const [previousSection, setPreviousSection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);
  
  // Estado de renderização 3D
  const [canvas3DActive, setCanvas3DActive] = useState(true);
  const [canvasScreenshot, setCanvasScreenshot] = useState(null);
  
  // Estados de fade e transição
  const [fadeProgress, setFadeProgress] = useState(0); // 0-1
  const [showContent, setShowContent] = useState(false);
  
  // Navegação para seção
  const navigateToSection = useCallback((sectionId) => {
    if (isTransitioning || currentSection === sectionId) return;
    
    console.log(`📍 NavigationContext: Navegando para ${sectionId}`);
    setPreviousSection(currentSection);
    setCurrentSection(sectionId);
    setIsTransitioning(true);
  }, [currentSection, isTransitioning]);
  
  // Voltar para main
  const returnToMain = useCallback(() => {
    if (isTransitioning || currentSection === 'MAIN') return;
    
    console.log('🏠 NavigationContext: Voltando para MAIN');
    setPreviousSection(currentSection);
    setCurrentSection('MAIN');
    setIsTransitioning(true);
    setSectionVisible(false);
    setShowContent(false);
  }, [currentSection, isTransitioning]);
  
  // Controle de pause/resume do canvas
  const pauseCanvas3D = useCallback((screenshot = null) => {
    console.log('⏸️ Pausando renderização 3D');
    setCanvas3DActive(false);
    if (screenshot) {
      setCanvasScreenshot(screenshot);
    }
  }, []);
  
  const resumeCanvas3D = useCallback(() => {
    console.log('▶️ Resumindo renderização 3D');
    setCanvas3DActive(true);
    setCanvasScreenshot(null);
  }, []);
  
  // Handler de progresso do fade
  const updateFadeProgress = useCallback((progress) => {
    setFadeProgress(progress);
    
    // Lógica de transição baseada no fade
    if (progress > 0.8 && currentSection !== 'MAIN' && !showContent) {
      // Momento de pausar 3D e mostrar conteúdo
      setShowContent(true);
      setSectionVisible(true);
      pauseCanvas3D();
    } else if (progress < 0.2 && currentSection === 'MAIN' && showContent) {
      // Voltando para main - esconde conteúdo
      setShowContent(false);
      setSectionVisible(false);
      resumeCanvas3D();
    }
  }, [currentSection, showContent, pauseCanvas3D, resumeCanvas3D]);
  
  // Finalizar transição
  const completeTransition = useCallback(() => {
    setIsTransitioning(false);
    console.log(`✅ Transição completa: ${currentSection}`);
  }, [currentSection]);
  
  // Histórico do navegador
  useEffect(() => {
    const handlePopState = (e) => {
      const section = e.state?.section || 'MAIN';
      if (section !== currentSection) {
        navigateToSection(section);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Atualiza URL quando seção muda
    if (currentSection !== 'MAIN') {
      window.history.pushState(
        { section: currentSection },
        '',
        `#${currentSection.toLowerCase()}`
      );
    } else {
      window.history.pushState({ section: 'MAIN' }, '', '#');
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentSection, navigateToSection]);
  
  // Handler de tecla ESC global
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && currentSection !== 'MAIN' && !isTransitioning) {
        returnToMain();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [currentSection, isTransitioning, returnToMain]);
  
  const value = {
    // Estados
    currentSection,
    previousSection,
    isTransitioning,
    sectionVisible,
    canvas3DActive,
    canvasScreenshot,
    fadeProgress,
    showContent,
    
    // Ações
    navigateToSection,
    returnToMain,
    pauseCanvas3D,
    resumeCanvas3D,
    updateFadeProgress,
    completeTransition
  };
  
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation deve ser usado dentro de NavigationProvider');
  }
  return context;
};