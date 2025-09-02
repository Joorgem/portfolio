import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Type definitions
export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

// Create context
const LanguageContext = createContext<LanguageContextType | null>(null);

// Storage key
const LANGUAGE_STORAGE_KEY = 'portfolio_language';

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage, fallback to browser language, then to 'pt'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (stored === 'pt' || stored === 'en') {
        return stored;
      }
      
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('pt')) {
        return 'pt';
      } else if (browserLang.startsWith('en')) {
        return 'en';
      }
    }
    
    return 'en'; // Default to English
  });

  // Update localStorage when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error(
      'useLanguage must be used within a LanguageProvider. Make sure to wrap your app with <LanguageProvider>.'
    );
  }
  
  return context;
};