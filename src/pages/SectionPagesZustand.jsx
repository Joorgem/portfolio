import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '../stores/navigation.store';

// Imports diretos das seções para carregamento instantâneo
import About from '../sections/About';
import Projects from '../sections/Projects';
import Experiences from '../sections/Experiences';
import Contact from '../sections/Contact';
import Courses from '../sections/Courses';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../components/LanguageToggle';
import Particles from '../components/Particles';
import { useMediaQuery } from 'react-responsive';

// Container de página com animações suaves
const PageContainer = ({ sectionId, backgroundColor = "#0a0a0a", children }) => {
  const { t } = useTranslation('common');
  const currentSection = useNavigationStore(state => state.currentSection);
  const pageVisible = useNavigationStore(state => state.pageVisible);
  const fadeProgress = useNavigationStore(state => state.fadeProgress);
  const initiateExit = useNavigationStore(state => state.initiateExit);
  const isMobile = useMediaQuery({ maxWidth: 853 });
  
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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-30 overflow-y-auto"
          style={backgroundColor === "transparent" ? {} : { backgroundColor }}
        >
          {/* Partículas da seção - ativas apenas quando seção está aberta */}
          <div className="fixed inset-0 z-40 pointer-events-none">
            <Particles
              className="absolute inset-0 w-full h-full"
              particleColors={['#ffffff', '#f8fafc', '#e2e8f0']}
              particleCount={isMobile ? 400 : 800}
              particleSpread={20}
              speed={0.1}
              particleBaseSize={100}
              sizeRandomness={1.2}
              cameraDistance={20}
              moveParticlesOnHover={true}
              particleHoverFactor={0.5}
              alphaParticles={false}
              disableRotation={false}
            />
          </div>

          {/* Overlay de fade baseado no progresso */}
          <motion.div
            className="fixed inset-0 bg-black pointer-events-none z-20"
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
            aria-label={t('navigation.backToMain')}
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
          
          {/* Language Toggle - Rola com o conteúdo */}
          <div className="absolute top-6 right-6 z-50">
            <LanguageToggle />
          </div>
          
          {/* Container do conteúdo com animação suave */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.6,
                delay: 0.1,
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
                          pointer-events-none z-20" />
          <div className="fixed bottom-0 left-0 right-0 h-24 
                          bg-gradient-to-t from-black/30 to-transparent 
                          pointer-events-none z-20" />
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
        backgroundColor="transparent"
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
        <div className="min-h-full">
          <Projects />
        </div>
      </PageContainer>
      
      {/* Experience Page */}
      <PageContainer 
        sectionId="experience" 
        backgroundColor="transparent"
      >
        <div className="min-h-screen pt-24 pb-10 flex items-center justify-center">
          <div className="w-full max-w-6xl px-4">
            <Experiences />
          </div>
        </div>
      </PageContainer>
      
      {/* Contact Page */}
      <PageContainer 
        sectionId="contact" 
        backgroundColor="transparent"
      >
        <div className="min-h-screen pt-24 pb-10">
          <Contact />
        </div>
      </PageContainer>
      
      {/* Courses Page */}
      <PageContainer 
        sectionId="courses" 
        backgroundColor="transparent"
      >
        <div className="min-h-screen pt-24 pb-10">
          <Courses />
        </div>
      </PageContainer>
    </>
  );
};

export default SectionPagesZustand;