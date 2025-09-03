import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import enAbout from './locales/en/about.json';
import enContact from './locales/en/contact.json';
import enNavigation from './locales/en/navigation.json';
import enProjects from './locales/en/projects.json';
import enExperiences from './locales/en/experiences.json';
import enCourses from './locales/en/courses.json';
import enHero from './locales/en/hero.json';
import enTutorial from './locales/en/tutorial.json';

import ptCommon from './locales/pt/common.json';
import ptAbout from './locales/pt/about.json';
import ptContact from './locales/pt/contact.json';
import ptNavigation from './locales/pt/navigation.json';
import ptProjects from './locales/pt/projects.json';
import ptExperiences from './locales/pt/experiences.json';
import ptCourses from './locales/pt/courses.json';
import ptHero from './locales/pt/hero.json';
import ptTutorial from './locales/pt/tutorial.json';

const resources = {
  en: {
    common: enCommon,
    about: enAbout,
    contact: enContact,
    navigation: enNavigation,
    projects: enProjects,
    experiences: enExperiences,
    courses: enCourses,
    hero: enHero,
    tutorial: enTutorial,
  },
  pt: {
    common: ptCommon,
    about: ptAbout,
    contact: ptContact,
    navigation: ptNavigation,
    projects: ptProjects,
    experiences: ptExperiences,
    courses: ptCourses,
    hero: ptHero,
    tutorial: ptTutorial,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    
    ns: ['common', 'about', 'contact', 'navigation', 'projects', 'experiences', 'courses', 'hero', 'tutorial'],
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'portfolio_language',
      caches: ['localStorage'],
    },
    
    resources,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    react: {
      useSuspense: false, // Disable suspense for now
    },
    
    // Development settings
    debug: process.env.NODE_ENV === 'development',
    
    // Fallback settings
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${ns}:${key} for language: ${lng}`);
      }
    },
  });

export default i18n;