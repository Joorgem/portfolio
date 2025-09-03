import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC = () => {
  const { i18n, t } = useTranslation('common');

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
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
      className="h-12 flex items-center justify-center px-4
                 bg-black/20 backdrop-blur-md rounded-full 
                 border border-white/10
                 transition-all duration-300
                 hover:bg-black/40 hover:border-white/20
                 group"
      aria-label={t('languageToggle.ariaLabel')}
    >
      {/* Language Text with Smooth Transition */}
      <motion.div 
        className="flex items-center text-sm font-medium text-white/90"
        key={i18n.language} // Force re-render on language change
        initial={{ opacity: 0, x: 5 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -5 }}
        transition={{ duration: 0.2 }}
      >
        <span className={`transition-all duration-300 ${
          i18n.language === 'pt' 
            ? 'text-white font-semibold' 
            : 'text-white/50 hover:text-white/70'
        }`}>
          PT
        </span>
        
        <span className="mx-2 text-white/40">|</span>
        
        <span className={`transition-all duration-300 ${
          i18n.language === 'en' 
            ? 'text-white font-semibold' 
            : 'text-white/50 hover:text-white/70'
        }`}>
          EN
        </span>
      </motion.div>
    </motion.button>
  );
};