import { useState, useEffect, useRef, RefObject, useCallback } from 'react';

// Hook para animação de frames contínua
export const useAnimationFrame = (callback: (_deltaTime: number) => void, isActive: boolean = true) => {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback, isActive]);
};

// Hook para detecção de scroll com Intersection Observer
interface ScrollProgress {
  isInView: boolean;
  progress: number; // 0-1 baseado na posição do elemento na viewport
  direction: 'up' | 'down' | null;
  revealLevel: 1 | 2 | 3 | 4;
}

export const useScrollProgress = (
  elementRef: RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
): ScrollProgress => {
  const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
    isInView: false,
    progress: 0,
    direction: null,
    revealLevel: 1
  });

  const previousScrollY = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Criar Intersection Observer para detectar quando elemento está visível
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const { isIntersecting, boundingClientRect } = entry;
          
          // Calcular progresso baseado na posição do elemento
          const viewportHeight = window.innerHeight;
          const elementTop = boundingClientRect.top;
          const elementHeight = boundingClientRect.height;
          
          // Progresso de 0 (topo do elemento no bottom da viewport) até 1 (bottom do elemento no topo da viewport)
          let progress = 0;
          if (isIntersecting) {
            if (elementTop >= 0) {
              // Elemento entrando por baixo
              progress = 1 - (elementTop / viewportHeight);
            } else {
              // Elemento já parcialmente visível
              progress = Math.abs(elementTop) / elementHeight;
            }
            progress = Math.max(0, Math.min(1, progress));
          }

          // Determinar nível de revelação
          let revealLevel: 1 | 2 | 3 | 4 = 1;
          if (progress > 0.25) revealLevel = 2;
          if (progress > 0.5) revealLevel = 3;
          if (progress > 0.75) revealLevel = 4;

          // Determinar direção do scroll
          const currentScrollY = window.scrollY;
          const direction = currentScrollY > previousScrollY.current ? 'down' : 
                          currentScrollY < previousScrollY.current ? 'up' : null;
          previousScrollY.current = currentScrollY;

          setScrollProgress({
            isInView: isIntersecting,
            progress,
            direction,
            revealLevel
          });
        });
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
        rootMargin: '0px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return scrollProgress;
};

// Hook melhorado para tracking de mouse com performance otimizada
interface MousePosition {
  x: number;
  y: number;
  elementX: number; // Posição relativa ao elemento
  elementY: number;
  distance: number; // Distância do centro do elemento
  angle: number; // Ângulo em relação ao centro
  isHovering: boolean;
  intensity: number; // 0-1 baseado na proximidade
}

export const useMouseTracking = (
  elementRef: RefObject<HTMLElement>,
  maxDistance: number = 300
): MousePosition => {
  const [mousePos, setMousePos] = useState<MousePosition>({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    distance: Infinity,
    angle: 0,
    isHovering: false,
    intensity: 0
  });

  const rafId = useRef<number>(0);

  const updateMousePosition = useCallback((e: MouseEvent) => {
    if (!elementRef.current) return;

    // Cancelar update anterior
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    // Usar requestAnimationFrame para performance
    rafId.current = requestAnimationFrame(() => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Posição relativa ao elemento
      const elementX = e.clientX - rect.left;
      const elementY = e.clientY - rect.top;
      
      // Distância e ângulo do centro
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = Math.atan2(deltaY, deltaX);
      
      // Verificar se está hovering
      const isHovering = elementX >= 0 && elementX <= rect.width && 
                        elementY >= 0 && elementY <= rect.height;
      
      // Intensidade baseada na proximidade
      const intensity = Math.max(0, 1 - (distance / maxDistance));

      setMousePos({
        x: e.clientX,
        y: e.clientY,
        elementX,
        elementY,
        distance,
        angle,
        isHovering,
        intensity
      });
    });
  }, [elementRef, maxDistance]);

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updateMousePosition]);

  return mousePos;
};