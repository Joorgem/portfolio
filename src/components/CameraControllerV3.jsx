import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavigationV3 } from '../contexts/NavigationContextV3';
import * as THREE from 'three';

/**
 * Configurações precisas de órbita baseadas nas posições reais do modelo
 * Considerando todas as transformações aplicadas
 */
const ORBIT_CONFIG = {
  MAIN: {
    center: [0, 0, 0],
    radius: 5,
    height: 1.8,
    fov: 75
  },
  about: {
    // Cabeça do astronauta - posição [0, 350, 0] no modelo
    // Com scale 0.01 * 0.4 = 0.004
    center: [0, 1.4, 0], // 350 * 0.004 = 1.4
    radius: 2.5,
    height: 0.8,
    fov: 65,
    zoomRadius: 0.5,
  },
  projects: {
    // Planeta 1 - posição [-357.404, 392.646, 0] no modelo
    center: [-1.43, 1.57, 0], // [-357.404 * 0.004, 392.646 * 0.004, 0]
    radius: 2.5,
    height: 0.6,
    fov: 65,
    zoomRadius: 0.3,
  },
  experience: {
    // Planeta 2 - posição [375.469, 427.948, 0] no modelo
    center: [1.5, 1.71, 0], // [375.469 * 0.004, 427.948 * 0.004, 0]
    radius: 2.8,
    height: 0.7,
    fov: 65,
    zoomRadius: 0.4,
  },
  contact: {
    // Planeta 3 - posição [-341.988, 460.196, -117.028] no modelo
    center: [-1.37, 1.84, -0.47], // [-341.988 * 0.004, 460.196 * 0.004, -117.028 * 0.004]
    radius: 2.8,
    height: 0.7,
    fov: 65,
    zoomRadius: 0.4,
  },
  testimonials: {
    // Planeta 4 - posição [199.634, 566.883, -221.001] no modelo
    center: [0.8, 2.27, -0.88], // [199.634 * 0.004, 566.883 * 0.004, -221.001 * 0.004]
    radius: 3,
    height: 0.8,
    fov: 65,
    zoomRadius: 0.3,
  }
};

/**
 * Controlador de câmera com posições precisas e transições suaves
 */
