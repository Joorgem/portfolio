/**
 * Coordenadas 3D dos pontos de navegação interativos no modelo space_boi.glb
 * 
 * IMPORTANTE: As coordenadas aqui são as posições dentro do grupo interno do modelo
 * Elas precisam passar por todas as transformações aplicadas:
 * 1. scale={0.01} do grupo interno
 * 2. scale do componente Astronaut (0.25 mobile / 0.4 desktop)
 * 3. position do componente Astronaut
 */

// Types for navigation points
export interface NavigationPoint {
  id: string;
  name: string;
  section: string;
  position: [number, number, number];
  radius: number;
  color: string;
  description: string;
  meshName: string;
}

export interface CameraPosition {
  position: [number, number, number];
  fov: number;
}

export interface NavigationConfig {
  MODEL_SCALE: number;
  HOVER_GLOW_INTENSITY: number;
  HOVER_ANIMATION_DURATION: number;
  TRANSITION_DURATION: number;
  STATES: {
    MAIN_SCENE: string;
    HOVERING: string;
    TRANSITIONING: string;
    SECTION_VIEW: string;
  };
  CAMERA_POSITIONS: Record<string, CameraPosition>;
}

export const NAVIGATION_POINTS: Record<string, NavigationPoint> = {
  // Cabeça do astronauta - Seção About Me
  HEAD: {
    id: 'about',
    name: 'About Me',
    section: 'about',
    position: [0, 350, 0], // Centro aproximado da cabeça no espaço do modelo
    radius: 65, // Raio de detecção ajustado
    color: '#000000', // Cor de transição (preto)
    description: 'Conheça mais sobre mim',
    meshName: 'body' // Nome do objeto no modelo
  },

  // Planeta 1 - Seção Projects
  PLANET_1: {
    id: 'projects',
    name: 'Projects',
    section: 'projects', 
    position: [-357.404, 392.646, 0], // Posição no espaço do modelo (Y e Z trocados por rotação)
    radius: 45,
    color: '#FFFFFF', // Cor de transição (branco)
    description: 'Veja meus projetos',
    meshName: 'Sphere.002'
  },

  // Planeta 2 - Seção Experience
  PLANET_2: {
    id: 'experience',
    name: 'Experience',
    section: 'experience',
    position: [375.469, 427.948, 0], // Posição no espaço do modelo
    radius: 65,
    color: '#FFFFFF',
    description: 'Minha experiência profissional', 
    meshName: 'Sphere.001'
  },

  // Planeta 3 - Seção Contact
  PLANET_3: {
    id: 'contact',
    name: 'Contact',
    section: 'contact',
    position: [-341.988, 460.196, -117.028], // Posição no espaço do modelo
    radius: 65,
    color: '#FFFFFF',
    description: 'Entre em contato',
    meshName: 'Sphere.005'
  },

  // Planeta 4 - Seção Testimonials
  PLANET_4: {
    id: 'testimonials',
    name: 'Testimonials',
    section: 'testimonials',
    position: [199.634, 566.883, -221.001], // Posição no espaço do modelo
    radius: 45,
    color: '#000000',
    description: 'O que dizem sobre meu trabalho',
    meshName: 'Sphere.008'
  }
};

/**
 * Configurações globais para navegação 3D
 */
export const NAVIGATION_CONFIG: NavigationConfig = {
  // Escala aplicada no componente Astronaut
  MODEL_SCALE: 0.01,
  
  // Configurações de hover
  HOVER_GLOW_INTENSITY: 0.5,
  HOVER_ANIMATION_DURATION: 0.3,
  
  // Configurações de transição de câmera (SIMPLIFICADO)
  TRANSITION_DURATION: 1.0,
  
  // Estados da aplicação
  STATES: {
    MAIN_SCENE: 'main_scene',
    HOVERING: 'hovering', 
    TRANSITIONING: 'transitioning',
    SECTION_VIEW: 'section_view'
  },
  
  // Posições da câmera
  CAMERA_POSITIONS: {
    MAIN: { position: [0, 20, 100], fov: 75 },
    ABOUT: { position: [0, 0, 10], fov: 50 },
    PROJECTS: { position: [-20, 10, 30], fov: 45 },
    EXPERIENCE: { position: [20, 10, 30], fov: 45 },
    CONTACT: { position: [-15, 25, 35], fov: 45 },
    TESTIMONIALS: { position: [10, 35, 40], fov: 45 }
  }
};

/**
 * Converte coordenadas do modelo para coordenadas do mundo 3D
 * Aplica a escala do componente Astronaut
 */
export const convertToWorldCoordinates = (modelPosition: [number, number, number]): [number, number, number] => {
  return [
    modelPosition[0] * NAVIGATION_CONFIG.MODEL_SCALE,
    modelPosition[1] * NAVIGATION_CONFIG.MODEL_SCALE, 
    modelPosition[2] * NAVIGATION_CONFIG.MODEL_SCALE
  ];
};

/**
 * Retorna todos os pontos de navegação como array
 */
export const getAllNavigationPoints = (): NavigationPoint[] => {
  return Object.values(NAVIGATION_POINTS);
};

/**
 * Encontra ponto de navegação por ID
 */
export const getNavigationPointById = (id: string): NavigationPoint | undefined => {
  return Object.values(NAVIGATION_POINTS).find(point => point.id === id);
};

/**
 * Calcula a distância entre duas posições 3D
 */
export const calculateDistance = (pos1: [number, number, number], pos2: [number, number, number]): number => {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1]; 
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};