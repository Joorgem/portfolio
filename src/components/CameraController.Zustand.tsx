import React, { useRef, useMemo } from 'react';
import { useFrame, useThree, RootState } from '@react-three/fiber';
import { useNavigationStore } from '../stores/navigation.store';
import { ObjectPool } from '../utils/objectPool';
import * as THREE from 'three';

interface CameraControllerZustandProps {
  astronautRef: React.RefObject<THREE.Group>;
  astronautScale?: number; // NOVO: Recebe escala dinâmica
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
  courses: [199.634, 566.883, -221.001] // Planeta 4 (direita-trás)
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

// MOBILE FIX: Configurações adaptativas com ajuste de altura para centralização
const getOrbitConfig = (): Record<string, OrbitConfig> => {
  const isMobile = window.innerWidth < 768;
  const aspectRatio = window.innerWidth / window.innerHeight;
  const isPortrait = aspectRatio < 1;
  
  // Ajusta altura baseado na orientação do dispositivo
  const getHeightAdjustment = (baseHeight: number): number => {
    if (!isMobile) return baseHeight;
    
    // Portrait: reduz altura mais agressivamente
    // Landscape: mantém altura mais próxima do original
    if (isPortrait) {
      return baseHeight * 0.4; // 40% da altura original em portrait
    } else {
      return baseHeight * 0.7; // 70% da altura original em landscape
    }
  };
  
  return {
    MAIN: {
      radius: isMobile ? 3.5 : 4.2,
      height: isMobile ? 1.5 : 1.8,
      fov: isMobile ? 65 : 75,
      rotationSpeed: 0.02
    },
    about: {
      radius: isMobile ? 2.0 : 2.5,
      height: getHeightAdjustment(0.6),
      fov: isMobile ? 60 : 65,
      zoomRadius: isMobile ? 0.5 : 0.6,
      rotationSpeed: 0.03
    },
    projects: {
      radius: isMobile ? 1.8 : 2.0,
      height: getHeightAdjustment(0.4),
      fov: isMobile ? 60 : 65,
      zoomRadius: isMobile ? 0.35 : 0.4,
      rotationSpeed: 0.03
    },
    experience: {
      radius: isMobile ? 2.0 : 2.5,
      height: getHeightAdjustment(0.5),
      fov: isMobile ? 60 : 65,
      zoomRadius: isMobile ? 0.4 : 0.5,
      rotationSpeed: 0.03
    },
    contact: {
      radius: isMobile ? 2.0 : 2.5,
      height: getHeightAdjustment(0.5),
      fov: isMobile ? 60 : 65,
      zoomRadius: isMobile ? 0.4 : 0.5,
      rotationSpeed: 0.03
    },
    courses: {
      radius: isMobile ? 1.8 : 2.2,
      height: getHeightAdjustment(0.4),
      fov: isMobile ? 60 : 65,
      zoomRadius: isMobile ? 0.35 : 0.4,
      rotationSpeed: 0.03
    }
  };
};

// const ORBIT_CONFIG = getOrbitConfig(); // Unused

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
  
  // CONTINUITY FIX: Campos para transições suaves (sem sistema conflitante)
  lastSavedAngle: number;                      // Último ângulo salvo para continuidade
}

// Pré-alocar objetos Vector3 reutilizáveis para performance (seguindo padrões React Three Fiber)
// const tempPosition = new THREE.Vector3(); // Unused
// const tempTarget = new THREE.Vector3(); // Unused  
// const tempLookAt = new THREE.Vector3(); // Unused

/**
 * CameraController usando Zustand
 * Acessa o estado diretamente do store, evitando re-renders desnecessários
 * Otimizado com práticas React Three Fiber: reutilização de objetos Vector3
 */
