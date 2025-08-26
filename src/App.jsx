import React from "react";
import HeroZustand from "./sections/HeroZustand";
import SectionPagesZustand from "./pages/SectionPagesZustand";
import CustomCursor from "./components/CustomCursor";
import MobileBottomNav from "./components/MobileBottomNav";
import ScrollIndicator from "./components/ScrollIndicator";

const App = () => {
  return (
    <div className="bg-black h-screen w-screen fixed inset-0 overflow-hidden relative">
      {/* Cursor customizado */}
      <CustomCursor />
      
      {/* Menu de navegação inferior para mobile */}
      <MobileBottomNav />
      
      {/* Indicador de scroll */}
      <ScrollIndicator />
      
      {/* Cena 3D principal com navegação usando Zustand */}
      <HeroZustand />
      
      {/* Páginas das seções com Zustand */}
      <SectionPagesZustand />
    </div>
  );
};

export default App;