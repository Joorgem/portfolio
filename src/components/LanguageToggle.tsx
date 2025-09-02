import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../locales/translations';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const translations = useTranslations(language);

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        duration: 0.4,
        delay: 0.4, // Slightly after the back button
        ease: [0.4, 0, 0.2, 1]
      }}
      onClick={toggleLanguage}
      className="fixed top-6 right-6 z-50 h-12 flex items-center justify-center px-4
                 bg-black/20 backdrop-blur-md rounded-full 
                 border border-white/10
                 transition-all duration-300
                 hover:bg-black/40 hover:border-white/20
                 group"
      aria-label={translations.common.languageToggle.ariaLabel}
    >
      {/* Language Text with Smooth Transition */}
      <motion.div 
        className="flex items-center text-sm font-medium text-white/90"
        key={language} // Force re-render on language change
        initial={{ opacity: 0, x: 5 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -5 }}
        transition={{ duration: 0.2 }}
      >
        <span className={`transition-all duration-300 ${
          language === 'pt' 
            ? 'text-white font-semibold' 
            : 'text-white/50 hover:text-white/70'
        }`}>
          PT
        </span>
        
        <span className="mx-2 text-white/40">|</span>
        
        <span className={`transition-all duration-300 ${
          language === 'en' 
            ? 'text-white font-semibold' 
            : 'text-white/50 hover:text-white/70'
        }`}>
          EN
        </span>
      </motion.div>
    </motion.button>
  );
};