import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '../stores/navigation.store';
import { PortfolioModes } from '../constants/navigationConfig';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import Particles from './Particles';
import { preloadHeroZustand } from '../utils/preloadHeroZustand';

const PortfolioModeSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const showModeSelector = useNavigationStore(state => state.showModeSelector);
  const modeStatus = useNavigationStore(state => state.modeStatus);
  const setPortfolioMode = useNavigationStore(state => state.setPortfolioMode);
  const hidePortfolioModeSelector = useNavigationStore(state => state.hidePortfolioModeSelector);
  const isMobile = useMediaQuery({ maxWidth: 853 });

  const handleModeSelect = useCallback((mode: typeof PortfolioModes[keyof typeof PortfolioModes]) => {
    if (mode === PortfolioModes.THREE_D) {
      preloadHeroZustand();
    }

    setPortfolioMode(mode);
    hidePortfolioModeSelector();
  }, [setPortfolioMode, hidePortfolioModeSelector]);

  const isTransitioning = modeStatus === 'loading-3d';

  // OPTIMIZED: Stable language toggle with useCallback
  const toggleLanguage = useCallback(() => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  }, [i18n]);


  return (
    <AnimatePresence>
      {(showModeSelector || isTransitioning) && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black cursor-default"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 z-[-1] pointer-events-none">
            <Particles
              className="w-full h-full"
              particleColors={['#ffffff', '#f8fafc', '#e2e8f0']}
              particleCount={isMobile ? 150 : 300} // Reduced count for this screen
              particleSpread={15}
              speed={0.05}
              particleBaseSize={80}
              sizeRandomness={1.0}
              cameraDistance={18}
              moveParticlesOnHover={true}
              particleHoverFactor={0.1}
              alphaParticles={false}
              disableRotation={false}
            />
          </div>

          {/* Language Toggle */}
          <motion.div
            className="absolute top-6 right-6 z-[62]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button
              onClick={toggleLanguage}
              className="h-12 flex items-center justify-center px-4
                         bg-black/20 backdrop-blur-md rounded-full border border-white/10
                         transition-all duration-300 hover:border-white/30"
              aria-label={t('languageToggle.ariaLabel')}
            >
              <div className="flex items-center text-sm font-medium text-white/80">
                <span className={i18n.language === 'pt' ? 'text-white font-bold' : 'text-white/60'}>PT</span>
                <span className="mx-2 text-white/40">|</span>
                <span className={i18n.language === 'en' ? 'text-white font-bold' : 'text-white/60'}>EN</span>
              </div>
            </button>
          </motion.div>


          {/* Show simplified loading view when transitioning */}
          {isTransitioning && !showModeSelector ? (
            <motion.div
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
              {/* 3D Mode */}
              <motion.div
              className="relative w-[280px] h-[140px] md:w-[320px] md:h-[160px] overflow-hidden group cursor-pointer flex items-center justify-center bg-black/30 rounded-xl transition-all duration-300"
              // DEBUGGING: Removed hover:bg-black/20 to test CSS hover interference
              onClick={() => handleModeSelect(PortfolioModes.THREE_D)}
              // OPTIMIZED: Using stable callback
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              // whileHover={{ scale: 1.05 }} // DEBUGGING: Removed to test if this causes re-render
            >
              {/* Loading overlay when transitioning */}
              {isTransitioning && (
                <motion.div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </motion.div>
              )}

              <h2
                className="text-white text-5xl text-center"
                style={{ fontFamily: 'Funnel Display', fontWeight: 800 }}
              >
                {t('modeSelector:3d.title')}
              </h2>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {t('modeSelector:3d.description')}
              </p>
            </motion.div>

            {/* One Page Mode */}
            <motion.div
              className="relative w-[280px] h-[140px] md:w-[320px] md:h-[160px] overflow-hidden group cursor-pointer flex items-center justify-center bg-black/30 hover:bg-black/20 rounded-xl transition-all duration-300"
              onClick={() => handleModeSelect(PortfolioModes.ONE_PAGE)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
            >
              <h2
                className="text-white text-5xl text-center"
                style={{ fontFamily: 'Funnel Display', fontWeight: 800 }}
              >
                {t('modeSelector:onepage.title')}
              </h2>
            </motion.div>
            </div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortfolioModeSelector;






