import React from "react";
import HeroZustand from "./sections/HeroZustand.tsx";
import SectionPagesZustand from "./pages/SectionPagesZustand";

const App = () => {
  return (
    <div className="bg-black h-screen w-screen fixed inset-0 overflow-hidden relative">
      {/* Cena 3D principal com navegação usando Zustand */}
      <HeroZustand />
      
      {/* Páginas das seções com Zustand */}
      <SectionPagesZustand />
    </div>
  );
};

export default App;