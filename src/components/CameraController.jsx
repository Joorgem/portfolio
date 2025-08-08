import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { NAVIGATION_POINTS } from '../constants/navigationPoints';
import * as THREE from 'three';

/**
 * Configurações orbitais para cada seção
 * Agora calcula posições dinamicamente baseado na rotação atual
 */
const getOrbitCenters = (astronautRotation, astronautPosition) => {
  const rotationMatrix = new THREE.Matrix4().makeRotationY(astronautRotation);
  
  // Função para transformar coordenada do modelo para mundo
  const transformPoint = (modelCoords) => {
    // Aplica escala do modelo (0.4 * 0.01)
    const scaled = new THREE.Vector3(
      modelCoords[0] * 0.4 * 0.01,
      modelCoords[1] * 0.4 * 0.01,
      modelCoords[2] * 0.4 * 0.01
    );
    
    // Aplica rotação atual do astronauta
    scaled.applyMatrix4(rotationMatrix);
    
    // Adiciona posição do astronauta
    scaled.add(new THREE.Vector3(...astronautPosition));
    
    return [scaled.x, scaled.y, scaled.z];
  };
  
  return {
    MAIN: { 
      orbitCenter: [0, 0, 0], 
      orbitRadius: 5, // Distância inicial corrigida
      orbitHeight: 0,
      fov: 75,
      background: null 
    },
    about: { 
      orbitCenter: transformPoint([0, 350, 0]), // Cabeça
      orbitRadius: 3, // Distância satelital
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#000000'
    },
    projects: { 
      orbitCenter: transformPoint([-357.404, 392.646, 0]), // Planeta 1
      orbitRadius: 3,
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#ffffff'
    },
    experience: { 
      orbitCenter: transformPoint([375.469, 427.948, 0]), // Planeta 2
      orbitRadius: 3,
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#ffffff'
    },
    contact: { 
      orbitCenter: transformPoint([-341.988, 460.196, -117.028]), // Planeta 3
      orbitRadius: 3,
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#ffffff'
    },
    testimonials: { 
      orbitCenter: transformPoint([199.634, 566.883, -221.001]), // Planeta 4
      orbitRadius: 3,
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#000000'
    }
  };
};

/**
 * Estados de transição da câmera - SIMPLIFICADO
 */
const CAMERA_STATES = {
  IDLE: 'idle',
  TRANSITIONING: 'transitioning',
  ORBITING: 'orbiting'
};

/**
 * Controlador orbital de câmera para navegação 3D
 */
