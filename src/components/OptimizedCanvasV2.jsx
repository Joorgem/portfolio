import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useNavigationV4 } from '../contexts/NavigationContextV4';

/**
 * Componente que controla renderização baseado no estado
 */
const RenderController = () => {
  const { gl, scene, camera } = useThree();
  const { canvas3DActive, navigationState } = useNavigationV4();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  // Controla loop de renderização
  useEffect(() => {
    if (!canvas3DActive) {
      // Pausa suave - renderiza um último frame
      gl.render(scene, camera);
      gl.setAnimationLoop(null);
      console.log('🛑 Canvas pausado');
    } else {
      // Resume renderização
      gl.setAnimationLoop(() => {
        gl.render(scene, camera);
        frameCount.current++;
      });
      console.log('▶️ Canvas resumido');
    }
    
    return () => {
      gl.setAnimationLoop(null);
    };
  }, [canvas3DActive, gl, scene, camera]);
  
  // Monitor de performance (desenvolvimento)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime.current;
      const fps = Math.round((frameCount.current * 1000) / delta);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 FPS: ${fps} | Estado: ${navigationState} | Canvas: ${canvas3DActive ? 'Ativo' : 'Pausado'}`);
      }
      
      frameCount.current = 0;
      lastTime.current = now;
    }, 2000);
    
    return () => clearInterval(interval);
  }, [navigationState, canvas3DActive]);
  
  return null;
};

/**
 * Canvas otimizado com controle inteligente
 */
export const OptimizedCanvasV2 = ({ children, ...props }) => {
  const { canvas3DActive, fadeProgress, navigationState } = useNavigationV4();
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const canvasRef = useRef();
  const screenshotTaken = useRef(false);
  
  // Captura screenshot quando apropriado
  useEffect(() => {
    if (!canvas3DActive && fadeProgress > 0.9 && !screenshotTaken.current) {
      // Tenta capturar screenshot
      const canvas = canvasRef.current?.querySelector('canvas');
      if (canvas) {
        try {
          const url = canvas.toDataURL('image/jpeg', 0.7);
          setScreenshotUrl(url);
          screenshotTaken.current = true;
          console.log('📸 Screenshot capturado');
        } catch (error) {
          console.error('Erro ao capturar screenshot:', error);
        }
      }
    } else if (canvas3DActive && screenshotTaken.current) {
      // Limpa screenshot quando retoma
      setScreenshotUrl(null);
      screenshotTaken.current = false;
    }
  }, [canvas3DActive, fadeProgress]);
  
  // Overlay de fade suave
  const FadeOverlay = () => (
    <div
      className="fixed inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        backgroundColor: '#000000',
        opacity: fadeProgress * 0.95, // Máximo 95% para manter alguma visibilidade
        zIndex: 5
      }}
    />
  );
  
  return (
    <>
      {/* Canvas 3D principal */}
      <div 
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ 
          display: canvas3DActive || !screenshotUrl ? 'block' : 'none',
          width: '100vw',
          height: '100vh'
        }}
      >
        <Canvas
          {...props}
          // Performance otimizada
          frameloop={canvas3DActive ? 'always' : 'never'}
          dpr={[1, 2]}
          performance={{
            min: 0.5,
            max: 1,
            debounce: 200
          }}
          // Shadows otimizadas
          shadows="soft"
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true // Necessário para screenshots
          }}
        >
          <RenderController />
          {children}
        </Canvas>
      </div>
      
      {/* Screenshot estático quando pausado */}
      {!canvas3DActive && screenshotUrl && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${screenshotUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${fadeProgress * 2}px)`, // Blur progressivo
            transform: `scale(${1 + fadeProgress * 0.05})` // Zoom sutil
          }}
        />
      )}
      
      {/* Overlay de fade */}
      <FadeOverlay />
    </>
  );
};

export default OptimizedCanvasV2;