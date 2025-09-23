/**
 * One Page Portfolio - Section Heights Configuration
 *
 * Define alturas conhecidas para cada seção para eliminar layout shift
 * e manter scrollbar com altura fixa desde o carregamento inicial.
 */

export const SECTION_HEIGHTS = {
  // About: Hero + Tech Stack Carousel + Bio
  about: '100vh',

  // Projects: Hero + Project Grid (variável, mas estimativa segura)
  projects: '120vh',

  // Experience: Timeline vertical (pode ser longa)
  experience: '130vh',

  // Courses: Grid de certificações
  courses: '110vh',

  // Contact: Form + DomeGallery (mais pesado)
  contact: '220vh',
} as const;

export type SectionId = keyof typeof SECTION_HEIGHTS;

/**
 * Skeleton heights para loading states
 * Mantém mesmo height das seções finais
 */
export const SKELETON_HEIGHTS = {
  ...SECTION_HEIGHTS
} as const;

/**
 * Mobile adjustments (se necessário)
 */
export const MOBILE_SECTION_HEIGHTS = {
  about: '110vh',
  projects: '140vh',
  experience: '150vh',
  courses: '130vh',
  contact: '240vh', // DomeGallery precisa de mais espaço no mobile
} as const;

/**
 * Utility function para obter height baseado no device
 */
export const getSectionHeight = (sectionId: SectionId, isMobile: boolean = false): string => {
  return isMobile ? MOBILE_SECTION_HEIGHTS[sectionId] : SECTION_HEIGHTS[sectionId];
};