/**
 * 3D coordinates of interactive navigation points in the space_boi.glb model
 * 
 * IMPORTANT: The coordinates here are the positions within the model's internal group
 * They need to go through all applied transformations:
 * 1. scale={0.01} of the internal group
 * 2. scale of the Astronaut component (0.25 mobile / 0.4 desktop)
 * 3. position of the Astronaut component
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
  // Astronaut's head - About Me Section
  HEAD: {
    id: 'about',
    name: 'About Me',
    section: 'about',
    position: [0, 350, 0], // Centro aproximado da cabeça no espaço do modelo
    radius: 65, // Raio de detecção ajustado
    color: '#000000', // Cor de transição (preto)
    description: 'Learn more about me',
    meshName: 'body' // Nome do objeto no modelo
  },

  // Planet 1 - Projects Section
  PLANET_1: {
    id: 'projects',
    name: 'Projects',
    section: 'projects', 
    position: [-357.404, 392.646, 0], // Posição no espaço do modelo (Y e Z trocados por rotação)
    radius: 45,
    color: '#FFFFFF', // Cor de transição (branco)
    description: 'View my projects',
    meshName: 'Sphere.002'
  },

  // Planet 2 - Experience Section
  PLANET_2: {
    id: 'experience',
    name: 'Experience',
    section: 'experience',
    position: [375.469, 427.948, 0], // Posição no espaço do modelo
    radius: 65,
    color: '#FFFFFF',
    description: 'My professional experience', 
    meshName: 'Sphere.001'
  },

  // Planet 3 - Contact Section
  PLANET_3: {
    id: 'contact',
    name: 'Contact',
    section: 'contact',
    position: [-341.988, 460.196, -117.028], // Posição no espaço do modelo
    radius: 65,
    color: '#FFFFFF',
    description: 'Get in touch',
    meshName: 'Sphere.005'
  },

  // Planet 4 - Courses Section
  PLANET_4: {
    id: 'courses',
    name: 'Courses',
    section: 'courses',
    position: [199.634, 566.883, -221.001], // Posição no espaço do modelo
    radius: 45,
    color: '#000000',
    description: 'Courses, certifications and extracurricular experiences',
    meshName: 'Sphere.008'
  }
};

/**
 * Global configurations for 3D navigation
 */
export const NAVIGATION_CONFIG: NavigationConfig = {
  // Scale applied in the Astronaut component
  MODEL_SCALE: 0.01,
  
  // Hover configurations
  HOVER_GLOW_INTENSITY: 0.5,
  HOVER_ANIMATION_DURATION: 0.3,
  
  // Camera transition configurations (SIMPLIFIED)
  TRANSITION_DURATION: 1.0,
  
  // Application states
  STATES: {
    MAIN_SCENE: 'main_scene',
    HOVERING: 'hovering', 
    TRANSITIONING: 'transitioning',
    SECTION_VIEW: 'section_view'
  },
  
  // Camera positions
  CAMERA_POSITIONS: {
    MAIN: { position: [0, 20, 100], fov: 75 },
    ABOUT: { position: [0, 0, 10], fov: 50 },
    PROJECTS: { position: [-20, 10, 30], fov: 45 },
    EXPERIENCE: { position: [20, 10, 30], fov: 45 },
    CONTACT: { position: [-15, 25, 35], fov: 45 },
    COURSES: { position: [10, 35, 40], fov: 45 }
  }
};

/**
 * Converts model coordinates to 3D world coordinates
 * Applies the Astronaut component scale
 */
export const convertToWorldCoordinates = (modelPosition: [number, number, number]): [number, number, number] => {
  return [
    modelPosition[0] * NAVIGATION_CONFIG.MODEL_SCALE,
    modelPosition[1] * NAVIGATION_CONFIG.MODEL_SCALE, 
    modelPosition[2] * NAVIGATION_CONFIG.MODEL_SCALE
  ];
};

/**
 * Returns all navigation points as an array
 */
export const getAllNavigationPoints = (): NavigationPoint[] => {
  return Object.values(NAVIGATION_POINTS);
};

/**
 * Finds navigation point by ID
 */
export const getNavigationPointById = (id: string): NavigationPoint | undefined => {
  return Object.values(NAVIGATION_POINTS).find(point => point.id === id);
};

/**
 * Calculates the distance between two 3D positions
 */
export const calculateDistance = (pos1: [number, number, number], pos2: [number, number, number]): number => {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1]; 
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};