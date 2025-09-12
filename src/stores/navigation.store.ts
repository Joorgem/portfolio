// src/stores/navigation.store.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  NAVIGATION_CONFIG, 
  ANIMATION_CONSTANTS, 
  NavigationStates,
  type NavigationState
} from '../constants/navigationConfig';


// Animation internal state interface
interface AnimationState {
  frame: number | null;
  zoomDirection: number;
  fadeFrame: number | null;
  lastScrollTime: number;
}

// Main store state interface
interface NavigationStoreState {
  navigationState: NavigationState;
  currentSection: string;
  targetSection: string | null;
  zoomProgress: number;
  fadeProgress: number;
  pageVisible: boolean;
  canvas3DActive: boolean;
  _animation: AnimationState;
  zoomOutProgress: number;
  hoveredPlanet: string | null;
  // Tutorial states
  showTutorial: boolean;
  tutorialCompleted: boolean;
  // Progress tracking
  visitedSections: string[];
  // Scroll lock for modals/overlays
  scrollLocked: boolean;
  // CONTINUITY FIX: Preserva estado final para transição suave de saída
  finalZoomProgress: number;        // Zoom progress quando entrou na seção (98%)
  finalOrbitAngle: number;          // Ângulo orbital quando entrou na seção
  finalCameraRadius: number;        // Raio da câmera quando entrou na seção
  finalCameraHeight: number;        // Altura da câmera quando entrou na seção
}

// Store actions interface
interface NavigationStoreActions {
  isNavigating: () => boolean;
  isInSection: () => boolean;
  canInteract: () => boolean;
  startNavigation: (_sectionId: string) => string | void;
  handleScroll: (_deltaY: number, _isInsideContent?: boolean) => void;
  startZoomIn: () => void;
  initiateExit: () => void;
  goToInitialState: () => void;
  startAnimationLoop: () => void;
  startFadeInAnimation: () => void;
  startFadeOutAnimation: () => void;
  enterSection: () => void;
  completeExit: () => void;
  cleanup: () => void;
  setHoveredPlanet: (_planet: string | null) => void;
  // Tutorial actions
  initializeTutorial: () => void;
  closeTutorial: () => void;
  completeTutorial: () => void;
  // Progress tracking actions
  markSectionAsVisited: (_sectionId: string) => void;
  loadVisitedSections: () => void;
  saveVisitedSections: () => void;
  // Scroll lock actions
  lockScroll: () => void;
  unlockScroll: () => void;
  // CONTINUITY FIX: Preserva estado final
  saveFinalCameraState: (_zoomProgress: number, _orbitAngle: number, _radius: number, _height: number) => void;
}

// Complete store type
export type NavigationStore = NavigationStoreState & NavigationStoreActions;

// Using centralized navigation configuration
const CONFIG = NAVIGATION_CONFIG;

