import { useState, useEffect, RefObject } from 'react';

interface ScrollProgress {
  scrollY: number;
  elementProgress: number;
  isVisible: boolean;
  phase: 'entering' | 'visible' | 'exiting' | 'hidden';
  revealLevel: 1 | 2 | 3 | 4; // 4 níveis de revelação
}

interface UseScrollProgressOptions {
  threshold?: number; // Threshold para visibilidade (0-1)
  offset?: number; // Offset em pixels
}

export const useScrollProgress = (
  elementRef: RefObject<HTMLElement>,
  options: UseScrollProgressOptions = {}
): ScrollProgress => {
  const { threshold = 0.1, offset = 0 } = options;
  const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
    scrollY: 0,
    elementProgress: 0,
    isVisible: false,
    phase: 'hidden',
    revealLevel: 1
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const scrollY = window.scrollY;
      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calcular progresso do elemento (0-1)
      const elementTop = rect.top + scrollY - offset;
      const elementHeight = rect.height;
      const scrollStart = elementTop - windowHeight;
      const scrollEnd = elementTop + elementHeight;
      const scrollDistance = scrollEnd - scrollStart;
      
      let elementProgress = 0;
      if (scrollY > scrollStart && scrollY < scrollEnd) {
        elementProgress = Math.min(1, Math.max(0, (scrollY - scrollStart) / scrollDistance));
      } else if (scrollY >= scrollEnd) {
        elementProgress = 1;
      }

      // Determinar visibilidade
      const isVisible = elementProgress > threshold;

      // Determinar fase
      let phase: ScrollProgress['phase'] = 'hidden';
      if (elementProgress > 0 && elementProgress <= 0.2) {
        phase = 'entering';
      } else if (elementProgress > 0.2 && elementProgress <= 0.8) {
        phase = 'visible';
      } else if (elementProgress > 0.8 && elementProgress < 1) {
        phase = 'exiting';
      }

      // Determinar nível de revelação baseado no progresso
      let revealLevel: ScrollProgress['revealLevel'] = 1;
      if (elementProgress > 0.2) revealLevel = 2;
      if (elementProgress > 0.5) revealLevel = 3;
      if (elementProgress > 0.8) revealLevel = 4;

      setScrollProgress({
        scrollY,
        elementProgress,
        isVisible,
        phase,
        revealLevel
      });
    };

    // Throttle scroll events para performance
    let rafId: number;
    const throttledScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Executar imediatamente

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [elementRef, threshold, offset]);

  return scrollProgress;
};

// Hook adicional para mouse proximity
export const useMouseProximity = (elementRef: RefObject<HTMLElement>) => {
  const [proximity, setProximity] = useState({
    distance: Infinity,
    angle: 0,
    isNear: false,
    intensity: 0 // 0-1, quão próximo está
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const angle = Math.atan2(deltaY, deltaX);
      
      // Considerar "próximo" se dentro de 200px
      const maxDistance = 200;
      const isNear = distance < maxDistance;
      const intensity = isNear ? Math.max(0, 1 - (distance / maxDistance)) : 0;

      setProximity({
        distance,
        angle,
        isNear,
        intensity
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [elementRef]);

  return proximity;
};