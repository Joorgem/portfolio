import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavigationV2 } from '../contexts/NavigationContextV2';
import * as THREE from 'three';

/**
 * Configurações de órbita para cada seção
 */
const ORBIT_CONFIG = {
  MAIN: {
    center: [0, 0, 0],
    radius: 5,
    height: 1.8,
    fov: 75
  },
  about: {
    center: [0, 1.4, 0], // Posição da cabeça ajustada
    radius: 3,
    height: 0.5,
    fov: 75,
    zoomRadius: 0.3, // Distância mínima no zoom máximo
  },
  projects: {
    center: [-1.4, 1.6, 0], // Planeta 1 ajustado
    radius: 3,
    height: 0.5,
    fov: 75,
    zoomRadius: 0.2,
  },
  experience: {
    center: [1.5, 1.7, 0], // Planeta 2 ajustado
    radius: 3,
    height: 0.5,
    fov: 75,
    zoomRadius: 0.25,
  },
  contact: {
    center: [-1.4, 1.8, -0.5], // Planeta 3 ajustado
    radius: 3,
    height: 0.5,
    fov: 75,
    zoomRadius: 0.25,
  },
  testimonials: {
    center: [0.8, 2.3, -0.9], // Planeta 4 ajustado
    radius: 3,
    height: 0.5,
    fov: 75,
    zoomRadius: 0.2,
  }
};

/**
 * Controlador de câmera simplificado
 * Apenas responde aos comandos do NavigationContext
 */
export const CameraControllerV2 = ({ astronautRef }) => {
  const { camera } = useThree();
  const { 
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress
  } = useNavigationV2();
  
  // Refs para animação suave
  const currentOrbitCenter = useRef(new THREE.Vector3(0, 0, 0));
  const targetOrbitCenter = useRef(new THREE.Vector3(0, 0, 0));
  const currentRadius = useRef(5);
  const currentHeight = useRef(1.8);
  const currentFov = useRef(75);
  const orbitAngle = useRef(0);
  
  // Refs para transição
  const transitionProgress = useRef(0);
  const isTransitioning = useRef(false);
  
  /**
   * Atualiza configuração de órbita baseado na seção
   */
  useEffect(() => {
    const section = targetSection || currentSection || 'MAIN';
    const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
    
    // Se mudou de seção, inicia transição
    if (targetSection && targetSection !== currentSection) {
      targetOrbitCenter.current.set(...config.center);
      isTransitioning.current = true;
      transitionProgress.current = 0;
      console.log(`📸 Câmera: Transicionando para ${section}`);
    }
  }, [targetSection, currentSection]);
  
  /**
   * Loop de animação da câmera
   */
  useFrame((state, delta) => {
    // Movimento orbital contínuo (mais lento)
    orbitAngle.current += delta * 0.1; // Velocidade reduzida
    
    // Transição suave entre seções
    if (isTransitioning.current) {
      transitionProgress.current += delta * 2; // Velocidade da transição
      const t = Math.min(1, transitionProgress.current);
      
      // Easing function (ease-in-out)
      const eased = t < 0.5 
        ? 2 * t * t 
        : -1 + (4 - 2 * t) * t;
      
      // Interpola centro de órbita
      currentOrbitCenter.current.lerp(targetOrbitCenter.current, eased);
      
      if (t >= 1) {
        isTransitioning.current = false;
      }
    }
    
    // Aplica zoom baseado no progresso
    const section = targetSection || currentSection || 'MAIN';
    const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
    
    if (navigationState === 'zooming_in' || navigationState === 'entering') {
      // Interpola raio baseado no zoom progress
      const targetRadius = config.zoomRadius || 0.3;
      const baseRadius = config.radius;
      currentRadius.current = THREE.MathUtils.lerp(
        baseRadius,
        targetRadius,
        zoomProgress * zoomProgress // Easing quadrático
      );
      
      // Ajusta altura para ficar mais próximo
      currentHeight.current = THREE.MathUtils.lerp(
        config.height,
        config.height * 0.3,
        zoomProgress
      );
      
      // Ajusta FOV para efeito mais imersivo
      const targetFov = 45; // FOV menor = mais zoom
      currentFov.current = THREE.MathUtils.lerp(
        config.fov,
        targetFov,
        zoomProgress
      );
    } else if (navigationState === 'zooming_out' || navigationState === 'exiting') {
      // Volta ao raio normal
      currentRadius.current = THREE.MathUtils.lerp(
        currentRadius.current,
        config.radius,
        delta * 3
      );
      currentHeight.current = THREE.MathUtils.lerp(
        currentHeight.current,
        config.height,
        delta * 3
      );
      currentFov.current = THREE.MathUtils.lerp(
        currentFov.current,
        config.fov,
        delta * 3
      );
    } else if (navigationState === 'orbiting') {
      // Órbita normal
      currentRadius.current = THREE.MathUtils.lerp(
        currentRadius.current,
        config.radius,
        delta * 5
      );
    }
    
    // Calcula posição da câmera
    const x = currentOrbitCenter.current.x + Math.cos(orbitAngle.current) * currentRadius.current;
    const y = currentOrbitCenter.current.y + currentHeight.current;
    const z = currentOrbitCenter.current.z + Math.sin(orbitAngle.current) * currentRadius.current;
    
    // Aplica posição e olhar
    camera.position.set(x, y, z);
    camera.lookAt(currentOrbitCenter.current);
    
    // Atualiza FOV
    camera.fov = currentFov.current;
    camera.updateProjectionMatrix();
  });
  
  return null;
};

export default CameraControllerV2;