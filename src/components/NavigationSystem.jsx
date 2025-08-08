import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import { NAVIGATION_POINTS } from '../constants/navigationPoints';
import { useNavigationInteraction, useNavigationCursor } from '../hooks/useNavigationInteraction';
import * as THREE from 'three';

/**
 * Anel rotativo para indicar seleção
 */
const RotatingRing = ({ radius }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius * 1.3, 2, 8, 32]} />
      <meshBasicMaterial 
        color="#00ff00"
        emissive="#00ff00"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

/**
 * Componente otimizado de hitbox individual
 */
const OptimizedHitbox = React.memo(({ 
  point, 
  onPointerOver,
  onPointerOut,
  onClick,
  isHovered,
  isSelected,
  debugMode 
}) => {
  const meshRef = useRef();
  const scaleRef = useRef(1);
  const [isLocalHover, setIsLocalHover] = useState(false);
  
  // Otimização: cria geometria uma vez
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(point.radius, 16, 16);
  }, [point.radius]);
  
  // Handlers otimizados
  const handlePointerOver = React.useCallback((e) => {
    e.stopPropagation();
    setIsLocalHover(true);
    onPointerOver(point);
  }, [point, onPointerOver]);
  
  const handlePointerOut = React.useCallback((e) => {
    e.stopPropagation();
    setIsLocalHover(false);
    onPointerOut();
  }, [onPointerOut]);
  
  const handleClick = React.useCallback((e) => {
    e.stopPropagation();
    onClick(point);
  }, [point, onClick]);
  
  // Animação otimizada de hover
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const targetScale = (isHovered || isLocalHover) ? 1.05 : 1;
    scaleRef.current += (targetScale - scaleRef.current) * 0.1;
    meshRef.current.scale.setScalar(scaleRef.current);
  });
  
  return (
    <group position={point.position}>
      {/* Hitbox invisível mas interativa */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <meshBasicMaterial 
          transparent
          opacity={debugMode ? 0.1 : 0}
          color={debugMode ? getColor(point.id) : '#000000'}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Visual de hover - só renderiza quando necessário */}
      {(isHovered || isLocalHover) && (
        <mesh>
          <sphereGeometry args={[point.radius * 1.1, 32, 32]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
      
      {/* Visual de seleção */}
      {isSelected && (
        <group>
          <mesh>
            <sphereGeometry args={[point.radius * 1.2, 16, 16]} />
            <meshBasicMaterial 
              color="#00ff00"
              transparent
              opacity={0.15}
              wireframe
            />
          </mesh>
          
          {/* Anel rotativo de seleção */}
          <RotatingRing radius={point.radius} />
        </group>
      )}
    </group>
  );
});

OptimizedHitbox.displayName = 'OptimizedHitbox';

/**
 * Sistema de navegação robusto e otimizado
 */
export const NavigationSystem = ({ 
  astronautRef,
  astronautScale = 0.4,
  astronautPosition = [-0.08, -0.5, 0],
  onNavigate,
  debugMode = false
}) => {
  const groupRef = useRef();
  
  // Hook otimizado de interação
  const {
    hoveredPoint,
    selectedPoint,
    isTransitioning,
    handleHover,
    handleClick
  } = useNavigationInteraction({
    onNavigate,
    debugMode,
    hoverDelay: 30, // Delay menor para resposta mais rápida
    clickDelay: 200 // Previne cliques duplos
  });
  
  // Controle de cursor
  useNavigationCursor(!!hoveredPoint);
  
  // Sincronização com rotação do astronauta
  useFrame(() => {
    if (groupRef.current && astronautRef?.current) {
      // Suaviza a rotação para evitar "pulos"
      const targetRotation = astronautRef.current.rotation.y;
      const currentRotation = groupRef.current.rotation.y;
      const diff = targetRotation - currentRotation;
      
      // Aplica rotação suave
      groupRef.current.rotation.y += diff * 0.15;
    }
  });
  
  // Handlers otimizados
  const handlePointerOver = React.useCallback((point) => {
    if (!isTransitioning) {
      handleHover(point);
    }
  }, [handleHover, isTransitioning]);
  
  const handlePointerOut = React.useCallback(() => {
    handleHover(null);
  }, [handleHover]);
  
  // Memoização dos pontos de navegação
  const navigationPoints = useMemo(() => {
    return Object.entries(NAVIGATION_POINTS);
  }, []);
  
  return (
    <group 
      ref={groupRef}
      name="navigation-system"
      position={astronautPosition}
      scale={astronautScale}
    >
      <group scale={0.01}>
        {navigationPoints.map(([key, point]) => (
          <OptimizedHitbox
            key={key}
            point={point}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
            isHovered={hoveredPoint?.id === point.id}
            isSelected={selectedPoint?.id === point.id}
            debugMode={debugMode}
          />
        ))}
      </group>
    </group>
  );
};

// Helper para cores
const getColor = (pointId) => {
  const colors = {
    'about': '#ff6b6b',
    'projects': '#4ecdc4',
    'experience': '#45b7d1',
    'contact': '#96ceb4',
    'testimonials': '#ffeaa7'
  };
  return colors[pointId] || '#ffffff';
};

export default NavigationSystem;