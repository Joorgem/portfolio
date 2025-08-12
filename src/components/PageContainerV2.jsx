import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationFixed } from '../contexts/NavigationContextFixed';

/**
 * Container otimizado para páginas com transições suaves
 */
const PageContainerV2 = ({ 
  sectionId,
  children,
  backgroundColor = '#0a0a0a',
  className = ''
}) => {
  const { 
    currentSection,
    pageVisible,
    fadeProgress,
    initiateExit,
    navigationState
  } = useNavigationFixed();
  
  const [shouldRender, setShouldRender] = useState(false);
  
  // Controla quando renderizar baseado no contexto
  useEffect(() => {
    const isActive = currentSection === sectionId && pageVisible;
    setShouldRender(isActive);
  }, [currentSection, sectionId, pageVisible]);
  
  // Botão de voltar com design melhorado
  const BackButton = () => (
    <motion.button
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ 
        duration: 0.5,
        delay: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      onClick={initiateExit}
      className="fixed top-6 left-6 z-50 group"
      aria-label="Voltar para navegação principal"
    >
      <div className="relative flex items-center gap-3 px-6 py-3 
                      bg-gradient-to-r from-white/10 to-white/5
                      backdrop-blur-xl rounded-full 
                      border border-white/20
                      shadow-lg shadow-black/50
                      transition-all duration-300
                      hover:from-white/20 hover:to-white/10
                      hover:scale-105 hover:shadow-xl hover:shadow-black/60">
        
        {/* Ícone de seta */}
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none"
          className="transform transition-transform duration-300 
                     group-hover:-translate-x-1"
        >
          <path 
            d="M19 12H5M5 12L12 19M5 12L12 5" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        
        {/* Texto */}
        <span className="text-white font-medium text-sm tracking-wide">
          Voltar
        </span>
        
        {/* Brilho decorativo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t 
                        from-transparent via-white/5 to-white/10 
                        opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300" />
      </div>
    </motion.button>
  );
  
  // Indicador de tecla ESC
  const EscapeHint = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ 
        duration: 0.5,
        delay: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-2 px-4 py-2 
                      bg-white/5 backdrop-blur-md rounded-full
                      border border-white/10">
        <span className="text-white/60 text-sm">Pressione</span>
        <kbd className="px-2.5 py-1 bg-white/10 rounded-md 
                        border border-white/20 text-white text-xs font-mono">
          ESC
        </kbd>
        <span className="text-white/60 text-sm">para voltar</span>
      </div>
    </motion.div>
  );
  
  // Loading spinner elegante
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-16 h-16"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-white/20 
                     border-t-white"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-white/10 
                     border-b-white/50"
        />
      </motion.div>
    </div>
  );
  
  return (
    <AnimatePresence mode="wait">
      {shouldRender && (
        <motion.div
          key={`page-${sectionId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-40 overflow-y-auto ${className}`}
          style={{ backgroundColor }}
        >
          {/* Overlay de fade baseado no progresso */}
          <motion.div
            className="fixed inset-0 bg-black pointer-events-none z-30"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 - fadeProgress }}
            transition={{ duration: 0.1 }}
          />
          
          {/* Controles de navegação */}
          <BackButton />
          <EscapeHint />
          
          {/* Container do conteúdo com animação suave */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.8,
                delay: 0.2,
                ease: [0.25, 0.1, 0.25, 1] // Cubic bezier para movimento natural
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
            {/* Wrapper para centralizar conteúdo */}
            <div className="relative w-full min-h-screen">
              {children}
            </div>
          </motion.div>
          
          {/* Gradientes decorativos sutis */}
          <div className="fixed top-0 left-0 right-0 h-24 
                          bg-gradient-to-b from-black/30 to-transparent 
                          pointer-events-none z-30" />
          <div className="fixed bottom-0 left-0 right-0 h-24 
                          bg-gradient-to-t from-black/30 to-transparent 
                          pointer-events-none z-30" />
          
          {/* Vinheta nas bordas para profundidade */}
          <div className="fixed inset-0 pointer-events-none z-20">
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, transparent 0%, transparent 70%, rgba(0,0,0,0.3) 100%)'
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageContainerV2;