// src/stores/navigation.store.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  NAVIGATION_CONFIG,
  ANIMATION_CONSTANTS,
  NavigationStates,
  PortfolioModes,
  STORAGE_KEYS,
  type NavigationState,
  type PortfolioMode
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
  // Navigation dots hover state (one-page mode)
  hoveredNavigationDot: string | null;
  // Portfolio mode state
  portfolioMode: PortfolioMode;
  showModeSelector: boolean;
  // Tutorial states
  showTutorial: boolean;
  tutorialCompleted: boolean;
  // Progress tracking
  visitedSections: string[];
  // Scroll lock for modals/overlays
  scrollLocked: boolean;
  // 3D Scene Ready state
  is3DSceneReady: boolean;
  // Loading 3D Scene state (to prevent race conditions)
  loading3DScene: boolean;
  // Activation in progress flag (prevents simultaneous activations)
  activationInProgress: boolean;
  // StrictMode protection flag
  _isInitialized: boolean;
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
  // Navigation dots actions (one-page mode)
  setHoveredNavigationDot: (_dotId: string | null) => void;
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
  // 3D Scene Ready actions
  set3DSceneReady: (_isReady: boolean) => void;
  // Loading 3D Scene actions (race condition prevention)
  setLoading3DScene: (_isLoading: boolean) => void;
  setActivationInProgress: (_inProgress: boolean) => void;
  activate3DSceneAndTutorial: () => void;
  // Portfolio mode actions
  setPortfolioMode: (_mode: PortfolioMode) => void;
  initializePortfolioMode: () => void;
  showPortfolioModeSelector: () => void;
  hidePortfolioModeSelector: () => void;
  // One-page mode actions
  setCurrentSection: (_sectionId: string) => void;
  // CONTINUITY FIX: Preserva estado final
  saveFinalCameraState: (_zoomProgress: number, _orbitAngle: number, _radius: number, _height: number) => void;
}

// Complete store type
export type NavigationStore = NavigationStoreState & NavigationStoreActions;

// Using centralized navigation configuration
const CONFIG = NAVIGATION_CONFIG;

// Global state change monitor for debugging
let lastPortfolioMode: string = 'choosing';