export const CameraController = ({ 
  targetSection = null,
  astronautRef = null,
  astronautPosition = [0, 0, 0],
  onTransitionStart,
  onTransitionComplete,
  onBackgroundChange,
  enabled = true 
}) => {
  const { camera, gl } = useThree();
  const [state, setState] = useState(CAMERA_STATES.IDLE);
  const [currentSection, setCurrentSection] = useState('MAIN');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs para controle orbital
  const currentOrbitCenter = useRef(new THREE.Vector3(0, 0, 0));
  const targetOrbitCenter = useRef(new THREE.Vector3(0, 0, 0));
  const currentRadius = useRef(5); // Inicial corrigido
  const targetRadius = useRef(5);
  const currentHeight = useRef(0);
  const targetHeight = useRef(0);
  const currentFov = useRef(75);
  const targetFov = useRef(75);
  
  // Sistema de transição de foco ULTRA SUAVE
  const targetSectionId = useRef('MAIN');
  const smoothOrbitCenter = useRef(new THREE.Vector3(0, 0, 0)); // Centro com transição suave
  const targetOrbitCenterSmooth = useRef(new THREE.Vector3(0, 0, 0)); // Alvo para interpolação
  const lastCachedRotation = useRef(0);
  const focusTransitionSpeed = 0.02; // Velocidade da transição de foco (mais baixo = mais suave)
  
  // Controle de animação SIMPLIFICADO
  const animationProgress = useRef(0);
  const animationDuration = useRef(1.0); // Transição mais rápida 
  const orbitAngle = useRef(0); // Ângulo satelital
  
  // Para suavizar transições
  const startOrbitCenter = useRef(new THREE.Vector3());
  const startRadius = useRef(5); // Inicial corrigido
  const startHeight = useRef(0);
  const startFov = useRef(75);
  
  /**
   * Inicia transição orbital para uma seção
   */
  const startTransition = React.useCallback((sectionId) => {
    if (!enabled || (state !== CAMERA_STATES.IDLE && state !== CAMERA_STATES.ORBITING)) return;
    
    // Obtém rotação atual do astronauta
    const astronautRotation = astronautRef?.current?.rotation?.y || 0;
    const orbitCenters = getOrbitCenters(astronautRotation, astronautPosition);
    
    const targetConfig = orbitCenters[sectionId];
    if (!targetConfig) return;
    
    // Salva estado atual da órbita
    startOrbitCenter.current.copy(currentOrbitCenter.current);
    startRadius.current = currentRadius.current;
    startHeight.current = currentHeight.current;
    startFov.current = currentFov.current;
    
    // **INICIALIZAÇÃO SUAVE**: Calcula posição atual do planeta para transição
    const currentAstronautRotation = astronautRef?.current?.rotation?.y || 0;
    const realTimeOrbitCenters = getOrbitCenters(currentAstronautRotation, astronautPosition);
    const realTimeConfig = realTimeOrbitCenters[sectionId];
    
    // Define targets para transição normal (posição, raio, etc)
    targetOrbitCenter.current.set(...realTimeConfig.orbitCenter);
    targetRadius.current = realTimeConfig.orbitRadius;
    targetHeight.current = realTimeConfig.orbitHeight;
    targetFov.current = realTimeConfig.fov;
    
    // **IMPORTANTE**: Inicializa o sistema de foco suave
    targetOrbitCenterSmooth.current.set(...realTimeConfig.orbitCenter);
    
    // Armazena para referência
    targetSectionId.current = sectionId;
    lastCachedRotation.current = currentAstronautRotation;
    
    // Inicia animação
    animationProgress.current = 0;
    setState(CAMERA_STATES.TRANSITIONING);
    setCurrentSection(sectionId);
    
    // Callbacks
    if (onTransitionStart) {
      onTransitionStart(sectionId);
    }
    
    if (onBackgroundChange) {
      onBackgroundChange(targetConfig.background);
    }
    
    console.log(`🌍 Órbita suave iniciada: ${sectionId} → Centro: [${realTimeConfig.orbitCenter.map(n => n.toFixed(2)).join(', ')}]`);
  }, [enabled, state, onTransitionStart, onBackgroundChange, astronautRef, astronautPosition]);
  
  /**
   * Retorna para a órbita principal
   */
  const returnToMain = React.useCallback(() => {
    if (!enabled || (state === CAMERA_STATES.IDLE || state === CAMERA_STATES.TRANSITIONING)) return;
    
    const astronautRotation = astronautRef?.current?.rotation?.y || 0;
    const orbitCenters = getOrbitCenters(astronautRotation, astronautPosition);
    const mainConfig = orbitCenters.MAIN;
    
    // Salva estado orbital atual
    startOrbitCenter.current.copy(currentOrbitCenter.current);
    startRadius.current = currentRadius.current;
    startHeight.current = currentHeight.current;
    startFov.current = currentFov.current;
    
    // Define targets para órbita principal
    targetOrbitCenter.current.set(...mainConfig.orbitCenter);
    targetRadius.current = mainConfig.orbitRadius;
    targetHeight.current = mainConfig.orbitHeight;
    targetFov.current = mainConfig.fov;
    
    // **RESETAR SISTEMA SUAVE**: Volta para MAIN
    targetSectionId.current = 'MAIN';
    targetOrbitCenterSmooth.current.set(...mainConfig.orbitCenter);
    
    // Inicia animação de volta
    animationProgress.current = 0;
    setState(CAMERA_STATES.TRANSITIONING);
    
    if (onBackgroundChange) {
      onBackgroundChange(null); // Remove background
    }
    
    console.log('🏠 Retornando para órbita principal');
  }, [enabled, state, onBackgroundChange, astronautRef, astronautPosition]);
  
  /**
   * Escuta mudanças na seção target
   */
  useEffect(() => {
    if (targetSection && targetSection !== currentSection) {
      startTransition(targetSection);
    }
  }, [targetSection, currentSection, startTransition]);
  
  /**
   * Loop ULTRA OTIMIZADO - MÍNIMA SOBRECARGA
   */
  useFrame((frameState, delta) => {
    if (!enabled) return;
    
    // Inicialização da câmera e sistema suave apenas uma vez
    if (!isInitialized) {
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      
      // Inicializa sistema de foco suave
      smoothOrbitCenter.current.set(0, 0, 0);
      targetOrbitCenterSmooth.current.set(0, 0, 0);
      
      setIsInitialized(true);
      return;
    }
    
    // MOVIMENTO ORBITAL SUAVE E LENTO
    orbitAngle.current += delta * 0.15; // Velocidade reduzida: 0.4 → 0.15
    
    // TRANSIÇÃO SIMPLIFICADA
    if (state === CAMERA_STATES.TRANSITIONING) {
      animationProgress.current += delta / animationDuration.current;
      const progress = Math.min(animationProgress.current, 1);
      
      // Interpolação linear simples (sem easing pesado)
      const t = progress;
      
      currentOrbitCenter.current.lerpVectors(
        startOrbitCenter.current,
        targetOrbitCenter.current,
        t
      );
      
      currentRadius.current = startRadius.current + (targetRadius.current - startRadius.current) * t;
      currentHeight.current = startHeight.current + (targetHeight.current - startHeight.current) * t;
      currentFov.current = startFov.current + (targetFov.current - startFov.current) * t;
      
      // Finaliza transição
      if (progress >= 1) {
        setState(targetSectionId.current === 'MAIN' ? CAMERA_STATES.IDLE : CAMERA_STATES.ORBITING);
        if (onTransitionComplete) {
          onTransitionComplete(targetSectionId.current === 'MAIN' ? 'MAIN' : currentSection);
        }
      }
    }
    
    // **TRANSIÇÃO DE FOCO IMPERCEPTÍVEL**: Interpolação contínua e suave
    if (state === CAMERA_STATES.ORBITING && targetSectionId.current !== 'MAIN') {
      const currentAstronautRotation = astronautRef?.current?.rotation?.y || 0;
      const rotationChange = Math.abs(currentAstronautRotation - lastCachedRotation.current);
      
      // Atualiza target apenas quando rotação muda significativamente
      if (rotationChange > 0.08) { // Threshold menor para mais responsividade
        const updatedOrbitCenters = getOrbitCenters(currentAstronautRotation, astronautPosition);
        const updatedConfig = updatedOrbitCenters[targetSectionId.current];
        
        if (updatedConfig) {
          // Atualiza o TARGET para interpolação (não o centro atual)
          targetOrbitCenterSmooth.current.set(...updatedConfig.orbitCenter);
          lastCachedRotation.current = currentAstronautRotation;
        }
      }
    }
    
    // **INTERPOLAÇÃO CONTÍNUA**: Sempre suaviza em direção ao target (IMPERCEPTÍVEL)
    smoothOrbitCenter.current.lerp(targetOrbitCenterSmooth.current, focusTransitionSpeed);
    
    // Usa o centro suavizado ao invés do abrupto
    currentOrbitCenter.current.copy(smoothOrbitCenter.current);
    
    // POSIÇÃO SATELITAL SIMPLES
    const cosAngle = Math.cos(orbitAngle.current);
    const sinAngle = Math.sin(orbitAngle.current);
    
    const x = currentOrbitCenter.current.x + cosAngle * currentRadius.current;
    const y = currentOrbitCenter.current.y + currentHeight.current;
    const z = currentOrbitCenter.current.z + sinAngle * currentRadius.current;
    
    camera.position.set(x, y, z);
    camera.lookAt(currentOrbitCenter.current);
    
    // Atualiza FOV
    camera.fov = currentFov.current;
    camera.updateProjectionMatrix();
  });
  
  return null; // Componente invisível - apenas lógica
};

