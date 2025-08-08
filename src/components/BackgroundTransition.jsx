import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Componente que gerencia transições de cor de fundo da cena 3D
 */
export const BackgroundTransition = ({ 
  targetColor = null,
  transitionDuration = 1.0,
  onTransitionComplete 
}) => {
  const { gl, scene } = useThree();
  
  // Refs para controle de animação
  const currentColor = useRef(new THREE.Color(0x000000)); // Começa preto
  const targetColorRef = useRef(new THREE.Color(0x000000));
  const animationProgress = useRef(0);
  const isAnimating = useRef(false);
  const startColor = useRef(new THREE.Color());
  
  // Atualiza cor target quando prop muda
  React.useEffect(() => {
    if (targetColor) {
      // Nova cor target
      const newTarget = new THREE.Color(targetColor);
      
      if (!currentColor.current.equals(newTarget)) {
        startColor.current.copy(currentColor.current);
        targetColorRef.current.copy(newTarget);
        animationProgress.current = 0;
        isAnimating.current = true;
        
        console.log(`🎨 Iniciando transição de cor para: ${targetColor}`);
      }
    } else {
      // Volta para transparente (sem background)
      startColor.current.copy(currentColor.current);
      targetColorRef.current.set(0x000011); // Cor muito escura
      animationProgress.current = 0;
      isAnimating.current = true;
      
      console.log('🎨 Removendo background');
    }
  }, [targetColor]);
  
  // Loop de animação
  useFrame((state, delta) => {
    if (isAnimating.current) {
      // Incrementa progresso
      animationProgress.current += delta / transitionDuration;
      const progress = Math.min(animationProgress.current, 1);
      
      // Easing suave
      const easedProgress = progress * progress * (3 - 2 * progress);
      
      // Interpola cor
      currentColor.current.lerpColors(
        startColor.current, 
        targetColorRef.current, 
        easedProgress
      );
      
      // Aplica cor de fundo da cena
      if (targetColor) {
        scene.background = currentColor.current;
      } else if (progress > 0.8) {
        // Remove background quando quase completou
        scene.background = null;
      }
      
      // Finaliza animação
      if (progress >= 1) {
        isAnimating.current = false;
        
        if (onTransitionComplete) {
          onTransitionComplete(targetColor);
        }
        
        console.log(`✅ Transição de cor completada: ${targetColor || 'removido'}`);
      }
    }
  });
  
  return null; // Componente invisível
};

/**
 * Componente que cria overlay de transição suave sobre a cena
 */
export const ScreenOverlay = ({ 
  color = null,
  opacity = 0,
  duration = 0.5,
  className = ""
}) => {
  const overlayRef = useRef();
  const [currentOpacity, setCurrentOpacity] = React.useState(0);
  const targetOpacity = useRef(0);
  const animationProgress = useRef(0);
  const isAnimating = useRef(false);
  
  // Atualiza quando props mudam
  React.useEffect(() => {
    const newOpacity = color ? opacity : 0;
    
    if (newOpacity !== currentOpacity) {
      targetOpacity.current = newOpacity;
      animationProgress.current = 0;
      isAnimating.current = true;
    }
  }, [color, opacity, currentOpacity]);
  
  // Animação com requestAnimationFrame
  React.useEffect(() => {
    if (!isAnimating.current) return;
    
    const animate = () => {
      animationProgress.current += 1 / (duration * 60); // Assume 60fps
      const progress = Math.min(animationProgress.current, 1);
      
      // Easing
      const easedProgress = progress * progress * (3 - 2 * progress);
      
      // Interpola opacidade
      const newOpacity = currentOpacity + (targetOpacity.current - currentOpacity) * easedProgress;
      setCurrentOpacity(newOpacity);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
      }
    };
    
    requestAnimationFrame(animate);
  }, [currentOpacity, duration]);
  
  if (!color && currentOpacity <= 0) {
    return null;
  }
  
  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 pointer-events-none transition-all ${className}`}
      style={{
        backgroundColor: color || '#000000',
        opacity: currentOpacity,
        zIndex: 5 // Acima da cena 3D (z-0) mas abaixo do texto (z-10)
      }}
    />
  );
};

export default BackgroundTransition;