export const CameraControllerV3 = ({ astronautRef }) => {
  const { camera } = useThree();
  const { 
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress
  } = useNavigationV3();
  
  // Refs para animação suave
  const currentOrbitCenter = useRef(new THREE.Vector3(0, 0, 0));
  const targetOrbitCenter = useRef(new THREE.Vector3(0, 0, 0));
  const currentRadius = useRef(5);
  const targetRadius = useRef(5);
  const currentHeight = useRef(1.8);
  const targetHeight = useRef(1.8);
  const currentFov = useRef(75);
  const targetFov = useRef(75);
  const orbitAngle = useRef(0);
  
  // Controle de transição
  const transitionProgress = useRef(0);
  const isTransitioning = useRef(false);
  const transitionSpeed = 0.8; // Velocidade reduzida para transições mais suaves
  
  // Atualiza alvo quando muda de seção
  useEffect(() => {
    const section = targetSection || currentSection || 'MAIN';
    const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
    
    if (targetSection && targetSection !== currentSection) {
      // Considera rotação do astronauta se existir
      if (astronautRef?.current && section !== 'MAIN') {
        const rotation = astronautRef.current.rotation.y;
        const rotationMatrix = new THREE.Matrix4().makeRotationY(rotation);
        
        // Aplica rotação ao centro de órbita
        const rotatedCenter = new THREE.Vector3(...config.center);
        rotatedCenter.applyMatrix4(rotationMatrix);
        
        // Adiciona posição do astronauta
        const astronautPos = astronautRef.current.position;
        rotatedCenter.add(astronautPos);
        
        targetOrbitCenter.current.copy(rotatedCenter);
      } else {
        targetOrbitCenter.current.set(...config.center);
      }
      
      targetRadius.current = config.radius;
      targetHeight.current = config.height;
      targetFov.current = config.fov;
      
      isTransitioning.current = true;
      transitionProgress.current = 0;
      
      console.log(`📸 Câmera: Movendo para ${section}`, {
        center: targetOrbitCenter.current.toArray(),
        radius: config.radius
      });
    }
  }, [targetSection, currentSection, astronautRef]);
  
  // Loop de animação da câmera
  useFrame((state, delta) => {
    // Movimento orbital muito mais lento
    orbitAngle.current += delta * 0.05; // Reduzido de 0.1 para 0.05
    
    // Transição suave entre seções
    if (isTransitioning.current) {
      transitionProgress.current += delta * transitionSpeed; // Mais lento
      const t = Math.min(1, transitionProgress.current);
      
      // Easing function smoother (ease-in-out cubic)
      const eased = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Interpola todos os valores
      currentOrbitCenter.current.lerp(targetOrbitCenter.current, eased);
      currentRadius.current = THREE.MathUtils.lerp(currentRadius.current, targetRadius.current, eased);
      currentHeight.current = THREE.MathUtils.lerp(currentHeight.current, targetHeight.current, eased);
      currentFov.current = THREE.MathUtils.lerp(currentFov.current, targetFov.current, eased);
      
      if (t >= 1) {
        isTransitioning.current = false;
        console.log('✅ Transição de câmera completa');
      }
    }
    
    // Aplica zoom baseado no progresso (mais suave)
    const section = targetSection || currentSection || 'MAIN';
    const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
    
    if (navigationState === 'zooming_in' || navigationState === 'entering') {
      const targetZoomRadius = config.zoomRadius || 0.3;
      const baseRadius = isTransitioning.current ? targetRadius.current : config.radius;
      
      // Easing mais suave para o zoom
      const zoomEased = zoomProgress * zoomProgress * (3 - 2 * zoomProgress);
      
      currentRadius.current = THREE.MathUtils.lerp(
        currentRadius.current,
        THREE.MathUtils.lerp(baseRadius, targetZoomRadius, zoomEased),
        delta * 2 // Velocidade de interpolação reduzida
      );
      
      // Ajusta altura gradualmente
      currentHeight.current = THREE.MathUtils.lerp(
        currentHeight.current,
        config.height * (1 - zoomEased * 0.5),
        delta * 2
      );
      
      // FOV muda mais suavemente
      const targetZoomFov = 45;
      currentFov.current = THREE.MathUtils.lerp(
        currentFov.current,
        THREE.MathUtils.lerp(config.fov, targetZoomFov, zoomEased),
        delta * 2
      );
    } else if (navigationState === 'zooming_out' || navigationState === 'exiting') {
      // Volta ao raio normal suavemente
      currentRadius.current = THREE.MathUtils.lerp(
        currentRadius.current,
        config.radius,
        delta * 2 // Mais suave
      );
      currentHeight.current = THREE.MathUtils.lerp(
        currentHeight.current,
        config.height,
        delta * 2
      );
      currentFov.current = THREE.MathUtils.lerp(
        currentFov.current,
        config.fov,
        delta * 2
      );
    }
    
    // Atualiza centro de órbita continuamente se astronauta estiver rotacionando
    if (!isTransitioning.current && astronautRef?.current && section !== 'MAIN') {
      const rotation = astronautRef.current.rotation.y;
      const rotationMatrix = new THREE.Matrix4().makeRotationY(rotation);
      
      // Recalcula centro baseado na rotação atual
      const rotatedCenter = new THREE.Vector3(...config.center);
      rotatedCenter.applyMatrix4(rotationMatrix);
      
      const astronautPos = astronautRef.current.position;
      rotatedCenter.add(astronautPos);
      
      // Interpola suavemente para o novo centro
      currentOrbitCenter.current.lerp(rotatedCenter, delta * 5);
    }
    
    // Calcula posição da câmera com órbita suave
    const x = currentOrbitCenter.current.x + Math.cos(orbitAngle.current) * currentRadius.current;
    const y = currentOrbitCenter.current.y + currentHeight.current;
    const z = currentOrbitCenter.current.z + Math.sin(orbitAngle.current) * currentRadius.current;
    
    // Aplica posição e olhar
    camera.position.set(x, y, z);
    camera.lookAt(currentOrbitCenter.current);
    
    // Atualiza FOV suavemente
    camera.fov = currentFov.current;
    camera.updateProjectionMatrix();
  });
  
  return null;
};

export default CameraControllerV3;