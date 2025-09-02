import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '../stores/navigation.store';

// Imports diretos das seções para carregamento instantâneo
import About from '../sections/About';
import Projects from '../sections/Projects';
import Experiences from '../sections/Experiences';
import Contact from '../sections/Contact';
import Courses from '../sections/Courses';
import { LanguageToggle } from '../components/LanguageToggle';

// Container de página com animações suaves
const PageContainer = ({ sectionId, backgroundColor = "#0a0a0a", children }) => {
  const currentSection = useNavigationStore(state => state.currentSection);
  const pageVisible = useNavigationStore(state => state.pageVisible);
  const fadeProgress = useNavigationStore(state => state.fadeProgress);
  const initiateExit = useNavigationStore(state => state.initiateExit);
  
  const [shouldRender, setShouldRender] = useState(false);
  
  // Controla quando renderizar baseado no store
  useEffect(() => {
    const isActive = currentSection === sectionId && pageVisible;
    setShouldRender(isActive);
  }, [currentSection, sectionId, pageVisible]);
  
  return (
    <AnimatePresence mode="wait">
      {shouldRender && (
        <motion.div
          key={`page-${sectionId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 overflow-y-auto"
          style={{ backgroundColor }}
        >
          {/* Overlay de fade baseado no progresso */}
          <motion.div
            className="fixed inset-0 bg-black pointer-events-none z-30"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 - fadeProgress }}
            transition={{ duration: 0.1 }}
          />
          
          {/* Botão de voltar com animação */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.4,
              delay: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
            onClick={initiateExit}
            className="fixed top-6 left-6 z-50 w-12 h-12 flex items-center justify-center
                       bg-black/20 backdrop-blur-md rounded-full 
                       border border-white/10
                       transition-all duration-300
                       hover:bg-black/40 hover:border-white/20
                       hover:scale-110 group"
            aria-label="Voltar para navegação principal"
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none"
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            >
              <path 
                d="M19 12H5M5 12L12 19M5 12L12 5" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
          
          {/* Container do conteúdo com animação suave */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.8,
                delay: 0.2,
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            exit={{ 
              opacity: 0,
              y: 50,
              transition: {
                duration: 0.3
              }
            }}
            className="relative min-h-screen w-full"
          >
            {children}
          </motion.div>
          
          {/* Gradientes decorativos sutis */}
          <div className="fixed top-0 left-0 right-0 h-24 
                          bg-gradient-to-b from-black/30 to-transparent 
                          pointer-events-none z-30" />
          <div className="fixed bottom-0 left-0 right-0 h-24 
                          bg-gradient-to-t from-black/30 to-transparent 
                          pointer-events-none z-30" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Páginas das seções com Zustand
 */
const SectionPagesZustand = () => {
  return (
    <>
      {/* About Page */}
      <PageContainer 
        sectionId="about" 
        backgroundColor="#0a0a0a"
      >
        <div className="min-h-screen pt-24 pb-10">
          <About />
        </div>
      </PageContainer>
      
      {/* Projects Page */}
      <PageContainer 
        sectionId="projects" 
        backgroundColor="transparent"
      >
        {/* Language Toggle - only visible in Projects section */}
        <LanguageToggle />
        
        <div className="min-h-full">
          <Projects />
        </div>
      </PageContainer>
      
      {/* Experience Page */}
      <PageContainer 
        sectionId="experience" 
        backgroundColor="#0a0a0a"
      >
        {/* Language Toggle - only visible in Experience section */}
        <LanguageToggle />
        
        <div className="min-h-screen pt-24 pb-10 flex items-center justify-center">
          <div className="w-full max-w-6xl px-4">
            <Experiences />
          </div>
        </div>
      </PageContainer>
      
      {/* Contact Page */}
      <PageContainer 
        sectionId="contact" 
        backgroundColor="#0a0a0a"
      >
        <div className="min-h-screen pt-24 pb-10">
          <Contact />
        </div>
      </PageContainer>
      
      {/* Courses Page */}
      <PageContainer 
        sectionId="courses" 
        backgroundColor="#0a0a0a"
      >
        {/* Language Toggle - only visible in Courses section */}
        <LanguageToggle />
        
        <div className="min-h-screen pt-24 pb-10">
          <Courses />
        </div>
      </PageContainer>
    </>
  );
};

export default SectionPagesZustand;