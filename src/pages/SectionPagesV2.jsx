import React, { Suspense, lazy } from 'react';
import PageContainerV2 from '../components/PageContainerV2';

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

/**
 * Páginas das seções com novo sistema de navegação
 */
const SectionPagesV2 = () => {
  return (
    <>
      {/* About Page */}
      <PageContainerV2 
        sectionId="about" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10">
            <About />
          </div>
        </Suspense>
      </PageContainerV2>
      
      {/* Projects Page */}
      <PageContainerV2 
        sectionId="projects" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10">
            <Projects />
          </div>
        </Suspense>
      </PageContainerV2>
      
      {/* Experience Page */}
      <PageContainerV2 
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
      </PageContainerV2>
      
      {/* Contact Page */}
      <PageContainerV2 
        sectionId="contact" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10">
            <Contact />
          </div>
        </Suspense>
      </PageContainerV2>
      
      {/* Testimonials Page */}
      <PageContainerV2 
        sectionId="testimonials" 
        backgroundColor="#0a0a0a"
      >
        <Suspense fallback={<PageLoader />}>
          <div className="min-h-screen pt-24 pb-10">
            <Testimonial />
          </div>
        </Suspense>
      </PageContainerV2>
    </>
  );
};

export default SectionPagesV2;