export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set, get) => {
    // ULTRA-DEBUG: Monitor ALL state changes - wrap the original set function
    const originalSet = set;
    set = (partial: any, replace?: boolean) => {
      const currentState = get();

      // Detect portfolioMode changes
      let newPortfolioMode = null;
      if (typeof partial === 'function') {
        const tempState = partial(currentState);
        newPortfolioMode = tempState.portfolioMode;
      } else if (partial && typeof partial === 'object') {
        newPortfolioMode = partial.portfolioMode;
      }

      if (newPortfolioMode && newPortfolioMode !== lastPortfolioMode) {
        const timestamp = new Date().toISOString();
        console.log(`🚨🚨🚨 [${timestamp}] PORTFOLIO MODE CHANGE DETECTED:`, {
          from: lastPortfolioMode,
          to: newPortfolioMode,
          stackTrace: new Error('Portfolio mode change').stack?.split('\n').slice(0, 5).join('\n')
        });
        lastPortfolioMode = newPortfolioMode;
      }

      return originalSet(partial, replace);
    };

    return ({
    // ===================================
    // ESTADO (STATE)
    // ===================================
    navigationState: NavigationStates.IDLE,
    currentSection: 'MAIN',     // Seção atual (UI/páginas)
    targetSection: null,         // Alvo da navegação (planeta selecionado)
    zoomProgress: 0,            // Progresso do zoom (0 a 1)
    fadeProgress: 0,            // Progresso do fade (0 a 1)
    pageVisible: false,         // Visibilidade da página da seção
    canvas3DActive: false,      // Estado do loop de renderização (inicia desabilitado para performance)
    
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

    // Navigation dots hover (one-page mode)
    hoveredNavigationDot: null,

    // Portfolio mode states
    portfolioMode: PortfolioModes.CHOOSING,
    showModeSelector: true,

    // Tutorial states
    showTutorial: false,
    tutorialCompleted: false,
    
    // Progress tracking
    visitedSections: [],
    
    // Scroll lock state
    scrollLocked: false,
    
    // 3D Scene Ready state
    is3DSceneReady: false,
    // Loading 3D Scene state (prevents race conditions)
    loading3DScene: false,
    // Activation in progress flag (prevents simultaneous activations)
    activationInProgress: false,
    // StrictMode protection flag
    _isInitialized: false,
    
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
      
      // CRITICAL: If 3D scene is not ready, ignore all scroll events
      if (!state.is3DSceneReady) {
        return;
      }

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

    // Navigation dots hover (one-page mode)
    setHoveredNavigationDot: (dotId: string | null) => {
      set({ hoveredNavigationDot: dotId });
    },
    
    // ===================================
    // TUTORIAL
    // ===================================
    initializeTutorial: () => {
      const timestamp = new Date().toISOString();
      const currentState = get();

      console.log(`🎪 [${timestamp}] initializeTutorial CALLED:`, {
        currentPortfolioMode: currentState.portfolioMode,
        currentLoading3DScene: currentState.loading3DScene,
        currentShowModeSelector: currentState.showModeSelector,
        isInitialized: currentState._isInitialized,
        stackTrace: new Error().stack
      });

      // STRICTMODE FIX: Só executa na primeira vez
      if (currentState._isInitialized) {
        console.log(`🛡️  [${timestamp}] initializeTutorial: BLOCKED - Already initialized, preventing StrictMode double execution`);
        return;
      }

      // Marca como inicializado para prevenir execuções duplas
      set({ _isInitialized: true });

      // Tutorial será ativado automaticamente quando o usuário selecionar o modo 3D
      // Não precisa mais fazer nada aqui

      console.log(`✅ [${timestamp}] initializeTutorial COMPLETED - Marked as initialized`);
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

    // 3D Scene Ready actions
    set3DSceneReady: (isReady: boolean) => {
      const timestamp = new Date().toISOString();
      const currentState = get();

      console.log(`🎬 [${timestamp}] set3DSceneReady CALLED:`, {
        isReady,
        currentIs3DSceneReady: currentState.is3DSceneReady,
        loading3DScene: currentState.loading3DScene,
        portfolioMode: currentState.portfolioMode,
        showTutorial: currentState.showTutorial,
        activationInProgress: currentState.activationInProgress
      });

      set({ is3DSceneReady: isReady });

      // RACE CONDITION FIX: Ativa tutorial apenas quando 3D scene está pronto E estamos em loading
      const state = get();
      if (isReady && state.loading3DScene && state.portfolioMode === PortfolioModes.THREE_D) {
        console.log(`⏰ [${timestamp}] set3DSceneReady: Scheduling activation in 50ms`);

        // Pequeno delay para garantir que a cena está realmente estabilizada
        setTimeout(() => {
          console.log(`🚀 [${timestamp}] set3DSceneReady: Calling activate3DSceneAndTutorial`);
          get().activate3DSceneAndTutorial();
        }, 50);
      } else {
        console.log(`❌ [${timestamp}] set3DSceneReady: Conditions not met for activation:`, {
          isReady,
          loading3DScene: state.loading3DScene,
          portfolioMode: state.portfolioMode,
          conditionsMet: isReady && state.loading3DScene && state.portfolioMode === PortfolioModes.THREE_D
        });
      }
    },

    // Loading 3D Scene actions (race condition prevention)
    setLoading3DScene: (isLoading: boolean) => {
      set({ loading3DScene: isLoading });
    },

    setActivationInProgress: (inProgress: boolean) => {
      set({ activationInProgress: inProgress });
    },

    activate3DSceneAndTutorial: () => {
      const timestamp = new Date().toISOString();
      const state = get();

      console.log(`🔥 [${timestamp}] activate3DSceneAndTutorial CALLED:`, {
        portfolioMode: state.portfolioMode,
        is3DSceneReady: state.is3DSceneReady,
        showTutorial: state.showTutorial,
        loading3DScene: state.loading3DScene,
        activationInProgress: state.activationInProgress
      });

      // RACE CONDITION GUARD: Previne ativações simultâneas
      if (state.activationInProgress) {
        console.log(`⚠️  [${timestamp}] activate3DSceneAndTutorial: BLOCKED - activationInProgress is true`);
        return;
      }

      // CRÍTICO: Só ativa se estivermos no modo 3D, scene pronto E ainda não estiver showing tutorial
      if (state.portfolioMode === PortfolioModes.THREE_D &&
          state.is3DSceneReady &&
          !state.showTutorial) {

        console.log(`✨ [${timestamp}] activate3DSceneAndTutorial: CONDITIONS MET - Activating tutorial`);

        // Marca como em progresso para prevenir calls simultâneas
        set({ activationInProgress: true });

        // Ativa tutorial
        set({
          showTutorial: true,
          loading3DScene: false,
          activationInProgress: false // Reset flag
        });

        console.log(`🎉 [${timestamp}] activate3DSceneAndTutorial: COMPLETED - Tutorial activated`);
      } else {
        console.log(`❌ [${timestamp}] activate3DSceneAndTutorial: CONDITIONS NOT MET:`, {
          is3DMode: state.portfolioMode === PortfolioModes.THREE_D,
          is3DSceneReady: state.is3DSceneReady,
          tutorialNotShowing: !state.showTutorial,
          allConditions: state.portfolioMode === PortfolioModes.THREE_D &&
                        state.is3DSceneReady &&
                        !state.showTutorial
        });
      }
    },

    // ===================================
    // PORTFOLIO MODE MANAGEMENT
    // ===================================
    setPortfolioMode: (mode: PortfolioMode) => {
      const timestamp = new Date().toISOString();
      const currentState = get();

      console.log(`🎯 [${timestamp}] setPortfolioMode CALLED:`, {
        newMode: mode,
        currentMode: currentState.portfolioMode,
        currentLoading3DScene: currentState.loading3DScene,
        currentShowTutorial: currentState.showTutorial,
        currentIs3DSceneReady: currentState.is3DSceneReady,
        activationInProgress: currentState.activationInProgress
      });

      set({
        portfolioMode: mode,
        // Ativa canvas 3D apenas se modo 3D for selecionado
        canvas3DActive: mode === PortfolioModes.THREE_D,
        // RACE CONDITION FIX: Não ativa tutorial imediatamente, espera 3D scene estar pronto
        showTutorial: false,
        // Indica que estamos carregando o 3D scene se modo 3D for selecionado
        loading3DScene: mode === PortfolioModes.THREE_D,
        // Reset tutorial completed quando muda modo
        tutorialCompleted: mode !== PortfolioModes.THREE_D,
        // Reset 3D scene ready state quando muda modo
        is3DSceneReady: mode !== PortfolioModes.THREE_D ? false : get().is3DSceneReady,
        // Reset activation flag quando muda modo
        activationInProgress: false
      });

      console.log(`✅ [${timestamp}] setPortfolioMode COMPLETED:`, {
        newState: {
          portfolioMode: mode,
          loading3DScene: mode === PortfolioModes.THREE_D,
          showTutorial: false,
          is3DSceneReady: mode !== PortfolioModes.THREE_D ? false : get().is3DSceneReady
        }
      });

      // REMOVED: Timeout logic movido para componente com useEffect e cleanup adequado

      // Não salva mais no localStorage - sempre volta à seleção no refresh
    },

    initializePortfolioMode: () => {
      const timestamp = new Date().toISOString();
      const currentState = get();

      console.log(`🔥🔥🔥 [${timestamp}] initializePortfolioMode CALLED - THIS IS THE CULPRIT:`, {
        currentPortfolioMode: currentState.portfolioMode,
        currentLoading3DScene: currentState.loading3DScene,
        currentShowModeSelector: currentState.showModeSelector,
        stackTrace: new Error().stack
      });

      // Limpa qualquer preferência salva anteriormente
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.PORTFOLIO_MODE);
      }

      // Sempre volta à tela de seleção no refresh/carregamento da página
      set({
        portfolioMode: PortfolioModes.CHOOSING,
        showModeSelector: true,
        // Canvas permanece desabilitado até escolha
        canvas3DActive: false,
        // Reset loading states
        loading3DScene: false,
        is3DSceneReady: false,
        showTutorial: false
      });

      console.log(`💥💥💥 [${timestamp}] initializePortfolioMode COMPLETED - STATE RESET TO CHOOSING`);
    },

    showPortfolioModeSelector: () => {
      const timestamp = new Date().toISOString();
      const currentState = get();

      console.log(`🔄🔄🔄 [${timestamp}] showPortfolioModeSelector CALLED - POTENTIAL CULPRIT:`, {
        currentPortfolioMode: currentState.portfolioMode,
        currentLoading3DScene: currentState.loading3DScene,
        currentShowModeSelector: currentState.showModeSelector,
        stackTrace: new Error().stack
      });

      set({ showModeSelector: true, portfolioMode: PortfolioModes.CHOOSING });

      console.log(`💀💀💀 [${timestamp}] showPortfolioModeSelector COMPLETED - FORCED RESET TO CHOOSING`);
    },

    hidePortfolioModeSelector: () => {
      const timestamp = new Date().toISOString();
      const currentState = get();

      console.log(`🙈 [${timestamp}] hidePortfolioModeSelector CALLED:`, {
        currentShowModeSelector: currentState.showModeSelector,
        portfolioMode: currentState.portfolioMode,
        loading3DScene: currentState.loading3DScene,
        showTutorial: currentState.showTutorial
      });

      set({ showModeSelector: false });

      console.log(`✅ [${timestamp}] hidePortfolioModeSelector COMPLETED`);
    },

    // Funções removidas - não salva mais preferência no localStorage
    // savePortfolioModePreference: Removida - sempre volta à seleção
    // loadPortfolioModePreference: Removida - sempre volta à seleção

    // ===================================
    // ONE-PAGE MODE ACTIONS
    // ===================================
    setCurrentSection: (sectionId: string) => {
      set({ currentSection: sectionId });
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