import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useNavigation } from '../contexts/NavigationContext';

/**
 * Componente que controla pause/resume da renderização
 */
const RenderController = () => {
  const { gl, scene, camera } = useThree();
  const { canvas3DActive, pauseCanvas3D, currentSection, fadeProgress } = useNavigation();
  const screenshotTaken = useRef(false);
  
  // Controla o frameloop baseado no estado
  useEffect(() => {
    if (!canvas3DActive) {
      // Pausa renderização
      gl.setAnimationLoop(null);
      console.log('🛑 Renderização 3D pausada');
      
      // Tira screenshot se ainda não tirou
      if (!screenshotTaken.current && fadeProgress > 0.8) {
        try {
          gl.render(scene, camera);
          const screenshot = gl.domElement.toDataURL('image/jpeg', 0.8);
          pauseCanvas3D(screenshot);
          screenshotTaken.current = true;
          console.log('📸 Screenshot capturado');
        } catch (error) {
          console.error('Erro ao capturar screenshot:', error);
        }
      }
    } else {
      // Resume renderização
      gl.setAnimationLoop(() => {
        gl.render(scene, camera);
      });
      screenshotTaken.current = false;
      console.log('▶️ Renderização 3D resumida');
    }
  }, [canvas3DActive, gl, scene, camera, fadeProgress, pauseCanvas3D]);
  
  return null;
};

/**
 * Canvas otimizado com controle de renderização
 */
export const OptimizedCanvas = ({ children, ...props }) => {
  const { canvas3DActive, canvasScreenshot } = useNavigation();
  const [showCanvas, setShowCanvas] = useState(true);
  const canvasRef = useRef();
  
  // Controla visibilidade do canvas vs screenshot
  useEffect(() => {
    if (!canvas3DActive && canvasScreenshot) {
      // Delay pequeno para garantir screenshot
      setTimeout(() => {
        setShowCanvas(false);
      }, 100);
    } else {
      setShowCanvas(true);
    }
  }, [canvas3DActive, canvasScreenshot]);
  
  return (
    <>
      {/* Canvas 3D */}
      <div 
        ref={canvasRef}
        style={{ 
          display: showCanvas ? 'block' : 'none',
          width: '100%',
          height: '100%'
        }}
      >
        <Canvas
          {...props}
          // Controla renderização baseado no estado
          frameloop={canvas3DActive ? 'always' : 'never'}
          // Otimizações
          dpr={[1, 2]} // Device pixel ratio
          performance={{
            min: 0.5, // FPS mínimo antes de reduzir qualidade
            max: 1,   // Qualidade máxima
            debounce: 200 // Debounce para mudanças de performance
          }}
        >
          <RenderController />
          {children}
        </Canvas>
      </div>
      
      {/* Screenshot estático quando pausado */}
      {!showCanvas && canvasScreenshot && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            width: '100vw',
            height: '100vh',
            backgroundImage: `url(${canvasScreenshot})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            imageRendering: 'crisp-edges'
          }}
        />
      )}
    </>
  );
};

/**
 * Hook para controlar animações baseado no estado
 */
export const useOptimizedFrame = (callback, dependencies = []) => {
  const { canvas3DActive } = useNavigation();
  
  useFrame((state, delta) => {
    // Só executa callback se canvas está ativo
    if (canvas3DActive) {
      callback(state, delta);
    }
  }, dependencies);
};

export default OptimizedCanvas;