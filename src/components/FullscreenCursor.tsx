import React, { useEffect, useRef } from 'react';

const FullscreenCursor: React.FC = () => {
  // Refs para manipulação direta do DOM
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | undefined>(undefined);
  const isPointerRef = useRef(false);
  const isVisibleRef = useRef(false);
  
  useEffect(() => {
    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;
    
    if (!cursorDot || !cursorRing) return;
    
    // Handler otimizado do mousemove
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
      const isInteractive = target.matches('button, a, input, select, textarea, [role="button"], [onclick], [style*="cursor: pointer"]');
      
      // Detecta elementos com fundo branco
      const isOverWhiteBg = target.matches('[data-white-bg="true"]') || 
                           target.closest('[data-white-bg="true"]');
      
      if (isInteractive !== isPointerRef.current) {
        isPointerRef.current = isInteractive;
        
        // Aplica mudanças diretamente no DOM
        if (isInteractive) {
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
    };
    
    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    };
    
    // Loop de animação otimizado
    let frameCount = 0;
    const animate = () => {
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
      }
      
      // Verifica elemento sob o cursor a cada 10 frames (~166ms a 60fps) para detectar cor
      frameCount++;
      if (frameCount % 10 === 0 && isVisibleRef.current) {
        const elementAtCursor = document.elementFromPoint(mousePosition.current.x, mousePosition.current.y);
        if (elementAtCursor) {
          // Detecta fundo branco no fullscreen
          const isOverWhiteBg = elementAtCursor.matches('[data-white-bg="true"]') || 
                               elementAtCursor.closest('[data-white-bg="true"]');
          
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
    
    // Event listeners - attach to fullscreen element
    const fullscreenElement = document.fullscreenElement as HTMLElement;
    if (fullscreenElement) {
      fullscreenElement.addEventListener('mousemove', handleMouseMove, { passive: true });
      fullscreenElement.addEventListener('mouseleave', handleMouseLeave);
      fullscreenElement.addEventListener('mouseenter', handleMouseEnter);
      
      // Esconde cursor padrão
      fullscreenElement.style.cursor = 'none';
      document.body.style.cursor = 'none';
    }
    
    // Inicia animação
    rafId.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (fullscreenElement) {
        fullscreenElement.removeEventListener('mousemove', handleMouseMove);
        fullscreenElement.removeEventListener('mouseleave', handleMouseLeave);
        fullscreenElement.removeEventListener('mouseenter', handleMouseEnter);
        fullscreenElement.style.cursor = '';
      }
      document.body.style.cursor = '';
      
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);
  
  return (
    <div className="pointer-events-none fixed inset-0 z-[999999]">
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
    </div>
  );
};

export default FullscreenCursor;