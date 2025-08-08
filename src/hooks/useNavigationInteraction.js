import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook customizado para gerenciar interações de navegação 3D
 * Com debounce e otimizações de performance
 */
export const useNavigationInteraction = (options = {}) => {
  const {
    onNavigate,
    debugMode = false,
    hoverDelay = 50, // ms de delay para evitar hover acidental
    clickDelay = 100, // ms de delay para evitar cliques duplos
  } = options;

  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs para controle de timing
  const hoverTimeoutRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const lastClickTime = useRef(0);
  const isHoveringRef = useRef(false);
  
  // Handler de hover com debounce
  const handleHover = useCallback((point) => {
    // Limpa timeout anterior
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (point) {
      // Aplica delay para confirmar hover
      hoverTimeoutRef.current = setTimeout(() => {
        if (!isTransitioning) {
          setHoveredPoint(point);
          isHoveringRef.current = true;
          
          if (debugMode) {
            console.log('🎯 Hover confirmed:', point.name);
          }
        }
      }, hoverDelay);
    } else {
      // Remove hover imediatamente ao sair
      setHoveredPoint(null);
      isHoveringRef.current = false;
    }
  }, [hoverDelay, isTransitioning, debugMode]);
  
  // Handler de clique com proteção contra duplo clique
  const handleClick = useCallback((point) => {
    const now = Date.now();
    
    // Previne cliques muito rápidos
    if (now - lastClickTime.current < clickDelay) {
      if (debugMode) {
        console.log('⚠️ Click ignored (too fast)');
      }
      return;
    }
    
    // Previne cliques durante transição
    if (isTransitioning) {
      if (debugMode) {
        console.log('⚠️ Click ignored (transitioning)');
      }
      return;
    }
    
    lastClickTime.current = now;
    
    // Limpa timeouts pendentes
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Aplica seleção
    setSelectedPoint(point);
    setIsTransitioning(true);
    
    if (debugMode) {
      console.log('✅ Click registered:', point.name);
    }
    
    // Chama callback de navegação
    if (onNavigate) {
      onNavigate(point);
    }
    
    // Reset transição após delay
    clickTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 2000);
  }, [clickDelay, isTransitioning, onNavigate, debugMode]);
  
  // Cleanup de timeouts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);
  
  // Reset de hover ao transicionar
  useEffect(() => {
    if (isTransitioning) {
      setHoveredPoint(null);
    }
  }, [isTransitioning]);
  
  return {
    hoveredPoint,
    selectedPoint,
    isTransitioning,
    handleHover,
    handleClick,
    isHovering: isHoveringRef.current
  };
};

/**
 * Hook para controle de cursor
 */
export const useNavigationCursor = (isHovering) => {
  useEffect(() => {
    if (isHovering) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
    
    // Cleanup
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [isHovering]);
};

/**
 * Hook para performance monitoring
 */
export const useNavigationPerformance = (debugMode = false) => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  useEffect(() => {
    if (!debugMode) return;
    
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime.current;
      const fps = Math.round((frameCount.current * 1000) / delta);
      
      console.log(`📊 Navigation FPS: ${fps}`);
      
      frameCount.current = 0;
      lastTime.current = now;
    }, 2000);
    
    return () => clearInterval(interval);
  }, [debugMode]);
  
  const countFrame = useCallback(() => {
    if (debugMode) {
      frameCount.current++;
    }
  }, [debugMode]);
  
  return { countFrame };
};