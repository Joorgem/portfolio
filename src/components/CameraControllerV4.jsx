import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavigationV4 } from '../contexts/NavigationContextV4';
import * as THREE from 'three';

/**
 * Configurações precisas de órbita
 */
const ORBIT_CONFIG = {
  MAIN: {
    center: [0, 0, 0],
    radius: 5,
    height: 1.8,
    fov: 75
  },
  about: {
    center: [0, 1.4, 0],
    radius: 3,
    height: 0.8,
    fov: 65,
    zoomRadius: 0.8, // Aumentado para zoom mais visível
  },
  projects: {
    center: [-1.43, 1.57, 0],
    radius: 3,
    height: 0.6,
    fov: 65,
    zoomRadius: 0.6,
  },
  experience: {
    center: [1.5, 1.71, 0],
    radius: 3.2,
    height: 0.7,
    fov: 65,
    zoomRadius: 0.7,
  },
  contact: {
    center: [-1.37, 1.84, -0.47],
    radius: 3.2,
    height: 0.7,
    fov: 65,
    zoomRadius: 0.7,
  },
  testimonials: {
    center: [0.8, 2.27, -0.88],
    radius: 3.5,
    height: 0.8,
    fov: 65,
    zoomRadius: 0.6,
  }
};

export const CameraControllerV4 = ({ astronautRef }) => {
  const { camera } = useThree();
  const { 
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress
  } = useNavigationV4();
  
  // Estado atual da câmera
  const currentState = useRef({
    center: new THREE.Vector3(0, 0, 0),
    radius: 5,
    height: 1.8,
    fov: 75,
    angle: 0
  });
  
  // Estado alvo da câmera
  const targetState = useRef({
    center: new THREE.Vector3(0, 0, 0),
    radius: 5,
    height: 1.8,
    fov: 75
  });
  
  // Controle de transição
  const transitionActive = useRef(false);
  const transitionProgress = useRef(0);
  
  // Atualiza alvo quando muda de seção
  useEffect(() => {
    const section = targetSection || currentSection || 'MAIN';
    const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
    
    console.log(`🎯 Camera target: ${section}`, config);
    
    // Sempre atualiza o alvo quando há mudança
    if (targetSection !== null || currentSection !== 'MAIN') {
      // Calcula posição considerando rotação do astronauta
      let finalCenter = new THREE.Vector3(...config.center);
      
      if (astronautRef?.current && section !== 'MAIN') {
        const rotation = astronautRef.current.rotation.y;
        const rotationMatrix = new THREE.Matrix4().makeRotationY(rotation);
        finalCenter.applyMatrix4(rotationMatrix);
        
        const astronautPos = astronautRef.current.position;
        finalCenter.add(astronautPos);
      }
      
      targetState.current.center.copy(finalCenter);
      targetState.current.radius = config.radius;
      targetState.current.height = config.height;
      targetState.current.fov = config.fov;
      
      // Ativa transição suave
      if (section !== 'MAIN') {
        transitionActive.current = true;
        transitionProgress.current = 0;
      }
    }
  }, [targetSection, currentSection, astronautRef]);
  
  // Loop de animação
  useFrame((state, delta) => {
    // Movimento orbital contínuo (muito lento)
    currentState.current.angle += delta * 0.03; // Ainda mais lento
    
    // Transição suave para o alvo
    if (transitionActive.current) {
      transitionProgress.current += delta * 0.5; // Transição bem lenta
      
      if (transitionProgress.current >= 1) {
        transitionProgress.current = 1;
        transitionActive.current = false;
      }
      
      // Easing suave exponencial
      const t = 1 - Math.exp(-5 * transitionProgress.current);
      
      // Interpola todos os valores
      currentState.current.center.lerp(targetState.current.center, t * 0.05);
      currentState.current.radius = THREE.MathUtils.lerp(
        currentState.current.radius,
        targetState.current.radius,
        t * 0.05
      );
      currentState.current.height = THREE.MathUtils.lerp(
        currentState.current.height,
        targetState.current.height,
        t * 0.05
      );
      currentState.current.fov = THREE.MathUtils.lerp(
        currentState.current.fov,
        targetState.current.fov,
        t * 0.05
      );
    } else {
      // Interpolação contínua mesmo sem transição (mais suave)
      currentState.current.center.lerp(targetState.current.center, delta * 2);
      currentState.current.radius = THREE.MathUtils.lerp(
        currentState.current.radius,
        targetState.current.radius,
        delta * 2
      );
      currentState.current.height = THREE.MathUtils.lerp(
        currentState.current.height,
        targetState.current.height,
        delta * 2
      );
      currentState.current.fov = THREE.MathUtils.lerp(
        currentState.current.fov,
        targetState.current.fov,
        delta * 2
      );
    }
    
    // ZOOM VISUAL - Aplica zoom baseado no progresso
    if (navigationState === 'zooming_in' || navigationState === 'entering') {
      const section = targetSection || currentSection || 'MAIN';
      const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
      
      if (config.zoomRadius) {
        // Interpola raio baseado no zoom progress
        const targetZoomRadius = config.zoomRadius;
        const baseRadius = config.radius;
        
        // Easing suave para o zoom
        const zoomEased = zoomProgress * zoomProgress;
        
        // Atualiza target state para zoom
        targetState.current.radius = THREE.MathUtils.lerp(
          baseRadius,
          targetZoomRadius,
          zoomEased
        );
        
        // Ajusta altura e FOV durante zoom
        targetState.current.height = config.height * (1 - zoomEased * 0.3);
        targetState.current.fov = THREE.MathUtils.lerp(65, 40, zoomEased);
      }
    } else if (navigationState === 'zooming_out' || navigationState === 'exiting') {
      // Volta aos valores normais
      const section = currentSection === 'MAIN' ? 'MAIN' : targetSection || currentSection;
      const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
      
      targetState.current.radius = config.radius;
      targetState.current.height = config.height;
      targetState.current.fov = config.fov;
    }
    
    // Atualiza centro continuamente se astronauta estiver rotacionando
    if (astronautRef?.current && currentSection !== 'MAIN' && !transitionActive.current) {
      const section = targetSection || currentSection;
      const config = ORBIT_CONFIG[section];
      
      if (config) {
        const rotation = astronautRef.current.rotation.y;
        const rotationMatrix = new THREE.Matrix4().makeRotationY(rotation);
        
        const rotatedCenter = new THREE.Vector3(...config.center);
        rotatedCenter.applyMatrix4(rotationMatrix);
        
        const astronautPos = astronautRef.current.position;
        rotatedCenter.add(astronautPos);
        
        targetState.current.center.lerp(rotatedCenter, delta * 3);
      }
    }
    
    // Calcula posição da câmera
    const x = currentState.current.center.x + 
              Math.cos(currentState.current.angle) * currentState.current.radius;
    const y = currentState.current.center.y + currentState.current.height;
    const z = currentState.current.center.z + 
              Math.sin(currentState.current.angle) * currentState.current.radius;
    
    // Aplica posição e olhar
    camera.position.set(x, y, z);
    camera.lookAt(currentState.current.center);
    
    // Atualiza FOV
    camera.fov = currentState.current.fov;
    camera.updateProjectionMatrix();
  });
  
  return null;
};

export default CameraControllerV4;