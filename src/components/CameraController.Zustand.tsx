import React, { useRef, useEffect } from 'react';
import { useFrame, useThree, RootState } from '@react-three/fiber';
import { useNavigationStore } from '../stores/navigation.store';
import * as THREE from 'three';

interface CameraControllerZustandProps {
  astronautRef: React.RefObject<THREE.Group>;
}

/**
 * Posições exatas dos elementos no modelo (space_boi.glb)
 * Estas são as coordenadas no espaço do modelo antes de transformações
 */
const MODEL_POSITIONS: Record<string, [number, number, number]> = {
  about: [0, 350, 0],                        // Cabeça do astronauta
  projects: [-357.404, 392.646, 0],          // Planeta 1 (esquerda)
  experience: [375.469, 427.948, 0],         // Planeta 2 (direita)
  contact: [-341.988, 460.196, -117.028],    // Planeta 3 (esquerda-trás)
  testimonials: [199.634, 566.883, -221.001] // Planeta 4 (direita-trás)
};

/**
 * Configurações de órbita para cada elemento
 */
interface OrbitConfig {
  radius: number;
  height: number;
  fov: number;
  zoomRadius?: number;
  rotationSpeed: number;
}

const ORBIT_CONFIG: Record<string, OrbitConfig> = {
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

interface CameraState {
  // Órbita
  orbitAngle: number;
  currentRadius: number;
  currentHeight: number;
  currentFov: number;
  
  // Centro de órbita (atualizado dinamicamente)
  orbitCenter: THREE.Vector3;
  
  // Para transições suaves de seção
  targetCenter: THREE.Vector3;
  targetRadius: number;
  targetHeight: number;
  targetFov: number;
  
  // Para zoom suave (valores interpolados)
  smoothRadius: number;
  smoothHeight: number;
  smoothFov: number;
  
  // Controle
  activeSection: string;
  isTransitioning: boolean;
  transitionProgress: number;
  
  // Sistema SIMPLIFICADO de transição direta
  isExiting: boolean;                           // Flag simples para saída
  cameraTargetPosition: THREE.Vector3;         // Posição alvo da câmera (sempre válida)
  cameraTargetLookAt: THREE.Vector3;           // LookAt alvo da câmera (sempre válida)
  transitionSpeed: number;                     // Velocidade da transição
}

/**
 * CameraController usando Zustand
 * Acessa o estado diretamente do store, evitando re-renders desnecessários
 */
export const CameraControllerZustand: React.FC<CameraControllerZustandProps> = ({ astronautRef }) => {
  const { camera } = useThree();
  
  // Monitora mudanças no currentSection, targetSection e zoomOutProgress
  const currentSection = useNavigationStore(state => state.currentSection);
  const targetSection = useNavigationStore(state => state.targetSection);
  const zoomOutProgress = useNavigationStore(state => state.zoomOutProgress);
  
  // Estado local da câmera (não causa re-render)
  const state = useRef<CameraState>({
    // Órbita
    orbitAngle: 0,
    currentRadius: 5,
    currentHeight: 1.8,
    currentFov: 75,
    
    // Centro de órbita (atualizado dinamicamente)
    orbitCenter: new THREE.Vector3(0, 0, 0),
    
    // Para transições suaves de seção
    targetCenter: new THREE.Vector3(0, 0, 0),
    targetRadius: 5,
    targetHeight: 1.8,
    targetFov: 75,
    
    // Para zoom suave (valores interpolados)
    smoothRadius: 5,
    smoothHeight: 1.8,
    smoothFov: 75,
    
    // Controle
    activeSection: 'MAIN',
    isTransitioning: false,
    transitionProgress: 0,
    
    // Sistema SIMPLIFICADO de transição direta
    isExiting: false,                           // Flag simples para saída
    cameraTargetPosition: new THREE.Vector3(), // Posição alvo da câmera (sempre válida)
    cameraTargetLookAt: new THREE.Vector3(),   // LookAt alvo da câmera (sempre válida)
    transitionSpeed: 0.1                       // Velocidade da transição
  });
  
  // Escala total aplicada ao modelo
  const totalScale = 0.01 * 0.4; // 0.004
  
  /**
   * Calcula posição mundial de um elemento
   * considerando rotação atual do astronauta
   */
  const calculateWorldPosition = (modelCoords: [number, number, number], section: string): THREE.Vector3 => {
    if (!modelCoords || section === 'MAIN') {
      return new THREE.Vector3(0, 0, 0);
    }
    
    // Aplica escala do modelo
    const scaled = new THREE.Vector3(
      modelCoords[0] * totalScale,
      modelCoords[1] * totalScale,
      modelCoords[2] * totalScale
    );
    
    // Aplica rotação atual do astronauta
    if (astronautRef?.current) {
      const rotation = astronautRef.current.rotation.y;
      const rotMatrix = new THREE.Matrix4().makeRotationY(rotation);
      scaled.applyMatrix4(rotMatrix);
      
      // Adiciona posição do astronauta
      const astronautPos = astronautRef.current.position;
      scaled.add(astronautPos);
    }
    
    return scaled;
  };
  
  /**
   * SIMPLIFICADO: Atualiza seção da câmera baseado nos estados do store
   */
  useEffect(() => {
    const activeSection = targetSection || currentSection || 'MAIN';
    
    if (activeSection !== state.current.activeSection) {
      state.current.activeSection = activeSection;
      state.current.isTransitioning = true;
      state.current.transitionProgress = 0;
      
      // Configuração da seção
      const config = ORBIT_CONFIG[activeSection] || ORBIT_CONFIG.MAIN;
      state.current.targetRadius = config.radius;
      state.current.targetHeight = config.height;
      state.current.targetFov = config.fov;
      
      // Centro da órbita
      if (activeSection === 'MAIN') {
        state.current.targetCenter.set(0, 0, 0);
      }
      
      // Reset flags
      state.current.isExiting = false;
    }
  }, [targetSection, currentSection]);
  
  /**
   * Loop principal - executado a cada frame
   */
  useFrame((frameState: RootState, delta: number) => {
    // Pega estado atual do store
    const store = useNavigationStore.getState();
    const { zoomProgress, navigationState } = store;
    
    // SISTEMA SIMPLIFICADO: Transição direta quando targetSection = 'MAIN'
    if (targetSection === 'MAIN' && currentSection !== 'MAIN' && !state.current.isExiting) {
      state.current.isExiting = true;
      
      const mainConfig = ORBIT_CONFIG.MAIN;
      state.current.cameraTargetPosition.set(
        Math.cos(0) * mainConfig.radius,
        mainConfig.height,
        Math.sin(0) * mainConfig.radius
      );
      state.current.cameraTargetLookAt.set(0, 0, 0);
      state.current.targetFov = mainConfig.fov;
      state.current.transitionSpeed = 0.08;
    }
    
    // Executa transição direta
    if (state.current.isExiting) {
      camera.position.lerp(state.current.cameraTargetPosition, state.current.transitionSpeed);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, state.current.targetFov, state.current.transitionSpeed);
      }
      camera.updateProjectionMatrix();
      camera.lookAt(state.current.cameraTargetLookAt);
      
      const distance = camera.position.distanceTo(state.current.cameraTargetPosition);
      if (distance < 0.2) {
        state.current.isExiting = false;
        camera.position.copy(state.current.cameraTargetPosition);
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = state.current.targetFov;
        }
        camera.updateProjectionMatrix();
      }
      return;
    }
    
    // ========================================
    // LÓGICA ORBITAL: Só executa se NÃO for transição direta
    // ========================================
    const section = state.current.activeSection;
    const config = ORBIT_CONFIG[section] || ORBIT_CONFIG.MAIN;
    
    
    // ========================================
    // 1. ATUALIZA CENTRO DE ÓRBITA (lógica normal)
    // ========================================
    if (section !== 'MAIN') {
      const modelPos = MODEL_POSITIONS[section];
      if (modelPos) {
        // Recalcula posição a cada frame para seguir rotação
        const worldPos = calculateWorldPosition(modelPos, section);
        state.current.targetCenter.copy(worldPos);
      }
    } else {
      // Para MAIN, sempre define origem como alvo
      state.current.targetCenter.set(0, 0, 0);
    }
    
    // ========================================
    // 2. MOVIMENTO ORBITAL (lógica normal)
    // ========================================
    state.current.orbitAngle += delta * config.rotationSpeed;
    
    // ========================================
    // 3. TRANSIÇÃO NORMAL (para navegação regular)
    // ========================================
    if (state.current.isTransitioning) {
      const transitionSpeed = 0.8;
      
      state.current.transitionProgress += delta * transitionSpeed;
      
      if (state.current.transitionProgress >= 1) {
        state.current.transitionProgress = 1;
        state.current.isTransitioning = false;

      }
      
      const t = state.current.transitionProgress;
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const lerpSpeed = 0.1;
      
      // Interpola valores normalmente
      state.current.orbitCenter.lerp(state.current.targetCenter, eased * lerpSpeed);
      state.current.currentRadius = THREE.MathUtils.lerp(
        state.current.currentRadius,
        state.current.targetRadius,
        eased * lerpSpeed
      );
      state.current.currentHeight = THREE.MathUtils.lerp(
        state.current.currentHeight,
        state.current.targetHeight,
        eased * lerpSpeed
      );
      state.current.currentFov = THREE.MathUtils.lerp(
        state.current.currentFov,
        state.current.targetFov,
        eased * lerpSpeed
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
    // 4. APLICAR ZOOM SUAVE (lógica normal)
    // ========================================
    
    // Calcula valores alvo baseados nos progressos de zoom
    let targetSmoothRadius = state.current.currentRadius;
    let targetSmoothHeight = state.current.currentHeight;
    let targetSmoothFov = state.current.currentFov;
    
    // Zoom in (quando está fazendo zoom para entrar)
    if (zoomProgress > 0 && section !== 'MAIN') {
      const zoomConfig = config.zoomRadius || 0.5;
      // Easing ainda mais suave: combinação de seno com cubic
      const sinEasing = Math.sin(zoomProgress * Math.PI * 0.5);
      const cubicEasing = zoomProgress * zoomProgress * (3 - 2 * zoomProgress); // Smoothstep
      const zoomEased = (sinEasing + cubicEasing) * 0.5; // Média das duas curvas
      
      targetSmoothRadius = THREE.MathUtils.lerp(state.current.currentRadius, zoomConfig, zoomEased);
      targetSmoothHeight = THREE.MathUtils.lerp(state.current.currentHeight, state.current.currentHeight * 0.3, zoomEased);
      targetSmoothFov = THREE.MathUtils.lerp(state.current.currentFov, 30, zoomEased);
    }
    
    // Zoom out visual (quando está fazendo scroll reverso)
    if (zoomOutProgress > 0 && section !== 'MAIN') {
      // Mesmo easing suave para zoom out
      const sinEasing = Math.sin(zoomOutProgress * Math.PI * 0.5);
      const cubicEasing = zoomOutProgress * zoomOutProgress * (3 - 2 * zoomOutProgress);
      const zoomOutEased = (sinEasing + cubicEasing) * 0.5;
      
      // Aplica zoom out com IMPACTO VISUAL MÍNIMO - quase sem afastamento
      targetSmoothRadius *= (1 + zoomOutEased * 0.08); // DRASTICAMENTE REDUZIDO de 0.8 para 0.3 
      targetSmoothHeight *= (1 + zoomOutEased * 0.002); // REDUZIDO de 0.3 para 0.15
      targetSmoothFov = Math.min(85, targetSmoothFov * (1 + zoomOutEased * 0.01)); // REDUZIDO de 0.15 para 0.08
    }
    
    // Interpola ULTRA-SUAVEMENTE para os valores alvo (elimina completamente os "degraus")
    const lerpSpeed = 15; // Reduzido de 25 para 15 (mais suave)
    const lerpFactor = Math.min(1, delta * lerpSpeed);
    
    state.current.smoothRadius = THREE.MathUtils.lerp(state.current.smoothRadius, targetSmoothRadius, lerpFactor);
    state.current.smoothHeight = THREE.MathUtils.lerp(state.current.smoothHeight, targetSmoothHeight, lerpFactor);
    state.current.smoothFov = THREE.MathUtils.lerp(state.current.smoothFov, targetSmoothFov, lerpFactor * 0.7); // FOV ainda mais suave
    
    // Usa os valores suaves para a câmera
    let effectiveRadius = state.current.smoothRadius;
    let effectiveHeight = state.current.smoothHeight;
    let effectiveFov = state.current.smoothFov;
    
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
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = effectiveFov;
    }
    camera.updateProjectionMatrix();
    
    // ========================================
    // 7. DEBUG (a cada 2 segundos)
    // ========================================
    if (frameState.clock.elapsedTime % 2 < delta) {
      if (section === 'MAIN') {
        console.log(`📍 Estado MAIN:`, {
          centro: state.current.orbitCenter.toArray().map(n => n.toFixed(2)),
          raio: effectiveRadius.toFixed(2),
          altura: effectiveHeight.toFixed(2),
          fov: effectiveFov.toFixed(0),
          posicaoCamera: [x.toFixed(2), y.toFixed(2), z.toFixed(2)],
          transicionando: state.current.isTransitioning
        });
      } else {
        console.log(`📍 Órbita ${section}:`, {
          centro: state.current.orbitCenter.toArray().map(n => n.toFixed(2)),
          raio: effectiveRadius.toFixed(2),
          zoom: `${(zoomProgress * 100).toFixed(0)}%`,
          estado: navigationState,
          rotação: astronautRef?.current?.rotation.y.toFixed(2) || '0'
        });
      }
    }
  });
  
  return null;
};

export default CameraControllerZustand;