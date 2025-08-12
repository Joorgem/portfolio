import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavigationV4 } from '../contexts/NavigationContextV4';
import * as THREE from 'three';

/**
 * Configurações de órbita com posições precisas
 * Baseadas nas posições reais do modelo Astronaut.jsx
 */
const PLANET_POSITIONS = {
  about: [0, 350, 0],                        // Cabeça
  projects: [-357.404, 392.646, 0],          // Planeta 1
  experience: [375.469, 427.948, 0],         // Planeta 2  
  contact: [-341.988, 460.196, -117.028],    // Planeta 3
  testimonials: [199.634, 566.883, -221.001] // Planeta 4
};

/**
 * Controlador de câmera V5 - Sistema completamente refeito
 * Foco em precisão e suavidade
 */
export const CameraControllerV5 = ({ astronautRef }) => {
  const { camera } = useThree();
  const { 
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress
  } = useNavigationV4();
  
  // Estado da câmera
  const cameraState = useRef({
    // Posição atual
    position: new THREE.Vector3(0, 1.8, 5),
    lookAt: new THREE.Vector3(0, 0, 0),
    
    // Parâmetros orbitais
    orbitAngle: 0,
    orbitRadius: 5,
    orbitHeight: 1.8,
    orbitCenter: new THREE.Vector3(0, 0, 0),
    
    // FOV
    fov: 75,
    
    // Controle de transição
    isTransitioning: false,
    transitionProgress: 0
  });
  
  // Alvo da câmera
  const targetState = useRef({
    orbitCenter: new THREE.Vector3(0, 0, 0),
    orbitRadius: 5,
    orbitHeight: 1.8,
    fov: 75
  });
  
  // Refs auxiliares
  const modelScale = 0.01 * 0.4; // Scale total aplicado ao modelo
  const lastSection = useRef('MAIN');
  
  /**
   * Calcula posição mundial de um ponto do modelo
   */
  const getWorldPosition = (modelPosition, includeRotation = true) => {
    const pos = new THREE.Vector3(...modelPosition);
    
    // Aplica scale do modelo
    pos.multiplyScalar(modelScale);
    
    // Aplica rotação do astronauta se necessário
    if (includeRotation && astronautRef?.current) {
      const rotation = astronautRef.current.rotation.y;
      const matrix = new THREE.Matrix4().makeRotationY(rotation);
      pos.applyMatrix4(matrix);
    }
    
    // Adiciona posição do astronauta
    if (astronautRef?.current) {
      const astronautPos = astronautRef.current.position;
      pos.add(astronautPos);
    }
    
    return pos;
  };
  
  /**
   * Atualiza alvo quando muda de seção
   */
  useEffect(() => {
    const section = targetSection || currentSection || 'MAIN';
    
    if (section !== lastSection.current) {
      console.log(`📸 Câmera: Mudando para ${section}`);
      lastSection.current = section;
      
      if (section === 'MAIN') {
        // Volta para visão principal
        targetState.current.orbitCenter.set(0, 0, 0);
        targetState.current.orbitRadius = 5;
        targetState.current.orbitHeight = 1.8;
        targetState.current.fov = 75;
      } else {
        // Órbita ao redor do planeta selecionado
        const planetPosition = PLANET_POSITIONS[section];
        if (planetPosition) {
          // NÃO aplica rotação aqui - será aplicada no loop
          const worldPos = getWorldPosition(planetPosition, false);
          targetState.current.orbitCenter.copy(worldPos);
          
          // Configurações de órbita por seção
          switch(section) {
            case 'about':
              targetState.current.orbitRadius = 2.5;
              targetState.current.orbitHeight = 0.5;
              break;
            case 'projects':
            case 'testimonials':
              targetState.current.orbitRadius = 2.2;
              targetState.current.orbitHeight = 0.4;
              break;
            default:
              targetState.current.orbitRadius = 2.8;
              targetState.current.orbitHeight = 0.6;
          }
          
          targetState.current.fov = 65;
        }
      }
      
      // Ativa transição suave
      cameraState.current.isTransitioning = true;
      cameraState.current.transitionProgress = 0;
    }
  }, [targetSection, currentSection]);
  
  /**
   * Loop principal de animação
   */
  useFrame((state, delta) => {
    // Movimento orbital contínuo (bem lento)
    cameraState.current.orbitAngle += delta * 0.02; // Muito lento
    
    // Se está orbitando um planeta, atualiza centro baseado na rotação atual
    const section = targetSection || currentSection || 'MAIN';
    if (section !== 'MAIN' && astronautRef?.current) {
      const planetPosition = PLANET_POSITIONS[section];
      if (planetPosition) {
        // Recalcula posição mundial com rotação atual
        const worldPos = getWorldPosition(planetPosition, true);
        targetState.current.orbitCenter.copy(worldPos);
      }
    }
    
    // Transição suave para o alvo
    if (cameraState.current.isTransitioning) {
      cameraState.current.transitionProgress += delta * 0.6; // Transição lenta
      
      if (cameraState.current.transitionProgress >= 1) {
        cameraState.current.transitionProgress = 1;
        cameraState.current.isTransitioning = false;
      }
      
      // Easing suave
      const t = 1 - Math.exp(-3 * cameraState.current.transitionProgress);
      
      // Interpola centro orbital
      cameraState.current.orbitCenter.lerp(targetState.current.orbitCenter, t * 0.05);
      cameraState.current.orbitRadius = THREE.MathUtils.lerp(
        cameraState.current.orbitRadius,
        targetState.current.orbitRadius,
        t * 0.05
      );
      cameraState.current.orbitHeight = THREE.MathUtils.lerp(
        cameraState.current.orbitHeight,
        targetState.current.orbitHeight,
        t * 0.05
      );
      cameraState.current.fov = THREE.MathUtils.lerp(
        cameraState.current.fov,
        targetState.current.fov,
        t * 0.05
      );
    } else {
      // Interpolação contínua mesmo fora de transição (para seguir rotação)
      cameraState.current.orbitCenter.lerp(targetState.current.orbitCenter, delta * 5);
      cameraState.current.orbitRadius = THREE.MathUtils.lerp(
        cameraState.current.orbitRadius,
        targetState.current.orbitRadius,
        delta * 3
      );
      cameraState.current.orbitHeight = THREE.MathUtils.lerp(
        cameraState.current.orbitHeight,
        targetState.current.orbitHeight,
        delta * 3
      );
      cameraState.current.fov = THREE.MathUtils.lerp(
        cameraState.current.fov,
        targetState.current.fov,
        delta * 3
      );
    }
    
    // APLICAR ZOOM - Modifica raio baseado no progresso
    let finalRadius = cameraState.current.orbitRadius;
    let finalHeight = cameraState.current.orbitHeight;
    let finalFov = cameraState.current.fov;
    
    if ((navigationState === 'zooming_in' || navigationState === 'entering') && zoomProgress > 0) {
      // Calcula zoom baseado na seção
      const zoomFactor = zoomProgress * zoomProgress; // Easing quadrático
      
      if (section === 'about') {
        // Zoom mais próximo para cabeça
        finalRadius = THREE.MathUtils.lerp(cameraState.current.orbitRadius, 0.5, zoomFactor);
        finalHeight = THREE.MathUtils.lerp(cameraState.current.orbitHeight, 0.2, zoomFactor);
      } else if (section !== 'MAIN') {
        // Zoom para planetas
        finalRadius = THREE.MathUtils.lerp(cameraState.current.orbitRadius, 0.4, zoomFactor);
        finalHeight = THREE.MathUtils.lerp(cameraState.current.orbitHeight, 0.15, zoomFactor);
      }
      
      // FOV diminui no zoom (mais zoom)
      finalFov = THREE.MathUtils.lerp(65, 35, zoomFactor);
    } else if (navigationState === 'zooming_out' || navigationState === 'exiting') {
      // Voltando ao normal
      const zoomFactor = 1 - zoomProgress;
      finalRadius = THREE.MathUtils.lerp(0.4, cameraState.current.orbitRadius, zoomFactor);
      finalHeight = THREE.MathUtils.lerp(0.15, cameraState.current.orbitHeight, zoomFactor);
      finalFov = THREE.MathUtils.lerp(35, 65, zoomFactor);
    }
    
    // Calcula posição da câmera na órbita
    const x = cameraState.current.orbitCenter.x + 
              Math.cos(cameraState.current.orbitAngle) * finalRadius;
    const y = cameraState.current.orbitCenter.y + finalHeight;
    const z = cameraState.current.orbitCenter.z + 
              Math.sin(cameraState.current.orbitAngle) * finalRadius;
    
    // Suaviza movimento da câmera
    cameraState.current.position.lerp(new THREE.Vector3(x, y, z), delta * 10);
    cameraState.current.lookAt.lerp(cameraState.current.orbitCenter, delta * 10);
    
    // Aplica posição e olhar
    camera.position.copy(cameraState.current.position);
    camera.lookAt(cameraState.current.lookAt);
    
    // Atualiza FOV
    camera.fov = finalFov;
    camera.updateProjectionMatrix();
    
    // Debug
    if (state.clock.elapsedTime % 2 < delta) {
      if (section !== 'MAIN') {
        console.log(`📍 Órbita: ${section}`, {
          center: cameraState.current.orbitCenter.toArray().map(n => n.toFixed(2)),
          radius: finalRadius.toFixed(2),
          zoom: (zoomProgress * 100).toFixed(0) + '%'
        });
      }
    }
  });
  
  return null;
};

export default CameraControllerV5;