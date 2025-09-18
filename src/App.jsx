import React, { useEffect, lazy, Suspense } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigationStore } from "./stores/navigation.store";

// Lazy loading para otimização de bundle
const HeroZustand = lazy(() => import("./sections/HeroZustand"));
const SectionPagesZustand = lazy(() => import("./pages/SectionPagesZustand"));
const CustomCursor = lazy(() => import("./components/CustomCursor"));
const MobileBottomNav = lazy(() => import("./components/MobileBottomNav"));
const NavigationProgress = lazy(() => import("./components/NavigationProgress"));
const NavigationTutorial = lazy(() => import("./components/NavigationTutorial"));

const App = () => {
  const initializeTutorial = useNavigationStore(state => state.initializeTutorial);
  const isMobile = useMediaQuery({ maxWidth: 853 });

  // Inicializa o tutorial na primeira renderização
  useEffect(() => {
    initializeTutorial();
  }, [initializeTutorial]);

  return (
    <div className="bg-black h-screen w-screen fixed inset-0 overflow-hidden relative">
      <Suspense fallback={<div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>}>
        {/* Cursor customizado */}
        <CustomCursor />

        {/* Menu de navegação inferior para mobile */}
        <MobileBottomNav />

        {/* Progress tracker para desktop */}
        <NavigationProgress />

        {/* Tutorial de navegação */}
        <NavigationTutorial />

        {/* Cena 3D principal com navegação usando Zustand */}
        <HeroZustand />

        {/* Páginas das seções com Zustand */}
        <SectionPagesZustand />
      </Suspense>
    </div>
  );
};

export default App;