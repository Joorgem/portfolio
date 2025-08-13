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
      background: null,
      // Configurações de zoom
      zoomConfig: {
        minRadius: 2,
        maxRadius: 8,
        entryRadius: 3,
        elementSize: 5 // Tamanho geral da cena
      }
    },
    about: { 
      orbitCenter: transformPoint([0, 350, 0]), // Cabeça
      orbitRadius: 3, // Distância satelital
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#000000',
      // Zoom específico para cabeça (maior por ser mais próxima)
      zoomConfig: {
        minRadius: -0.5,  // NEGATIVO - atravessa a superfície!
        maxRadius: 5,
        entryRadius: 0.2, // Começa a entrar quando está próximo
        surfaceRadius: 0.65, // Raio da superfície do elemento
        elementSize: 0.65 // Tamanho da cabeça no modelo
      }
    },
    projects: { 
      orbitCenter: transformPoint([-357.404, 392.646, 0]), // Planeta 1
      orbitRadius: 3,
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#000000',
      // Zoom para planeta pequeno
      zoomConfig: {
        minRadius: -0.3,  // Atravessa o planeta
        maxRadius: 5,
        entryRadius: 0.15,  // Começa a entrar
        surfaceRadius: 0.45, // Raio da superfície
        elementSize: 0.45 // Planeta menor
      }
    },
    experience: { 
      orbitCenter: transformPoint([375.469, 427.948, 0]), // Planeta 2
      orbitRadius: 3,
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#ffffff',
      // Zoom para planeta médio
      zoomConfig: {
        minRadius: -0.4,  // Atravessa bem dentro
        maxRadius: 5,
        entryRadius: 0.25,  // Começa a entrar
        surfaceRadius: 0.65, // Raio da superfície
        elementSize: 0.65 // Planeta médio
      }
    },
    contact: { 
      orbitCenter: transformPoint([-341.988, 460.196, -117.028]), // Planeta 3
      orbitRadius: 3,
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#ffffff',
      // Zoom para planeta médio com profundidade
      zoomConfig: {
        minRadius: -0.4,  // Atravessa bem dentro
        maxRadius: 5,
        entryRadius: 0.25,  // Começa a entrar
        surfaceRadius: 0.65, // Raio da superfície
        elementSize: 0.65 // Planeta médio
      }
    },
    testimonials: { 
      orbitCenter: transformPoint([199.634, 566.883, -221.001]), // Planeta 4
      orbitRadius: 3,
      orbitHeight: 1,
      fov: 75, // FOV padrão
      background: '#000000',
      // Zoom para planeta pequeno distante
      zoomConfig: {
        minRadius: -0.3,  // Atravessa o planeta
        maxRadius: 5,
        entryRadius: 0.15,  // Começa a entrar
        surfaceRadius: 0.45, // Raio da superfície
        elementSize: 0.45 // Planeta menor
      }
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
  onZoomUpdate, // NOVO: callback unificado para reportar zoom
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
  
  // Sistema de zoom
  const baseRadius = useRef(5);
  const zoomSpeed = 0.0018; // MUITO mais suave
  const wheelAccumulator = useRef(0);
  const lastWheelTime = useRef(0);
  const zoomTransitionSpeed = 0.02; // Transição bem suave
  const currentZoomConfig = useRef(null); // Configuração de zoom atual
  
  // Níveis de zoom adaptativos (serão ajustados por elemento)
  const ZOOM_LEVELS = {
    FAR: 1.0,      // Visão orbital normal
    MEDIUM: 0.5,   // Aproximação média
    CLOSE: 0.25,   // Próximo ao elemento
    INSIDE: 0.08   // Dentro da seção (trigger para entrar)
  };
  
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
    console.log(`🚀 Iniciando transição para: ${sectionId}`);
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
    
    // Armazena configuração de zoom específica do elemento
    currentZoomConfig.current = realTimeConfig.zoomConfig;
    baseRadius.current = realTimeConfig.orbitRadius;
    
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
    
    console.log(`🌍 Órbita iniciada: ${sectionId} → Zoom config:`, realTimeConfig.zoomConfig);
  }, [enabled, state, onTransitionStart, astronautRef, astronautPosition]);
  
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
    
    // Notifica que voltou para MAIN (reseta fade)
    if (onZoomUpdate) {
      onZoomUpdate({
        radius: 5,
        sectionConfig: null,
        sectionId: 'MAIN'
      });
    }
    
    // Inicia animação de volta
    animationProgress.current = 0;
    setState(CAMERA_STATES.TRANSITIONING);
    
    console.log('🏠 Retornando para órbita principal');
  }, [enabled, state, onZoomUpdate, astronautRef, astronautPosition]);
  
  /**
   * Handler de zoom com wheel/scroll
   */
  const handleWheel = React.useCallback((event) => {
    if (!enabled || state === CAMERA_STATES.TRANSITIONING) return;
    
    // Previne scroll da página
    event.preventDefault();
    
    const now = Date.now();
    const timeDelta = now - lastWheelTime.current;
    lastWheelTime.current = now;
    
    // Acumula eventos de wheel para suavizar
    if (timeDelta < 50) {
      wheelAccumulator.current += event.deltaY;
    } else {
      wheelAccumulator.current = event.deltaY;
    }
    
    // Calcula novo raio baseado no zoom
    const zoomDelta = wheelAccumulator.current * zoomSpeed;
    
    if (state === CAMERA_STATES.ORBITING && currentSection !== 'MAIN') {
      // Usa configuração de zoom específica do elemento atual
      const zoomConfig = currentZoomConfig.current || {
        minRadius: 0.5,
        maxRadius: 5,
        entryRadius: 0.3,
        elementSize: 1
      };
      
      // Zoom contextual adaptativo quando orbitando uma seção
      // Permite valores NEGATIVOS para atravessar a superfície!
      const newRadius = Math.max(
        zoomConfig.minRadius, // Pode ser negativo!
        Math.min(zoomConfig.maxRadius, currentRadius.current - zoomDelta * 2) // Mais suave
      );
      targetRadius.current = newRadius;
      
      // NOVO: Reporta estado do zoom para o hook central
      // O hook vai calcular tudo (penetração, fade, isInside, etc)
      if (onZoomUpdate) {
        const orbitCenters = getOrbitCenters(astronautRef?.current?.rotation?.y || 0, astronautPosition);
        const sectionConfig = orbitCenters[currentSection];
        
        onZoomUpdate({
          radius: newRadius,
          sectionConfig: {
            ...zoomConfig,
            background: sectionConfig.background
          },
          sectionId: currentSection
        });
      }
      
      // Ajusta FOV baseado no zoom para efeito mais imersivo
      const zoomRatio = (newRadius - zoomConfig.minRadius) / (zoomConfig.maxRadius - zoomConfig.minRadius);
      const fovRange = 65; // Variação máxima do FOV aumentada
      targetFov.current = 75 - (1 - zoomRatio) * fovRange; // FOV varia de 75 a 10 (mais zoom)
      
    } else if (state === CAMERA_STATES.IDLE) {
      // Zoom geral na visão principal
      const mainConfig = getOrbitCenters(0, astronautPosition).MAIN.zoomConfig;
      const newRadius = Math.max(
        mainConfig.minRadius, 
        Math.min(mainConfig.maxRadius, currentRadius.current - zoomDelta * 5)
      );
      targetRadius.current = newRadius;
      baseRadius.current = newRadius;
      
      // Reporta que está em MAIN (reseta fade)
      if (onZoomUpdate) {
        onZoomUpdate({
          radius: newRadius,
          sectionConfig: null,
          sectionId: 'MAIN'
        });
      }
    }
    
    // Reset acumulador mais suavemente
    wheelAccumulator.current *= 0.95; // Decai mais devagar para movimento suave
  }, [enabled, state, currentSection, onZoomUpdate, astronautRef, astronautPosition]);
  
  /**
   * Handler para sair da seção com zoom reverso (simplificado)
   */
  const handleZoomOut = React.useCallback(() => {
    // Apenas ajusta o zoom - o hook gerencia o resto
    targetRadius.current = baseRadius.current * ZOOM_LEVELS.MEDIUM;
    targetFov.current = 75;
  }, []);
  
  /**
   * Escuta mudanças na seção target
   */
  useEffect(() => {
    if (targetSection && targetSection !== currentSection) {
      startTransition(targetSection);
    }
  }, [targetSection, currentSection, startTransition]);
  
  /**
   * Adiciona listener de wheel/scroll
   */
  useEffect(() => {
    const canvas = gl.domElement;
    
    // Adiciona listener com passive: false para prevenir scroll
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    // Handler para ESC durante zoom (gerenciado no Hero.jsx)
    const handleKeyDown = (e) => {
      // ESC é gerenciado no Hero.jsx agora
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gl.domElement, handleWheel, handleZoomOut]);
  
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
      
      // Atualiza base radius após transição
      if (progress >= 1) {
        baseRadius.current = currentRadius.current;
      }
      
      // Finaliza transição
      if (progress >= 1) {
        setState(targetSectionId.current === 'MAIN' ? CAMERA_STATES.IDLE : CAMERA_STATES.ORBITING);
        setCurrentSection(targetSectionId.current === 'MAIN' ? 'MAIN' : currentSection);
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
    
    // Suaviza zoom quando não está em transição
    if (state !== CAMERA_STATES.TRANSITIONING) {
      currentRadius.current += (targetRadius.current - currentRadius.current) * zoomTransitionSpeed;
      currentFov.current += (targetFov.current - currentFov.current) * zoomTransitionSpeed;
    }
    
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
 * Hook para controlar navegação da câmera - Única fonte de verdade
 */
export const useCameraNavigation = () => {
  // Estados de navegação
  const [targetSection, setTargetSection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [orbitingSection, setOrbitingSection] = useState('MAIN'); // Qual seção está orbitando
  
  // Estados de zoom e penetração
  const [currentRadius, setCurrentRadius] = useState(5);
  const [surfaceRadius, setSurfaceRadius] = useState(1);
  const [penetrationDepth, setPenetrationDepth] = useState(0); // 0-1: quanto penetrou
  const [isInsidePlanet, setIsInsidePlanet] = useState(false); // Derivado: raio < 0
  const [zoomLevel, setZoomLevel] = useState('FAR'); // FAR | MEDIUM | CLOSE | INSIDE
  
  // Estados de fade
  const [fadeColor, setFadeColor] = useState(null);
  const [fadeOpacity, setFadeOpacity] = useState(0); // 0-1: opacidade real do fade
  
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
    setOrbitingSection(sectionId);
    console.log(`🎯 Começando a orbitar: ${sectionId}`);
  }, []);
  
  const handleTransitionComplete = React.useCallback((sectionId) => {
    setIsTransitioning(false);
    setTargetSection(null);
    console.log(`✅ Órbita estabelecida: ${sectionId}`);
  }, []);
  
  /**
   * NOVO: Callback unificado para atualizar estado de zoom
   * Chamado a cada frame durante zoom
   */
  const handleZoomUpdate = React.useCallback(({
    radius,
    sectionConfig,
    sectionId
  }) => {
    if (!sectionConfig || sectionId === 'MAIN') {
      // Reset quando em MAIN
      setPenetrationDepth(0);
      setIsInsidePlanet(false);
      setZoomLevel('FAR');
      setFadeColor(null);
      setFadeOpacity(0);
      return;
    }
    
    const { surfaceRadius: surface, minRadius, background } = sectionConfig;
    
    // Atualiza raio atual
    setCurrentRadius(radius);
    setSurfaceRadius(surface);
    
    // Calcula penetração (0 = longe, 1 = máximo dentro)
    const penetration = surface > 0 ? 
      Math.max(0, Math.min(1, (surface - radius) / (surface - minRadius))) : 0;
    setPenetrationDepth(penetration);
    
    // Determina se está dentro (raio negativo)
    const inside = radius < 0;
    setIsInsidePlanet(inside);
    
    // Determina nível de zoom
    let level = 'FAR';
    if (inside) {
      level = 'INSIDE';
    } else if (radius <= surface * 0.5) {
      level = 'CLOSE';
    } else if (radius <= surface * 1.5) {
      level = 'MEDIUM';
    }
    setZoomLevel(level);
    
    // Calcula fade baseado na penetração
    // Começa fade quando está próximo (penetration > 0.2)
    if (penetration > 0.2) {
      setFadeColor(background);
      // Mapeia 0.2-1.0 para 0-1 de opacidade
      const opacity = (penetration - 0.2) / 0.8;
      setFadeOpacity(Math.min(1, opacity));
    } else {
      setFadeColor(null);
      setFadeOpacity(0);
    }
    
    // Debug
    if (penetration > 0) {
      console.log(`🌍 Zoom Status:`, {
        section: sectionId,
        radius: radius.toFixed(3),
        penetration: (penetration * 100).toFixed(0) + '%',
        inside,
        fadeOpacity: (fadeOpacity * 100).toFixed(0) + '%'
      });
    }
  }, [fadeOpacity]);
  
  return {
    // Estados de navegação
    targetSection,
    orbitingSection,
    isTransitioning,
    
    // Estados de zoom
    currentRadius,
    penetrationDepth,
    isInsidePlanet,
    zoomLevel,
    
    // Estados de fade
    fadeColor,
    fadeOpacity,
    
    // Ações
    navigateToSection,
    returnToMain,
    
    // Handlers para CameraController
    onTransitionStart: handleTransitionStart,
    onTransitionComplete: handleTransitionComplete,
    onZoomUpdate: handleZoomUpdate
  };
};

export default CameraController;