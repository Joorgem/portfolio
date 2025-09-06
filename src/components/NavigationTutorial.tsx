import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '../stores/navigation.store';
import { useTranslation } from 'react-i18next';

const NavigationTutorial: React.FC = () => {
  const { t, i18n } = useTranslation('tutorial');
  const showTutorial = useNavigationStore(state => state.showTutorial);
  const completeTutorial = useNavigationStore(state => state.completeTutorial);

  // Detecta se é mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Estado para controlar se o idioma foi selecionado no mobile
  const [languageSelected, setLanguageSelected] = useState(!isMobile);

  const handleStartExploring = () => {
    completeTutorial();
  };

  const handleLanguageSelect = (language: 'pt' | 'en') => {
    i18n.changeLanguage(language);
    setLanguageSelected(true);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.3,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.85,
      y: 30,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2 + 0.3,
        duration: 0.5
      }
    })
  };

  return (
    <AnimatePresence mode="wait">
      {showTutorial && (
        <motion.div key="tutorial-modal">
          {/* Backdrop com blur */}
          <motion.div
            className="fixed inset-0 z-[49] bg-black/60 backdrop-blur-xl cursor-pointer"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleStartExploring}
          />

          {/* Modal */}
          <motion.div
            key={`tutorial-${languageSelected ? 'tutorial' : 'language'}-${i18n.language}`}
            className="fixed inset-0 z-[50] flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            onClick={languageSelected ? handleStartExploring : undefined}
          >
            <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={languageSelected ? handleStartExploring : undefined}>
              {/* Condicional: Seleção de Idioma no Mobile ou Tutorial */}
              {!languageSelected && isMobile ? (
                // Mobile - Seleção de Idioma
                <>

                  {/* Language Buttons */}
                  <div className="flex gap-4 justify-center items-center h-full">
                    <motion.button
                      onClick={() => handleLanguageSelect('pt')}
                      className="w-20 h-20 bg-white/5 border border-white/10 rounded-xl 
                                hover:bg-white/10 hover:border-white/20 transition-all duration-300
                                flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-2xl font-medium text-white/90">PT</span>
                    </motion.button>

                    <motion.button
                      onClick={() => handleLanguageSelect('en')}
                      className="w-20 h-20 bg-white/5 border border-white/10 rounded-xl 
                                hover:bg-white/10 hover:border-white/20 transition-all duration-300
                                flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <span className="text-2xl font-medium text-white/90">EN</span>
                    </motion.button>
                  </div>
                </>
              ) : (
                // Desktop ou Mobile após seleção de idioma - Tutorial Normal
                <>
                  {/* Header */}
                  <motion.div
                    className="text-center mb-8"
                    key={`tutorial-header-${i18n.language}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className="text-2xl font-light text-white mb-2 tracking-wide">
                      {t('title')}
                    </h2>
                    <div className="w-12 h-px bg-white/20 mx-auto"></div>
                  </motion.div>

                  {/* Steps */}
                  <div className="space-y-6 mb-8" key={`tutorial-steps-${i18n.language}`}>
                {/* Step 1 */}
                <motion.div
                  className="flex items-center gap-4"
                  custom={0}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-white/80 text-sm font-light">1</span>
                  </div>
                  <div>
                    <p className="text-white/90 font-light" dangerouslySetInnerHTML={{ __html: t(isMobile ? 'steps.step1.mobile' : 'steps.step1.desktop') }} />
                  </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  className="flex items-center gap-4"
                  custom={1}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-white/80 text-sm font-light">2</span>
                  </div>
                  <div>
                    <p className="text-white/90 font-light" dangerouslySetInnerHTML={{ __html: t(isMobile ? 'steps.step2.mobile' : 'steps.step2.desktop') }} />
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  className="flex items-center gap-4"
                  custom={2}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-white/80 text-sm font-light">3</span>
                  </div>
                  <div>
                    <p className="text-white/90 font-light" dangerouslySetInnerHTML={{ __html: t(isMobile ? 'steps.step3.mobile' : 'steps.step3.desktop') }} />
                  </div>
                </motion.div>
                  </div>

                  {/* Click to continue */}
                  <motion.p
                    className="text-center mt-6 text-white/60 text-sm font-light cursor-pointer hover:text-white/80 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={handleStartExploring}
                  >
                    {t('clickToContinue')}
                  </motion.p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationTutorial;