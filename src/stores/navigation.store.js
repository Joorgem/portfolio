// src/stores/navigation.store.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// A máquina de estados completa
export const NavigationStates = {
  IDLE: 'idle',
  ORBITING: 'orbiting',
  ZOOMING_IN: 'zooming_in',
  ENTERING: 'entering',
  IN_SECTION: 'in_section',
  EXITING: 'exiting',
  ZOOMING_OUT: 'zooming_out',
};

// Configurações do sistema
const CONFIG = {
  // Sensibilidades balanceadas para scroll suave
  zoomInSensitivity: 0.0008,      // Zoom in normal
  zoomOutSensitivity: 0.0010,     // AJUSTADO: meio termo entre suave e responsivo
  
  // Velocidades de animação automática mais lentas
  zoomSpeed: 0.012,               // Reduzido de 0.015 para 0.012
  fadeSpeed: 0.015,               // Reduzido de 0.018 para 0.015
  
  // Pontos de transição ajustados para mais controle manual
  zoomStartFade: 0.88,            // Aumentado de 0.85 para 0.88 (fade mais tarde)
  zoomComplete: 0.98,             // Mantido em 0.98
  fadePauseCanvas: 0.95,          // Mantido em 0.95
  zoomAutoComplete: 0.65,         // AUMENTADO de 0.3 para 0.65 (65% = muito mais scroll manual)
  
  // Thresholds para estados especiais
  zoomOutCompleteThreshold: 0.65, // AUMENTADO de 0.85 para 0.65 (ativa animação mais cedo - menos "vai e volta")
  exitScrollThreshold: -150,      // Mantido
  
  // Novos parâmetros para suavidade extra
  scrollThrottle: 12,             // Throttle mais baixo (era 16ms, agora 12ms)
  maxScrollDelta: 120,            // Limita picos de deltaY para evitar saltos
};

export const useNavigationStore = create(
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
      zoomDirection: 0,        // -1 = out, 0 = parado, 1 = in
      fadeFrame: null,
      lastScrollTime: 0,
    },
    
    // Zoom out visual (0 a 1, onde 1 = zoom out máximo)
    zoomOutProgress: 0,
    
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
    startNavigation: (sectionId) => {
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
          _animation: { ...state._animation, scrollAccumulated: 0, zoomDirection: 0 }
        });
      }
      
      set({ 
        targetSection: sectionId, 
        navigationState: NavigationStates.ORBITING,
        _animation: { ...state._animation, scrollAccumulated: 0, zoomDirection: 0 }
      });
      
      return sectionId;
    },
    
    /**
     * Processa scroll do mouse de forma ULTRA-SUAVE
     */
    handleScroll: (deltaY, isInsideContent = false) => {
      const state = get();
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
        
        if (clampedDeltaY > 0) {
          // ⬇️ SCROLL DOWN - Zoom IN ultra-suave
          const increment = clampedDeltaY * CONFIG.zoomInSensitivity;
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
          // ⬆️ SCROLL UP - Zoom OUT ultra-suave
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
          const increment = clampedDeltaY * CONFIG.zoomInSensitivity;
          const newZoom = Math.max(0, Math.min(1, state.zoomProgress + increment));
          
          set({ zoomProgress: newZoom });
          

          
          // Se fez scroll reverso e chegou próximo de 0
          if (newZoom < 0.03 && clampedDeltaY < 0) {

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
      // ESTADO IN_SECTION - Saída por scroll
      // ========================================
      else if (currentState === NavigationStates.IN_SECTION && !isInsideContent) {
        // Scroll reverso forte para sair
        if (deltaY < -50) {
          get().initiateExit();
        }
      }
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
      

      
      // Atualização atômica para evitar estados intermediários
      set({ 
        navigationState: NavigationStates.EXITING,
        pageVisible: false,
        targetSection: null  // CRÍTICO: garante que vai direto para MAIN
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
          _animation: { frame: null, zoomDirection: 0, fadeFrame: null }
        });
        window.history.pushState({ section: 'MAIN' }, '', '#');
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
          
          // Completa zoom
          if (nextZoom >= CONFIG.zoomComplete) {

            get().enterSection();
            shouldContinue = false;
          }
        }
        // Zoom out
        else if (anim.zoomDirection < 0 && state.navigationState === NavigationStates.ZOOMING_OUT) {
          const nextZoom = Math.max(0, state.zoomProgress - CONFIG.zoomSpeed * 1.5);
          set({ zoomProgress: nextZoom });
          shouldContinue = nextZoom > 0;
          
          if (nextZoom === 0) {
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
        
        // Pausa canvas quando fade alto
        if (nextFade >= CONFIG.fadePauseCanvas && state.canvas3DActive) {

          set({ canvas3DActive: false });
        }
        
        if (nextFade < 1) {
          set({ 
            _animation: { 
              ...get()._animation, 
              fadeFrame: requestAnimationFrame(animate) 
            }
          });
        } else {
          set({ 
            _animation: { 
              ...get()._animation, 
              fadeFrame: null 
            }
          });
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
        
        // Resume canvas quando fade baixo
        if (nextFade <= 0.5 && !state.canvas3DActive) {

          set({ canvas3DActive: true });
        }
        
        if (nextFade > 0) {
          requestAnimationFrame(animate);
        } else {
          // Inicia zoom out
          set({ 
            navigationState: NavigationStates.ZOOMING_OUT,
            _animation: { ...get()._animation, zoomDirection: -1 }
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
      

      set({ navigationState: NavigationStates.ENTERING });
      
      setTimeout(() => {
        set({ 
          currentSection: section,
          pageVisible: true,
          navigationState: NavigationStates.IN_SECTION
        });
      }, 200);
      
      // Atualiza URL
      window.history.pushState(
        { section },
        '',
        `#${section.toLowerCase()}`
      );
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
          fadeFrame: null
        }
      });
      
      window.history.pushState({ section: 'MAIN' }, '', '#');
    },
    
    // ===================================
    // CLEANUP
    // ===================================
    cleanup: () => {
      const anim = get()._animation;
      if (anim.frame) cancelAnimationFrame(anim.frame);
      if (anim.fadeFrame) cancelAnimationFrame(anim.fadeFrame);
    }
  }))
);