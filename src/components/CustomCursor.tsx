import React, { useEffect, useRef, useState } from 'react';
import { useNavigationStore } from '../stores/navigation.store';

const CustomCursor: React.FC = () => {
  const hoveredPlanet = useNavigationStore(state => state.hoveredPlanet);
  
  // Refs para manipulação direta do DOM
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | undefined>(undefined);
  const isPointerRef = useRef(false);
  const isVisibleRef = useRef(false);
  
  // Hook para detectar dispositivo móvel
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' && window.innerWidth < 768
  );
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    // Skip effect if mobile
    if (isMobile) return;
    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;
    const cursorText = cursorTextRef.current;
    
    if (!cursorDot || !cursorRing) return;
    
    // Cache de elementos interativos para melhor performance
    const interactiveSelectors = 'button, a, input, select, textarea, [role="button"], [onclick]';
    let cachedInteractiveElements: Set<Element> = new Set();
    
    // Atualiza cache de elementos interativos periodicamente
    const updateInteractiveCache = () => {
      cachedInteractiveElements = new Set(document.querySelectorAll(interactiveSelectors));
    };
    updateInteractiveCache();
    
    // Atualiza cache quando o DOM muda
    const observer = new MutationObserver(() => {
      updateInteractiveCache();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Função otimizada para verificar se elemento é interativo
    const isInteractive = (element: Element): boolean => {
      let current: Element | null = element;
      while (current) {
        if (cachedInteractiveElements.has(current)) return true;
        if (current.matches('[style*="cursor: pointer"]')) return true;
        current = current.parentElement;
      }
      return false;
    };
    
    // Handler otimizado do mousemove com throttle
    let lastMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      
      // Throttle para 120fps (8.33ms)
      if (now - lastMoveTime < 8.33) return;
      lastMoveTime = now;
      
      mousePosition.current = { x: e.clientX, y: e.clientY };
      
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
      
      // Detecta hover sobre elementos interativos
      const target = e.target as Element;
      const shouldShowPointer = isInteractive(target) || !!hoveredPlanet;
      
      if (shouldShowPointer !== isPointerRef.current) {
        isPointerRef.current = shouldShowPointer;
        
        // Aplica mudanças diretamente no DOM
        if (shouldShowPointer) {
          cursorDot.style.transform = 'translate(-50%, -50%) scale(0)';
          cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
          cursorRing.style.borderWidth = '1px';
        } else {
          cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
          cursorRing.style.transform = 'translate(-50%, -50%) scale(0)';
          cursorRing.style.borderWidth = '0px';
        }
      }
    };
    
    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      if (cursorText) cursorText.style.opacity = '0';
    };
    
    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    };
    
    // Loop de animação otimizado
    let frameCount = 0;
    const animate = () => {
      // Lerp otimizado para movimento suave e responsivo
      const lerp = 0.15; // Balanceado entre suavidade e responsividade
      const dx = mousePosition.current.x - currentPosition.current.x;
      const dy = mousePosition.current.y - currentPosition.current.y;
      
      // Só atualiza se houver movimento significativo (threshold de 0.01px)
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        currentPosition.current.x += dx * lerp;
        currentPosition.current.y += dy * lerp;
        
        // Usa transform3d para GPU acceleration
        const transform = `translate3d(${currentPosition.current.x}px, ${currentPosition.current.y}px, 0)`;
        cursorDot.style.transform = transform + ' translate(-50%, -50%)' + (isPointerRef.current ? ' scale(0)' : ' scale(1)');
        cursorRing.style.transform = transform + ' translate(-50%, -50%)' + (isPointerRef.current ? ' scale(1)' : ' scale(0)');
        
        if (cursorText) {
          cursorText.style.transform = transform;
        }
      }
      
      // Verifica elemento sob o cursor a cada 10 frames (~166ms a 60fps)
      frameCount++;
      if (frameCount % 10 === 0 && isVisibleRef.current) {
        const elementAtCursor = document.elementFromPoint(mousePosition.current.x, mousePosition.current.y);
        if (elementAtCursor) {
          // Atualiza estado visual do cursor baseado em hover interativo ou planeta
          const shouldShowPointer = isInteractive(elementAtCursor) || !!hoveredPlanet;
          
          if (shouldShowPointer !== isPointerRef.current) {
            isPointerRef.current = shouldShowPointer;
            
            if (shouldShowPointer) {
              cursorDot.style.transform = 'translate(-50%, -50%) scale(0)';
              cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
              cursorRing.style.borderWidth = '1px';
            } else {
              cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
              cursorRing.style.transform = 'translate(-50%, -50%) scale(0)';
              cursorRing.style.borderWidth = '0px';
            }
          }
        }
      }
      
      rafId.current = requestAnimationFrame(animate);
    };
    
    // Event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    // Inicia animação
    rafId.current = requestAnimationFrame(animate);
    
    // Esconde cursor padrão
    document.body.style.cursor = 'none';
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      document.body.style.cursor = 'auto';
      observer.disconnect();
    };
  }, [hoveredPlanet, isMobile]);
  
  // Atualiza texto do planeta quando muda
  useEffect(() => {
    if (cursorTextRef.current) {
      if (hoveredPlanet) {
        cursorTextRef.current.style.opacity = '1';
      } else {
        cursorTextRef.current.style.opacity = '0';
      }
    }
  }, [hoveredPlanet]);
  
  // Não renderiza em mobile
  if (isMobile) return null;
  
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        className="absolute w-2 h-2 bg-white/80 rounded-full"
        style={{
          left: 0,
          top: 0,
          opacity: 0,
          willChange: 'transform',
          transition: 'none',
        }}
      />
      
      {/* Cursor ring */}
      <div
        ref={cursorRingRef}
        className="absolute w-6 h-6 border-white/50 rounded-full"
        style={{
          left: 0,
          top: 0,
          opacity: 0,
          borderWidth: 0,
          willChange: 'transform',
          transition: 'border-width 0.15s ease-out',
        }}
      />
      
      {/* Planet text */}
      {hoveredPlanet && (
        <div
          ref={cursorTextRef}
          className="absolute left-6 -top-0.5 whitespace-nowrap"
          style={{
            opacity: 0,
            willChange: 'transform',
            transition: 'opacity 0.15s ease-out',
          }}
        >
          <span className="text-[11px] text-white/85 tracking-wider uppercase font-light drop-shadow-sm">
            {hoveredPlanet}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomCursor;