import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigationStore } from '../stores/navigation.store';
import { useTranslation } from 'react-i18next';

const CustomCursor: React.FC = () => {
  const hoveredPlanet = useNavigationStore(state => state.hoveredPlanet);
  const { t } = useTranslation('navigation');
  
  // Helper function to translate planet names
  const translatePlanetName = (planetName: string | null) => {
    if (!planetName) return null;
    
    const nameMap: Record<string, string> = {
      'About Me': t('points.about.name'),
      'Projects': t('points.projects.name'),
      'Experience': t('points.experience.name'),
      'Contact': t('points.contact.name'),
      'Courses': t('points.courses.name')
    };
    
    return nameMap[planetName] || planetName;
  };
  
  // Refs para manipulação direta do DOM
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | undefined>(undefined);
  const isPointerRef = useRef(false);
  const isVisibleRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Hook para detectar dispositivo móvel
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' && window.innerWidth < 768
  );
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    window.addEventListener('resize', checkMobile);
    document.addEventListener('fullscreenchange', checkFullscreen);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, []);
  
  useEffect(() => {
    // Skip effect if mobile or in fullscreen (FullscreenCursor will handle it)
    if (isMobile || isFullscreen) return;
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
      
      // Detecta elementos com fundo branco
      const isOverWhiteBg = target.matches('[data-white-bg="true"]') || 
                           target.closest('[data-white-bg="true"]');
      
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
        
        // Muda cor do cursor baseado no fundo
        if (isOverWhiteBg) {
          cursorDot.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          cursorRing.style.borderColor = 'rgba(0, 0, 0, 0.5)';
        } else {
          cursorDot.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
          cursorRing.style.borderColor = 'rgba(255, 255, 255, 0.5)';
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
          const isOverWhiteBg = elementAtCursor.matches('[data-white-bg="true"]') || 
                               elementAtCursor.closest('[data-white-bg="true"]');
          
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
          
          // Atualiza cor do cursor
          if (isOverWhiteBg) {
            cursorDot.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            cursorRing.style.borderColor = 'rgba(0, 0, 0, 0.5)';
          } else {
            cursorDot.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            cursorRing.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }
        }
      }
      
      rafId.current = requestAnimationFrame(animate);
    };
    
    // Event listeners - attach to both document and fullscreen element
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    // Additional listeners for fullscreen compatibility
    if (document.fullscreenElement) {
      document.fullscreenElement.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.fullscreenElement.addEventListener('mouseleave', handleMouseLeave);
      document.fullscreenElement.addEventListener('mouseenter', handleMouseEnter);
    }
    
    // Inicia animação
    rafId.current = requestAnimationFrame(animate);
    
    // Esconde cursor padrão
    document.body.style.cursor = 'none';
    
    // Se estiver em fullscreen, esconde o cursor também no elemento fullscreen
    if (document.fullscreenElement) {
      (document.fullscreenElement as HTMLElement).style.cursor = 'none';
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      // Clean up fullscreen listeners if they exist
      if (document.fullscreenElement) {
        document.fullscreenElement.removeEventListener('mousemove', handleMouseMove);
        document.fullscreenElement.removeEventListener('mouseleave', handleMouseLeave);
        document.fullscreenElement.removeEventListener('mouseenter', handleMouseEnter);
      }
      
      if (rafId.current) cancelAnimationFrame(rafId.current);
      document.body.style.cursor = 'auto';
      
      // Restaura cursor no elemento fullscreen se existir
      if (document.fullscreenElement) {
        (document.fullscreenElement as HTMLElement).style.cursor = 'auto';
      }
      
      observer.disconnect();
    };
  }, [hoveredPlanet, isMobile, isFullscreen]);
  
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
  
  // Não renderiza em mobile ou em fullscreen (FullscreenCursor cuida disso)
  if (isMobile || isFullscreen) return null;
  
  const cursorElements = (
    <div className={`pointer-events-none fixed inset-0 ${isFullscreen ? 'z-[99999]' : 'z-[9999]'}`}>
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
      
      {/* Planet text card */}
      {hoveredPlanet && (
        <div
          ref={cursorTextRef}
          className="absolute left-6 -top-1 whitespace-nowrap"
          style={{
            opacity: 0,
            willChange: 'transform',
            transition: 'opacity 0.15s ease-out',
          }}
        >
          <div className="bg-black/40 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg shadow-lg">
            <span className="text-[15px] text-white/95 tracking-wider uppercase font-normal">
              {translatePlanetName(hoveredPlanet)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
  
  // Se estiver em fullscreen, renderiza no elemento fullscreen
  if (isFullscreen && document.fullscreenElement) {
    return createPortal(cursorElements, document.fullscreenElement);
  }
  
  // Caso contrário, renderiza normalmente
  return cursorElements;
};

export default CustomCursor;