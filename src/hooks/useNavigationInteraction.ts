import { useState, useCallback, useRef, useEffect } from 'react';
import type { NavigationPoint } from '../constants/navigationPoints';

interface UseNavigationInteractionOptions {
  onNavigate?: (_point: NavigationPoint) => void;
  debugMode?: boolean;
  hoverDelay?: number; // ms de delay para evitar hover acidental
  clickDelay?: number; // ms de delay para evitar cliques duplos
}

interface UseNavigationInteractionReturn {
  hoveredPoint: NavigationPoint | null;
  selectedPoint: NavigationPoint | null;
  isTransitioning: boolean;
  handleHover: (_point: NavigationPoint | null) => void;
  handleClick: (_point: NavigationPoint) => void;
  isHovering: boolean;
}

/**
 * Hook customizado para gerenciar interações de navegação 3D
 * Com debounce e otimizações de performance
 */
export const useNavigationInteraction = (options: UseNavigationInteractionOptions = {}): UseNavigationInteractionReturn => {
  const {
    onNavigate,
    debugMode = false,
    hoverDelay = 50, // ms de delay para evitar hover acidental
    clickDelay = 100, // ms de delay para evitar cliques duplos
  } = options;

  const [hoveredPoint, setHoveredPoint] = useState<NavigationPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<NavigationPoint | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs para controle de timing
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTime = useRef(0);
  const isHoveringRef = useRef(false);
  
  // Handler de hover com debounce
  const handleHover = useCallback((point: NavigationPoint | null) => {
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
          
        }
      }, hoverDelay);
    } else {
      // Remove hover imediatamente ao sair
      setHoveredPoint(null);
      isHoveringRef.current = false;
    }
  }, [hoverDelay, isTransitioning, debugMode]);
  
  // Handler de clique com proteção contra duplo clique
  const handleClick = useCallback((point: NavigationPoint) => {
    const now = Date.now();
    
    // Previne cliques muito rápidos
    if (now - lastClickTime.current < clickDelay) {
      return;
    }
    
    // Previne cliques durante transição
    if (isTransitioning) {
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
export const useNavigationCursor = (isHovering: boolean): void => {
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

interface UseNavigationPerformanceReturn {
  countFrame: () => void;
}

/**
 * Hook para performance monitoring
 */
export const useNavigationPerformance = (debugMode = false): UseNavigationPerformanceReturn => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  useEffect(() => {
    if (!debugMode) return;
    
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime.current;
      const fps = Math.round((frameCount.current * 1000) / delta);
      
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