import React, { Suspense, lazy } from 'react';
import PageContainer, { PageLoader } from '../components/PageContainer';

// Lazy load das seções
const About = lazy(() => import('../sections/About'));
const Projects = lazy(() => import('../sections/Projects'));
const Experiences = lazy(() => import('../sections/Experiences'));
const Contact = lazy(() => import('../sections/Contact'));
const Testimonial = lazy(() => import('../sections/Testimonial'));

// Configurações de cada seção
const SECTION_CONFIG = {
  about: {
    component: About,
    backgroundColor: '#0a0a0a', // Preto suave
    title: 'About Me'
  },
  projects: {
    component: Projects,
    backgroundColor: '#0a0a0a', // Preto suave
    title: 'My Projects'
  },
  experience: {
    component: Experiences,
    backgroundColor: '#0a0a0a', // Preto suave
    title: 'Experience'
  },
  contact: {
    component: Contact,
    backgroundColor: '#0a0a0a', // Preto suave
    title: 'Contact'
  },
  testimonials: {
    component: Testimonial,
    backgroundColor: '#0a0a0a', // Preto suave
    title: 'Testimonials'
  }
};

/**
 * Página About com container
 */
export const AboutPage = () => (
  <PageContainer 
    sectionId="about" 
    backgroundColor={SECTION_CONFIG.about.backgroundColor}
  >
    <Suspense fallback={<PageLoader />}>
      <div className="min-h-screen pt-20 pb-10">
        <About />
      </div>
    </Suspense>
  </PageContainer>
);

/**
 * Página Projects com container
 */
export const ProjectsPage = () => (
  <PageContainer 
    sectionId="projects" 
    backgroundColor={SECTION_CONFIG.projects.backgroundColor}
  >
    <Suspense fallback={<PageLoader />}>
      <div className="min-h-screen pt-20 pb-10">
        <Projects />
      </div>
    </Suspense>
  </PageContainer>
);

/**
 * Página Experience com container
 */
export const ExperiencePage = () => (
  <PageContainer 
    sectionId="experience" 
    backgroundColor={SECTION_CONFIG.experience.backgroundColor}
  >
    <Suspense fallback={<PageLoader />}>
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <div className="w-full max-w-6xl px-4">
          <h2 className="text-heading text-white mb-12 text-center">My Experience</h2>
          <Experiences />
        </div>
      </div>
    </Suspense>
  </PageContainer>
);

/**
 * Página Contact com container
 */
export const ContactPage = () => (
  <PageContainer 
    sectionId="contact" 
    backgroundColor={SECTION_CONFIG.contact.backgroundColor}
  >
    <Suspense fallback={<PageLoader />}>
      <div className="min-h-screen pt-20 pb-10">
        <Contact />
      </div>
    </Suspense>
  </PageContainer>
);

/**
 * Página Testimonials com container
 */
export const TestimonialsPage = () => (
  <PageContainer 
    sectionId="testimonials" 
    backgroundColor={SECTION_CONFIG.testimonials.backgroundColor}
  >
    <Suspense fallback={<PageLoader />}>
      <div className="min-h-screen pt-20 pb-10">
        <Testimonial />
      </div>
    </Suspense>
  </PageContainer>
);

/**
 * Componente que renderiza todas as páginas
 * Cada uma só aparece quando sua seção está ativa
 */
const SectionPages = () => {
  return (
    <>
      <AboutPage />
      <ProjectsPage />
      <ExperiencePage />
      <ContactPage />
      <TestimonialsPage />
    </>
  );
};

export default SectionPages;