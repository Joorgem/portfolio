import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';

import About from '../sections/About';
import Projects from '../sections/Projects';
import Experiences from '../sections/Experiences';
import Contact from '../sections/Contact';
import Courses from '../sections/Courses';

import Particles from '../components/Particles';
import { LanguageToggle } from '../components/LanguageToggle';
import { useNavigationStore } from '../stores/navigation.store';
import { getSectionHeight, type SectionId } from '../constants/sectionHeights';
import DomeGallerySkeleton from './DomeGallerySkeleton';

declare global {
  interface Window {
    navigationUpdateTimeout?: NodeJS.Timeout;
  }
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
  background?: string;
}

const SectionLoader: React.FC<{ sectionId: string; isMobile: boolean }> = ({ sectionId, isMobile }) => {
  const height = getSectionHeight(sectionId as SectionId, isMobile);

  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-white/40 text-sm font-light tracking-wide animate-pulse">
        Loading section...
      </div>
    </div>
  );
};

const OnePagePortfolio: React.FC = () => {
  const { t } = useTranslation('common');
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const showPortfolioModeSelector = useNavigationStore(state => state.showPortfolioModeSelector);
  const setHoveredNavigationDot = useNavigationStore(state => state.setHoveredNavigationDot);
  const currentSection = useNavigationStore(state => state.currentSection);
  const setCurrentSection = useNavigationStore(state => state.setCurrentSection);

  const activeSection = currentSection === 'MAIN' ? 'about' : currentSection.toLowerCase();

  const [visibleSections, setVisibleSections] = useState<Set<string>>(() => {
    return new Set(['about', 'projects', 'experience', 'courses', 'contact']);
  });

  const [showHeaderName, setShowHeaderName] = useState<boolean>(false);

  const sections: Section[] = React.useMemo(() => [
    {
      id: 'about',
      title: t('navigation.about', 'About'),
      component: About,
    },
    {
      id: 'projects',
      title: t('navigation.projects', 'Projects'),
      component: Projects,
    },
    {
      id: 'experience',
      title: t('navigation.experience', 'Experience'),
      component: Experiences,
    },
    {
      id: 'courses',
      title: t('navigation.courses', 'Courses'),
      component: Courses,
    },
    {
      id: 'contact',
      title: t('navigation.contact', 'Contact'),
      component: Contact,
    },
  ], [t]);

  useEffect(() => {
    const detectInitialSection = () => {
      const scrollPosition = window.scrollY + 64;
      let detectedSection = 'MAIN';

      sections.forEach(section => {
        const element = document.getElementById(`section-${section.id}`);
        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;

          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            detectedSection = section.id === 'about' ? 'MAIN' : section.id.toUpperCase();
          }
        }
      });

      setCurrentSection(detectedSection);
    };

    const timer = setTimeout(detectInitialSection, 100);
    return () => clearTimeout(timer);
  }, [sections, setCurrentSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement;

    if (element && scrollContainer) {
      const elementPosition = element.offsetTop - 64;

      scrollContainer.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });

    }
  };

  useEffect(() => {
    const mainNameElement = document.getElementById('main-name');
    if (!mainNameElement) return;

    const nameObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setShowHeaderName(!entry.isIntersecting);
      },
      {
        threshold: 0.1
      }
    );

    nameObserver.observe(mainNameElement);

    return () => {
      nameObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const initializeObserver = () => {
      const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement;

      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const sectionId = entry.target.id.replace('section-', '');
            if (entry.isIntersecting) {
              setVisibleSections(prev => {
                const newVisible = new Set([...prev, sectionId]);

                const sectionIndex = sections.findIndex(s => s.id === sectionId);
                if (sectionIndex >= 0) {
                  if (sectionIndex > 0) {
                    newVisible.add(sections[sectionIndex - 1].id);
                  }
                  if (sectionIndex < sections.length - 1) {
                    newVisible.add(sections[sectionIndex + 1].id);
                  }
                }

                return newVisible;
              });
            }
          });

          let bestSection = '';
          let bestVisibility = 0;

          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const rect = entry.boundingClientRect;
              const viewport = entry.rootBounds || { height: scrollContainer?.clientHeight || window.innerHeight };

              const headerHeight = 64;
              const availableViewport = viewport.height - headerHeight;
              const visibleHeight = Math.min(rect.bottom, viewport.height) - Math.max(rect.top, headerHeight);
              const visibilityPercentage = Math.max(0, visibleHeight / availableViewport);

              if (visibilityPercentage > bestVisibility) {
                bestVisibility = visibilityPercentage;
                bestSection = entry.target.id.replace('section-', '');
              }
            }
          });

          if (bestSection && bestVisibility > 0.2) {
            const storeSectionId = bestSection === 'about' ? 'MAIN' : bestSection.toUpperCase();

            clearTimeout(window.navigationUpdateTimeout);
            window.navigationUpdateTimeout = setTimeout(() => {
              setCurrentSection(storeSectionId);
            }, 100);
          }
        },
        {
          root: scrollContainer || null,
          rootMargin: '0px 0px -20% 0px',
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        }
      );

      const timer = setTimeout(() => {
        sections.forEach(section => {
          const element = document.getElementById(`section-${section.id}`);
          if (element) {
            sectionObserver.observe(element);
          }
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearTimeout(window.navigationUpdateTimeout);
        sectionObserver.disconnect();
      };
    };

    const initTimer = setTimeout(initializeObserver, 50);

    return () => {
      clearTimeout(initTimer);
    };
  }, [sections, setCurrentSection]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          className="w-full h-full"
          particleColors={['#ffffff', '#f8fafc', '#e2e8f0']}
          particleCount={isMobile ? 300 : 600}
          particleSpread={15}
          speed={0.05}
          particleBaseSize={80}
          sizeRandomness={1.0}
          cameraDistance={18}
          moveParticlesOnHover={true}
          particleHoverFactor={0.3}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="relative h-screen bg-transparent text-white overflow-x-hidden overflow-y-auto" data-scroll-container>

      <motion.header
        className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
              animate={{
                opacity: showHeaderName ? 1 : 0,
                y: showHeaderName ? 0 : -10
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              <h1 className="text-xl font-light tracking-wide text-white">
                Jorge Molina
              </h1>
            </motion.div>

            {!isMobile && (
              <nav className="hidden md:flex space-x-8">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`px-3 py-2 text-sm font-light tracking-wide transition-all duration-300 ${
                      activeSection === section.id
                        ? 'text-white border-b border-white/50'
                        : 'text-white/60 hover:text-white'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {section.title}
                  </motion.button>
                ))}
              </nav>
            )}

            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <motion.button
                onClick={showPortfolioModeSelector}
                className="p-2 text-white/60 hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={t('switchTo3D', 'Switch to 3D Experience')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {isMobile && (
        <motion.nav
          className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-around py-3">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex flex-col items-center space-y-1 px-2 py-1 transition-all duration-300 ${
                  activeSection === section.id
                    ? 'text-white'
                    : 'text-white/60'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === section.id ? 'bg-white' : 'bg-white/30'
                }`} />
                <span className="text-xs font-light">{section.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.nav>
      )}

      <motion.main
        className="relative z-10 pt-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sections.map((section, index) => {
          const SectionComponent = section.component;

          return (
            <motion.section
              key={section.id}
              id={`section-${section.id}`}
              className="relative"
              style={{ minHeight: getSectionHeight(section.id as SectionId, isMobile) }}
              variants={sectionVariants}
            >
              <div className={`${isMobile ? 'pb-20' : 'pb-10'}`}>
                {visibleSections.has(section.id) ? (
                  <SectionComponent />
                ) : (
                  section.id === 'contact' ? (
                    <div className="relative bg-transparent w-full" style={{ height: getSectionHeight('contact', isMobile) }}>
                      <div className="relative z-10 flex flex-col justify-center items-center py-20 px-4" style={{ minHeight: getSectionHeight('contact', isMobile) }}>
                        <DomeGallerySkeleton />
                      </div>
                    </div>
                  ) : (
                    <SectionLoader sectionId={section.id} isMobile={isMobile} />
                  )
                )}
              </div>

              {index < sections.length - 1 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-20 bg-gradient-to-b from-white/20 to-transparent" />
              )}
            </motion.section>
          );
        })}
      </motion.main>

      {!isMobile && (
        <motion.div
          className="fixed right-8 top-1/2 transform -translate-y-1/2 z-30"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex flex-col space-y-3">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                onMouseEnter={() => {
                  setHoveredNavigationDot(section.id);
                }}
                onMouseLeave={() => {
                  setHoveredNavigationDot(null);
                }}
                className={`w-3 h-3 rounded-full border border-white/30 transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-white'
                    : 'bg-transparent hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                title={section.title}
              />
            ))}
          </div>
        </motion.div>
      )}

        <div className="fixed top-16 left-0 right-0 h-8 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-20" />
      </div>
    </>
  );
};

export default OnePagePortfolio;