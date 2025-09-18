import React, { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import HeroZustand from "./sections/HeroZustand";
import SectionPagesZustand from "./pages/SectionPagesZustand";
import CustomCursor from "./components/CustomCursor";
import MobileBottomNav from "./components/MobileBottomNav";
import NavigationProgress from "./components/NavigationProgress";
import NavigationTutorial from "./components/NavigationTutorial";
import { useNavigationStore } from "./stores/navigation.store";

const App = () => {
  const initializeTutorial = useNavigationStore(state => state.initializeTutorial);
  const isMobile = useMediaQuery({ maxWidth: 853 });

  // Inicializa o tutorial na primeira renderização
  useEffect(() => {
    initializeTutorial();
  }, [initializeTutorial]);

  return (
    <div className="bg-black h-screen w-screen fixed inset-0 overflow-hidden relative">

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
    </div>
  );
};

export default App;