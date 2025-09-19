import React from "react";
import { FlipWords } from "./FlipWords";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationStore } from "../stores/navigation.store";
import { useTranslation } from "react-i18next";

const HeroTextFixed: React.FC = () => {
  const { t } = useTranslation('hero');
  const words = t('words', { returnObjects: true }) as string[];
  const navigationState = useNavigationStore(state => state.navigationState);
  const fadeProgress = useNavigationStore(state => state.fadeProgress);
  
  // Esconde texto quando navegando ou em seção
  const shouldShow = navigationState === 'idle' || navigationState === 'orbiting';
  const opacity = shouldShow ? Math.max(0, 1 - fadeProgress) : 0;
  
  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  };
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="absolute top-12 left-0 z-10 pt-0 pl-8 pr-8 pb-8 md:pt-0 md:pl-12 md:pr-12 md:pb-12 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Desktop View - Responsive breakpoints */}
          <div className="hidden md:block">
            <motion.h1
              className="text-xl md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-medium text-white mb-3"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.5 }}
            >
              {t('greeting')}
            </motion.h1>
            <div className="space-y-1">
              <motion.p
                className="text-2xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-medium text-neutral-300"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.7 }}
              >
                <span dangerouslySetInnerHTML={{ __html: t('tagline.desktop') }} />
              </motion.p>
              <motion.div
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 1 }}
              >
                <FlipWords
                  words={words}
                  className="font-black text-white text-3xl md:text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl"
                />
              </motion.div>
              <motion.p
                className="text-xl md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-medium text-neutral-300"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 1.3 }}
              >
                {t('solutions.desktop')}
              </motion.p>
            </div>
          </div>
          
          {/* Mobile View - Tamanhos menores */}
          <div className="block md:hidden">
            <motion.p
              className="text-lg sm:text-xl font-medium text-white mb-4"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.5 }}
            >
              {t('greetingMobile')}
            </motion.p>
            <div className="space-y-2">
              <motion.p
                className="text-2xl sm:text-3xl font-black text-neutral-300"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.7 }}
              >
                {t('tagline.mobile')}
              </motion.p>
              <motion.div
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 1 }}
              >
                <FlipWords
                  words={words}
                  className="font-bold text-white text-3xl sm:text-4xl"
                />
              </motion.div>
              <motion.p
                className="text-lg sm:text-xl font-black text-neutral-300"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 1.3 }}
              >
                {t('solutions.mobile')}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeroTextFixed;