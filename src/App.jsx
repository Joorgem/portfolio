import React, { useEffect, Suspense } from "react";

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
  const initializeTutorial = useNavigationStore(state => state.initializeTutorial);
  const portfolioMode = useNavigationStore(state => state.portfolioMode);

  // Inicializa o tutorial na primeira renderização
  useEffect(() => {
    initializeTutorial();
  }, [initializeTutorial]);

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