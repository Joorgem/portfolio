import React, { useEffect, useState, startTransition } from 'react';
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

// Timing unificado para evitar conflitos de animação
const ANIMATION_TIMING = {
  fade: 0.1,      // Mesmo timing do Hero fade
  content: 0.3,   // Conteúdo aparece suavemente
  button: 0.4,    // Botão aparece por último
  delay: 0.05     // Delay estratégico
};

// Container de página com animações suaves
const PageContainer = ({ sectionId, backgroundColor = "#0a0a0a", children }) => {
  const { t } = useTranslation('common');
  const currentSection = useNavigationStore(state => state.currentSection);
  const pageVisible = useNavigationStore(state => state.pageVisible);
  const initiateExit = useNavigationStore(state => state.initiateExit);
  const isMobile = useMediaQuery({ maxWidth: 853 });
  
  const [shouldRender, setShouldRender] = useState(false);
  
  // Controla quando renderizar baseado no store
  useEffect(() => {
    const isActive = currentSection === sectionId && pageVisible;
    startTransition(() => {
      setShouldRender(isActive);
    });
  }, [currentSection, sectionId, pageVisible]);

  // CORREÇÃO CRÍTICA: Removido useEffect que causava fechamento automático
  // O fadeOut deve ser controlado EXCLUSIVAMENTE pelo botão de saída ou ESC
  // O rendering da seção agora é puro, sem efeitos colaterais que interferem na navegação
  
  return (
    <AnimatePresence mode="wait">
      {shouldRender && (
        <motion.div
          key={`page-${sectionId}`}
          initial={{ opacity: 1 }} // MODIFICADO: Começa opaco para ser revelado pelo fade
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: ANIMATION_TIMING.fade,
            delay: ANIMATION_TIMING.delay,
            ease: "easeOut" 
          }}
          className="fixed inset-0 z-30 overflow-y-auto bg-black"
          style={backgroundColor === "transparent" ? { backgroundColor: "#000000" } : { backgroundColor }}
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

          {/* Overlay removido - usando apenas o overlay do Hero para evitar piscamento */}
          
          {/* Botão de voltar com animação */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: ANIMATION_TIMING.button,
              delay: ANIMATION_TIMING.content,
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
                duration: ANIMATION_TIMING.content,
                delay: ANIMATION_TIMING.delay,
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            exit={{ 
              opacity: 0,
              y: 50,
              transition: {
                duration: ANIMATION_TIMING.fade
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