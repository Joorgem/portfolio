import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useNavigationFixed } from '../contexts/NavigationContextFixed';
import * as THREE from 'three';

/**
 * Posições exatas dos elementos no modelo (space_boi.glb)
 * Estas são as coordenadas no espaço do modelo antes de transformações
 */
const MODEL_POSITIONS = {
  about: [0, 350, 0],                        // Cabeça do astronauta
  projects: [-357.404, 392.646, 0],          // Planeta 1 (esquerda)
  experience: [375.469, 427.948, 0],         // Planeta 2 (direita)
  contact: [-341.988, 460.196, -117.028],    // Planeta 3 (esquerda-trás)
  testimonials: [199.634, 566.883, -221.001] // Planeta 4 (direita-trás)
};

/**
 * Configurações de órbita para cada elemento
 */
const ORBIT_CONFIG = {
  MAIN: {
    radius: 5,
    height: 1.8,
    fov: 75,
    rotationSpeed: 0.02
  },
  about: {
    radius: 2.5,
    height: 0.6,
    fov: 65,
    zoomRadius: 0.6,
    rotationSpeed: 0.03
  },
  projects: {
    radius: 2.0,
    height: 0.4,
    fov: 65,
    zoomRadius: 0.4,
    rotationSpeed: 0.03
  },
  experience: {
    radius: 2.5,
    height: 0.5,
    fov: 65,
    zoomRadius: 0.5,
    rotationSpeed: 0.03
  },
  contact: {
    radius: 2.5,
    height: 0.5,
    fov: 65,
    zoomRadius: 0.5,
    rotationSpeed: 0.03
  },
  testimonials: {
    radius: 2.2,
    height: 0.4,
    fov: 65,
    zoomRadius: 0.4,
    rotationSpeed: 0.03
  }
};

/**
 * Controlador Final de Câmera - Sistema robusto e preciso
 */
