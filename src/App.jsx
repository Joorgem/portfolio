import React, { useEffect, useRef, Suspense } from "react";

// Lazy loading do HeroZustand para otimização de performance
// PRODUCTION FIX: Smart preloading to prevent race conditions
import { preloadHeroZustand } from "./utils/preloadHeroZustand";

const HeroZustand = React.lazy(() => preloadHeroZustand());
import SectionPagesZustand from "./pages/SectionPagesZustand";
import CustomCursor from "./components/CustomCursor";
import MobileBottomNav from "./components/MobileBottomNav";
import NavigationProgress from "./components/NavigationProgress";
import NavigationTutorial from "./components/NavigationTutorial";
import PortfolioModeSelector from "./components/PortfolioModeSelector";
import OnePagePortfolio from "./components/OnePagePortfolio";
import { useNavigationStore } from "./stores/navigation.store";
import { PortfolioModes } from "./constants/navigationConfig";

const App = () => {
  const portfolioMode = useNavigationStore(state => state.portfolioMode);
  // Timeout management refs following React best practices
  const timeoutRef = useRef(null);

  // Inicializa o tutorial na primeira renderização
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🎭 [${timestamp}] App: Calling initializeTutorial()`);

    // CRITICAL FIX: Call directly from store to avoid dependency issues
    useNavigationStore.getState().initializeTutorial();
  }, []); // Empty dependency array - only run once on mount

  // Aplica classes CSS no body baseado no modo do portfolio
  useEffect(() => {
    const body = document.body;

    // Remove todas as classes de modo
    body.classList.remove('mode-3d', 'mode-onepage');

    // Aplica a classe correspondente ao modo atual
    if (portfolioMode === PortfolioModes.THREE_D) {
      body.classList.add('mode-3d');
    } else if (portfolioMode === PortfolioModes.ONE_PAGE) {
      body.classList.add('mode-onepage');
    }

    // Cleanup: remove classes quando componente desmonta
    return () => {
      body.classList.remove('mode-3d', 'mode-onepage');
    };
  }, [portfolioMode]);

  // TIMEOUT FALLBACK: Smart timeout management with proper cleanup
  useEffect(() => {
    const timestamp = new Date().toISOString();

    console.log(`⏲️  [${timestamp}] App Timeout Effect TRIGGERED:`, {
      portfolioMode,
      hasExistingTimeout: !!timeoutRef.current
    });

    // Clear any existing timeout first
    if (timeoutRef.current) {
      console.log(`🗑️  [${timestamp}] App: Clearing existing timeout`);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only set timeout for 3D mode
    if (portfolioMode === PortfolioModes.THREE_D) {
      console.log(`⏳ [${timestamp}] App: Setting 5s timeout for 3D mode`);

      timeoutRef.current = setTimeout(() => {
        const timeoutTimestamp = new Date().toISOString();
        const currentState = useNavigationStore.getState();

        console.log(`⏰ [${timeoutTimestamp}] App Timeout FIRED:`, {
          loading3DScene: currentState.loading3DScene,
          portfolioMode: currentState.portfolioMode,
          showTutorial: currentState.showTutorial,
          is3DSceneReady: currentState.is3DSceneReady,
          activationInProgress: currentState.activationInProgress
        });

        // Only activate if still in loading state and conditions are met
        if (currentState.loading3DScene &&
            currentState.portfolioMode === PortfolioModes.THREE_D &&
            !currentState.showTutorial &&
            !currentState.is3DSceneReady &&
            !currentState.activationInProgress) {
          console.warn(`🚨 [${timeoutTimestamp}] 3D Scene loading timeout - forcing activation for UX`);
          currentState.activate3DSceneAndTutorial();
        } else {
          console.log(`⏸️  [${timeoutTimestamp}] App Timeout: Conditions not met for forced activation`);
        }

        timeoutRef.current = null; // Clear ref after execution
      }, 5000);
    } else {
      console.log(`❌ [${timestamp}] App: Not 3D mode, no timeout set`);
    }

    // Cleanup function following React patterns
    return () => {
      if (timeoutRef.current) {
        console.log(`🧹 [${new Date().toISOString()}] App Cleanup: Clearing timeout on unmount/change`);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [portfolioMode]); // Only depend on portfolioMode to avoid unnecessary resets

  return (
    <div className={`bg-black relative ${
      portfolioMode === PortfolioModes.ONE_PAGE
        ? 'min-h-screen w-full overflow-x-hidden'
        : 'h-screen w-screen fixed inset-0 overflow-hidden'
    }`}>

      {/* Cursor customizado */}
      <CustomCursor />

      {/* Seletor de modo de portfólio - Aparece primeiro */}
      <PortfolioModeSelector />

      {/* Componentes do modo 3D - Renderizados apenas no modo 3D */}
      {portfolioMode === PortfolioModes.THREE_D && (
        <>
          {/* Menu de navegação inferior para mobile */}
          <MobileBottomNav />

          {/* Progress tracker para desktop */}
          <NavigationProgress />

          {/* Tutorial de navegação */}
          <NavigationTutorial />

          {/* Cena 3D principal com navegação usando Zustand - Lazy loaded */}
          <Suspense fallback={
            <div className="fixed inset-0 z-0 bg-black flex items-center justify-center">
              <div className="text-white/60 text-sm font-light tracking-wide">
                Loading 3D experience...
              </div>
            </div>
          }>
            <HeroZustand />
          </Suspense>

          {/* Páginas das seções com Zustand */}
          <SectionPagesZustand />
        </>
      )}

      {/* Componente One Page - Renderizado apenas no modo One Page */}
      {portfolioMode === PortfolioModes.ONE_PAGE && (
        <OnePagePortfolio />
      )}
    </div>
  );
};

export default App;