/**
 * Navigation System Configuration Constants
 * 
 * @description Centralized configuration for the 3D navigation system
 * Separates configuration values from store logic for better maintainability
 */

/**
 * Mobile device detection utility
 * Used to adapt navigation behavior for touch devices
 */
export const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
};

/**
 * Navigation configuration interface
 * Defines all configurable parameters for the navigation system
 */
export interface NavigationConfig {
  zoomInSensitivity: number;
  zoomOutSensitivity: number;
  zoomSpeed: number;
  fadeSpeed: number;
  zoomStartFade: number;
  zoomComplete: number;
  fadePauseCanvas: number;
  zoomAutoComplete: number;
  zoomOutCompleteThreshold: number;
  exitScrollThreshold: number;
  scrollThrottle: number;
  maxScrollDelta: number;
}

/**
 * Default navigation configuration
 * Optimized for both mobile and desktop experiences
 * 
 * @description Configuration values are dynamically adjusted based on device type.
 * Mobile devices get higher sensitivity for touch interactions,
 * while desktop maintains precision for mouse wheel control.
 */
export const NAVIGATION_CONFIG: NavigationConfig = {
  // Scroll sensitivities (mobile gets higher values for touch responsiveness)
  zoomInSensitivity: isMobileDevice() ? 0.0015 : 0.0008,
  zoomOutSensitivity: isMobileDevice() ? 0.0018 : 0.0010,
  
  // Animation speeds (consistent across devices)
  zoomSpeed: 0.012,                    // Auto zoom animation speed
  fadeSpeed: 0.015,                    // Fade transition speed
  
  // Transition thresholds (progress values 0-1)
  zoomStartFade: 0.88,                 // When to start fade effect during zoom
  zoomComplete: 0.98,                  // When zoom is considered complete
  fadePauseCanvas: 0.95,               // When to pause 3D canvas during fade
  zoomAutoComplete: 0.65,              // Auto-complete threshold for zoom
  
  // Exit and zoom out behavior - CONTINUITY FIX: Ajustado para simetria
  zoomOutCompleteThreshold: 0.02,      // Zoom out até quase 0 para simetria com entrada
  exitScrollThreshold: -150,           // Minimum scroll value to trigger exit
  
  // Performance and responsiveness
  scrollThrottle: isMobileDevice() ? 5 : 12,  // Scroll event throttling (ms)
  maxScrollDelta: 120,                 // Maximum scroll delta to prevent jumps
} as const;

/**
 * Animation frame management constants
 */
export const ANIMATION_CONSTANTS = {
  ZOOM_DIRECTION: {
    OUT: -1,
    STOPPED: 0,
    IN: 1,
  },
  
  INITIAL_VALUES: {
    ZOOM_PROGRESS: 0,
    FADE_PROGRESS: 0,
    ZOOM_OUT_PROGRESS: 0,
  },
} as const;

/**
 * Navigation state constants
 * Defines the 7-state navigation system
 */
export const NavigationStates = {
  IDLE: 'idle',
  ORBITING: 'orbiting',
  ZOOMING_IN: 'zooming_in',
  ENTERING: 'entering',
  IN_SECTION: 'in_section',
  EXITING: 'exiting',
  ZOOMING_OUT: 'zooming_out',
} as const;

export type NavigationState = typeof NavigationStates[keyof typeof NavigationStates];

/**
 * Local storage keys for persistence
 */
export const STORAGE_KEYS = {
  TUTORIAL_COMPLETED: 'portfolio_tutorial_completed',
  VISITED_SECTIONS: 'portfolio_visited_sections',
} as const;