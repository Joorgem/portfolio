import React from 'react';
import { useNavigationStore } from '../stores/navigation.store';

const ScrollIndicator: React.FC = () => {
  const navigationState = useNavigationStore(state => state.navigationState);
  const zoomProgress = useNavigationStore(state => state.zoomProgress);
  
  // Mostra apenas quando está em órbita e ainda não começou o zoom significativo
  const shouldShow = navigationState === 'orbiting' && zoomProgress < 0.3;
  
  // Detecta se é mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!shouldShow) return null;

  return (
    <div 
      className={`
        fixed z-[9996] pointer-events-none
        transition-all duration-500 ease-out
        ${shouldShow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isMobile 
          ? 'bottom-14 left-1/2 -translate-x-1/2' 
          : 'bottom-4 left-1/2 -translate-x-1/2'
        }
      `}
    >
      <div className="flex items-center gap-2">
        {isMobile ? (
          <>
            {/* Touch/Swipe Icon para Mobile - Aprimorado */}
            <div className="relative flex items-center gap-3">
              {/* Seta swipe up */}
              <div className="flex items-center">
                <svg className="w-3 h-3 text-white/30 animate-scroll-arrows" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M6 2L4.5 3.5L6 5V2Z" />
                </svg>
              </div>
              
              <svg
                className="w-6 h-10 text-white/40"
                fill="none"
                viewBox="0 0 24 40"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Contorno arredondado */}
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="32"
                  rx="8"
                  ry="8"
                  className="stroke-white/30"
                  strokeWidth="1"
                  fill="none"
                />
                
                {/* Círculo do toque animado */}
                <circle
                  cx="12"
                  cy="20"
                  r="3"
                  className="fill-white/50 animate-touch-drag"
                />
              </svg>
              
              {/* Seta swipe down */}
              <div className="flex items-center">
                <svg className="w-3 h-3 text-white/30 animate-scroll-arrows" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M6 10L7.5 8.5L6 7V10Z" />
                </svg>
              </div>
            </div>

          </>
        ) : (
          <>
            {/* Mouse Icon para Desktop - Aprimorado */}
            <div className="relative flex items-center gap-3">
              {/* Seta para cima */}
              <div className="flex items-center">
                <svg className="w-3 h-3 text-white/30 animate-scroll-arrows" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M6 2L4.5 3.5L6 5V2Z" />
                </svg>
              </div>
              
              <svg
                className="w-5 h-8 text-white/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                viewBox="0 0 24 36"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Mouse body */}
                <rect
                  x="6"
                  y="4"
                  width="12"
                  height="20"
                  rx="6"
                  ry="6"
                  className="stroke-white/40"
                  fill="none"
                />
                
                {/* Scroll wheel com animação bidirecional */}
                <line
                  x1="12"
                  y1="11"
                  x2="12"
                  y2="13"
                  className="stroke-white/60 animate-scroll-wheel-up"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="11"
                  x2="12"
                  y2="13"
                  className="stroke-white/60 animate-scroll-wheel-down"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Seta para baixo */}
              <div className="flex items-center">
                <svg className="w-3 h-3 text-white/30 animate-scroll-arrows" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M6 10L7.5 8.5L6 7V10Z" />
                </svg>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default ScrollIndicator;