export const CameraControllerFinal = ({ astronautRef }) => {
  const { camera } = useThree();
  const { 
    navigationState,
    currentSection,
    targetSection,
    zoomProgress,
    fadeProgress
  } = useNavigationFixed();
  
  // Estado principal da câmera
  const state = useRef({
    // Órbita
    orbitAngle: 0,
    currentRadius: 5,
    currentHeight: 1.8,
    currentFov: 75,
    
    // Centro de órbita (atualizado dinamicamente)
    orbitCenter: new THREE.Vector3(0, 0, 0),
    
    // Para transições suaves
    targetCenter: new THREE.Vector3(0, 0, 0),
    targetRadius: 5,
    targetHeight: 1.8,
    targetFov: 75,
    
    // Controle
    activeSection: 'MAIN',
    isTransitioning: false,
    transitionProgress: 0
  });
  
  // Escala total aplicada ao modelo
  const totalScale = 0.01 * 0.4; // 0.004
  
  /**
   * Função crucial: Calcula posição mundial de um elemento
   * considerando rotação atual do astronauta
   */
  const calculateWorldPosition = (modelCoords, section) => {
    if (!modelCoords || section === 'MAIN') {
      return new THREE.Vector3(0, 0, 0);
    }
    
    // Passo 1: Aplica escala do modelo
    const scaled = new THREE.Vector3(
      modelCoords[0] * totalScale,
      modelCoords[1] * totalScale,
      modelCoords[2] * totalScale
    );
    
    // Passo 2: Aplica rotação atual do astronauta
    if (astronautRef?.current) {
      const rotation = astronautRef.current.rotation.y;
      const rotMatrix = new THREE.Matrix4().makeRotationY(rotation);
      scaled.applyMatrix4(rotMatrix);
      
      // Passo 3: Adiciona posição do astronauta
      const astronautPos = astronautRef.current.position;
      scaled.add(astronautPos);
    }
    
    return scaled;
  };
  
  /**
   * Atualiza configuração quando muda de seção
   */
  useEffect(() => {
    const newSection = targetSection || currentSection || 'MAIN';
    
    // Sempre atualiza quando targetSection muda (permite trocar entre planetas)
    if (targetSection && newSection !== state.current.activeSection) {
      console.log(`🎯 Câmera: Transição ${state.current.activeSection} → ${newSection}`);
      
      state.current.activeSection = newSection;
      state.current.isTransitioning = true;
      state.current.transitionProgress = 0;
      
      // Define configurações alvo
      const config = ORBIT_CONFIG[newSection] || ORBIT_CONFIG.MAIN;
      state.current.targetRadius = config.radius;
      state.current.targetHeight = config.height;
      state.current.targetFov = config.fov;
      
      // Se for MAIN, centro é origem
      if (newSection === 'MAIN') {
        state.current.targetCenter.set(0, 0, 0);
      }
      // Caso contrário, o centro será calculado dinamicamente no loop
    } else if (!targetSection && currentSection !== state.current.activeSection) {
      // Atualiza se currentSection mudou (para sincronizar após navegação)
      state.current.activeSection = currentSection;
    }
  }, [targetSection, currentSection]);
  
  /**
   * Loop principal - executado a cada frame
   */
  useFrame((frameState, delta) => {
    const section = state.current.activeSection;
    const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
    
    // ========================================
    // 1. ATUALIZA CENTRO DE ÓRBITA
    // ========================================
    if (section !== 'MAIN') {
      const modelPos = MODEL_POSITIONS[section];
      if (modelPos) {
        // IMPORTANTE: Recalcula posição a cada frame para seguir rotação
        const worldPos = calculateWorldPosition(modelPos, section);
        state.current.targetCenter.copy(worldPos);
      }
    }
    
    // ========================================
    // 2. MOVIMENTO ORBITAL
    // ========================================
    state.current.orbitAngle += delta * config.rotationSpeed;
    
    // ========================================
    // 3. TRANSIÇÃO SUAVE
    // ========================================
    if (state.current.isTransitioning) {
      state.current.transitionProgress += delta * 0.8;
      
      if (state.current.transitionProgress >= 1) {
        state.current.transitionProgress = 1;
        state.current.isTransitioning = false;
        console.log(`✅ Transição completa para ${section}`);
      }
      
      // Easing cúbico suave
      const t = state.current.transitionProgress;
      const eased = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Interpola valores
      state.current.orbitCenter.lerp(state.current.targetCenter, eased * 0.1);
      state.current.currentRadius = THREE.MathUtils.lerp(
        state.current.currentRadius,
        state.current.targetRadius,
        eased * 0.1
      );
      state.current.currentHeight = THREE.MathUtils.lerp(
        state.current.currentHeight,
        state.current.targetHeight,
        eased * 0.1
      );
      state.current.currentFov = THREE.MathUtils.lerp(
        state.current.currentFov,
        state.current.targetFov,
        eased * 0.1
      );
    } else {
      // Interpolação contínua para seguir movimento suave
      state.current.orbitCenter.lerp(state.current.targetCenter, delta * 8);
      state.current.currentRadius = THREE.MathUtils.lerp(
        state.current.currentRadius,
        state.current.targetRadius,
        delta * 5
      );
      state.current.currentHeight = THREE.MathUtils.lerp(
        state.current.currentHeight,
        state.current.targetHeight,
        delta * 5
      );
      state.current.currentFov = THREE.MathUtils.lerp(
        state.current.currentFov,
        state.current.targetFov,
        delta * 5
      );
    }
    
    // ========================================
    // 4. APLICAR ZOOM (se estiver em zoom)
    // ========================================
    let effectiveRadius = state.current.currentRadius;
    let effectiveHeight = state.current.currentHeight;
    let effectiveFov = state.current.currentFov;
    
    if (zoomProgress > 0 && section !== 'MAIN') {
      const zoomConfig = config.zoomRadius || 0.5;
      const zoomEased = zoomProgress * zoomProgress; // Easing quadrático
      
      effectiveRadius = THREE.MathUtils.lerp(
        state.current.currentRadius,
        zoomConfig,
        zoomEased
      );
      effectiveHeight = THREE.MathUtils.lerp(
        state.current.currentHeight,
        state.current.currentHeight * 0.3,
        zoomEased
      );
      effectiveFov = THREE.MathUtils.lerp(
        state.current.currentFov,
        30, // FOV bem fechado no zoom máximo
        zoomEased
      );
    }
    
    // ========================================
    // 5. CALCULA POSIÇÃO DA CÂMERA
    // ========================================
    const x = state.current.orbitCenter.x + 
              Math.cos(state.current.orbitAngle) * effectiveRadius;
    const y = state.current.orbitCenter.y + effectiveHeight;
    const z = state.current.orbitCenter.z + 
              Math.sin(state.current.orbitAngle) * effectiveRadius;
    
    // ========================================
    // 6. APLICA TRANSFORMAÇÕES
    // ========================================
    camera.position.set(x, y, z);
    camera.lookAt(state.current.orbitCenter);
    camera.fov = effectiveFov;
    camera.updateProjectionMatrix();
    
    // ========================================
    // 7. DEBUG (a cada 2 segundos)
    // ========================================
    if (frameState.clock.elapsedTime % 2 < delta && section !== 'MAIN') {
      console.log(`📍 Órbita ${section}:`, {
        centro: state.current.orbitCenter.toArray().map(n => n.toFixed(2)),
        raio: effectiveRadius.toFixed(2),
        zoom: `${(zoomProgress * 100).toFixed(0)}%`,
        rotação: astronautRef?.current?.rotation.y.toFixed(2) || '0'
      });
    }
  });
  
  return null;
};

export default CameraControllerFinal;