/**
 * Hook para controlar navegação da câmera
 */
export const useCameraNavigation = () => {
  const [targetSection, setTargetSection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentSection, setCurrentSection] = useState('MAIN');
  const [backgroundColor, setBackgroundColor] = useState(null);
  
  const navigateToSection = React.useCallback((sectionId) => {
    console.log(`🎯 Navegando para seção: ${sectionId}`);
    setTargetSection(sectionId);
  }, []);
  
  const returnToMain = React.useCallback(() => {
    console.log('🏠 Solicitando retorno para main');
    setTargetSection('MAIN');
  }, []);
  
  const handleTransitionStart = React.useCallback((sectionId) => {
    setIsTransitioning(true);
  }, []);
  
  const handleTransitionComplete = React.useCallback((sectionId) => {
    setIsTransitioning(false);
    setCurrentSection(sectionId);
    setTargetSection(null); // Limpa target
  }, []);
  
  const handleBackgroundChange = React.useCallback((color) => {
    setBackgroundColor(color);
  }, []);
  
  return {
    // Estado
    targetSection,
    currentSection,
    isTransitioning,
    backgroundColor,
    
    // Ações
    navigateToSection,
    returnToMain,
    
    // Handlers para CameraController
    onTransitionStart: handleTransitionStart,
    onTransitionComplete: handleTransitionComplete,
    onBackgroundChange: handleBackgroundChange
  };
};

export default CameraController;