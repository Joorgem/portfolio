import React, { Suspense, useEffect } from "react";

import CustomCursor from "./components/CustomCursor";
import MobileBottomNav from "./components/MobileBottomNav";
import NavigationProgress from "./components/NavigationProgress";
import NavigationTutorial from "./components/NavigationTutorial";
import OnePagePortfolio from "./components/OnePagePortfolio";
import PortfolioModeSelector from "./components/PortfolioModeSelector";
import SectionPagesZustand from "./pages/SectionPagesZustand";
import { PortfolioModes } from "./constants/navigationConfig";
import { useNavigationStore } from "./stores/navigation.store";
import { preloadHeroZustand } from "./utils/preloadHeroZustand";

const HeroZustand = React.lazy(() => preloadHeroZustand());

const App = () => {
  const portfolioMode = useNavigationStore(state => state.portfolioMode);

  useEffect(() => {
    useNavigationStore.getState().initializeTutorial();
    preloadHeroZustand();
  }, []);

  useEffect(() => {
    const body = document.body;

    body.classList.toggle("mode-3d", portfolioMode === PortfolioModes.THREE_D);
    body.classList.toggle("mode-onepage", portfolioMode === PortfolioModes.ONE_PAGE);

    return () => {
      body.classList.remove("mode-3d", "mode-onepage");
    };
  }, [portfolioMode]);

  const containerClassName =
    portfolioMode === PortfolioModes.ONE_PAGE
      ? "bg-black relative min-h-screen w-full overflow-x-hidden"
      : "bg-black relative h-screen w-screen fixed inset-0 overflow-hidden";

  return (
    <div className={containerClassName}>
      <CustomCursor />
      <PortfolioModeSelector />

      {portfolioMode === PortfolioModes.THREE_D && (
        <>
          <MobileBottomNav />
          <NavigationProgress />
          <NavigationTutorial />

          <Suspense
            fallback={
              <div className="fixed inset-0 z-0 flex items-center justify-center bg-black">
                <div className="text-sm font-light tracking-wide text-white/60">
                  Loading 3D experience...
                </div>
              </div>
            }
          >
            <HeroZustand />
          </Suspense>

          <SectionPagesZustand />
        </>
      )}

      {portfolioMode === PortfolioModes.ONE_PAGE && <OnePagePortfolio />}
    </div>
  );
};

export default App;
