import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../contexts/NavigationContext';

const PageContainer = ({ 
  sectionId,
  children,
  backgroundColor = '#000000',
  className = ''
}) => {
  const { 
    currentSection, 
    sectionVisible, 
    returnToMain,
    fadeProgress 
  } = useNavigation();
  
  const [isVisible, setIsVisible] = useState(false);
  
  // Controla visibilidade baseado no contexto
  useEffect(() => {
    setIsVisible(currentSection === sectionId && sectionVisible);
  }, [currentSection, sectionId, sectionVisible]);
  
  // Botão de voltar estilizado
  const BackButton = () => (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      onClick={returnToMain}
      className="fixed top-8 left-8 z-50 flex items-center gap-3 px-5 py-3 
                 bg-white/10 backdrop-blur-md rounded-full border border-white/20
                 hover:bg-white/20 hover:scale-105 transition-all duration-300
                 group cursor-pointer"
      aria-label="Voltar para navegação principal"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="transform group-hover:-translate-x-1 transition-transform duration-300"
      >
        <path 
          d="M19 12H5M5 12L12 19M5 12L12 5" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-white font-medium">Voltar</span>
    </motion.button>
  );
  
  // Indicador de navegação
  const NavigationHint = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: 0.8 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50
                 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full
                 border border-white/20 text-white/80 text-sm"
    >
      Pressione <kbd className="px-2 py-1 mx-1 bg-white/20 rounded">ESC</kbd> para voltar
    </motion.div>
  );
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={sectionId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed inset-0 z-40 overflow-y-auto ${className}`}
          style={{ 
            backgroundColor,
            // Usa o fade progress para controlar opacidade inicial
            opacity: Math.min(1, fadeProgress * 1.2)
          }}
        >
          {/* Botão de voltar */}
          <BackButton />
          
          {/* Hint de navegação */}
          <NavigationHint />
          
          {/* Container do conteúdo com animação */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ 
              duration: 0.6,
              delay: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="min-h-screen w-full"
          >
            {/* Wrapper para centralizar conteúdo se necessário */}
            <div className="relative w-full min-h-screen">
              {children}
            </div>
          </motion.div>
          
          {/* Gradiente decorativo no topo */}
          <div className="fixed top-0 left-0 right-0 h-32 
                          bg-gradient-to-b from-black/50 to-transparent 
                          pointer-events-none z-30" />
          
          {/* Gradiente decorativo no fundo */}
          <div className="fixed bottom-0 left-0 right-0 h-32 
                          bg-gradient-to-t from-black/50 to-transparent 
                          pointer-events-none z-30" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente de Loading para transições
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
    />
  </div>
);

export default PageContainer;