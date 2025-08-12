import React, { Suspense, lazy } from 'react';
import { useNavigationStore } from '../stores/navigation.store';

// Lazy load das seções existentes
const About = lazy(() => import('../sections/About'));
const Projects = lazy(() => import('../sections/Projects'));
const Experiences = lazy(() => import('../sections/Experiences'));
const Contact = lazy(() => import('../sections/Contact'));
const Testimonial = lazy(() => import('../sections/Testimonial'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white 
                      rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// Componente simples de container de página
const PageContainer = ({ sectionId, backgroundColor = "#0a0a0a", children }) => {
  const currentSection = useNavigationStore(state => state.currentSection);
  const navigationState = useNavigationStore(state => state.navigationState);
  
  const isVisible = navigationState === 'in_section' && currentSection === sectionId.toUpperCase();
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed inset-0 z-20 overflow-y-auto"
      style={{ backgroundColor }}
    >
      {children}
    </div>
  );
};

/**
 * Páginas das seções com Zustand
 */
const SectionPagesZustand = () => {
  return (
    <>
      {/* About Page */}
      <PageContainer 
        sectionId="about" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10">
            <About />
          </div>
        </Suspense>
      </PageContainer>
      
      {/* Projects Page */}
      <PageContainer 
        sectionId="projects" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10">
            <Projects />
          </div>
        </Suspense>
      </PageContainer>
      
      {/* Experience Page */}
      <PageContainer 
        sectionId="experience" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10 flex items-center justify-center">
            <div className="w-full max-w-6xl px-4">
              <h2 className="text-heading text-white mb-12 text-center">
                My Experience
              </h2>
              <Experiences />
            </div>
          </div>
        </Suspense>
      </PageContainer>
      
      {/* Contact Page */}
      <PageContainer 
        sectionId="contact" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10">
            <Contact />
          </div>
        </Suspense>
      </PageContainer>
      
      {/* Testimonials Page */}
      <PageContainer 
        sectionId="testimonials" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10">
            <Testimonial />
          </div>
        </Suspense>
      </PageContainer>
    </>
  );
};

export default SectionPagesZustand;