export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set, get) => ({
    // ===================================
    // ESTADO (STATE)
    // ===================================
    navigationState: NavigationStates.IDLE,
    currentSection: 'MAIN',     // Seção atual (UI/páginas)
    targetSection: null,         // Alvo da navegação (planeta selecionado)
    zoomProgress: 0,            // Progresso do zoom (0 a 1)
    fadeProgress: 0,            // Progresso do fade (0 a 1)
    pageVisible: false,         // Visibilidade da página da seção
    canvas3DActive: true,       // Estado do loop de renderização
    
    // Valores de animação (não causam re-render)
    _animation: {
      frame: null,
      zoomDirection: ANIMATION_CONSTANTS.ZOOM_DIRECTION.STOPPED,
      fadeFrame: null,
      lastScrollTime: 0,
    },
    
    // Zoom out visual (0 a 1, onde 1 = zoom out máximo)
    zoomOutProgress: ANIMATION_CONSTANTS.INITIAL_VALUES.ZOOM_OUT_PROGRESS,
    
    // Hover do planeta
    hoveredPlanet: null,
    
    // Tutorial states
    showTutorial: false,
    tutorialCompleted: false,
    
    // Progress tracking
    visitedSections: [],
    
    // Scroll lock state
    scrollLocked: false,
    
    // CONTINUITY FIX: Estado preservado para transições suaves
    finalZoomProgress: 0,
    finalOrbitAngle: 0,
    finalCameraRadius: 4.2,
    finalCameraHeight: 1.8,
    
    // ===================================
    // GETTERS (HELPERS)
    // ===================================
    isNavigating: () => {
      const state = get().navigationState;
      return state !== NavigationStates.IDLE && 
             state !== NavigationStates.IN_SECTION &&
             state !== NavigationStates.ORBITING;
    },
    
    isInSection: () => {
      return get().navigationState === NavigationStates.IN_SECTION;
    },
    
    canInteract: () => {
      const state = get().navigationState;
      return state === NavigationStates.IDLE || 
             state === NavigationStates.ORBITING;
    },
    
    // ===================================
    // AÇÕES PRINCIPAIS
    // ===================================
    
    /**
     * Inicia navegação para uma seção (clique no planeta)
     */
    startNavigation: (sectionId: string) => {
      const state = get();
      
      // Valida se pode navegar
      if (!state.canInteract()) {
        return;
      }
      
      // Se está mudando de planeta, reseta valores
      if (state.navigationState === NavigationStates.ORBITING && 
          state.targetSection !== sectionId) {
        set({ 
          zoomProgress: 0, 
          fadeProgress: 0,
          _animation: { ...state._animation, zoomDirection: 0 }
        });
      }
      
      set({ 
        targetSection: sectionId, 
        navigationState: NavigationStates.ORBITING,
        _animation: { ...state._animation, zoomDirection: 0 }
      });
      
      return sectionId;
    },
    
    /**
     * Processa scroll do mouse de forma ULTRA-SUAVE
     */
    handleScroll: (deltaY: number, isInsideContent: boolean = false) => {
      const state = get();
      
      // CRITICAL: If scroll is locked (e.g., by DomeGallery), ignore all scroll events
      if (state.scrollLocked) {
        return;
      }
      
      const anim = state._animation;
      const now = Date.now();
      
      // Throttle melhorado para suavidade extra
      if (now - anim.lastScrollTime < CONFIG.scrollThrottle) return;
      
      const currentState = state.navigationState;
      
      // Se está dentro de uma seção e o scroll é de conteúdo, não faz nada
      if (currentState === NavigationStates.IN_SECTION && isInsideContent) {
        return;
      }
      
      // Limita picos de deltaY para evitar saltos bruscos
      const clampedDeltaY = Math.sign(deltaY) * Math.min(Math.abs(deltaY), CONFIG.maxScrollDelta);
      
      set({ _animation: { ...anim, lastScrollTime: now } });
      
      // ========================================
      // ESTADO ORBITING - Zoom ULTRA-SUAVE
      // ========================================
      if (currentState === NavigationStates.ORBITING) {
        
        if (clampedDeltaY < 0) {
          // ⬆️ SCROLL UP - Zoom IN ultra-suave
          const increment = Math.abs(clampedDeltaY) * CONFIG.zoomInSensitivity;
          const newZoom = Math.min(1, Math.max(0, state.zoomProgress + increment));
          
          set({ 
            zoomProgress: newZoom,
            zoomOutProgress: 0 // Reset zoom out
          });
          
          // Se passou do threshold automático (agora em 65%)
          if (newZoom >= CONFIG.zoomAutoComplete && state._animation.zoomDirection === 0) {
            set({ 
              navigationState: NavigationStates.ZOOMING_IN,
              _animation: { ...state._animation, zoomDirection: 1 }
            });
            get().startAnimationLoop();
          }
          
        } else {
          // ⬇️ SCROLL DOWN - Zoom OUT ultra-suave
          const increment = Math.abs(clampedDeltaY) * CONFIG.zoomOutSensitivity;
          const newZoomOut = Math.min(1, Math.max(0, state.zoomOutProgress + increment));
          
          set({ 
            zoomOutProgress: newZoomOut,
            zoomProgress: Math.max(0, state.zoomProgress - increment * 0.3) // Reduzido de 0.5 para 0.3
          });
          
          // Se zoom out chegou quase no máximo, volta ao inicial
          if (newZoomOut >= CONFIG.zoomOutCompleteThreshold) {
            get().goToInitialState();
            return;
          }
        }
        
      }
      
      // ========================================
      // ESTADO ZOOMING_IN - Controle manual ultra-suave
      // ========================================
      else if (currentState === NavigationStates.ZOOMING_IN) {
        // Só permite controle manual até o ponto de auto-complete (agora 65%)
        if (state.zoomProgress < CONFIG.zoomAutoComplete) {
          const increment = -clampedDeltaY * CONFIG.zoomInSensitivity;
          const newZoom = Math.max(0, Math.min(1, state.zoomProgress + increment));
          
          set({ zoomProgress: newZoom });
          
          // Se fez scroll reverso e chegou próximo de 0
          if (newZoom < 0.03 && clampedDeltaY > 0) {
            get().goToInitialState();
          }
          // Se chegou no auto-complete, ativa animação
          else if (newZoom >= CONFIG.zoomAutoComplete && state._animation.zoomDirection === 0) {
            set({ _animation: { ...state._animation, zoomDirection: 1 } });
            get().startAnimationLoop();
          }
        }
      }
      
      // ========================================
      // ESTADO IN_SECTION - DESABILITADO: Saída APENAS por ESC ou botão
      // ========================================
      // CORREÇÃO CRÍTICA: Removido o scroll automático de saída que causava fechamento indesejado
      // A saída da seção agora é controlada EXCLUSIVAMENTE por:
      // 1. Botão "Voltar" no canto superior esquerdo (onClick={initiateExit})
      // 2. Tecla ESC (handleKeyDown no HeroZustand.tsx)
      // 3. Scroll dentro das seções é NORMAL e não interfere na navegação 3D
    },
    
    
    /**
     * Inicia processo de zoom in automático
     */
    startZoomIn: () => {
      const state = get();
      if (state.navigationState !== NavigationStates.ZOOMING_IN && 
          state.navigationState !== NavigationStates.ORBITING) return;
      
      set({ 
        navigationState: NavigationStates.ZOOMING_IN,
        _animation: { ...state._animation, zoomDirection: 1 }
      });
      
      // Inicia loop de animação
      get().startAnimationLoop();
    },
    
    /**
     * Inicia saída da seção
     */
    initiateExit: () => {
      const state = get();
      if (state.navigationState !== NavigationStates.IN_SECTION) return;
      
      // CONTINUITY FIX: Restaura valores finais para começar saída de onde entrada terminou
      set({ 
        navigationState: NavigationStates.EXITING,
        pageVisible: false,
        targetSection: null,  // CRÍTICO: garante que vai direto para MAIN
        // Restaura zoom progress para onde estava quando entrou (98%)
        zoomProgress: state.finalZoomProgress,
        // Reset zoom out progress para começar do zero
        zoomOutProgress: 0
      });
      
      // Inicia animação de fade out
      get().startFadeOutAnimation();
    },
    
    /**
     * SIMPLIFICADO: Comando direto para voltar ao inicial
     */
    goToInitialState: () => {
      const state = get();
      
      // Para todas as animações
      get().cleanup();
      
      // Se em seção, faz fade + zoom out
      if (state.navigationState === NavigationStates.IN_SECTION) {
        set({ 
          navigationState: NavigationStates.EXITING,
          pageVisible: false,
          targetSection: 'MAIN',  // Força destino MAIN
          zoomOutProgress: 0
        });
        get().startFadeOutAnimation();
      } else {
        // Volta direto
        set({
          navigationState: NavigationStates.IDLE,
          currentSection: 'MAIN',
          targetSection: null,
          zoomProgress: 0,
          fadeProgress: 0,
          zoomOutProgress: 0,
          pageVisible: false,
          canvas3DActive: true,
          _animation: { frame: null, zoomDirection: 0, fadeFrame: null, lastScrollTime: 0 }
        });
        if (typeof window !== 'undefined') {
          window.history.pushState({ section: 'MAIN' }, '', '#');
        }
      }
    },
    
    // ===================================
    // ANIMAÇÕES
    // ===================================
    
    /**
     * Loop principal de animação de zoom
     */
    startAnimationLoop: () => {
      const animate = () => {
        const state = get();
        const anim = state._animation;
        let shouldContinue = false;
        
        // Zoom in
        if (anim.zoomDirection > 0 && state.navigationState === NavigationStates.ZOOMING_IN) {
          const nextZoom = Math.min(1, state.zoomProgress + CONFIG.zoomSpeed);
          set({ zoomProgress: nextZoom });
          shouldContinue = nextZoom < 1;
          
          // Inicia fade
          if (nextZoom >= CONFIG.zoomStartFade && state.fadeProgress === 0) {
            get().startFadeInAnimation();
          }
          
          // Completa zoom - mas NÃO entra na seção ainda
          // A entrada na seção é controlada pelo fade, não pelo zoom
          if (nextZoom >= CONFIG.zoomComplete) {
            shouldContinue = false;
          }
        }
        // Zoom out - CONTINUITY FIX: Velocidade mais simétrica para transição suave
        else if (anim.zoomDirection < 0 && state.navigationState === NavigationStates.ZOOMING_OUT) {
          // Usa velocidade ligeiramente mais rápida para compensar a distância (98% até 0%)
          const nextZoom = Math.max(0, state.zoomProgress - CONFIG.zoomSpeed * 1.2);
          set({ zoomProgress: nextZoom });
          shouldContinue = nextZoom > CONFIG.zoomOutCompleteThreshold;
          
          if (nextZoom <= CONFIG.zoomOutCompleteThreshold) {
            get().completeExit();
            shouldContinue = false;
          }
        }
        
        if (shouldContinue) {
          set({ 
            _animation: { 
              ...get()._animation, 
              frame: requestAnimationFrame(animate) 
            }
          });
        } else {
          // Limpa animação
          set({ 
            _animation: { 
              ...get()._animation, 
              frame: null,
              zoomDirection: 0
            }
          });
        }
      };
      
      // Cancela animação anterior se houver
      const currentFrame = get()._animation.frame;
      if (currentFrame) {
        cancelAnimationFrame(currentFrame);
      }
      
      set({ 
        _animation: { 
          ...get()._animation, 
          frame: requestAnimationFrame(animate) 
        }
      });
    },
    
    /**
     * Animação de fade in
     */
    startFadeInAnimation: () => {
      const animate = () => {
        const state = get();
        const nextFade = Math.min(1, state.fadeProgress + CONFIG.fadeSpeed);
        set({ fadeProgress: nextFade });
        
        // O canvas não é mais pausado aqui. A visibilidade será controlada por CSS.
        if (nextFade >= 0.98) {
          // A lógica de pausar o canvas foi removida.
        }
        
        if (nextFade < 1) {
          set({ 
            _animation: { 
              ...get()._animation, 
              fadeFrame: requestAnimationFrame(animate) 
            }
          });
        } else {
          // Fade completado - AGORA pode entrar na seção
          set({ 
            _animation: { 
              ...get()._animation, 
              fadeFrame: null 
            }
          });
          // Entra na seção APENAS quando fade estiver 100% completo
          get().enterSection();
        }
      };
      
      const currentFrame = get()._animation.fadeFrame;
      if (currentFrame) {
        cancelAnimationFrame(currentFrame);
      }
      
      set({ 
        _animation: { 
          ...get()._animation, 
          fadeFrame: requestAnimationFrame(animate) 
        }
      });
    },
    
    /**
     * Animação de fade out
     */
    startFadeOutAnimation: () => {
      const animate = () => {
        const state = get();
        const nextFade = Math.max(0, state.fadeProgress - CONFIG.fadeSpeed * 2);
        set({ fadeProgress: nextFade });
        
        // O canvas agora está sempre ativo; a visibilidade é controlada por CSS.
        
        if (nextFade > 0) {
          requestAnimationFrame(animate);
        } else {
          // CONTINUITY FIX: Inicia zoom out preservando continuidade
          const currentState = get();
          set({ 
            navigationState: NavigationStates.ZOOMING_OUT,
            // Garante que zoom progress está no valor final salvo
            zoomProgress: currentState.finalZoomProgress,
            _animation: { ...currentState._animation, zoomDirection: -1 }
          });
          get().startAnimationLoop();
        }
      };
      
      requestAnimationFrame(animate);
    },
    
    /**
     * Entra na seção
     */
    enterSection: () => {
      const state = get();
      const section = state.targetSection;
      if (!section) return;
      
      // CONTINUITY FIX: Salva estado final quando entra na seção
      // Isso garante que a saída comece de onde a entrada terminou
      set({ 
        navigationState: NavigationStates.ENTERING,
        // Preserva o estado atual como "final" para usar na saída
        finalZoomProgress: state.zoomProgress, // Deve estar em ~0.98 (CONFIG.zoomComplete)
        // Os valores de câmera serão salvos pelo CameraController via saveFinalCameraState
      });
      
      setTimeout(() => {
        set({ 
          currentSection: section,
          pageVisible: true,
          navigationState: NavigationStates.IN_SECTION,
          // fadeProgress: 0 // REMOVIDO: O overlay agora é removido pelo SectionPagesZustand
        });
        
        // Mark section as visited
        get().markSectionAsVisited(section.toLowerCase());
      }, 100); // Volta ao original - agora controlado pelo fade
      
      // Atualiza URL
      if (typeof window !== 'undefined') {
        window.history.pushState(
          { section },
          '',
          `#${section.toLowerCase()}`
        );
      }
    },
    
    /**
     * SIMPLIFICADO: Volta direto para IDLE/MAIN
     */
    completeExit: () => {
      set({
        navigationState: NavigationStates.IDLE,
        currentSection: 'MAIN',
        targetSection: null,
        zoomProgress: 0,
        fadeProgress: 0,
        zoomOutProgress: 0,
        pageVisible: false,
        canvas3DActive: true,
        _animation: {
          frame: null,
          zoomDirection: 0,
          fadeFrame: null,
          lastScrollTime: 0
        }
      });
      
      if (typeof window !== 'undefined') {
        window.history.pushState({ section: 'MAIN' }, '', '#');
      }
    },
    
    // ===================================
    // CLEANUP
    // ===================================
    cleanup: () => {
      const anim = get()._animation;
      if (anim.frame) cancelAnimationFrame(anim.frame);
      if (anim.fadeFrame) cancelAnimationFrame(anim.fadeFrame);
    },
    
    // ===================================
    // CURSOR/HOVER
    // ===================================
    setHoveredPlanet: (planet: string | null) => {
      set({ hoveredPlanet: planet });
    },
    
    // ===================================
    // TUTORIAL
    // ===================================
    initializeTutorial: () => {
      // Always show tutorial on page load
      set({ showTutorial: true });
    },
    
    closeTutorial: () => {
      set({ showTutorial: false });
    },
    
    completeTutorial: () => {
      // Only mark as completed for current session, no localStorage
      set({ 
        showTutorial: false, 
        tutorialCompleted: true 
      });
    },

    // ===================================
    // PROGRESS TRACKING
    // ===================================
    markSectionAsVisited: (sectionId: string) => {
      const state = get();
      const normalizedId = sectionId.toLowerCase();
      
      if (!state.visitedSections.includes(normalizedId)) {
        const updatedSections = [...state.visitedSections, normalizedId];
        set({ visitedSections: updatedSections });
        // No localStorage saving - only in-memory for current session
      }
    },

    // Removed localStorage functions - no persistence between sessions
    loadVisitedSections: () => {
      // No-op: sections always start fresh
    },

    saveVisitedSections: () => {
      // No-op: no saving to localStorage
    },

    // ===================================
    // SCROLL LOCK (for modals/overlays)
    // ===================================
    lockScroll: () => {
      set({ scrollLocked: true });
    },

    unlockScroll: () => {
      set({ scrollLocked: false });
    },

    // CONTINUITY FIX: Salva estado final da câmera para uso na saída
    saveFinalCameraState: (zoomProgress: number, orbitAngle: number, radius: number, height: number) => {
      set({
        finalZoomProgress: zoomProgress,
        finalOrbitAngle: orbitAngle,
        finalCameraRadius: radius,
        finalCameraHeight: height
      });
    }
  }))
);