export const CameraControllerZustand: React.FC<CameraControllerZustandProps> = ({ astronautRef, astronautScale = 0.4 }) => {
  const { camera } = useThree();
  
  // PERFORMANCE OPTIMIZATION: Direct store access instead of reactive hooks
  // Only subscribe to saveFinalCameraState as it's used in useEffect
  const saveFinalCameraState = useNavigationStore(state => state.saveFinalCameraState);

  // PERFORMANCE: Local vectors to avoid conflicts with other components
  const localVectors = useMemo(() => ({
    projectedCenter: new THREE.Vector3(),
    correctedCenter: new THREE.Vector3(),
  }), []);
  
  // Estado local da câmera (não causa re-render)
  const state = useRef<CameraState>({
    // Órbita
    orbitAngle: 0,
    currentRadius: 4.2,
    currentHeight: 1.8,
    currentFov: 75,
    
    // Centro de órbita (atualizado dinamicamente)
    orbitCenter: new THREE.Vector3(0, 0, 0),
    
    // Para transições suaves de seção
    targetCenter: new THREE.Vector3(0, 0, 0),
    targetRadius: 4.2,
    targetHeight: 1.8,
    targetFov: 75,
    
    // Para zoom suave (valores interpolados)
    smoothRadius: 4.2,
    smoothHeight: 1.8,
    smoothFov: 75,
    
    // Controle
    activeSection: 'MAIN',
    isTransitioning: false,
    transitionProgress: 0,
    
    // CONTINUITY FIX: Estado para transições suaves
    lastSavedAngle: 0                          // Último ângulo salvo para continuidade
  });
  
  // FIX: Usa escala dinâmica passada como prop
  const totalScale = 0.01 * astronautScale;
  
  /**
   * Calcula posição mundial de um elemento
   * considerando rotação atual do astronauta e aspect ratio
   */
  const calculateWorldPosition = (modelCoords: [number, number, number], section: string): THREE.Vector3 => {
    if (!modelCoords || section === 'MAIN') {
      // CRITICAL FIX: Return new instance to avoid shared mutable state
      return new THREE.Vector3(0, 0, 0);
    }
    
    // MOBILE FIX: Considera aspect ratio para centralização correta
    const isMobileDevice = window.innerWidth < 768;
    const aspectRatio = window.innerWidth / window.innerHeight;
    
    // Ajuste vertical baseado no aspect ratio (portrait vs landscape)
    let verticalOffset = 0;
    if (isMobileDevice) {
      // Portrait mode (aspect < 1): precisa subir um pouco
      // Landscape mode (aspect > 1): mantém ou desce
      if (aspectRatio < 1) {
        verticalOffset = 0.08 * (1 - aspectRatio); // Mais offset em telas mais altas
      } else {
        verticalOffset = -0.02; // Pequeno offset negativo para landscape
      }
    }
    
    // CRITICAL FIX: Use temporary vector for calculations but return new instance
    const tempVector = ObjectPool.tempVector2.set(
      modelCoords[0] * totalScale,
      modelCoords[1] * totalScale + verticalOffset,
      modelCoords[2] * totalScale
    );
    const scaled = tempVector.clone(); // Return new instance to avoid shared state
    
    // Aplica rotação atual do astronauta - using object pool for performance
    if (astronautRef?.current) {
      const rotation = astronautRef.current.rotation.y;
      const rotMatrix = ObjectPool.tempMatrix1.makeRotationY(rotation);
      scaled.applyMatrix4(rotMatrix);
      
      // Adiciona posição do astronauta
      const astronautPos = astronautRef.current.position;
      scaled.add(astronautPos);
    }
    
    return scaled;
  };
  
  // PERFORMANCE OPTIMIZATION: Section updates moved to useFrame for better performance
  // This avoids React re-renders and uses direct store polling
  
  /**
   * Loop principal - executado a cada frame
   */
  useFrame((_frameState: RootState, delta: number) => {
    // Acesso direto ao store para performance (evita React re-renders)
    const store = useNavigationStore.getState();
    const { zoomProgress, navigationState, targetSection, currentSection, zoomOutProgress } = store;

    // PERFORMANCE OPTIMIZATION: Poll section changes in useFrame instead of useEffect
    const activeSection = targetSection || currentSection || 'MAIN';
    if (activeSection !== state.current.activeSection) {
      state.current.activeSection = activeSection;
      state.current.isTransitioning = true;
      state.current.transitionProgress = 0;

      // MOBILE FIX: Usa configuração atualizada
      const currentConfig = getOrbitConfig();
      const config = currentConfig[activeSection] || currentConfig.MAIN;
      state.current.targetRadius = config.radius;
      state.current.targetHeight = config.height;
      state.current.targetFov = config.fov;

      // Centro da órbita
      if (activeSection === 'MAIN') {
        state.current.targetCenter.set(0, 0, 0);
      }
    }

    // Se estiver dentro de uma seção, pausa completamente a câmera para manter a posição de "pouso"
    if (navigationState === 'in_section') {
      // A câmera permanecerá na última posição calculada antes de entrar na seção
      return;
    }
    
    // CONTINUITY FIX: Sistema unificado de transições sem conflitos
    // Removido sistema "simplificado" que causava teleporte da câmera
    
    // CONTINUITY FIX: Salva estado final quando zoom completa e restaura na saída
    if (navigationState === 'entering') {
      // Salva estado atual da câmera quando está entrando na seção
      saveFinalCameraState(
        zoomProgress,
        state.current.orbitAngle,
        state.current.smoothRadius,
        state.current.smoothHeight
      );
    } else if (navigationState === 'zooming_out') {
      // CONTINUITY FIX: Restaura estado final salvo quando inicia zoom out
      const store = useNavigationStore.getState();
      if (store.finalOrbitAngle !== undefined && Math.abs(state.current.orbitAngle - store.finalOrbitAngle) > 0.1) {
        state.current.orbitAngle = store.finalOrbitAngle;
        state.current.smoothRadius = store.finalCameraRadius;
        state.current.smoothHeight = store.finalCameraHeight;
      }
    }
    
    // ========================================
    // LÓGICA ORBITAL: Sistema unificado para entrada e saída
    // ========================================
    const section = state.current.activeSection;
    // MOBILE FIX: Recalcula config a cada frame para garantir valores corretos
    const currentConfig = getOrbitConfig();
    const config = currentConfig[section] || currentConfig.MAIN;
    
    
    // ========================================
    // 1. ATUALIZA CENTRO DE ÓRBITA (lógica normal)
    // ========================================
    if (section !== 'MAIN') {
      const modelPos = MODEL_POSITIONS[section];
      if (modelPos) {
        // CRITICAL FIX: Recalcula posição mundial A CADA FRAME
        // Isso garante que o centro orbital siga a rotação do astronauta
        const worldPos = calculateWorldPosition(modelPos, section);
        
        // Atualiza o target center para todos os dispositivos
        // Removido o comportamento diferente para mobile que causava transições bruscas
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
      // MOBILE FIX: Velocidade de transição adaptativa
      const isMobileDevice = window.innerWidth < 768;
      const transitionSpeed = isMobileDevice ? 0.6 : 0.8; // Mobile um pouco mais lento para suavidade
      
      state.current.transitionProgress += delta * transitionSpeed;
      
      if (state.current.transitionProgress >= 1) {
        state.current.transitionProgress = 1;
        state.current.isTransitioning = false;
      }
      
      const t = state.current.transitionProgress;
      // Easing suave para mobile e desktop
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const lerpSpeed = isMobileDevice ? 0.08 : 0.1; // Mobile um pouco mais suave
      
      // Interpola valores com suavidade
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
      // Interpolação contínua normal (quando não está em transição)
      const isMobileDevice = window.innerWidth < 768;
      // Valores mais moderados para evitar movimentos bruscos
      const lerpSpeed = isMobileDevice ? 6 : 8;  // Reduzido de 12 para 6 no mobile
      const radiusSpeed = isMobileDevice ? 4 : 5; // Reduzido de 8 para 4 no mobile
      
      // Interpolação contínua para seguir movimento suave
      state.current.orbitCenter.lerp(state.current.targetCenter, delta * lerpSpeed);
      state.current.currentRadius = THREE.MathUtils.lerp(
        state.current.currentRadius,
        state.current.targetRadius,
        delta * radiusSpeed
      );
      state.current.currentHeight = THREE.MathUtils.lerp(
        state.current.currentHeight,
        state.current.targetHeight,
        delta * radiusSpeed
      );
      state.current.currentFov = THREE.MathUtils.lerp(
        state.current.currentFov,
        state.current.targetFov,
        delta * radiusSpeed
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
    // 6. APLICA TRANSFORMAÇÕES COM CORREÇÃO MOBILE
    // ========================================
    camera.position.set(x, y, z);
    
    // MOBILE FIX: Ajusta lookAt considerando aspect ratio - using object pool
    const isMobileDevice = window.innerWidth < 768;
    if (isMobileDevice && section !== 'MAIN') {
      // Verifica projeção do centro para garantir centralização - using local vectors
      localVectors.projectedCenter.copy(state.current.orbitCenter);
      localVectors.projectedCenter.project(camera);

      // Se não está centralizado (deve ser próximo de 0,0)
      if (Math.abs(localVectors.projectedCenter.x) > 0.1 || Math.abs(localVectors.projectedCenter.y) > 0.1) {
        // Aplica correção baseada no offset detectado - using local vectors
        localVectors.correctedCenter.copy(state.current.orbitCenter);
        localVectors.correctedCenter.x -= localVectors.projectedCenter.x * 0.1;
        localVectors.correctedCenter.y -= localVectors.projectedCenter.y * 0.1;
        camera.lookAt(localVectors.correctedCenter);
      } else {
        camera.lookAt(state.current.orbitCenter);
      }
    } else {
      camera.lookAt(state.current.orbitCenter);
    }
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = effectiveFov;
      // MOBILE FIX: Força atualização da matriz de projeção
      camera.aspect = window.innerWidth / window.innerHeight;
    }
    camera.updateProjectionMatrix();
  });
  
  return null;
};

export default CameraControllerZustand;